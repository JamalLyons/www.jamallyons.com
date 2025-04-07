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

  // Calculate deterministic position based on index
  const calculatePosition = () => {
    // Use index to create a deterministic pattern
    const angle = (index * 137.5) % 360; // Golden angle
    const radius = 30 + (index % 3) * 15; // Varying distances

    // Convert polar coordinates to cartesian
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;

    // Scale factor based on index
    const scale = 0.85 + (index % 5) * 0.05;

    return { x, y, scale };
  };

  const position = calculatePosition();

  useEffect(() => {
    // Delay the appearance for a staggered effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
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
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs font-medium">{name}</div>
    </div>
  );
}
