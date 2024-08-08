import { Session } from '@/lib/types'
import { type Metadata } from 'next'

import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getChat, getMissingKeys } from '@/app/actions'

import { AI } from '../../../../lib/actions'
import { Chat } from '@/components/chat'

export interface ChatPageProps {
    params: {
        id: string
    }
}

export async function generateMetadata({
    params
}: ChatPageProps): Promise<Metadata> {
    const session = await auth()

    if (!session?.user) {
        return {}
    }

    let id = session.user!.id ?? '';
    const chat = await getChat(params.id, id)

    if (!chat || 'error' in chat) {
        redirect('/')
    } else {
        return {
            title: chat?.title.toString().slice(0, 50) ?? 'List'
        }
    }
}

export default async function ChatPage({ params }: ChatPageProps) {
    const session = (await auth()) as Session
    const missingKeys = await getMissingKeys()

    if (!session?.user) {
        redirect(`/login?next=/list/${params.id}`)
    }

    const userId = session.user.id as string
    const chat = await getChat(params.id, userId)

    if (!chat || 'error' in chat) {
        redirect('/')
    } else {
        if (chat?.userId !== session?.user?.id) {
            notFound()
        }

        return (
            <AI initialAIState={{ chatId: chat.id, messages: chat.messages }}>
                <Chat
                    id={chat.id}
                    session={session}
                    initialMessages={chat.messages}
                    missingKeys={missingKeys}
                />
            </AI>
        )
    }
}