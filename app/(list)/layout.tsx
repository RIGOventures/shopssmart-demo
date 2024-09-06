import { SidebarDesktop } from '@/components/sidebar/sidebar-desktop'

interface ChatLayoutProps {
	children: React.ReactNode
}

export default function Layout({ children }: ChatLayoutProps) {
	return (
		<div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
			<SidebarDesktop />
			{children}
		</div>
	);
}