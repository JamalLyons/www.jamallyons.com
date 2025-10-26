/// <reference types="vite/client" />

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import appStyles from '../styles.css?url'

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
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
      whoami: "info",
      ls: "list",
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
              // Clear input and navigate
              input.value = '';
              window.location.href = target;
            } else if (target === "help") {
              console.log("Available commands: home, about, projects, contact, help, clear, whoami, ls");
              input.value = '';
            } else if (target === "info") {
              console.log("Jamal Lyons - Backend Engineer & CS Student");
              input.value = '';
            } else if (target === "clear") {
              window.location.reload();
            } else if (command) {
              console.log(`Command not found: ${command}. Type 'help' for available commands.`);
              input.value = '';
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
