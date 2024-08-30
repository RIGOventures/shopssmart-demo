'use server'

import { z } from 'zod';
import { type ReactNode } from 'react'

import { ResultCode } from '@/lib/utils/result'
import type { Message, Preferences, Product } from "@/lib/types"
import type { AI } from '@/lib/services/ai-state'

import { headers } from 'next/headers'

import { AxiosError } from 'axios'

import { createVertex } from '@ai-sdk/google-vertex'

import {
    getMutableAIState,
    streamUI,
    createStreamableValue,
} from 'ai/rsc'

import { createInstruction, createPrompt } from '@/lib/utils/ai-model'
import { nanoid } from '@/lib/utils/nanoid'

import { rateLimit } from '@/lib/services/rate-limit'

import { BotMessage, SpinnerMessage } from '@/components/chat/message'
import { getGCPCredentials } from './utils/env-auth';

// Create Google gemini model
const vertex = createVertex({
    googleAuthOptions: getGCPCredentials()
});

const model = vertex('gemini-1.5-flash', {
    useSearchGrounding: true,
    safetySettings: [
        { category: 'HARM_CATEGORY_UNSPECIFIED', threshold: 'BLOCK_ONLY_HIGH' },
    ],
});

// Submit a prompt to a model
export async function submitPrompt(aiState: any, value: string, preferences: Preferences, 
    onFinish: (value: string) => void) 
{
    
    // Create instruction
    const modelInstruction = createInstruction();

    // Create message with preferences
    let categories = (preferences.lifestyle ? preferences.lifestyle : '') + preferences.allergen
    const userPrompt = createPrompt(value, categories, preferences.health)

    // Create stream elements
    let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
    let textNode: undefined | ReactNode

    // Get the history
    const history = aiState.get().messages.map((message: Message)=> ({
        role: message.role,
        content: message.content
    }))

    // Query model
    const result = await streamUI({
        model: model,
        initial: <SpinnerMessage />,
        system: modelInstruction,
        messages: [
            ...history,
            // Add prompt
            {
                role: 'user',
                content: userPrompt
            }
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
                
                //console.log(product)

                // Call on finish here
                onFinish(content)

            } else {
                // Gradually get text stream from open ai (typing effect)
                textStream.update(delta)
            }

            return textNode
        }
    })

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
                content: "..."
            }
        ]
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

export async function submitMessage(message: string, preferences: {}) {

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
    const words = message.split(/[,]+/)

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

    function createFinishResponse(displacement: number) {
        return function(content: string) {
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

            responsesLoaded++
        }
    }

    // Check if request fails
	try {

        // Send prompt for each word
        for (let index = 0; index < words.length; index++) {
            let word = words[index]
            let displacement = currentMessages.length + index * 2 + 1

            const result = await submitPrompt(aiState, word, preferences, createFinishResponse(displacement))
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
  