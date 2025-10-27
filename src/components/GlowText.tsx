import type { ReactNode } from "react";

interface GlowTextProps {
	children: ReactNode;
	className?: string;
	intensity?: "normal" | "strong";
}

export function GlowText({ children, className = "", intensity = "normal" }: GlowTextProps) {
	const glowClass = intensity === "strong" ? "text-glow-strong" : "text-glow";

	return <span className={`text-accent ${glowClass} ${className}`}>{children}</span>;
}
