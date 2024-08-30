import '@/app/global.css';

import { inter } from '@/app/fonts';

import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'

export const metadata = {
	title: {
		template: `%s | Smart Shop`,
		default: 'Smart Shop'
	},
	description: 'Demo for Smart Shop',
	// Current website URL
	metadataBase: new URL('https://smart-shop-demo.vercel.app'),
	icons: {
		icon: '/favicon.ico',
	}
}

export const viewport = {
	themeColor: [
	  	{ media: '(prefers-color-scheme: light)', color: 'white' },
	  	{ media: '(prefers-color-scheme: dark)', color: 'black' }
	]
}

interface RootLayoutProps {
	children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en">
			<body className={`${inter.className} antialiased`}>
				<Toaster position="top-center" />
				<Providers
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<div className="flex flex-col min-h-screen">
						<Header />
						<main className="flex flex-col flex-1 bg-muted/50">
							{children}
						</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
  