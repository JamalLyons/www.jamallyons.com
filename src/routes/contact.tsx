import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState, FormEvent, useEffect } from "react";
import { TerminalLayout } from "../components/TerminalLayout";
import { PageTransition } from "../components/PageTransition";

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
    }, [currentLine, initLines.length]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate transmission
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 2000);
    };

    return (
        <TerminalLayout>
            <PageTransition trigger={location.pathname}>
                <div className="space-y-1 text-left">
                    {!isSubmitted ? (
                        <>
                            {displayedLines.map((line, index) => (
                                <div
                                    key={index}
                                    className={`${line.startsWith("[jamal@future")
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
                                            <label className="block text-terminal text-sm">
                                                &gt; enter_name:
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="w-full bg-background/50 border border-border/50 text-text px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent focus:box-glow transition-all"
                                                placeholder="Your name"
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-terminal text-sm">
                                                &gt; enter_email:
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full bg-background/50 border border-border/50 text-text px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent focus:box-glow transition-all"
                                                placeholder="your.email@domain.com"
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-terminal text-sm">
                                                &gt; enter_message:
                                            </label>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                required
                                                rows={6}
                                                className="w-full bg-background/50 border border-border/50 text-text px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent focus:box-glow transition-all resize-none"
                                                placeholder="Type your message here..."
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`font-mono text-terminal border border-terminal/50 px-6 py-2 text-sm transition-all duration-300 box-glow-hover hover:bg-terminal/10 hover:text-accent-glow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isSubmitting ? "animate-pulse" : ""
                                                }`}
                                        >
                                            {isSubmitting ? "&gt; transmitting..." : "&gt; transmit"}
                                        </button>
                                    </form>

                                    {!isSubmitting && (
                                        <div className="pt-4">
                                            <span className="inline-block animate-blink text-accent-glow">_</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-2 animate-fade-in">
                            <div className="text-accent-glow font-bold">
                                [jamal@future ~]$ transmission_status
                            </div>
                            <div className="h-3"></div>
                            <div className="text-terminal">&gt; Transmission received successfully.</div>
                            <div className="h-3"></div>
                            <div className="space-y-1 text-sm text-text/70 pl-4 border-l-2 border-terminal/30">
                                <div>Status: <span className="text-terminal">DELIVERED</span></div>
                                <div>From: {name} ({email})</div>
                                <div>Message length: {message.length} characters</div>
                                <div>Timestamp: {new Date().toLocaleString()}</div>
                            </div>
                            <div className="h-3"></div>
                            <div className="text-accent italic text-sm">
                                Thank you for reaching out! I'll respond to your transmission soon.
                            </div>
                            <div className="h-3"></div>
                            <button
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setShowForm(false);
                                    setCurrentLine(0);
                                    setDisplayedLines([]);
                                    setName("");
                                    setEmail("");
                                    setMessage("");
                                }}
                                className="font-mono text-terminal/70 hover:text-terminal border border-terminal/30 hover:border-terminal/50 px-4 py-2 text-sm transition-all box-glow-hover"
                            >
                                &gt; send_another
                            </button>
                            <div className="pt-4">
                                <span className="inline-block animate-blink text-accent-glow">_</span>
                            </div>
                        </div>
                    )}
                </div>
            </PageTransition>
        </TerminalLayout>
    );
}
