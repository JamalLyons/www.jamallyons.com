"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavbarProps {
  logo?: React.ReactNode;
  items: NavItem[];
  rightContent?: React.ReactNode;
  className?: string;
}

export default function Navbar({
  logo,
  items,
  rightContent,
  className = "",
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0a0a14]/90 backdrop-blur-md shadow-lg py-3"
          : "bg-[#0a0a14]/40 backdrop-blur-sm py-4"
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            {logo || (
              <span className="text-purple-500 font-bold tracking-wider text-xl">
                jamal_lyons:~$
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative group px-3 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "text-purple-300"
                        : "text-gray-300 hover:text-purple-300"
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.label}</span>
                    </div>

                    {/* Animated underline */}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-0.5 transform origin-bottom-right transition-transform duration-300 ${
                        isActive
                          ? "bg-purple-500 scale-x-100"
                          : "bg-purple-500/70 scale-x-0 group-hover:scale-x-100 group-hover:origin-bottom-left"
                      }`}
                    />

                    {/* Glow effect */}
                    {isActive && (
                      <span className="absolute inset-0 rounded-md bg-purple-600/10 blur-sm" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Content */}
          {rightContent && (
            <div className="hidden md:block">{rightContent}</div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-purple-300 hover:text-purple-100 p-2 rounded-full hover:bg-purple-900/30 transition-colors"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-[#0a0a14] border-t border-purple-900/30">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-purple-900/20 text-purple-300 border-l-2 border-purple-500"
                    : "text-gray-300 hover:bg-purple-900/10 hover:text-purple-300"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}

          {/* Mobile Right Content */}
          {rightContent && (
            <div className="px-3 py-3 border-t border-purple-900/30 mt-2 pt-2">
              {rightContent}
            </div>
          )}
        </div>
      </div>

      {/* Navbar Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/40 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: "0 0 4px 1px rgba(168, 85, 247, 0.4)",
              opacity: Math.random() * 0.5 + 0.2,
              transform: `scale(${Math.random() * 0.5 + 0.5})`,
            }}
          />
        ))}

        {/* Top border glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </div>
    </nav>
  );
}
