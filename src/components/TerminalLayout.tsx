import { ReactNode } from "react";
import { MatrixAnimation } from "./MatrixAnimation";

interface TerminalLayoutProps {
    children: ReactNode;
}

const navigation = [
    { path: "/", label: "home" },
    { path: "/about", label: "about" },
    { path: "/projects", label: "projects" },
    { path: "/blog", label: "blog" },
    { path: "/contact", label: "contact" },
];

export function TerminalLayout({ children }: TerminalLayoutProps) {
    return (
        <div className="w-screen h-screen bg-background/50 text-text font-mono overflow-hidden relative flex items-center justify-center p-2 md:p-8">
            {/* Terminal window container with border */}
            <div className="w-full h-full max-w-[1400px] bg-background relative flex flex-col border-2 border-border/80 shadow-[0_0_40px_rgba(157,78,221,0.3)]">
                {/* Terminal window chrome/UI */}
                <div className="absolute inset-0 border-2 border-accent/20 pointer-events-none z-40">
                    {/* Top-left corner accent */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent/30"></div>
                    {/* Top-right corner accent */}
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent/30"></div>
                    {/* Bottom-left corner accent */}
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent/30"></div>
                    {/* Bottom-right corner accent */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent/30"></div>
                </div>

                {/* Terminal grid background */}
                <div className="absolute inset-0 terminal-grid opacity-10 pointer-events-none" />

                {/* Scanlines overlay */}
                <div className="absolute inset-0 scanlines pointer-events-none" />

                {/* CRT flicker effect on edges */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    <div className="absolute inset-0 animate-flicker bg-linear-to-b from-accent/5 via-transparent to-accent/5" />
                </div>

                {/* Matrix animation overlay - hidden on mobile */}
                <div className="hidden md:block">
                    <MatrixAnimation columnCount={18} speed={0.6} />
                </div>

                {/* Fixed top navigation */}
                <header className="flex flex-wrap items-center justify-center gap-2 md:gap-6 py-2 md:py-4 bg-background/80 backdrop-blur-sm border-b border-border z-50 sticky top-0 px-2">
                    {navigation.map((nav) => (
                        <a
                            key={nav.path}
                            href={nav.path}
                            className="font-mono transition-all duration-300 text-terminal hover:text-accent-glow hover:text-glow box-glow-hover px-2 md:px-4 py-1.5 md:py-2 border border-terminal/30 hover:border-accent/50 text-xs md:text-base"
                        >
                            <span className="select-none">&gt; {nav.label}</span>
                        </a>
                    ))}
                </header>

                {/* Main terminal output area - scrollable */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden pl-2 pr-2 md:pr-6 py-4 md:py-6 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Fixed bottom command input - hidden on mobile */}
                <div className="hidden md:block sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border z-50 py-4 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-accent-glow font-bold text-sm">[jamal@future ~]$</span>
                            <input
                                type="text"
                                id="terminal-input"
                                className="flex-1 bg-transparent border-none outline-none text-text font-mono focus:ring-0 focus:outline-none text-sm"
                                autoFocus
                                autoComplete="off"
                                spellCheck="false"
                            />
                            <span className="inline-block animate-blink text-terminal">_</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
