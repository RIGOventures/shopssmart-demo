'use client'

import { ServerActionResult, type Chat } from '@/lib/types'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { toast } from 'sonner'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import { ShareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ChatShareDialog } from '@/components/chat-share-dialog'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'

interface SidebarActionsProps {
    chat: Chat
    removeChat: (args: { id: string; path: string }) => ServerActionResult<void>
    shareChat: (id: string) => ServerActionResult<Chat>
}

export function SidebarActions({
    chat,
    removeChat,
    shareChat
}: SidebarActionsProps) {
    const router = useRouter()
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
    const [isRemovePending, startRemoveTransition] = React.useTransition()

    return (
        <>
        <div className="">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        className="size-7 p-0 hover:bg-background"
                        onClick={() => setShareDialogOpen(true)}
                    >
                        <ShareIcon />
                        <span className="sr-only">Share</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Share list
                </TooltipContent>
            </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            className="size-7 p-0 hover:bg-background"
                            disabled={isRemovePending}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            <TrashIcon />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Delete list
                    </TooltipContent>
                </Tooltip>
            </div>
            <ChatShareDialog
                chat={chat}
                shareChat={shareChat}
                open={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
                onCopy={() => setShareDialogOpen(false)}
            />
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This will permanently delete your chat message and remove your
                        data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemovePending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isRemovePending}
                            onClick={event => {
                                event.preventDefault()
                                // @ts-ignore
                                startRemoveTransition(async () => {
                                    const result = await removeChat({
                                        id: chat.id,
                                        path: chat.path
                                    })

                                    if (result && 'error' in result) {
                                        toast.error(result.error)
                                        return
                                    }

                                    setDeleteDialogOpen(false)
                                    router.refresh()
                                    router.push('/')
                                    toast.success('Chat deleted')
                                })
                            }}
                        >
                        {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}