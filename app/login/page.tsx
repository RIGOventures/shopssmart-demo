import { Session } from '@/lib/types'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'

import LoginForm from '@/components/login-form'

export default async function LoginPage() {
    const session = (await auth()) as Session
    if (session) {
        redirect('/')
    }

    return (
        <main className="flex flex-col p-4">
            <LoginForm />
        </main>
    )
}