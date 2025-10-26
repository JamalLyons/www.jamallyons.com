import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TerminalLayout } from "../components/TerminalLayout";
import { PageTransition } from "../components/PageTransition";
import { siteConfig } from "../config/siteConfig";

export const Route = createFileRoute("/blog")({
    component: Blog,
});

interface Line {
    text: string;
    style?: string;
    delay?: number;
}

function Blog() {
    const location = useLocation();
    const [showContent, setShowContent] = useState(false);
    const [currentLine, setCurrentLine] = useState(0);
    const [displayedLines, setDisplayedLines] = useState<typeof initLines>([]);
    const [showPosts, setShowPosts] = useState(false);
    const [isTyping, setIsTyping] = useState(true);

    const blogPosts = siteConfig.blogs;

    const initLines: Line[] = [
        { text: "[jamal_lyons:~]$ ls ./blog", style: "text-accent-glow font-bold", delay: 100 },
        { text: "", delay: 300 },
        { text: "> Scanning blog directory...", style: "text-terminal", delay: 200 },
        { text: `> Found ${blogPosts.length} articles`, style: "text-terminal", delay: 100 },
        { text: "", delay: 500 },
    ];

    useEffect(() => {
        setShowContent(false);
        setCurrentLine(0);
        setDisplayedLines([]);
        setShowPosts(false);
        setIsTyping(false);
        const timer = setTimeout(() => {
            setShowContent(true);
            setIsTyping(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    useEffect(() => {
        if (showContent && isTyping && currentLine < initLines.length) {
            const delay = initLines[currentLine].delay || 100;
            const timer = setTimeout(() => {
                setDisplayedLines((prev) => [...prev, initLines[currentLine]]);
                setCurrentLine((prev) => prev + 1);
            }, delay);
            return () => clearTimeout(timer);
        } else if (currentLine === initLines.length) {
            setIsTyping(false);
            setTimeout(() => setShowPosts(true), 200);
        }
    }, [showContent, isTyping, currentLine]);

    return (
        <TerminalLayout>
            <PageTransition trigger={location.pathname}>
                {showContent && (
                    <div className="space-y-1 text-left">
                        {displayedLines.map((line, index) => (
                            <div
                                key={index}
                                className={`${line.style || ""} ${line.text === "" ? "h-3" : ""}`}
                            >
                                {line.text === "" ? "\u00A0" : line.text}
                            </div>
                        ))}

                        {showPosts && (
                            <div className="space-y-6 pt-4 animate-fade-in">
                                {blogPosts.map((post, index) => (
                                    <div
                                        key={post.title}
                                        className="space-y-3 border-l-2 border-accent/30 pl-4 animate-slide-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-baseline gap-3 flex-wrap">
                                            <span className="text-terminal font-bold text-lg">
                                                &gt; {post.title}
                                            </span>
                                            <span className="text-xs text-text/50">{post.date} • {post.readTime}</span>
                                        </div>

                                        <div className="text-sm text-text/70 pl-2">
                                            {post.description}
                                        </div>

                                        <div className="flex flex-wrap gap-2 pl-2">
                                            {post.tags.map((tag) => (
                                                <span key={tag} className="text-xs text-accent/80">
                                                    [{tag}]
                                                </span>
                                            ))}
                                        </div>

                                        <div className="pl-2">
                                            <a
                                                href={post.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-accent/70 hover:text-accent-glow hover:text-glow transition-colors"
                                            >
                                                read article →
                                            </a>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-4">
                                    <span className="inline-block animate-blink text-accent-glow">_</span>
                                </div>
                            </div>
                        )}

                        {!showPosts && (
                            <div className="pt-2">
                                <span className="inline-block animate-blink text-accent-glow">
                                    {isTyping ? "_" : ""}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </PageTransition>
        </TerminalLayout>
    );
}
