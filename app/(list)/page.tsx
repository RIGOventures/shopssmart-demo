import { Session } from '@/lib/types'

import { generateId } from 'ai';

import { auth } from '@/auth'

import { getMissingKeys } from '@/lib/utils/env-auth'

import { Chat } from '@/components/chat'

export const metadata = {
    title: 'Shopping'
}

export default async function Page() {
    const id = generateId()
    const session = (await auth()) as Session
    const missingKeys = await getMissingKeys()

    return <Chat 
        id={id} 
        session={session} 
        missingKeys={missingKeys} 
    />
}
