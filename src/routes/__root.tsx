/// <reference types="vite/client" />

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import appStyles from '../styles.css?url'

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const [showHelp, setShowHelp] = useState(false);
  const [commandOutput, setCommandOutput] = useState<string | null>(null);

  useEffect(() => {
    let commandHistory: string[] = [];
    let historyIndex = -1;

    const validCommands: { [key: string]: string } = {
      home: "/",
      about: "/about",
      projects: "/projects",
      blog: "/blog",
      contact: "/contact",
      help: "help",
      clear: "clear",
      shutdown: "shutdown",
      whoami: "info",
      ls: "list",
    };

    const commands: { [key: string]: () => void } = {
      shutdown: () => {
        // Clear boot session and redirect to home
        sessionStorage.removeItem('booted');
        sessionStorage.removeItem('bootedTime');
        window.location.href = '/';
      },
    };

    const handleTerminalInput = (e: KeyboardEvent) => {
      const input = document.getElementById('terminal-input') as HTMLInputElement;
      if (!input) return;

      // Ignore if user is typing in the actual input
      if (e.target === input) {
        // Handle arrow keys for history
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (commandHistory.length > 0) {
            historyIndex = historyIndex <= 0 ? commandHistory.length - 1 : historyIndex - 1;
            input.value = commandHistory[historyIndex];
          }
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyIndex >= 0) {
            historyIndex = historyIndex >= commandHistory.length - 1 ? -1 : historyIndex + 1;
            input.value = historyIndex === -1 ? '' : commandHistory[historyIndex];
          }
          return;
        }

        // Handle Enter key
        if (e.key === 'Enter') {
          const command = input.value.trim().toLowerCase();
          if (command) {
            // Add to history
            commandHistory = [...commandHistory, command];
            historyIndex = -1;

            const target = validCommands[command];

            if (target?.startsWith("/")) {
              // Navigate to route
              input.value = '';
              window.location.href = target;
            } else if (target === "help") {
              setShowHelp(true);
              input.value = '';
            } else if (target === "info") {
              setCommandOutput("A coding genius, a problem solver, and a quick learner.");
              input.value = '';
              setTimeout(() => setCommandOutput(null), 3000);
            } else if (target === "list") {
              setCommandOutput("Available routes:\n  - home (/)  - about (/about)  - projects (/projects)  - blog (/blog)  - contact (/contact)");
              input.value = '';
              setTimeout(() => setCommandOutput(null), 8000);
            } else if (target === "clear") {
              // Refresh the page
              window.location.reload();
            } else if (target === "shutdown") {
              commands.shutdown();
            } else if (command) {
              setCommandOutput(`Command not found: ${command}. Type 'help' for available commands.`);
              input.value = '';
              setTimeout(() => setCommandOutput(null), 3000);
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleTerminalInput);

    return () => {
      document.removeEventListener('keydown', handleTerminalInput);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />

        {/* Help Popup Modal */}
        {showHelp && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowHelp(false)}>
            <div className="bg-background border-2 border-accent/50 shadow-[0_0_40px_rgba(157,78,221,0.5)] max-w-2xl w-full max-h-[80vh] overflow-auto relative" onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-4 right-4 text-text/50 hover:text-accent-glow transition-colors text-2xl font-bold leading-none w-8 h-8 flex items-center justify-center border border-border/30 hover:border-accent"
              >
                ×
              </button>

              {/* Content */}
              <div className="p-8">
                <h2 className="text-accent-glow text-3xl font-bold font-mono mb-6">Available Commands</h2>

                <div className="space-y-4 text-text/80">
                  <div className="border-l-2 border-terminal pl-4 py-2">
                    <div className="font-mono text-terminal text-sm">&gt; home</div>
                    <div className="text-sm mt-1">Navigate to home page</div>
                  </div>

                  <div className="border-l-2 border-terminal pl-4 py-2">
                    <div className="font-mono text-terminal text-sm">&gt; about</div>
                    <div className="text-sm mt-1">View about page</div>
                  </div>

                  <div className="border-l-2 border-terminal pl-4 py-2">
                    <div className="font-mono text-terminal text-sm">&gt; projects</div>
                    <div className="text-sm mt-1">View projects page</div>
                  </div>

                  <div className="border-l-2 border-terminal pl-4 py-2">
                    <div className="font-mono text-terminal text-sm">&gt; contact</div>
                    <div className="text-sm mt-1">View contact page</div>
                  </div>

                  <div className="border-l-2 border-accent/50 pl-4 py-2">
                    <div className="font-mono text-accent text-sm">&gt; help</div>
                    <div className="text-sm mt-1">Show this help dialog</div>
                  </div>

                  <div className="border-l-2 border-accent/50 pl-4 py-2">
                    <div className="font-mono text-accent text-sm">&gt; clear</div>
                    <div className="text-sm mt-1">Refresh the page</div>
                  </div>

                  <div className="border-l-2 border-accent/50 pl-4 py-2">
                    <div className="font-mono text-accent text-sm">&gt; shutdown</div>
                    <div className="text-sm mt-1">Clear boot session and return to login</div>
                  </div>

                  <div className="border-l-2 border-accent/50 pl-4 py-2">
                    <div className="font-mono text-accent text-sm">&gt; whoami</div>
                    <div className="text-sm mt-1">Display user information</div>
                  </div>

                  <div className="border-l-2 border-accent/50 pl-4 py-2">
                    <div className="font-mono text-accent text-sm">&gt; ls</div>
                    <div className="text-sm mt-1">List available routes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Command Output Display */}
        {commandOutput && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
            <div className="bg-background border-2 border-terminal/50 px-6 py-4 shadow-[0_0_20px_rgba(0,255,183,0.3)] max-w-2xl">
              <pre className="text-terminal text-sm font-mono whitespace-pre-wrap">{commandOutput}</pre>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Portfolio | Jamal Lyons",
      },
      {
        name: "description",
        content: "A portfolio website for Jamal Lyons, a backend engineer and computer science student.",
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appStyles,
      },
    ],
  }),
  component: () => {
    return (
      <RootDocument>
        <Outlet />
      </RootDocument>
    );
  },
});
