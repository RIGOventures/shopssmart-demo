interface ChatLayoutProps {
	children: React.ReactNode
}

export default function Layout({ children }: ChatLayoutProps) {
	return (
		<div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
			{children}
		</div>
	);
}