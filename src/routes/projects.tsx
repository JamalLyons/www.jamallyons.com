import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TerminalLayout } from "../components/TerminalLayout";
import { PageTransition } from "../components/PageTransition";
import { siteConfig } from "../config/siteConfig";

export const Route = createFileRoute("/projects")({
    component: Projects,
});

function Projects() {
    const location = useLocation();
    const [currentLine, setCurrentLine] = useState(0);
    const [displayedLines, setDisplayedLines] = useState<string[]>([]);
    const [showProjects, setShowProjects] = useState(false);

    const projects = siteConfig.projects;

    const lines = [
        "[jamal_lyons:~]$ ls ./projects",
        "",
        "> Scanning project directory...",
        "",
    ];

    useEffect(() => {
        if (currentLine < lines.length) {
            const timer = setTimeout(() => {
                setDisplayedLines((prev) => [...prev, lines[currentLine]]);
                setCurrentLine((prev) => prev + 1);

                if (currentLine === lines.length - 1) {
                    setTimeout(() => setShowProjects(true), 400);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [currentLine, lines.length]);

    return (
        <TerminalLayout>
            <PageTransition trigger={location.pathname}>
                <div className="space-y-1 text-left">
                    {displayedLines.map((line, index) => (
                        <div
                            key={index}
                            className={`${line.startsWith("[jamal_lyons")
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

                    {showProjects && (
                        <div className="space-y-8 pt-4 animate-fade-in">
                            {projects.map((project, index) => (
                                <div
                                    key={project.name}
                                    className="space-y-3 border-l-2 border-accent/30 pl-4"
                                >
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-terminal font-bold text-lg">
                                            &gt; {project.name}/
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-1 border ${project.status === "production"
                                                ? "border-terminal/50 text-terminal"
                                                : project.status === "development"
                                                    ? "border-accent/50 text-accent"
                                                    : "border-text/20 text-text/40"
                                                }`}
                                        >
                                            {project.status}
                                        </span>
                                    </div>

                                    <div className="text-sm text-text/70 pl-2">
                                        {project.description}
                                    </div>

                                    <div className="flex flex-wrap gap-2 pl-2">
                                        {project.tech.map((tech) => (
                                            <span
                                                key={tech}
                                                className="text-xs text-accent/80"
                                            >
                                                [{tech}]
                                            </span>
                                        ))}
                                    </div>

                                    {project.github && (
                                        <div className="flex gap-4 pl-2 text-sm">
                                            <a
                                                href={project.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-terminal/70 hover:text-terminal hover:text-glow transition-colors"
                                            >
                                                github →
                                            </a>
                                        </div>
                                    )}

                                    {project.demo && (
                                        <div className="flex gap-4 pl-2 text-sm">
                                            <a
                                                href={project.demo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-accent/70 hover:text-accent-glow hover:text-glow transition-colors"
                                            >
                                                demo →
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}

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
