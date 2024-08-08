import { Session } from '@/lib/types'

import { getMissingKeys } from '@/app/actions'
import { nanoid } from '@/lib/utils'
import { auth } from '@/auth'

import { AI } from '../../lib/actions'
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
