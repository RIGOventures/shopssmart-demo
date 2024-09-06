'use client'

import type { AI } from '@/lib/services/ai-state'

import * as React from 'react'

import { useAIState, useUIState } from 'ai/rsc'
import { shareChat } from '@/app/actions'

import { Button } from '@/components/ui/button'
import { ChatShareDialog } from '@/components/input/chat-share-dialog'
import { ButtonScrollToBottom } from '@/components/ui/icons'
import { ShareIcon } from '@heroicons/react/24/outline';
import { PromptForm } from './chat-form'

export interface ChatPanelProps {
    id?: string
    title?: string
    input: string
    setInput: (value: string) => void
    isAtBottom: boolean
    scrollToBottom: () => void
}

export function ChatPanel({
    id,
    title,
    input,
    setInput,
    isAtBottom,
    scrollToBottom
}: ChatPanelProps) {
    const [aiState] = useAIState()
    const [messages, setMessages] = useUIState<typeof AI>()
    const [shareDialogOpen, setShareDialogOpen] = React.useState(false)

    return (
        <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
            <ButtonScrollToBottom
                isAtBottom={isAtBottom}
                scrollToBottom={scrollToBottom}
            />

            <div className="mx-auto sm:max-w-2xl sm:px-4">
                {
                    messages?.length >= 2 ? (
                        <div className="flex h-12 items-center justify-center">
                            <div className="flex space-x-2">
                                {
                                    id && title ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShareDialogOpen(true)}
                                        >
                                            <ShareIcon className="mr-2" />
                                            Share
                                        </Button>
                                        <ChatShareDialog
                                            open={shareDialogOpen}
                                            onOpenChange={setShareDialogOpen}
                                            onCopy={() => setShareDialogOpen(false)}
                                            shareChat={shareChat}
                                            chat={{
                                                id,
                                                title,
                                                messages: aiState.messages
                                            }}
                                        />
                                    </>
                                ) : null
                            }
                            </div>
                        </div>
                    ) : null
                }

                <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
                    <PromptForm input={input} setInput={setInput} />
                </div>
            </div>
        </div>
    )
}
