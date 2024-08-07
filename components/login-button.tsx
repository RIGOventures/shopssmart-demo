'use client'

import { useFormStatus } from 'react-dom'

import { IconSpinner } from './ui/icons'

export default function LoginButton({ label }: { label: string }) {
	const { pending } = useFormStatus()

	return (
		<button
			className="my-4 flex h-10 w-full flex-row items-center justify-center rounded-md bg-zinc-900 p-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
			aria-disabled={pending}
		>
			{pending ? <IconSpinner /> : label}
		</button>
	)
}