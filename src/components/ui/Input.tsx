"use client";

import React, { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  icon,
  fullWidth = false,
  className = "",
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label className="block text-purple-300 text-sm mb-1 ml-1">
          {label}
        </label>
      )}

      <div className={`relative group ${isFocused ? "z-10" : ""}`}>
        <div
          className={`
            absolute -inset-0.5 rounded-md opacity-75 
            ${
              isFocused
                ? "bg-purple-600/30 blur-sm animate-pulse"
                : "bg-transparent"
            }
            transition-all duration-300
          `}
        />

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-purple-400">{icon}</div>
          )}

          <input
            className={`
              w-full bg-[#0a0a12] text-gray-200 border border-purple-900/50 
              rounded-md py-2 px-3 outline-none transition-all duration-300
              placeholder:text-gray-500
              ${icon ? "pl-10" : ""}
              ${
                isFocused
                  ? "border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : ""
              }
              ${error ? "border-red-500" : ""}
              hover:border-purple-700
              ${className}
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
  );
}
