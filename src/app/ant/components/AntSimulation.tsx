"use client";

import React, { useRef, useEffect, useState } from "react";

// Types
type Position = { x: number; y: number };
type Ant = {
  position: Position;
  direction: number;
  hasFood: boolean;
  age: number;
};
type Food = Position;
type SimulationConfigType = {
  antCount: number;
  foodCount: number;
  evaporationRate: number;
  diffusionRate: number;
  antSpeed: number;
  pheromoneStrength: number;
  sensorAngle: number;
  sensorDistance: number;
};

interface AntSimulationProps {
  config: SimulationConfigType;
  simulationState: "stopped" | "running" | "paused";
  setSimulationState: (state: "stopped" | "running" | "paused") => void;
}

export default function AntSimulation({
  config,
  simulationState,
  setSimulationState,
}: AntSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [nestPosition, setNestPosition] = useState<Position>({ x: 0, y: 0 });
  const [ants, setAnts] = useState<Ant[]>([]);
  const [food, setFood] = useState<Food[]>([]);
  const [homePheromones, setHomePheromones] = useState<number[][]>([]);
  const [foodPheromones, setFoodPheromones] = useState<number[][]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  // Debug log for simulation state changes
  useEffect(() => {
    console.log("AntSimulation: Simulation state changed to:", simulationState);
  }, [simulationState]);

  // Initialize simulation
  useEffect(() => {
    if (!canvasRef.current) return;

    // Only initialize if we haven't attempted initialization yet or if we're in stopped state
    if (initializationAttempted && simulationState !== "stopped") return;

    console.log("AntSimulation: Initializing simulation");

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parentElement = canvas.parentElement;
    if (!parentElement) return;

    // Get the container dimensions
    const containerWidth = parentElement.clientWidth;
    const containerHeight = parentElement.clientHeight;

    // Set canvas size with a pixel density adjustment for retina displays
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = containerWidth * pixelRatio;
    canvas.height = containerHeight * pixelRatio;

    // Set display size (css pixels)
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // Scale the context to handle the pixel ratio
    ctx.scale(pixelRatio, pixelRatio);

    // Save the logical canvas size for simulation calculations
    setCanvasSize({ width: containerWidth, height: containerHeight });

    // Initialize nest position at the center
    const nest = {
      x: Math.floor(containerWidth / 2),
      y: Math.floor(containerHeight / 2),
    };
    setNestPosition(nest);

    // Initialize ants
    const newAnts = Array.from({ length: config.antCount }, () => ({
      position: { ...nest },
      direction: Math.random() * Math.PI * 2,
      hasFood: false,
      age: 0,
    }));
    setAnts(newAnts);

    // Initialize food in random positions avoiding the nest
    const newFood: Food[] = [];
    for (let i = 0; i < config.foodCount; i++) {
      let foodPos: Position;
      do {
        foodPos = {
          x: Math.floor(Math.random() * containerWidth),
          y: Math.floor(Math.random() * containerHeight),
        };
      } while (
        Math.hypot(foodPos.x - nest.x, foodPos.y - nest.y) <
        Math.min(containerWidth, containerHeight) / 4
      );
      newFood.push(foodPos);
    }
    setFood(newFood);

    // Create correctly sized pheromone grids that match the canvas dimensions
    const newHomePheromones = Array(containerHeight)
      .fill(0)
      .map(() => Array(containerWidth).fill(0));
    const newFoodPheromones = Array(containerHeight)
      .fill(0)
      .map(() => Array(containerWidth).fill(0));

    setHomePheromones(newHomePheromones);
    setFoodPheromones(newFoodPheromones);

    setIsInitialized(true);
    setInitializationAttempted(true);
    console.log(
      "AntSimulation: Initialization complete with canvas size:",
      containerWidth,
      "x",
      containerHeight
    );
  }, [
    config.antCount,
    config.foodCount,
    initializationAttempted,
    simulationState,
  ]);

  // Simulation loop
  useEffect(() => {
    if (!isInitialized || simulationState !== "running" || !canvasRef.current) {
      console.log("AntSimulation: Not starting simulation loop", {
        isInitialized,
        simulationState,
        hasCanvas: !!canvasRef.current,
      });
      return;
    }

    console.log("AntSimulation: Starting simulation loop");

    const simulationStep = () => {
      updateAnts();
      if (animationRef.current && animationRef.current % 5 === 0) {
        updatePheromones();
      }
      render();
      animationRef.current = requestAnimationFrame(simulationStep);
    };

    animationRef.current = requestAnimationFrame(simulationStep);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
        console.log("AntSimulation: Stopping simulation loop");
      }
    };
  }, [isInitialized, simulationState]);

  // Update ants logic
  const updateAnts = () => {
    const newAnts = [...ants];
    const newHomePheromones = homePheromones.map((row) => [...row]);
    const newFoodPheromones = foodPheromones.map((row) => [...row]);

    // Safety check for array sizes
    if (
      canvasSize.height !== newHomePheromones.length ||
      canvasSize.width !== (newHomePheromones[0]?.length || 0)
    ) {
      console.error("Pheromone grid size mismatch:", {
        canvasHeight: canvasSize.height,
        gridHeight: newHomePheromones.length,
        canvasWidth: canvasSize.width,
        gridWidth: newHomePheromones[0]?.length || 0,
      });
      return;
    }

    // Update each ant
    for (let i = 0; i < newAnts.length; i++) {
      const ant = newAnts[i];
      ant.age += 1;

      // Calculate sensor positions
      const leftSensorAngle =
        ant.direction - (config.sensorAngle * Math.PI) / 180;
      const rightSensorAngle =
        ant.direction + (config.sensorAngle * Math.PI) / 180;

      const leftSensorPos = {
        x: Math.round(
          ant.position.x + Math.cos(leftSensorAngle) * config.sensorDistance
        ),
        y: Math.round(
          ant.position.y + Math.sin(leftSensorAngle) * config.sensorDistance
        ),
      };

      const rightSensorPos = {
        x: Math.round(
          ant.position.x + Math.cos(rightSensorAngle) * config.sensorDistance
        ),
        y: Math.round(
          ant.position.y + Math.sin(rightSensorAngle) * config.sensorDistance
        ),
      };

      const centerSensorPos = {
        x: Math.round(
          ant.position.x + Math.cos(ant.direction) * config.sensorDistance
        ),
        y: Math.round(
          ant.position.y + Math.sin(ant.direction) * config.sensorDistance
        ),
      };

      // Check if sensors are in bounds
      const inBounds = (pos: Position) => {
        return (
          pos.x >= 0 &&
          pos.x < canvasSize.width &&
          pos.y >= 0 &&
          pos.y < canvasSize.height
        );
      };

      // Get pheromone values at sensor positions
      const getPheromoneValue = (pos: Position, hasFood: boolean) => {
        if (!inBounds(pos)) return 0;
        try {
          return hasFood
            ? newHomePheromones[pos.y][pos.x]
            : newFoodPheromones[pos.y][pos.x];
        } catch (e) {
          console.error("Error accessing pheromone data at:", pos, e);
          return 0;
        }
      };

      // Sense pheromones
      const leftPheromone = inBounds(leftSensorPos)
        ? getPheromoneValue(leftSensorPos, ant.hasFood)
        : 0;
      const rightPheromone = inBounds(rightSensorPos)
        ? getPheromoneValue(rightSensorPos, ant.hasFood)
        : 0;
      const centerPheromone = inBounds(centerSensorPos)
        ? getPheromoneValue(centerSensorPos, ant.hasFood)
        : 0;

      // Adjust direction based on pheromone concentration
      if (centerPheromone > leftPheromone && centerPheromone > rightPheromone) {
        // Continue straight if center sensor has the strongest signal
      } else if (leftPheromone > rightPheromone) {
        ant.direction -= Math.random() * 0.3; // Turn left
      } else if (rightPheromone > leftPheromone) {
        ant.direction += Math.random() * 0.3; // Turn right
      } else {
        // Random walk with slight changes to current direction
        ant.direction += (Math.random() - 0.5) * 0.2;
      }

      // Random direction adjustment (small random walk component)
      ant.direction += (Math.random() - 0.5) * 0.1;

      // Update position
      const newX = ant.position.x + Math.cos(ant.direction) * config.antSpeed;
      const newY = ant.position.y + Math.sin(ant.direction) * config.antSpeed;

      // Bounce off walls
      if (newX < 0) {
        ant.position.x = 0;
        ant.direction = Math.PI - ant.direction;
      } else if (newX >= canvasSize.width) {
        ant.position.x = canvasSize.width - 1;
        ant.direction = Math.PI - ant.direction;
      } else {
        ant.position.x = newX;
      }

      if (newY < 0) {
        ant.position.y = 0;
        ant.direction = -ant.direction;
      } else if (newY >= canvasSize.height) {
        ant.position.y = canvasSize.height - 1;
        ant.direction = -ant.direction;
      } else {
        ant.position.y = newY;
      }

      // Check if ant found food
      if (!ant.hasFood) {
        const foundFood = food.findIndex(
          (f) => Math.hypot(ant.position.x - f.x, ant.position.y - f.y) < 5
        );

        if (foundFood >= 0) {
          ant.hasFood = true;
          ant.direction += Math.PI; // Turn back
        }
      }

      // Check if ant returned to nest with food
      if (ant.hasFood) {
        const distToNest = Math.hypot(
          ant.position.x - nestPosition.x,
          ant.position.y - nestPosition.y
        );

        if (distToNest < 15) {
          ant.hasFood = false;
          ant.direction += Math.PI; // Turn back
        }
      }

      // Lay pheromones
      const phX = Math.floor(ant.position.x);
      const phY = Math.floor(ant.position.y);

      if (inBounds({ x: phX, y: phY })) {
        try {
          if (ant.hasFood) {
            newFoodPheromones[phY][phX] = Math.min(
              1,
              (newFoodPheromones[phY][phX] || 0) +
                config.pheromoneStrength * 0.003
            );
          } else {
            newHomePheromones[phY][phX] = Math.min(
              1,
              (newHomePheromones[phY][phX] || 0) +
                config.pheromoneStrength * 0.003
            );
          }
        } catch (e) {
          console.error("Error updating pheromone at:", { x: phX, y: phY }, e);
        }
      }
    }

    // Update all states at once
    setAnts(newAnts);
    setHomePheromones(newHomePheromones);
    setFoodPheromones(newFoodPheromones);
  };

  // Update pheromones (evaporation and diffusion)
  const updatePheromones = () => {
    const newHomePheromones = homePheromones.map((row) => [...row]);
    const newFoodPheromones = foodPheromones.map((row) => [...row]);

    // Evaporation
    for (let y = 0; y < canvasSize.height; y++) {
      for (let x = 0; x < canvasSize.width; x++) {
        if (y < newHomePheromones.length && x < newHomePheromones[y].length) {
          newHomePheromones[y][x] *= 1 - config.evaporationRate * 0.05;
          newFoodPheromones[y][x] *= 1 - config.evaporationRate * 0.05;
        }
      }
    }

    // Diffusion (simplified)
    if (config.diffusionRate > 0) {
      const diffusedHome = applyDiffusion(newHomePheromones);
      const diffusedFood = applyDiffusion(newFoodPheromones);

      setHomePheromones(diffusedHome);
      setFoodPheromones(diffusedFood);
    } else {
      setHomePheromones(newHomePheromones);
      setFoodPheromones(newFoodPheromones);
    }
  };

  const applyDiffusion = (pheromones: number[][]) => {
    const diffused = pheromones.map((row) => [...row]);
    const diffusionFactor = config.diffusionRate * 0.05;

    for (
      let y = 1;
      y < canvasSize.height - 1 && y < pheromones.length - 1;
      y++
    ) {
      for (
        let x = 1;
        x < canvasSize.width - 1 && x < pheromones[y].length - 1;
        x++
      ) {
        const diffusionAmount = pheromones[y][x] * diffusionFactor;
        const perNeighbor = diffusionAmount / 4;

        diffused[y - 1][x] += perNeighbor;
        diffused[y + 1][x] += perNeighbor;
        diffused[y][x - 1] += perNeighbor;
        diffused[y][x + 1] += perNeighbor;
        diffused[y][x] -= diffusionAmount;
      }
    }

    return diffused;
  };

  // Render function
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ensure canvas is properly sized
    if (
      canvas.width !== canvasSize.width ||
      canvas.height !== canvasSize.height
    ) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
    }

    // Clear canvas
    ctx.fillStyle = "rgba(10, 10, 15, 1)";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Render pheromones with blurring for more natural look
    ctx.globalAlpha = 0.7;

    // Draw home pheromones (purple)
    for (let y = 0; y < canvasSize.height && y < homePheromones.length; y++) {
      for (
        let x = 0;
        x < canvasSize.width && x < homePheromones[y].length;
        x++
      ) {
        const value = homePheromones[y][x];
        if (value > 0.01) {
          ctx.fillStyle = `rgba(168, 85, 247, ${value * 0.7})`;
          ctx.beginPath();
          ctx.arc(x, y, value * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw food pheromones (cyan)
    for (let y = 0; y < canvasSize.height && y < foodPheromones.length; y++) {
      for (
        let x = 0;
        x < canvasSize.width && x < foodPheromones[y].length;
        x++
      ) {
        const value = foodPheromones[y][x];
        if (value > 0.01) {
          ctx.fillStyle = `rgba(0, 210, 255, ${value * 0.7})`;
          ctx.beginPath();
          ctx.arc(x, y, value * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.globalAlpha = 1.0;

    // Draw nest
    ctx.beginPath();
    ctx.arc(nestPosition.x, nestPosition.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(168, 85, 247, 0.7)";
    ctx.fill();
    ctx.strokeStyle = "rgba(216, 180, 254, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw food
    food.forEach((f) => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 242, 255, 0.8)";
      ctx.fill();
      ctx.strokeStyle = "rgba(125, 211, 252, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Draw ants
    ants.forEach((ant) => {
      ctx.beginPath();

      if (ant.hasFood) {
        // Draw ant with food
        ctx.arc(ant.position.x, ant.position.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(125, 211, 252, 0.9)";
      } else {
        // Draw normal ant
        ctx.arc(ant.position.x, ant.position.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(216, 180, 254, 0.9)";
      }

      ctx.fill();

      // Draw direction indicator
      ctx.beginPath();
      ctx.moveTo(ant.position.x, ant.position.y);
      ctx.lineTo(
        ant.position.x + Math.cos(ant.direction) * 4,
        ant.position.y + Math.sin(ant.direction) * 4
      );
      ctx.strokeStyle = ant.hasFood
        ? "rgba(125, 211, 252, 0.6)"
        : "rgba(216, 180, 254, 0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;

      // Pause simulation during resize
      const wasRunning = simulationState === "running";
      if (wasRunning) {
        setSimulationState("paused");
      }

      // Reinitialize simulation with new dimensions
      setIsInitialized(false);
      setInitializationAttempted(false);

      // Resume if it was running
      if (wasRunning) {
        setTimeout(() => setSimulationState("running"), 100);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [simulationState, setSimulationState]);

  // Reset simulation when stopped
  useEffect(() => {
    if (simulationState === "stopped") {
      setIsInitialized(false);
      setInitializationAttempted(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [simulationState]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
