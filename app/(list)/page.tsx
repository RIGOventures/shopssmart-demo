import { Session } from '@/lib/types'

import { getMissingKeys } from '@/app/actions'
import { nanoid } from '@/lib/utils'
import { auth } from '@/auth'

//import { Chat } from '@/components/chat'

export const metadata = {
    title: 'Shopping'
}

export default async function Page() {
    const id = nanoid()
    const session = (await auth()) as Session
    const missingKeys = await getMissingKeys()

    return (
        <></>
        //<Chat id={id} session={session} missingKeys={missingKeys} />
    )
}
