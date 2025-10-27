import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useLocation } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
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
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [displayedLines, setDisplayedLines] = useState<string[]>([]);
	const [currentLine, setCurrentLine] = useState(0);
	const [errors, setErrors] = useState({
		name: "",
		email: "",
		message: "",
	});
	const { mutate, isPending, isError, isSuccess } = useMutation({
		mutationFn: useConvexMutation(api.contact.upsertMessage),
	});

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

	const validateForm = () => {
		const newErrors = {
			name: "",
			email: "",
			message: "",
		};

		// Validate name (3-30 characters)
		if (name.trim().length < 3) {
			newErrors.name = "Name must be at least 3 characters";
		} else if (name.trim().length > 30) {
			newErrors.name = "Name must be 30 characters or less";
		}

		// Validate email syntax
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			newErrors.email = "Please enter a valid email address";
		}

		// Validate message (20-500 characters)
		if (message.trim().length < 20) {
			newErrors.message = "Message must be at least 20 characters";
		} else if (message.trim().length > 500) {
			newErrors.message = "Message must be 500 characters or less";
		}

		setErrors(newErrors);
		return !newErrors.name && !newErrors.email && !newErrors.message;
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		// Save the data to the db
		mutate({
			name: name.trim(),
			email: email.trim(),
			message: message.trim(),
		});

		// Simulate submission delay
		setTimeout(() => {
			setIsSubmitting(false);
			setIsSubmitted(true);

			// Reset form after successful submission
			setName("");
			setEmail("");
			setMessage("");
			setErrors({ name: "", email: "", message: "" });
		}, 500);
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
											<label htmlFor="name-input" className="block text-terminal text-sm">
												&gt; enter_name:
											</label>
											<input
												id="name-input"
												type="text"
												value={name}
												onChange={(e) => setName(e.target.value)}
												required
												className="w-full bg-background/50 border border-border/50 text-text px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent focus:box-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
												placeholder="Your name"
												disabled={isSubmitting}
											/>
											{errors.name && <div className="text-red-400 text-xs font-mono">! {errors.name}</div>}
										</div>

										<div className="space-y-2">
											<label htmlFor="email-input" className="block text-terminal text-sm">
												&gt; enter_email:
											</label>
											<input
												id="email-input"
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												required
												className="w-full bg-background/50 border border-border/50 text-text px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent focus:box-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
												placeholder="your.email@domain.com"
												disabled={isSubmitting}
											/>
											{errors.email && <div className="text-red-400 text-xs font-mono">! {errors.email}</div>}
										</div>

										<div className="space-y-2">
											<label htmlFor="message-input" className="block text-terminal text-sm">
												&gt; enter_message:
											</label>
											<textarea
												id="message-input"
												value={message}
												onChange={(e) => setMessage(e.target.value)}
												required
												rows={6}
												className="w-full bg-background/50 border border-border/50 text-text px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent focus:box-glow transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
												placeholder="Type your message here..."
												disabled={isSubmitting}
											/>
											{errors.message && <div className="text-red-400 text-xs font-mono">! {errors.message}</div>}
											<div className="text-text/50 text-xs font-mono">{message.length}/500 characters</div>
										</div>

										<button
											type="submit"
											disabled={isSubmitting}
											className="font-mono text-terminal border border-terminal/50 px-6 py-2 text-sm transition-all duration-300 box-glow-hover hover:bg-terminal/10 hover:text-accent-glow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{isSubmitting ? "&gt; transmitting..." : "&gt; transmit"}
										</button>
									</form>

									<div className="pt-4">
										<span className="inline-block animate-blink text-accent-glow">_</span>
									</div>
								</div>
							)}
						</>
					)}

					{isSubmitted && (
						<div className="space-y-1 animate-fade-in">
							<div className="text-terminal">&gt; Transmission successful!</div>
							<div className="text-text/80">&gt; Your message has been received.</div>
						</div>
					)}
				</div>
			</PageTransition>
		</TerminalLayout>
	);
}
