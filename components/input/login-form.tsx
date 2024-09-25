'use client'

import Link from 'next/link'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFormState } from 'react-dom'

import { authenticate } from '@/app/login/actions'

import { toast } from 'sonner'

import { getMessageFromCode } from '@/lib/utils/result'

import SubmitButton from './submit-button'

export default function LoginForm() {
    const router = useRouter()
    const [result, dispatch] = useFormState(authenticate, undefined)

    useEffect(() => {
        if (result) {
            if (result.type === 'error') {
                toast.error(getMessageFromCode(result.resultCode))
            } else {
                toast.success(getMessageFromCode(result.resultCode))
                router.refresh()
            }
        }
    }, [result, router])

    return (
        <form
            action={dispatch}
            className="flex flex-col items-center gap-4 space-y-3"
        >
            <div className="w-full flex-1 rounded-lg border bg-white px-6 pb-4 pt-8 shadow-md  md:w-96 dark:bg-zinc-950">
                <h1 className="mb-3 text-2xl font-bold">Please log in to continue.</h1>
                    <div className="w-full">
                        <div>
                            <label
                                className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
                                htmlFor="email"
                            >
                            Email
                            </label>
                            <div className="relative">
                            <input
                                className="peer block w-full rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                required
                            />
                            </div>
                        </div>
                    <div className="mt-4">
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                </div>
                <SubmitButton label="Log in" />
            </div>

            <Link
                href="/signup"
                className="flex flex-row gap-1 text-sm text-zinc-400"
            >
                No account yet? <div className="font-semibold underline">Sign up</div>
            </Link>
        </form>
    )
}