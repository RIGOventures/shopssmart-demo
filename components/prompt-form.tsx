'use client'

import { type AI } from '@/lib/actions'

import { useEffect, useRef } from 'react'
import { useActions, useUIState } from 'ai/rsc'

import { SpinnerMessage, UserMessage } from './chat/message'

import { nanoid } from 'nanoid'
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

export function PromptForm({
	input,
	setInput
}: {
	input: string
	setInput: (value: string) => void
}) {
	const router = useRouter()
	const { formRef, onKeyDown } = useEnterSubmit()
	const inputRef = useRef<HTMLTextAreaElement>(null)
	const { createUserMessage, submitUserMessage } = useActions()

	// https://sdk.vercel.ai/docs/reference/ai-sdk-rsc/use-ui-state
	const [_, setMessages] = useUIState<typeof AI>()

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus()
		}
	}, [])

	const callback = async (value: string) => {

		// Split words by white space or comma
		const words = value.split(/[ ,]+/)
		for (const word of words) {
			
			// Optimistically add user message UI
			setMessages(currentMessages => [
				...currentMessages,
				{
					id: nanoid(),
					display: <UserMessage>{word}</UserMessage>
				},
				{
					id: nanoid(),
					display: <SpinnerMessage />
				}
			])

		}

		// Submit user message
		const responses = await submitUserMessage(value)

		// Update UI with placeholder interface
		setMessages(currentMessages => {

			const length = responses.length
			const finalIndex = currentMessages.length - 1
			for (let index = 0; index < length; index++) {
				let responseMessage = responses[index]

				// Place recommendation every other message
				let displacement = (length - (index + 1)) * 2
				currentMessages[finalIndex - displacement] = responseMessage
			}

			return currentMessages
		})

	}

	const debouncedSubmitHandler = useDebouncedCallback(callback, 2000)

	const onSubmit = (e: any) => {

		e.preventDefault()

		// Blur focus on mobile
		if (window.innerWidth < 600) {
			e.target['message']?.blur()
		}

		const value = input.trim()
		setInput('')
		if (!value) return

		debouncedSubmitHandler(value)

	}

	return (
		<form
			ref={formRef}
			onSubmit={onSubmit}
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
					autoComplete="off"
					autoCorrect="off"
					name="message"
					rows={1}
					value={input}
					onChange={e => setInput(e.target.value)}
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