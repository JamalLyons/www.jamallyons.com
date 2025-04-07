"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOutsideClick?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOutsideClick = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Lock scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll when modal is closed
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOutsideClick) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleBackdropClick}
    >
      {/* Modal Backdrop Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/5 to-transparent opacity-40"></div>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-purple-400 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: "0 0 8px 2px rgba(168, 85, 247, 0.6)",
              opacity: Math.random() * 0.5 + 0.3,
              animationDelay: `${Math.random() * 5}s`,
              animation: "pulse 3s infinite ease-in-out",
            }}
          ></div>
        ))}
      </div>

      {/* Modal Content */}
      <div
        className={`relative ${
          sizeClasses[size]
        } w-full bg-gradient-to-b from-[#0c0c14] to-[#080810] rounded-lg shadow-2xl transform transition-all duration-300 border border-purple-900/40 overflow-hidden ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent"></div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-10 h-10 overflow-hidden">
          <div className="absolute top-0 right-0 transform rotate-45 translate-x-1/2 -translate-y-1/3 w-5 h-10 bg-purple-600/40"></div>
        </div>

        {/* Header */}
        {title && (
          <div className="px-6 py-4 border-b border-purple-900/30 flex items-center justify-between">
            <h3 className="text-purple-300 font-semibold text-lg">{title}</h3>
            <button
              onClick={onClose}
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 p-2 rounded-full transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 text-gray-300">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-purple-900/30 bg-purple-900/10">
            {footer}
          </div>
        )}

        {/* Glowing bottom-right corner effect */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-xl"></div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return isOpen ? createPortal(modalContent, document.body) : null;
}
