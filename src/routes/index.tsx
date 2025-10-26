import { createFileRoute, useLocation, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TerminalLayout } from "../components/TerminalLayout";
import { PageTransition } from "../components/PageTransition";
import { BootScreen } from "../components/BootScreen";
import { siteConfig } from "../config/siteConfig";

export const Route = createFileRoute("/")({
  component: Home,
  validateSearch: (search: Record<string, unknown>) => ({
    booted: (search.booted as string) || undefined,
  }),
});

function Home() {
  const location = useLocation();
  const search = useSearch({ from: '/' });
  const [showBootScreen, setShowBootScreen] = useState<boolean | null>(null);
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

  // Check if already booted from query param or session storage
  useEffect(() => {
    if (showBootScreen === null) {
      const checkIfBooted = () => {
        // Check query param first
        if (search.booted === '1') {
          return true;
        }

        // Check session storage with expiry
        const bootedValue = sessionStorage.getItem('booted');
        const bootedTime = sessionStorage.getItem('bootedTime');

        if (bootedValue === '1' && bootedTime) {
          const now = Date.now();
          const bootTime = parseInt(bootedTime);
          const oneHourInMs = 60 * 60 * 1000;

          // If less than 1 hour has passed, still booted
          if (now - bootTime < oneHourInMs) {
            return true;
          } else {
            // Expired, clear storage
            sessionStorage.removeItem('booted');
            sessionStorage.removeItem('bootedTime');
          }
        }

        return false;
      };

      const isBooted = checkIfBooted();
      setShowBootScreen(!isBooted);
    }
  }, [search.booted, showBootScreen]);

  useEffect(() => {
    if (!bootComplete && !showBootScreen && currentBootLine < bootSequence.length) {
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
  }, [currentBootLine, bootComplete, showBootScreen, bootSequence.length]);

  const handleBoot = () => {
    // Store in session storage to persist across refreshes (1 = booted, 0 = not booted)
    sessionStorage.setItem('booted', '1');
    // Store timestamp for 1 hour expiry
    sessionStorage.setItem('bootedTime', Date.now().toString());

    // Update URL with query param
    window.history.replaceState(
      { ...window.history.state, as: undefined, scroll: undefined },
      '',
      window.location.pathname + '?booted=1'
    );
    setShowBootScreen(false);
  };

  // Don't render anything until we know if we should show boot screen
  if (showBootScreen === null) {
    return null;
  }

  // Show boot screen if not booted
  if (showBootScreen) {
    return <BootScreen onBoot={handleBoot} />;
  }

  // Show normal content with terminal animation
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
                  <div>• Type <span className="text-accent">&gt; help</span> to see available commands</div>
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
                <div className="pl-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {siteConfig.social.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text/60 hover:text-accent transition-colors whitespace-nowrap"
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
