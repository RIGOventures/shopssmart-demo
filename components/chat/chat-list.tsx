'use client'

import { Message, Session } from '@/lib/types'

import Link from 'next/link'

import { SpinnerMessage, BotMessage, UserMessage } from '@/components/chat/message'
import { Separator } from '@/components/ui/separator'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

export interface ChatList {
    messages: Message[]
    session?: Session
    isShared: boolean
    isLoading: boolean
}

export function ChatList({ messages, session, isShared, isLoading }: ChatList) {
    if (!messages.length) {
        return null
    }

    const uiMessages = convertToUIMessages(messages)
    
    return (
        <div className="relative mx-auto max-w-2xl px-4">
            {
                !isShared && !session ? (
                    <>
                        <div className="group relative mb-4 flex items-start md:-ml-12">
                            <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
                                <ExclamationTriangleIcon />
                            </div>
                            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
                                <p className="text-muted-foreground leading-normal">
                                    Please{' '}
                                    <Link href="/login" className="underline">
                                        log in
                                    </Link>{' '}
                                    or{' '}
                                    <Link href="/signup" className="underline">
                                        sign up
                                    </Link>{' '}
                                    to save and revisit your list history!
                                </p>
                            </div>
                        </div>
                        <Separator className="my-4" />
                    </>
                ) : null
            }

            {
                uiMessages.map((message, index: number) => (
                    <div key={message.id}>
                        <div>{message.display}</div>
                        {index < messages.length - 1 && <Separator className="my-4" />}
                    </div>
                ))
            }

            {isLoading &&
                messages.length > 0 &&
                messages[messages.length - 1].role === 'user' && (
                    <div>
                        <Separator className="my-4" />
                        <SpinnerMessage />
                    </div>
                )
            }

        </div>
    )
}

export const convertToUIMessages = (messages: Message[]) => {
    return messages
        .filter((message: Message) => message.role !== 'system')
        .map((message: Message, index: number) => (
            {
                id: message.content,
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
