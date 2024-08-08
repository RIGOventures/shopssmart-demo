'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

import { Button, type ButtonProps } from '@/components/ui/button'
import { ArrowDownIcon } from '@heroicons/react/24/outline';

interface ButtonScrollToBottomProps extends ButtonProps {
    isAtBottom: boolean
    scrollToBottom: () => void
}

function ButtonScrollToBottom({
    className,
    isAtBottom,
    scrollToBottom,
    ...props
}: ButtonScrollToBottomProps) {
    return (
        <Button
            variant="outline"
            size="icon"
            className={cn(
                'absolute right-4 top-1 z-10 bg-background transition-opacity duration-300 sm:right-8 md:top-2',
                isAtBottom ? 'opacity-0' : 'opacity-100',
                className
            )}
            onClick={() => scrollToBottom()}
            {...props}
        >
            <ArrowDownIcon />
            <span className="sr-only">Scroll to bottom</span>
        </Button>
    )
}

function IconSpinner({ className, ...props }: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4 animate-spin', className)}
            {...props}
        >
            <path d="M232 128a104 104 0 0 1-208 0c0-41 23.81-78.36 60.66-95.27a8 8 0 0 1 6.68 14.54C60.15 61.59 40 93.27 40 128a88 88 0 0 0 176 0c0-34.73-20.15-66.41-51.34-80.73a8 8 0 0 1 6.68-14.54C208.19 49.64 232 87 232 128Z" />
        </svg>
    )
}

export {
    ButtonScrollToBottom,
    IconSpinner
}