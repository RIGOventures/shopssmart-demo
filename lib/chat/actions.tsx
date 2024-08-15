'use server'

import { ResultCode } from '@/lib/utils'
import type { AI, AIState } from '@/lib/actions'

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
	selectedCategories: string | null, 
	specificDescriptors: string | null
) {
	let fullSearchCriteria = `Give me a list of 5 ${groceryType} recommendations ${
			selectedCategories ? `that fit all of the following categories: ${selectedCategories}` : ''
		}. ${
			specificDescriptors
				? `Make sure it fits the following description as well: ${specificDescriptors}.`
				: ''
		} ${
			selectedCategories || specificDescriptors
				? `If you do not have 5 recommendations that fit these criteria perfectly, do your best to suggest other ${groceryType}'s that I might like.`
				: ''
		}
        
        Please return this response as a numbered list with the ${groceryType}'s name, followed by a colon, and then a brief reason for picking that ${groceryType}. 
        There should be a line of whitespace between each item in the list.`;
		
	return fullSearchCriteria
}

export async function submitPrompt(aiState: any, value: string) {
    
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

    // Submit prompt
    //const prompt = createUserMessage(value, null, null)
    //console.log(prompt)

    // Create stream elements
    let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
    let textNode: undefined | React.ReactNode

    // Create promise elements 
    let textContent = ""
    let textFinished = false
    let textPromise = new Promise<string>(resolve  => {
        let interval = setInterval(() => {
            if (!textFinished) return;
            clearInterval(interval);
            resolve(textContent);
        }, 100)
    })

    // Query model
    console.log(aiState.get().messages)
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
        text: ({ content, done, delta }) => {
            // Create text stream
            if (!textStream) {
                textStream = createStreamableValue('')
                textNode = <BotMessage content={textStream.value} />
            }
    
            // Update text stream
            if (done) {
                textStream.done()
                textContent = content
                textFinished = true
            } else {
                // Gradually get text stream from open ai (typing effect)
                textStream.update(delta)
            }
    
            return textNode
        }
    })

    return [
        {
            id: nanoid(),
            display: result.value
        }, 
        textPromise
    ]
}

function executeAsync(func: (value: any) => void) {
    setTimeout(func, 0);
}

async function waitUntil(condition: () => boolean, time = 100) {
    while (!condition()) {
        await new Promise((resolve) => setTimeout(resolve, time));
    }
}

export async function submitUserMessage(value: string) {
    
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
            //console.log(rateLimitResult)
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

    const responses = []
    const promises: any[] = []

    // Split words by white space or comma
    const words = value.split(/[ ,]+/)
    for (const word of words) {
        const [result, promise] = await submitPrompt(aiState, word)
        responses.push(result)
        promises.push(promise)
    }

    // Finish state so it can be update properly
    aiState.done(
        {
            ...aiState.get()
        }
    )

    // Get current another ai state to sync
    const asyncAiState = getMutableAIState<typeof AI>()
    executeAsync(async function() {

        // Update ai with the message
        const currentMessages = asyncAiState.get().messages

        const length = promises.length
        const finalIndex = currentMessages.length - 1
        for (let index = 0; index < length; index++) {
            
            let content = ""
            let finished = false

            let promise = promises[index]
            promise.then((result: string) => {
                content = result
                finished = true
            })

            await waitUntil(() => finished === true);

            // Place recommendation every other message
            let displacement = (length - (index + 1)) * 2
            currentMessages[finalIndex - displacement] = {
                id: nanoid(),
                role: 'assistant',
                content: content
            }
        }

        // Finish state
        asyncAiState.done(
            {
                ...asyncAiState.get(),
                messages: currentMessages
            }
        )

    });

    return responses
}
  