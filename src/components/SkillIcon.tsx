"use client";

import { ReactNode, useEffect, useState } from "react";

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

  // Calculate deterministic position based on index
  const calculatePosition = () => {
    // Use index to create a deterministic pattern
    const angle = (index * 137.5) % 360; // Golden angle

    // Adjust radius based on screen size
    const baseRadius = isMobile ? 20 : 30;
    const radius = baseRadius + (index % 3) * (isMobile ? 10 : 15);

    // Convert polar coordinates to cartesian
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;

    // Scale factor based on index and screen size
    const baseScale = isMobile ? 0.7 : 0.85;
    const scale = baseScale + (index % 5) * 0.05;

    return { x, y, scale };
  };

  const position = calculatePosition();

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Delay the appearance for a staggered effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, [delay]);

  // Calculate a unique animation delay for floating effect
  const floatDelay = `${(index % 5) * 0.5}s`;

  return (
    <div
      className={`skill-icon float absolute transform transition-all duration-1000 ease-in-out flex flex-col items-center ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
        animationDelay: floatDelay,
      }}
    >
      <div className="text-xl sm:text-2xl mb-1">{icon}</div>
      <div className="text-[10px] sm:text-xs font-medium">{name}</div>
    </div>
  );
}
