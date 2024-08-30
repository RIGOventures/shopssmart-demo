import { Session } from '@/lib/types'

import { nanoid } from '@/lib/utils/nanoid'
import { auth } from '@/auth'

import { getMissingKeys } from '@/lib/utils/env-auth'

import { AI } from '@/lib/services/ai-state'
import { Chat } from '@/components/chat'

export const metadata = {
    title: 'Shopping'
}

export default async function Page() {
    const id = nanoid()
    const session = (await auth()) as Session
    const missingKeys = await getMissingKeys()

    return (
        <AI initialAIState={{ chatId: id, messages: [] }}>
            <Chat 
                id={id} 
                session={session} 
                missingKeys={missingKeys} 
            />
        </AI>
    )
}
