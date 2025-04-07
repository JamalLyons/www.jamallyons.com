"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

// Deterministic random number generator
function seededRandom(seed: number) {
  return function () {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const fpsInterval = useRef(1000 / 30); // Target 30 FPS instead of 60
  const then = useRef(0);
  const elapsed = useRef(0);

  useEffect(() => {
    // Skip on server-side
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let frameCount = 0;
    let lastFpsCheck = performance.now();

    // Create particles with deterministic values
    const createParticles = () => {
      // Clear existing particles
      particles = [];

      // Reduce particle count based on device performance
      let particleCount;

      if (isLowPerformance) {
        particleCount = Math.min(15, Math.floor(window.innerWidth / 60));
      } else if (isMobile) {
        particleCount = Math.min(20, Math.floor(window.innerWidth / 45));
      } else {
        particleCount = Math.min(35, Math.floor(window.innerWidth / 35));
      }

      const random = seededRandom(42); // Fixed seed for consistency

      for (let i = 0; i < particleCount; i++) {
        // Reduce particle size on mobile/low-performance devices
        const baseSize = isLowPerformance ? 0.8 : isMobile ? 1 : 1.5;
        const size = random() * baseSize + 0.5;

        particles.push({
          x: random() * window.innerWidth,
          y: random() * window.innerHeight,
          size: size,
          speedX:
            (random() - 0.5) * (isLowPerformance ? 0.1 : isMobile ? 0.15 : 0.2),
          speedY:
            (random() - 0.5) * (isLowPerformance ? 0.1 : isMobile ? 0.15 : 0.2),
          opacity: random() * 0.4 + 0.1,
          color: i % 5 === 0 ? "#00f2ff" : "#a855f7", // Mix of purple and blue
        });
      }
    };

    // Check device capabilities
    const checkDeviceCapabilities = () => {
      // Check if mobile
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);

      // Use a simple performance check
      const startTime = performance.now();
      let checkSum = 0;

      // Simple computation to test device performance
      for (let i = 0; i < 100000; i++) {
        checkSum += Math.sin(i * 0.1) * Math.cos(i * 0.2);
      }

      const endTime = performance.now();
      const performanceTime = endTime - startTime;

      // If the performance test takes longer than 20ms, consider it a low-performance device
      setIsLowPerformance(performanceTime > 20 || isMobileDevice);
    };

    // Initial capability check
    checkDeviceCapabilities();

    // Set canvas to full screen with appropriate pixel ratio
    const resizeCanvas = () => {
      const pixelRatio = isLowPerformance ? 1 : window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      if (pixelRatio !== 1) {
        ctx.scale(pixelRatio, pixelRatio);
      }

      // Recreate particles when canvas is resized
      createParticles();
    };

    // Add resize listener
    window.addEventListener("resize", checkDeviceCapabilities);
    window.addEventListener("resize", resizeCanvas);

    // Initial setup
    resizeCanvas();

    // Draw particles
    const drawParticles = (now: number) => {
      // Calculate elapsed time since last frame
      elapsed.current = now - then.current;

      // Request next frame
      animationFrameId = requestAnimationFrame(drawParticles);

      // Skip frames based on FPS throttling
      if (elapsed.current < fpsInterval.current) {
        return;
      }

      // Update time tracking for next frame
      then.current = now - (elapsed.current % fpsInterval.current);

      // Performance monitoring
      frameCount++;
      if (now - lastFpsCheck > 1000) {
        // Every second
        const fps = frameCount;
        frameCount = 0;
        lastFpsCheck = now;

        // Adjust performance settings if FPS is too low
        if (fps < 20 && !isLowPerformance) {
          setIsLowPerformance(true);
          // Recreate particles with lower settings
          createParticles();
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x > window.innerWidth) particle.x = 0;
        if (particle.x < 0) particle.x = window.innerWidth;
        if (particle.y > window.innerHeight) particle.y = 0;
        if (particle.y < 0) particle.y = window.innerHeight;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        // Skip glow effects on low performance devices
        if (!isLowPerformance) {
          // Draw glow effect - reduce glow size on mobile
          const glowSize = isMobile ? particle.size * 1.5 : particle.size * 2;
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            glowSize
          );
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.globalAlpha = particle.opacity * 0.4;
          ctx.fill();
        }

        // Connect particles with lines - skip on low performance devices
        // and limit connections on mobile
        if (!isLowPerformance) {
          const connectLimit = isMobile ? 3 : 5;
          let connectCount = 0;

          for (let j = index + 1; j < particles.length; j++) {
            if (connectCount >= connectLimit) break;

            const otherParticle = particles[j];
            const distance = Math.sqrt(
              Math.pow(particle.x - otherParticle.x, 2) +
                Math.pow(particle.y - otherParticle.y, 2)
            );

            // Reduced connection distance on mobile
            const maxDistance = isMobile ? 70 : 100;

            if (distance < maxDistance) {
              connectCount++;
              ctx.beginPath();
              ctx.strokeStyle = particle.color;
              ctx.globalAlpha =
                (1 - distance / maxDistance) * 0.15 * particle.opacity;
              ctx.lineWidth = isLowPerformance ? 0.3 : 0.5;
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.stroke();
            }
          }
        }
      });
    };

    // Animation loop with timestamp for throttling
    then.current = performance.now();
    const animate = (timestamp: number) => {
      drawParticles(timestamp);
    };

    // Initialize and start animation
    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("resize", checkDeviceCapabilities);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
