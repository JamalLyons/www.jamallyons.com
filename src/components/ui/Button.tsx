"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "relative flex items-center justify-center font-medium transition-all duration-300 overflow-hidden";

  const variantStyles = {
    primary:
      "bg-purple-900/30 text-purple-300 border border-purple-700 hover:bg-purple-800/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:-translate-y-0.5",
    secondary:
      "bg-[#0a0a0f] text-electric-blue border border-electric-blue hover:bg-[#111122] hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] hover:-translate-y-0.5",
    outline:
      "bg-transparent text-purple-300 border border-purple-500 hover:bg-purple-900/20 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:-translate-y-0.5",
    ghost:
      "bg-transparent text-purple-300 hover:bg-purple-900/20 hover:shadow-[0_0_5px_rgba(168,85,247,0.2)] hover:-translate-y-0.5",
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1 rounded-md",
    md: "text-sm px-4 py-2 rounded-md",
    lg: "text-base px-6 py-3 rounded-lg",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {/* Animated glow effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/30 to-purple-600/0 opacity-0 group-hover:opacity-100 animate-pulse-slow"></span>

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        {children}
      </span>

      {/* Border glow pseudo-element */}
      <span className="absolute inset-0 border border-purple-500/50 rounded-md opacity-0 group-hover:opacity-100"></span>
    </button>
  );
}
