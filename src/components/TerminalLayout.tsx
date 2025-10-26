import { ReactNode } from "react";

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
        <div className="w-screen h-screen bg-background text-text font-mono overflow-hidden relative flex flex-col">
            {/* Terminal grid background */}
            <div className="absolute inset-0 terminal-grid opacity-10 pointer-events-none" />

            {/* Scanlines overlay */}
            <div className="absolute inset-0 scanlines pointer-events-none" />

            {/* CRT flicker effect on edges */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute inset-0 animate-flicker bg-linear-to-b from-accent/5 via-transparent to-accent/5" />
            </div>

            {/* Fixed top navigation */}
            <header className="flex items-center justify-center gap-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border z-50 sticky top-0">
                {navigation.map((nav) => (
                    <a
                        key={nav.path}
                        href={nav.path}
                        className="font-mono transition-all duration-300 text-terminal hover:text-accent-glow hover:text-glow box-glow-hover px-4 py-2 border border-terminal/30 hover:border-accent/50"
                    >
                        <span className="select-none">&gt; {nav.label}</span>
                    </a>
                ))}
            </header>

            {/* Main terminal output area - scrollable */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden pl-2 pr-6 py-6">
                <div className="max-w-5xl">
                    {children}
                </div>
            </main>

            {/* Fixed bottom command input */}
            <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border z-50 py-4 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-accent-glow font-bold">[jamal@future ~]$</span>
                        <input
                            type="text"
                            id="terminal-input"
                            className="flex-1 bg-transparent border-none outline-none text-text font-mono focus:ring-0 focus:outline-none"
                            autoFocus
                            autoComplete="off"
                            spellCheck="false"
                        />
                        <span className="inline-block animate-blink text-terminal">_</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
