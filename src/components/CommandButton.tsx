import { Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";

interface CommandButtonProps {
	children: ReactNode;
	to: string;
	className?: string;
}

export function CommandButton({ children, to, className = "" }: CommandButtonProps) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Link
			to={to}
			className={`inline-block font-mono text-terminal border border-terminal/50 px-6 py-3 transition-all duration-300 box-glow-hover hover:bg-terminal/10 hover:text-accent-glow active:scale-95 ${className}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<span className={isHovered ? "text-glow" : ""}>&gt; {children}</span>
		</Link>
	);
}
