import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TerminalLayout } from "../components/TerminalLayout";
import { TypewriterText } from "../components/TypewriterText";
import { PageTransition } from "../components/PageTransition";
import { siteConfig } from "../config/siteConfig";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const location = useLocation();
  const [bootComplete, setBootComplete] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [currentBootLine, setCurrentBootLine] = useState(0);

  const bootSequence = [
    "[jamal@future ~]$ boot --portfolio",
    "> Initializing Jamal Lyons' digital space...",
    "> Loading system modules... [OK]",
    "> Establishing secure connection... [OK]",
    "> Access granted.",
    "> Welcome to my world.",
  ];

  useEffect(() => {
    if (!bootComplete && currentBootLine < bootSequence.length) {
      const timer = setTimeout(() => {
        setCurrentBootLine((prev) => prev + 1);
        if (currentBootLine === bootSequence.length - 1) {
          setTimeout(() => {
            setBootComplete(true);
            setTimeout(() => setShowWelcome(true), 300);
          }, 800);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentBootLine, bootComplete, bootSequence.length]);

  return (
    <TerminalLayout>
      <PageTransition trigger={location.pathname}>
        <div className="space-y-4 text-left">
          {/* Boot Sequence */}
          {!bootComplete && (
            <div className="space-y-2 animate-flicker">
              {bootSequence.slice(0, currentBootLine + 1).map((line, index) => (
                <div
                  key={index}
                  className={`${index === 0 ? "text-accent-glow font-bold" : "text-terminal"
                    } animate-fade-in`}
                >
                  {line}
                </div>
              ))}
              {currentBootLine < bootSequence.length && (
                <span className="inline-block animate-blink text-terminal">_</span>
              )}
            </div>
          )}

          {/* Welcome Message */}
          {showWelcome && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4 border-l-2 border-accent/50 pl-4 py-4">
                <div className="text-accent-glow text-2xl font-bold">
                  {siteConfig.name}
                </div>
                <div className="text-text">{siteConfig.role}</div>
                <div className="text-terminal">
                  Building systems that connect people and technology
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="text-terminal font-bold">&gt; quick_access</div>
                <div className="pl-4 space-y-2 text-text/80">
                  <div>• Type <span className="text-accent">&gt; about</span> to learn more</div>
                  <div>• Type <span className="text-accent">&gt; projects</span> to see my work</div>
                  <div>• Type <span className="text-accent">&gt; contact</span> to send a message</div>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-border/30">
                <div className="text-terminal font-bold">&gt; system.status</div>
                <div className="pl-4 space-y-2 text-sm text-text/70">
                  <div>Build: v3.0.0 | Framework: TanStack Start</div>
                  <div>Status: <span className="text-terminal">ONLINE</span> | Last Deploy: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="text-terminal font-bold">&gt; connect.social</div>
                <div className="pl-4 flex gap-6 text-sm">
                  {siteConfig.social.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text/60 hover:text-accent transition-colors"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </TerminalLayout>
  );
}
