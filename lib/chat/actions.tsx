'use server'

import { type ReactNode } from 'react'

import { ResultCode } from '@/lib/utils'
import type { AI } from '@/lib/actions'

import { redirect } from 'next/navigation'
import { NextResponse } from "next/server";
import { revalidatePath } from 'next/cache'

import { headers } from 'next/headers'
import { openai } from '@ai-sdk/openai'
import {
    getMutableAIState,
    streamUI,
    createStreamableValue
} from 'ai/rsc'
import { rateLimit } from '@/app/(list)/actions'
import { nanoid } from '@/lib/utils'

import { BotMessage, SpinnerMessage } from '@/components/chat/message'
import { searchProduct } from '../shop/spoonacular'
import { searchUPCItem, getUPCInformation } from '../shop/upc-database'
import { AxiosError } from 'axios'

// Create openai model
const model = openai('gpt-4-turbo');

// Design model prompt
const prompt = `\
    You are a grocery shopping conversation bot and you help recommend users to buy certain groceries.
    You and the user can discuss reasons to buy certain groceries, in the UI.
    
    If the user wants to buy groceries, or complete another impossible task, respond that you are a demo and cannot do that.
    
    Besides that, you cannot interact with the user.
    Thank you for your help! It's greatly appreciated.`


function createUserMessage(
	groceryType: string, 
    availableProducts?: string,
	selectedCategories?: string, 
	specificDescriptors?: string
) {
	let fullSearchCriteria = `Pick one ${groceryType} recommendation`
    + `${
            availableProducts ? 
            `from the available products: ${availableProducts}` : 
            ''
        }. `
    + `${
            selectedCategories ? 
            `Make sure that is fits all of the following categories: ${selectedCategories}. ` : 
            ''
        }`
    + `${
            specificDescriptors? 
            `Make sure it fits the following description as well: ${specificDescriptors}. ` : 
            ''
        }`
    + `${
			selectedCategories || specificDescriptors? 
            `If you cannot pick a recommendation that fit these criteria perfectly, select the one that best matches. ` :
            ''
		}`
    + `Please respond with the ${groceryType}'s name, followed by a colon, and then a brief reason for picking that ${groceryType}.`
		
	return fullSearchCriteria
}

// names is a list of keys you want to keep
function removeAllExcept(arr: [], names: string[]) { 
    arr.forEach(item => {
        Object.keys(item).forEach(key => {
            if (!names.includes(key)) {
                delete item[key]
            }
        })
    })
}

function getItemByValue(arr: [], key: string, value: any) {
    return arr.find(item => item[key] === value);
}

export async function submitPrompt(aiState: any, value: string, 
    displacement: number, onFinish: () => void) {
    
    // Get any items that match this item 
    const response = await searchUPCItem(value) // await searchProduct(value)

    // Get products from data
    let data = response.data
    let products = data.products || data.items

    // Keep certain fields
    let fields = [ "title", "badges", "description", "upc", "barcode" ]
    removeAllExcept(products, fields);

    // Generate list of available products
    let availableProducts = Object.entries(products)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

    // Submit prompt
    const prompt = createUserMessage(value, availableProducts)
    console.log(prompt)

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
    

    // Create stream elements
    let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
    let textNode: undefined | ReactNode

    // Query model
    const result = await streamUI({
        model: model,
        initial: <SpinnerMessage />,
        system: prompt,
        messages: [
            ...aiState.get().messages.map((message: any) => ({
                role: message.role,
                content: message.content
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

                console.log(content)

                const [title, description] = content.match(/\d\.\s*(.*?):\s*(.*)/) || [];
                
                const product = getItemByValue(products, "title", title)
                let { upc, barcode } = product!

                let result = await getUPCInformation(upc || barcode)
                
                console.log(result)

                console.log(result.data)

                textNode = <BotMessage content={title + " Why? " + description} />

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
    
    function done() {
        // Finish state so it can be updated properly
        aiState.done({
            ...aiState.get(),
            messages: aiState.get().messages
        })
    }

    function direct() {    

        // Move to the new chat
        let id = aiState.get().chatId
        let path = `list/${id}`

        // Get domain
        const headersList = headers()
        let domain = headersList.get('origin') || headersList.get('referer') || ''

        // Redirect to path
        const random = Math.random() // Hack to make the page refresh data!

        // TODO: Fix redirection
        //revalidatePath(path)
        NextResponse.redirect(new URL(path + `?${random}`, domain)) 

    }
    
    function finishResponse() {
        responsesLoaded++
        if (responsesLoaded === words.length) {
            done()
            // Check if a new chat
            if (currentMessages.length === 0) { direct() }         
        }
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

    return responses
}
  