import { Session } from '@/lib/types'

import * as React from 'react'
import { Suspense, cache } from 'react';
import Link from 'next/link'

import { getProfiles } from '@/app/actions';

import { auth } from '@/auth'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/header/user-menu'
import { ThemeToggle } from '@/components/header/theme-toggle'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar/sidebar-toggle'
import { ChatHistory } from './sidebar/chat-history'

import { ShoppingCartIcon, SlashIcon } from '@heroicons/react/24/outline';
import { ProfilePanel } from './header/profile-panel';

const loadProfiles = cache(async (userId?: string) => {
    return await getProfiles(userId)
})

async function UserOrLogin() {
	
	const session = (await auth()) as Session

	const result = await loadProfiles(session.user.id)
    if (result && 'error' in result) {
        toast.error(result.error)
        return
    }

	return (
		<>
			{
				session?.user ? (
					<>
						<SidebarMobile>
							<ChatHistory userId={session.user.id} />
						</SidebarMobile>
						<SidebarToggle />
					</>
				) : (
					<Link href="/new" rel="nofollow">
						<ShoppingCartIcon className="size-6 mr-2 dark:hidden" />
						<ShoppingCartIcon className="hidden size-6 mr-2 dark:block" />
					</Link>
				)
			}
			<div className="flex items-center">
				<ThemeToggle />
				<SlashIcon className="size-6 text-muted-foreground/50" />
				{
					session?.user ? (
						<div className="flex items-center justify-between">
							<UserMenu user={session.user} />
							<SlashIcon className="size-6 text-muted-foreground/50" />
							<ProfilePanel profiles={result} user={session.user} />
						</div>
					) : (
						<Button variant="link" asChild className="-ml-2">
							<Link href="/login">Login</Link>
						</Button>
					)
				}
			</div>
		</>
	)
}

export function Header() {
	return (
		<header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
			<div className="flex items-center">
				<Suspense fallback={<div className="flex-1 overflow-auto" />}>
					<UserOrLogin />
				</Suspense>
			</div>
		</header>
	)
}