import { Session } from '@/lib/types'

import * as React from 'react'
import Link from 'next/link'

import { Suspense } from 'react';

import { auth } from '@/auth'

import { ShoppingCartIcon, SlashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/user-menu'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { ChatHistory } from './chat-history'

async function UserOrLogin() {
	const session = (await auth()) as Session
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
				<SlashIcon className="size-6 text-muted-foreground/50" />
				{
					session?.user ? (
						<UserMenu user={session.user} />
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