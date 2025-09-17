"use client";

import { ReactNode, useEffect, useState, useRef } from "react";

interface SkillIconProps {
  icon: ReactNode;
  name: string;
  index: number;
  delay?: number;
}

export default function SkillIcon({
  icon,
  name,
  index,
  delay = 0,
}: SkillIconProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [mounted, setMounted] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const positioned = useRef(false);

  // Calculate deterministic position based on index and performance
  const calculatePosition = () => {
    // Use index to create a deterministic pattern
    const angle = (index * 137.5) % 360; // Golden angle

    // Adjust radius based on screen size and performance
    const baseRadius = isLowPerformance ? 15 : isMobile ? 20 : 30;
    const radius =
      baseRadius + (index % 3) * (isLowPerformance ? 8 : isMobile ? 10 : 15);

    // Convert polar coordinates to cartesian
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;

    // Scale factor based on index and screen size
    const baseScale = isLowPerformance ? 0.6 : isMobile ? 0.7 : 0.85;
    const scale = baseScale + (index % 5) * 0.05;

    return { x, y, scale };
  };

  // Mount effect - handles initial mounting and SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Skip on server-side or before mounting
    if (typeof window === "undefined" || !mounted) return;

    // Check device capabilities
    const checkDeviceCapabilities = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);

      // Simple check for low performance
      if (isMobileDevice && window.innerWidth < 480) {
        setIsLowPerformance(true);
      } else {
        // Use global performance info if available
        const lowPerf = window.__lowPerformanceDevice;
        if (typeof lowPerf === "boolean") {
          setIsLowPerformance(lowPerf);
        }
      }
    };

    // Initial check
    checkDeviceCapabilities();

    // Add resize listener (throttled)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        checkDeviceCapabilities();
        // Reset positioning
        positioned.current = false;
        updatePosition();
      }, 250); // Throttle resize events
    };

    window.addEventListener("resize", handleResize);

    // Function to update position with animation optimization
    const updatePosition = () => {
      if (!iconRef.current || positioned.current) return;

      const position = calculatePosition();

      // Apply transform directly to avoid React state updates for position
      iconRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(${position.scale})`;
      positioned.current = true;

      // For low performance devices, use simpler animations via CSS rather than continuous JS updates
      if (isLowPerformance) {
        iconRef.current.style.animation = "none";
        // Use CSS animations instead of JavaScript for better performance
        iconRef.current.style.transition = "opacity 0.5s ease-in-out";
      } else {
        // Set animation delay to create staggered effect
        iconRef.current.style.animationDelay = `${(index % 5) * 0.5}s`;
      }
    };

    // Delay the appearance for a staggered effect
    const timer = setTimeout(
      () => {
        setIsVisible(true);
        updatePosition();
      },
      isLowPerformance ? delay / 2 : delay
    );

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [delay, index, mounted]);

  // Prevent content flash during SSR/hydration
  if (!mounted) {
    return (
      <div
        ref={iconRef}
        className="skill-icon absolute transform opacity-0 flex flex-col items-center"
        style={{ transform: "translate(0px, 0px) scale(0)" }}
      >
        <div className="text-xl sm:text-2xl mb-1">{icon}</div>
        <div className="text-[10px] sm:text-xs font-medium">{name}</div>
      </div>
    );
  }

  // Calculate a unique animation delay for floating effect
  const floatDelay = `${(index % 5) * 0.5}s`;

  return (
    <div
      ref={iconRef}
      className={`skill-icon absolute transform transition-opacity duration-500 ease-in-out flex flex-col items-center ${isVisible ? "opacity-100" : "opacity-0"
        } ${!isLowPerformance ? "float" : ""}`}
      style={{
        // Initial values - will be updated via JS
        transform: `translate(0px, 0px) scale(0)`,
        animationDelay: floatDelay,
        willChange: isLowPerformance ? "opacity" : "transform, opacity",
      }}
    >
      <div className="text-xl sm:text-2xl mb-1">{icon}</div>
      <div className="skill-label text-[10px] sm:text-xs font-medium">{name}</div>
    </div>
  );
}
