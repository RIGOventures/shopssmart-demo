import { redirect } from 'next/navigation'
import { cache } from 'react'

import { clearChats, getChats } from '@/app/actions'

import { ClearHistory } from '@/components/sidebar/clear-history'
import { SidebarItems } from '@/components/sidebar/sidebar-items'
import { ThemeToggle } from '@/components/header/theme-toggle'

interface SidebarListProps {
    userId?: string
    children?: React.ReactNode
}

const loadChats = cache(async (userId?: string) => {
    return await getChats(userId)
})

export async function SidebarChat({ userId }: SidebarListProps) {
    const chats = await loadChats(userId)

    if (!chats || 'error' in chats) {
        redirect('/')
    } else {
        return (
            <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                    {
                        chats?.length ? (
                            <div className="space-y-2 px-2">
                                <SidebarItems chats={chats} />
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-sm text-muted-foreground">No list history</p>
                            </div>
                        )
                    }
                </div>
                <div className="flex items-center justify-between p-4">
                    <ThemeToggle />
                    <ClearHistory clearChats={clearChats} isEnabled={chats?.length > 0} />
                </div>
            </div>
        )
    }
}