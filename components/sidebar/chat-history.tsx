import * as React from 'react'
import Link from 'next/link'

import { Suspense } from 'react';

import { cn } from '@/lib/utils/style'

import { SidebarChat } from '@/components/sidebar/sidebar-list'
import { buttonVariants } from '@/components/ui/button'
import { PlusIcon } from '@heroicons/react/24/outline';

interface ChatHistoryProps {
    userId?: string
}

export async function ChatHistory({ userId }: ChatHistoryProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4">
                <h4 className="text-sm font-medium">
                    Shopping Lists
                </h4>
            </div>
            <div className="mb-2 px-2">
                <Link
                    href="/"
                    className={cn(
                        buttonVariants({ variant: 'outline' }),
                        'h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
                    )}
                >
                    <PlusIcon className="size-6 -translate-x-2 stroke-2" />
                    New List
                </Link>
            </div>
            <Suspense
                fallback={
                    <div className="flex flex-col flex-1 px-4 space-y-4 overflow-auto">
                        {Array.from({ length: 10 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-full h-6 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800"
                        />
                        ))}
                    </div>
                }
            >
                {/* @ts-ignore */}
                <SidebarChat userId={userId} />
            </Suspense>
        </div>
    )
}