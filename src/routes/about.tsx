import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageTransition } from "../components/PageTransition";
import { TerminalLayout } from "../components/TerminalLayout";
import { siteConfig } from "../config/siteConfig";

export const Route = createFileRoute("/about")({
	component: About,
});

interface Line {
	text: string;
	style?: string;
	delay?: number;
}

function About() {
	const location = useLocation();
	const [showContent, setShowContent] = useState(false);
	const [currentLine, setCurrentLine] = useState(0);
	const [displayedLines, setDisplayedLines] = useState<Line[]>([]);
	const [isTyping, setIsTyping] = useState(true);

	// Build bio lines from config
	const bioLines: Line[] = [
		{
			text: "[jamal_lyons:~]$ whoami",
			style: "text-accent-glow font-bold",
			delay: 100,
		},
		{ text: "", delay: 300 },
		{ text: siteConfig.bio.intro, style: "text-text", delay: 100 },
		...siteConfig.bio.description.map((text) => ({
			text,
			style: "text-text",
			delay: 80,
		})),
		{ text: "", delay: 500 },
		{
			text: "[jamal_lyons:~]$ cat stack.txt",
			style: "text-accent-glow font-bold",
			delay: 100,
		},
		{ text: "", delay: 300 },
		...siteConfig.stack.map((item) => ({
			text: item,
			style: "text-terminal",
			delay: 100,
		})),
		{ text: "", delay: 500 },
		{
			text: "[jamal_lyons:~]$ echo $FOCUS_AREAS",
			style: "text-accent-glow font-bold",
			delay: 100,
		},
		{ text: "", delay: 300 },
		...siteConfig.focusAreas.map((area) => ({
			text: area,
			style: "text-terminal",
			delay: 120,
		})),
		{ text: "", delay: 500 },
		{
			text: "[jamal_lyons:~]$ cat mission.txt",
			style: "text-accent-glow font-bold",
			delay: 100,
		},
		{ text: "", delay: 300 },
		...siteConfig.mission.map((quote) => ({
			text: `"${quote}"`,
			style: "text-accent italic",
			delay: 150,
		})),
		{ text: "", delay: 500 },
		{
			text: "[jamal_lyons:~]$ status",
			style: "text-accent-glow font-bold",
			delay: 100,
		},
		{
			text: `Status: ${siteConfig.bio.status}`,
			style: "text-terminal font-bold",
			delay: 200,
		},
	];

	useEffect(() => {
		setShowContent(false);
		setCurrentLine(0);
		setDisplayedLines([]);
		setIsTyping(false);
		const timer = setTimeout(() => {
			setShowContent(true);
			setIsTyping(true);
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (showContent && isTyping && currentLine < bioLines.length) {
			const delay = bioLines[currentLine].delay || 100;
			const timer = setTimeout(() => {
				setDisplayedLines((prev) => [...prev, bioLines[currentLine]]);
				setCurrentLine((prev) => prev + 1);
			}, delay);
			return () => clearTimeout(timer);
		} else if (currentLine === bioLines.length) {
			setIsTyping(false);
		}
	}, [showContent, isTyping, currentLine, bioLines.length, bioLines[currentLine]]);

	return (
		<TerminalLayout>
			<PageTransition trigger={location.pathname}>
				{showContent && (
					<div className="space-y-1 text-left">
						{displayedLines.map((line, index) => (
							<div key={`${(index + Math.random()) ^ 2}`} className={`${line.style || ""} ${line.text === "" ? "h-3" : ""}`}>
								{line.text === "" ? "\u00A0" : line.text}
							</div>
						))}
						<div className="pt-2">
							<span className="inline-block animate-blink text-accent-glow">{isTyping ? "_" : ""}</span>
						</div>
					</div>
				)}
			</PageTransition>
		</TerminalLayout>
	);
}
