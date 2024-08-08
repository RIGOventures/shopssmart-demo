'use server'

import { ResultCode } from '@/lib/utils'
import type { AI } from '@/lib/actions'

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

const prompt = `\
    You are a grocery shopping conversation bot and you help recommend users to buy certain groceries.
    You and the user can discuss reasons to buy certain groceries, in the UI.
    
    Messages inside [] means that it's a UI element or a user event. For example:
    - "[Price of AAPL = 100]" means that an interface of the stock price of AAPL is shown to the user.
    - "[User has changed the amount of AAPL to 10]" means that the user has changed the amount of AAPL to 10 in the UI.
    
    If you want to show events, call \`get_events\`.
    If the user wants to buy groceries, or complete another impossible task, respond that you are a demo and cannot do that.
    
    Besides that, you cannot interact with the user.`

const model = openai('gpt-4-turbo');

export async function createUserMessage(
	groceryType: string, 
	selectedCategories: string, 
	specificDescriptors: string
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
		} Please return this response as a numbered list with the ${groceryType}'s name, followed by a colon, and then a brief description of the ${groceryType}. 
		 There should be a line of whitespace between each item in the list.`;
		
	return fullSearchCriteria
}

export async function submitUserMessage(content: string) {
    
    // Apply rate limit middleware
	try {
        // Get header
        const headersList = headers()
        
        // Get user ip
        const userIP =
            headersList.get('x-forwarded-for') || headersList.get('cf-connecting-ip') || '';

        const rateLimitResult = await rateLimit(userIP);
        if (rateLimitResult) {
            console.log(rateLimitResult)
            //return rateLimitResult;
        }
    } catch (error) {
		return {
            type: 'error',
            resultCode: ResultCode.UnknownError,
            message: error.toString()
        }
	}

    const aiState = getMutableAIState<typeof AI>()
  
    aiState.update({
        ...aiState.get(),
        messages: [
            ...aiState.get().messages,
            {
                id: nanoid(),
                role: 'user',
                content
            }
        ]
    })
  
    let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
    let textNode: undefined | React.ReactNode
  
    const result = await streamUI({
        model: model,
        initial: <SpinnerMessage />,
        system: prompt,
        messages: [
            ...aiState.get().messages.map((message: any) => ({
                role: message.role,
                content: message.content,
                name: message.name
            }))
        ],
        text: ({ content, done, delta }) => {
            if (!textStream) {
                textStream = createStreamableValue('')
                textNode = <BotMessage content={textStream.value} />
            }
    
            if (done) {
                textStream.done()
                aiState.done(
                    {
                        ...aiState.get(),
                        messages: [
                            ...aiState.get().messages,
                            {
                                id: nanoid(),
                                role: 'assistant',
                                content
                            }
                        ]
                    }
                )
            } else {
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
  