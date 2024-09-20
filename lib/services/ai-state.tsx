import { Chat, Message } from '@/lib/types'

export type AIState = {
    chatId: string
    messages: Message[]
}

export type UIState = {
    id: string
    display: React.ReactNode
}[]

import { auth } from '@/auth'

import { nanoid } from '@/lib/utils/nanoid'

import { saveChat } from '@/app/actions'
import { submitMessage } from '@/lib/actions'
import { getPreferences, getProfile } from '@/app/account/actions'

import { createAI, getAIState } from 'ai/rsc'

import { BotMessage, UserMessage } from '@/components/chat/message'

async function submitUserMessage(message: string) {
    'use server'

    const session = await auth()

    if (session && session.user) {
        // Get the selected profile
        const profile = await getProfile(session.user!.email!)
        // Get preferences on that profile
        const pref = await getPreferences(profile) 
        if (pref) {
            return submitMessage(message, pref)
        }
    }

    return submitMessage(message, {})
}

export const AI = createAI<AIState, UIState>({
    actions: {
        submitUserMessage
    },
    initialUIState: [],
    initialAIState: { 
        chatId: nanoid(), 
        messages: [] 
    },
    onGetUIState: async () => {
        'use server'

        const session = await auth()

        if (session && session.user) {
            const aiState = getAIState() as Chat

            if (aiState) {
                const uiState = getUIStateFromAIState(aiState)
                return uiState
            }
        } else {
            return
        }
    },
    onSetAIState: async ({ state }) => {
        'use server'

        const session = await auth()

        if (session && session.user) {
            const { chatId, messages } = state

            const createdAt = new Date()
            const userId = session.user.id as string
            const path = `/list/${chatId}`

            const firstMessageContent = messages[0].content as string
            const title = firstMessageContent.substring(0, 100)

            const chat: Chat = {
                id: chatId,
                title,
                userId,
                createdAt,
                messages,
                path
            }

            await saveChat(chat)

        } else {
            return
        }
    }
})

export const getUIStateFromAIState = (aiState: Chat) => {
    return aiState.messages
        .filter((message: Message) => message.role !== 'system')
        .map((message: Message, index: number) => (
            {
                id: `${aiState.chatId}-${index}`,
                display:
                    message.role === 'user' ? (
                        <UserMessage>
                            {message.content as string}
                        </UserMessage>
                    ) : message.role === 'assistant' && typeof message.content === 'string' ? (
                        <BotMessage content={message.content} />
                    ) : null
            }
        ))
}