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

export async function submitPrompt(aiState: any, value: string, displacement: number) {
    
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
        text: ({ content, done, delta }) => {
            // Create text stream
            if (!textStream) {
                textStream = createStreamableValue('')
                textNode = <BotMessage content={textStream.value} />
            }
    
            // Update text stream
            if (done) {
                textStream.done()

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

    // Get current messages
    const currentMessages = aiState.get().messages
    const responses = []

    // Split words by white space or comma
    const words = value.split(/[ ,]+/)
    for (let index = 0; index < words.length; index++) {
        let word = words[index]
        let displacement = currentMessages.length + index * 2 + 1

        const result = await submitPrompt(aiState, word, displacement)
        responses.push(result)
    }

    // Finish state so it can be update properly
    aiState.done({...aiState.get()})

    return responses
}
  