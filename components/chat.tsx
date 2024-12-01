'use client'

import { Message, Session } from '@/lib/types'

import { cn } from '@/lib/utils/style'

import { useRouter } from 'next/navigation'

import { useEffect, useTransition } from 'react'
import { useChat } from 'ai/react'
import { toast } from 'sonner'

import { getMessageFromCode } from '@/lib/utils/result'

import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

import { ChatList } from '@/components/chat/chat-list'
import { ChatPanel } from '@/components/input/chat-panel'
import { EmptyScreen } from '@/components/chat/empty-screen'

export interface ChatProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    id?: string
    session?: Session
    missingKeys: string[]
}

export function Chat({ id, initialMessages, session, missingKeys, className }: ChatProps) {

    const router = useRouter()
    const [isPending, startTransition] = useTransition();

    const { messages, setMessages, input, setInput, append, isLoading } = useChat({ 
        id, 
        initialMessages,
        onResponse: (response: Response) => {
            console.log(response)

            if (response.type === 'error') {
				//toast.error(getMessageFromCode(response.resultCode))
			}
        },
        onFinish: (message) => {
            let pathname = window.location.pathname
            if (pathname == "/") {
                startTransition(() => {
                    // Move to the new chat
                    let path = `list/${id}`
                    window.history.replaceState({}, '', path)

                    // Refresh the page
                    location.reload();
                })
            }
        }
    });


    // Wrap the submit handler to pass the chatId
    const appendWithId = async (input: string, subOptions?: {}) => {
		const chatOptions = { body: { chatId: id } }
        const options = Object.assign({}, chatOptions, subOptions);

        return await append({
            role: 'user',
            content: input
        }, options)
	}

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
                        <ChatList messages={messages} isLoading={isLoading} isShared={false} session={session} />
                    ) : (
                        <EmptyScreen />
                    )
                }
                <div className="w-full h-px" ref={visibilityRef} />
            </div>

            <ChatPanel
                input={input}
                setInput={setInput}
                append={appendWithId}
                setMessages={setMessages}
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
            />
        </div>
    )
}