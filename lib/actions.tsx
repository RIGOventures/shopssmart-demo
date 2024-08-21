'use server'

import { type ReactNode } from 'react'

import { ResultCode } from '@/lib/utils/result'
import type { Product } from "@/lib/types"

import { headers } from 'next/headers'

import type { AI } from '@/lib/services/ai-state'
import { openai } from '@ai-sdk/openai'
import {
    getMutableAIState,
    streamUI,
    createStreamableValue
} from 'ai/rsc'

import { rateLimit } from '@/lib/services/rate-limit'
import { nanoid } from '@/lib/utils/nanoid'

import { searchKroger } from './shop/kroger/actions'
import { searchWalgreens } from './shop/wallgreens/actions'

import { AxiosError } from 'axios'

import { BotMessage, SpinnerMessage } from '@/components/chat/message'

import { getItemByValue, removeAllExcept } from './utils/dictionary'
import { createMessage, createPrompt } from './utils/ai-model'

// List of product search functions

const array_of_searches = [
    searchKroger,
    //searchWalgreens
]

// Create openai model
const model = openai('gpt-4-turbo');

// Submit a prompt to a model
export async function submitPrompt(aiState: any, value: string, 
    displacement: number, onFinish: () => void) {
    
    // Get products from stores
    let location = { latitude: 39.306346, longitude: -84.278902 }
    // let location = { latitude: 0, longitude: 0 }

    let searchResults = await Promise.all(array_of_searches.flatMap(async search => await search([ value ], location)));
    const products: Product[] = searchResults.flat()

    // Keep certain fields
    let fields = [ "description", "category", "url" ]
    removeAllExcept(products, fields);

    // Generate list of available products
    let availableProducts = JSON.stringify(products)

    // Create message and prompt
    const modelPrompt = createPrompt();
    const userMessage = createMessage(value, availableProducts)
    
    // Create stream elements
    let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
    let textNode: undefined | ReactNode

    // Update ai state with the new message
    aiState.update({
        ...aiState.get(),
        messages: [
            ...aiState.get().messages,
            {
                id: nanoid(),
                role: 'user',
                content: value
            },
            {
                id: nanoid(),
                role: 'assistant',
                content: ""
            }
        ]
    })

    // Query model
    const result = await streamUI({
        model: model,
        initial: <SpinnerMessage />,
        system: modelPrompt,
        messages: [
            ...aiState.get().messages.map((message: any) => ({
                role: message.role,
                content: userMessage
            }))
        ],
        text: async ({ content, done, delta }) => {
            // Create text stream
            if (!textStream) {
                textStream = createStreamableValue('')
                textNode = <BotMessage content={textStream.value} />
            }
    
            // Update text stream
            if (done) {  
                textStream.done()

                // Get choice
                const [, description, reason ] = content.match(/\s*(.*?)\n\s*(.*)/) || [];
                
                // Get product
                const product = getItemByValue(products, "description", description)
                if (product) {
                    console.log(product)
                }

                // Update ai with the message
                let currentMessages = aiState.get().messages
                // Place recommendation every other message
                currentMessages[displacement] = {
                    id: nanoid(),
                    role: 'assistant',
                    content: content
                }

                // Update ai state with the new message
                aiState.update({
                    ...aiState.get(),
                    messages: currentMessages
                })  

                // Call on finish here
                onFinish()

            } else {
                // Gradually get text stream from open ai (typing effect)
                textStream.update(delta)
            }

            return textNode
        }
    })

    return {
        id: nanoid(),
        display: result.value
    }

}

async function waitUntil(condition: () => boolean, time = 100) {
    while (!condition()) {
        await new Promise((resolve) => setTimeout(resolve, time));
    }
}

export async function submitUserMessage(message: string) {

    // Rate limit by middleware
	try {
        // Get header
        const headersList = headers()

        // Get user ip
        const userIP =
            headersList.get('x-forwarded-for') || headersList.get('cf-connecting-ip') || '';

        // Apply rate limit middleware
        const rateLimitResult = await rateLimit(userIP);
        if (rateLimitResult) {
            //return rateLimitResult;
        }
    } catch (error) {

        let message
        if (error instanceof Error) message = error.message
        else message = String(error)

		return {
            type: 'error',
            resultCode: ResultCode.UnknownError,
            message: message
        }
	}

    // Get current ai state
    const aiState = getMutableAIState<typeof AI>()
    
    // Get current messages
    const currentMessages = aiState.get().messages

    // Split words by white space or comma
    const words = message.split(/[ ,]+/)

    // Load responses for each word
    const responses = []
    let responsesLoaded = 0

    let responsePromise = new Promise(async (resolve, reject) => {
        // Wait for all responses to load
        await waitUntil(() => responsesLoaded === words.length);

        // Finish state so it can be updated properly
        aiState.done({
            ...aiState.get(),
            messages: aiState.get().messages
        })

        // Check if a new chat
        resolve(currentMessages.length === 0);
    })

    function finishResponse() {
        responsesLoaded++
    }

    // Check if request fails
	try {

        // Send prompt for each word
        for (let index = 0; index < words.length; index++) {
            let word = words[index]
            let displacement = currentMessages.length + index * 2 + 1

            const result = await submitPrompt(aiState, word, displacement, finishResponse)
            responses.push(result)
        }

    } catch (error) {

        let message
        if (error instanceof Error) message = error.message
        else message = String(error)

        console.log(message)

        let resultCode 

        if (error instanceof AxiosError) {
             
            let statusCode = error.response?.status
            switch (statusCode) {
                case 401:
                    resultCode = ResultCode.InvalidCredentials
                    break
                case 402:
                case 420:
                    resultCode = ResultCode.RateLimited
                    break
                default:
                    resultCode = ResultCode.UnknownError
            }

        } else {
            resultCode = ResultCode.UnknownError
        }
		
        return {
            type: 'error',
            resultCode: resultCode,
            message: message
        }

	}

    aiState.done({...aiState.get()})

    return {
        promise: responsePromise,
        responses: responses
    }
}
  