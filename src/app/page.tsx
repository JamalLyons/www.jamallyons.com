"use client";

import Blogs from "@/components/Blogs";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import { useEffect, useState } from "react";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    __lowPerformanceDevice?: boolean;
  }
}

// Performance detection helper
const detectLowPerformanceDevice = () => {
  // Early return if not in browser
  if (typeof window === "undefined") return false;

  // Check if prefers-reduced-motion is set
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Check if device is a low-end mobile
  const isLowEndMobile =
    window.innerWidth < 480 ||
    (typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 4);

  // Run a simple performance test
  const startTime = performance.now();
  let result = 0;
  for (let i = 0; i < 50000; i++) {
    // Reduced iteration count for better initial load
    result += Math.sin(i * 0.1) * Math.cos(i * 0.2);
  }
  const endTime = performance.now();

  // If the computation took more than 20ms, consider it a low-performance device
  const isSlowComputation = endTime - startTime > 20;

  return prefersReducedMotion || isLowEndMobile || isSlowComputation;
};

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted
    setMounted(true);

    // Detect device performance on client-side
    const isLowPerformance = detectLowPerformanceDevice();

    // Store the result globally for components to access
    window.__lowPerformanceDevice = isLowPerformance;

    // Apply appropriate CSS class to body for performance optimizations
    if (isLowPerformance) {
      document.body.classList.add("low-performance");

      // Reduce particles count for low-end devices
      document.documentElement.style.setProperty(
        "--particle-count-multiplier",
        "0.5"
      );
    } else {
      document.documentElement.style.setProperty(
        "--particle-count-multiplier",
        "1"
      );
    }

    // Clean up canvas elements on navigation
    return () => {
      // Find and remove any leftover canvas elements
      const canvases = document.querySelectorAll("canvas");
      canvases.forEach((canvas) => {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
    };
  }, []);

  // Safely access browser APIs after mounting
  const isLowPerformance = mounted ? window.__lowPerformanceDevice : false;

  console.log(`isLowPerformance: ${isLowPerformance}`);

  // Apply simpler initial styles if not mounted yet
  const initialStyles = mounted ? {} : { opacity: 0.8 };

  return (
    <main
      className={`min-h-screen p-4 md:p-8 lg:p-12 ${
        !mounted ? "no-animation" : ""
      }`}
      style={initialStyles}
    >
      <Hero />
      <Experience />
      <Projects />
      <Blogs />
      <Footer />
    </main>
  );
}
