'use client'

import { Message } from '@/lib/types'

import { useEffect, useRef } from 'react'

import { useRouter } from 'next/navigation'

import { useDebouncedCallback } from 'use-debounce';
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'

import Textarea from 'react-textarea-autosize'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { PlusIcon, ArrowTurnDownLeftIcon } from '@heroicons/react/24/outline';

export interface PromptForm {
    input: string
	setInput: (value: string) => void
	append: (message: string, options?: {}) => Promise<string | undefined>
	setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void
}

export function PromptForm({ input, setInput, append, setMessages }: PromptForm) {

	const router = useRouter()
	const { formRef, onKeyDown } = useEnterSubmit()
	const inputRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus()
		}
	}, [])

	const submitCallback = async (value: string) => {
		// Split words by white space or comma
		const words = value.split(/[,]+/)
		for (const word of words) {
			// Submit user message
			await append(word)
		}
	}

	const handleSubmitDebouncedCallback = useDebouncedCallback(submitCallback, 2000)

	const handleSubmit = (event: any) => {

		event.preventDefault()

		const value = input.trim()
		setInput('')
		if (!value) return

		handleSubmitDebouncedCallback(value)
		
	}

	return (
		<form
			ref={formRef}
			onSubmit={handleSubmit}
		>
			<div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
							onClick={() => {
								router.push('/new')
							}}
						>
							<PlusIcon />
							<span className="sr-only">New Chat</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>New Chat</TooltipContent>
				</Tooltip>
				
				<Textarea
					ref={inputRef}
					tabIndex={0}
					onKeyDown={onKeyDown}
					placeholder="Send a message."
					className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
					autoFocus
					spellCheck={false}
					name="message"
					rows={1}
					value={input}
					onChange={event => setInput(event.target.value)}
				/>

				<div className="absolute right-0 top-[13px] sm:right-4">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button type="submit" size="icon" disabled={input === ''}>
								<ArrowTurnDownLeftIcon />
								<span className="sr-only">
									Send message
								</span>
							</Button>
						</TooltipTrigger>

						<TooltipContent>
							Send message
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</form>
	)
}