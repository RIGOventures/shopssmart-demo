'use client'

import * as React from 'react'

import { useSidebar } from '@/lib/hooks/use-sidebar'
import { Button } from '@/components/ui/button'
import { Bars3Icon } from '@heroicons/react/24/outline';

export function SidebarToggle() {
    const { toggleSidebar } = useSidebar()

    return (
        <Button
            variant="ghost"
            className="-ml-2 hidden size-9 p-0 lg:flex"
            onClick={() => {
                toggleSidebar()
            }}
        >
            <Bars3Icon className="size-6" />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    )
}