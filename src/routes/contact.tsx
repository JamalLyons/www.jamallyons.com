import { createFileRoute, useLocation } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import { PageTransition } from "../components/PageTransition";
import { TerminalLayout } from "../components/TerminalLayout";

export const Route = createFileRoute("/contact")({
	component: Contact,
});

function Contact() {
	const location = useLocation();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [isSubmitted, _setIsSubmitted] = useState(false);
	const [_isSubmitting, _setIsSubmitting] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [showComingSoon, setShowComingSoon] = useState(false);
	const [displayedLines, setDisplayedLines] = useState<string[]>([]);
	const [currentLine, setCurrentLine] = useState(0);

	const initLines = [
		"[jamal@future ~]$ send_transmission",
		"",
		"> Initializing secure transmission protocol...",
		"> Connection established.",
		"",
	];

	useEffect(() => {
		if (currentLine < initLines.length) {
			const timer = setTimeout(() => {
				setDisplayedLines((prev) => [...prev, initLines[currentLine]]);
				setCurrentLine((prev) => prev + 1);

				if (currentLine === initLines.length - 1) {
					setTimeout(() => setShowForm(true), 300);
				}
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [currentLine]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		// Show coming soon notification instead of submitting
		setShowComingSoon(true);
		// Auto-hide after 5 seconds
		setTimeout(() => {
			setShowComingSoon(false);
		}, 5000);
	};

	return (
		<TerminalLayout>
			<PageTransition trigger={location.pathname}>
				<div className="space-y-1 text-left">
					{!isSubmitted && (
						<>
							{displayedLines.map((line, index) => (
								<div
									key={`${(index + Math.random()) ^ 2}`}
									className={`${
										line.startsWith("[jamal@future")
											? "text-accent-glow font-bold"
											: line.startsWith(">")
												? "text-terminal"
												: line === ""
													? "h-3"
													: "text-text/80"
									}`}
								>
									{line === "" ? "\u00A0" : line}
								</div>
							))}

							{showForm && (
								<div className="space-y-6 pt-4 animate-fade-in">
									<form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
										<div className="space-y-2">
											<label className="block text-terminal text-sm">&gt; enter_name:</label>
											<input
												type="text"
												value={name}
												onChange={(e) => setName(e.target.value)}
												required
												className="w-full bg-background/50 border border-border/50 text-text px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent focus:box-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
												placeholder="Your name"
												disabled={true}
											/>
										</div>

										<div className="space-y-2">
											<label className="block text-terminal text-sm">&gt; enter_email:</label>
											<input
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												required
												className="w-full bg-background/50 border border-border/50 text-text px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent focus:box-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
												placeholder="your.email@domain.com"
												disabled={true}
											/>
										</div>

										<div className="space-y-2">
											<label className="block text-terminal text-sm">&gt; enter_message:</label>
											<textarea
												value={message}
												onChange={(e) => setMessage(e.target.value)}
												required
												rows={6}
												className="w-full bg-background/50 border border-border/50 text-text px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent focus:box-glow transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
												placeholder="Type your message here..."
												disabled={true}
											/>
										</div>

										<button
											type="submit"
											className="font-mono text-terminal border border-terminal/50 px-6 py-2 text-sm transition-all duration-300 box-glow-hover hover:bg-terminal/10 hover:text-accent-glow active:scale-95"
										>
											&gt; transmit
										</button>
									</form>

									<div className="pt-4">
										<span className="inline-block animate-blink text-accent-glow">_</span>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</PageTransition>

			{/* Coming Soon Notification */}
			{showComingSoon && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
					<div className="bg-background border-2 border-accent/50 shadow-[0_0_40px_rgba(157,78,221,0.5)] max-w-md w-full p-8 relative animate-slide-up">
						<button
							type="button"
							onClick={() => setShowComingSoon(false)}
							className="absolute top-4 right-4 text-text/50 hover:text-accent-glow transition-colors text-2xl font-bold leading-none w-8 h-8 flex items-center justify-center border border-border/30 hover:border-accent"
						>
							×
						</button>

						<div className="space-y-4">
							<div className="text-accent-glow text-2xl font-bold font-mono">Contact Coming Soon</div>
							<div className="text-text">
								I'm currently setting up the backend infrastructure for secure message transmission.
							</div>

							<div className="space-y-2 text-sm text-text/70">
								<div>
									Backend: <span className="text-accent">In Development</span>
								</div>
								<div>
									Expected Launch: <span className="text-terminal">Coming Soon</span>
								</div>
								<div>Security: Encrypted transmission protocol</div>
							</div>

							<div className="pt-4 border-t border-border/30">
								<div className="text-terminal text-sm font-bold mb-2">&gt; Follow for updates</div>
								<div className="text-text/70 text-sm">Stay tuned for when the contact system launches!</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</TerminalLayout>
	);
}
