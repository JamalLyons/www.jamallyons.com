"use client";

import React from "react";

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
  return (
    <div
      className={`relative bg-gradient-to-b from-[#0c0c14] to-[#080810] border border-purple-900/30 rounded-lg overflow-hidden backdrop-blur-sm transition-all duration-300 ${
        hover
          ? "hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:-translate-y-1 hover:border-purple-700/50"
          : ""
      } ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
  );
}
