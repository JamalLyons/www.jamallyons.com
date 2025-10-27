import { type ReactNode, useEffect, useState } from "react";

interface PageTransitionProps {
  children: ReactNode;
  trigger: string;
}

export function PageTransition({ children, trigger }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Quick fade out
    setIsVisible(false);

    // Fade in with new content
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      {children}
    </div>
  );
}
