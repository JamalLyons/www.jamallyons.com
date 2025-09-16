"use client";

import React, { useEffect, useRef, useState } from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hover?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  interactive?: boolean;
}

export default function Card({
  title,
  children,
  footer,
  hover = true,
  className = "",
  titleClassName = "",
  contentClassName = "",
  footerClassName = "",
  onMouseEnter,
  onMouseLeave,
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [vars, setVars] = useState<Record<string, string>>({});

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isLowPerf = typeof window !== "undefined" && (window as any).__lowPerformanceDevice === true;
    setMotionEnabled(!(prefersReduced || isLowPerf));
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !motionEnabled) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;
    const rotateX = (py - 0.5) * -8; // tilt up/down
    const rotateY = (px - 0.5) * 10; // tilt left/right
    setVars({
      "--px": `${x}px`,
      "--py": `${y}px`,
      "--rx": `${rotateY}deg`,
      "--ry": `${rotateX}deg`,
    });
  };

  const handleMouseLeave = () => {
    setVars({ "--rx": "0deg", "--ry": "0deg" });
    onMouseLeave?.();
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={onMouseEnter}
      style={vars as React.CSSProperties}
      className={`relative bg-gradient-to-b from-[#0c0c14] to-[#080810] border border-purple-900/30 rounded-lg overflow-hidden backdrop-blur-sm transition-all duration-300 ${hover
          ? "hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:-translate-y-1 hover:border-purple-700/50"
          : ""
        } ${className}`}
    >
      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(180px circle at var(--px) var(--py), rgba(168,85,247,0.18), transparent 45%)",
        }}
      />

      {/* 3D tilt wrapper */}
      <div
        className="relative"
        style={{
          transform:
            motionEnabled ?
              "perspective(900px) rotateX(var(--ry)) rotateY(var(--rx)) translateZ(0)" :
              undefined,
          transformStyle: "preserve-3d",
          transition: "transform 300ms ease",
        }}
      >
        {/* Top border glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-600/50 to-transparent"></div>

        {title && (
          <div className={`p-4 border-b border-purple-900/30 ${titleClassName}`}>
            <h3 className="text-purple-300 font-semibold text-lg">{title}</h3>
          </div>
        )}

        <div className={`p-4 text-gray-300 ${contentClassName}`}>{children}</div>

        {footer && (
          <div
            className={`p-4 border-t border-purple-900/30 bg-purple-900/5 ${footerClassName}`}
          >
            {footer}
          </div>
        )}

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
          <div className="absolute top-0 right-0 transform rotate-45 translate-x-1/2 -translate-y-1/3 w-4 h-8 bg-purple-600/30"></div>
        </div>

        {/* Bottom right corner glow */}
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-purple-600/5 rounded-full blur-xl pointer-events-none"></div>
      </div>
    </div>
  );
}
