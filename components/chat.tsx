'use client'

import { Message, Session } from '@/lib/types'

import { cn } from '@/lib/utils/style'

import { useEffect, useState } from 'react'
import { useUIState } from 'ai/rsc'
import { toast } from 'sonner'

import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'

export interface ChatProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    id?: string
    session?: Session
    missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
    const [input, setInput] = useState('')
    const [messages] = useUIState()

    const [_, setNewChatId] = useLocalStorage('newChatId', id)

    useEffect(() => {
        setNewChatId(id)
    })

    useEffect(() => {
        missingKeys.map(key => {
            toast.error(`Missing ${key} environment variable!`)
        })
    }, [missingKeys])

    const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
        useScrollAnchor()

    return (
        <div
            className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
            ref={scrollRef}
        >

            <div
                className={cn('pb-[200px] pt-4 md:pt-10', className)}
                ref={messagesRef}
            >
                {
                    messages.length ? (
                        <ChatList messages={messages} isShared={false} session={session} />
                    ) : (
                        <EmptyScreen />
                    )
                }
                <div className="w-full h-px" ref={visibilityRef} />
            </div>

            <ChatPanel
                id={id}
                input={input}
                setInput={setInput}
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
            />
        </div>
    )
}