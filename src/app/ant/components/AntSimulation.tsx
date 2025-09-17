"use client";

import React, { useRef, useEffect, useState } from "react";

// Types
type Position = { x: number; y: number };
type Ant = {
  position: Position;
  direction: number;
  hasFood: boolean;
  age: number;
  foodCarried: number; // Amount of food carried by an ant
  explorationBias: number; // Individual ant exploration tendency (0-1)
};
type Food = Position & { amount: number }; // Added food amount
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
  const [collectedFood, setCollectedFood] = useState(0); // Track total food collected

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

    // Initialize ants with individual traits
    const newAnts = Array.from({ length: config.antCount }, () => ({
      position: { ...nest },
      direction: Math.random() * Math.PI * 2,
      hasFood: false,
      age: 0,
      foodCarried: 0,
      explorationBias: 0.1 + Math.random() * 0.4, // Random exploration tendency
    }));
    setAnts(newAnts);

    // Reset collected food
    setCollectedFood(0);

    // Initialize food in random positions avoiding the nest with random amounts
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

      // Add food with random amounts between 50-150 units
      newFood.push({
        ...foodPos,
        amount: 50 + Math.floor(Math.random() * 100),
      });
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
      // Update pheromones less frequently for better performance
      if (animationRef.current && animationRef.current % 3 === 0) {
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
    const newFood = [...food];
    let newCollectedFood = collectedFood;

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

      // Calculate sensor positions with wider range for better pheromone detection
      const leftSensorAngle =
        ant.direction - (config.sensorAngle * Math.PI) / 180;
      const rightSensorAngle =
        ant.direction + (config.sensorAngle * Math.PI) / 180;
      // Add more sensors for better pheromone detection
      const farLeftSensorAngle =
        ant.direction - (config.sensorAngle * 1.5 * Math.PI) / 180;
      const farRightSensorAngle =
        ant.direction + (config.sensorAngle * 1.5 * Math.PI) / 180;

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

      const farLeftSensorPos = {
        x: Math.round(
          ant.position.x +
          Math.cos(farLeftSensorAngle) * config.sensorDistance * 1.2
        ),
        y: Math.round(
          ant.position.y +
          Math.sin(farLeftSensorAngle) * config.sensorDistance * 1.2
        ),
      };

      const farRightSensorPos = {
        x: Math.round(
          ant.position.x +
          Math.cos(farRightSensorAngle) * config.sensorDistance * 1.2
        ),
        y: Math.round(
          ant.position.y +
          Math.sin(farRightSensorAngle) * config.sensorDistance * 1.2
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

      // Sense pheromones with all sensors
      const leftPheromone = inBounds(leftSensorPos)
        ? getPheromoneValue(leftSensorPos, ant.hasFood)
        : 0;
      const rightPheromone = inBounds(rightSensorPos)
        ? getPheromoneValue(rightSensorPos, ant.hasFood)
        : 0;
      const centerPheromone = inBounds(centerSensorPos)
        ? getPheromoneValue(centerSensorPos, ant.hasFood)
        : 0;
      const farLeftPheromone = inBounds(farLeftSensorPos)
        ? getPheromoneValue(farLeftSensorPos, ant.hasFood)
        : 0;
      const farRightPheromone = inBounds(farRightSensorPos)
        ? getPheromoneValue(farRightSensorPos, ant.hasFood)
        : 0;

      // Adjust direction based on pheromone concentration with more realistic behavior
      const allSensorsEqual =
        Math.abs(centerPheromone - leftPheromone) < 0.05 &&
        Math.abs(centerPheromone - rightPheromone) < 0.05 &&
        Math.abs(leftPheromone - rightPheromone) < 0.05;

      // Exploration factor - higher value = more random movement
      const explorationFactor =
        ant.explorationBias *
        (1 -
          Math.min(1, (centerPheromone + leftPheromone + rightPheromone) * 2));

      // When carrying food, prioritize home pheromones more strongly
      if (ant.hasFood) {
        // Calculate direction to nest
        const angleToNest = Math.atan2(
          nestPosition.y - ant.position.y,
          nestPosition.x - ant.position.x
        );

        // Blend between pheromone following and direct path to nest
        const pheromoneWeight = Math.min(
          0.8,
          Math.max(0.2, (centerPheromone + leftPheromone + rightPheromone) * 3)
        );

        if (
          centerPheromone > leftPheromone &&
          centerPheromone > rightPheromone
        ) {
          // Continue straight if center sensor has the strongest signal
          ant.direction =
            ant.direction * (1 - pheromoneWeight) +
            angleToNest * pheromoneWeight +
            (Math.random() - 0.5) * 0.05;
        } else if (
          leftPheromone > rightPheromone ||
          farLeftPheromone > farRightPheromone
        ) {
          // Turn left - stronger turn when difference is larger
          const turnStrength = Math.min(
            0.4,
            (leftPheromone - rightPheromone) * 2 + 0.1
          );
          ant.direction =
            ant.direction * (1 - pheromoneWeight) +
            (ant.direction - turnStrength) * pheromoneWeight +
            (Math.random() - 0.5) * 0.05;
        } else if (
          rightPheromone > leftPheromone ||
          farRightPheromone > farLeftPheromone
        ) {
          // Turn right - stronger turn when difference is larger
          const turnStrength = Math.min(
            0.4,
            (rightPheromone - leftPheromone) * 2 + 0.1
          );
          ant.direction =
            ant.direction * (1 - pheromoneWeight) +
            (ant.direction + turnStrength) * pheromoneWeight +
            (Math.random() - 0.5) * 0.05;
        } else if (allSensorsEqual) {
          // When no strong gradient, head more directly toward nest
          ant.direction =
            ant.direction * (1 - pheromoneWeight) +
            angleToNest * pheromoneWeight +
            (Math.random() - 0.5) * explorationFactor;
        }
      } else {
        // Normal pheromone following behavior when not carrying food
        if (
          centerPheromone > leftPheromone &&
          centerPheromone > rightPheromone
        ) {
          // Continue straight if center sensor has the strongest signal
          ant.direction += (Math.random() - 0.5) * 0.05;
        } else if (
          leftPheromone > rightPheromone ||
          farLeftPheromone > farRightPheromone
        ) {
          // Turn left - stronger turn when difference is larger
          const turnStrength = Math.min(
            0.4,
            (leftPheromone - rightPheromone) * 2 + 0.1
          );
          ant.direction -= turnStrength;
        } else if (
          rightPheromone > leftPheromone ||
          farRightPheromone > farLeftPheromone
        ) {
          // Turn right - stronger turn when difference is larger
          const turnStrength = Math.min(
            0.4,
            (rightPheromone - leftPheromone) * 2 + 0.1
          );
          ant.direction += turnStrength;
        } else if (allSensorsEqual) {
          // Explore with random movement when no strong gradient is detected
          ant.direction += (Math.random() - 0.5) * explorationFactor;
        }
      }

      // Random direction adjustment scaled by exploration bias
      ant.direction += (Math.random() - 0.5) * 0.05 * explorationFactor;

      // Update position with variable speed (faster when following trails)
      const speedMultiplier =
        1 + Math.max(centerPheromone, leftPheromone, rightPheromone) * 0.5;
      const newX =
        ant.position.x +
        Math.cos(ant.direction) * config.antSpeed * speedMultiplier;
      const newY =
        ant.position.y +
        Math.sin(ant.direction) * config.antSpeed * speedMultiplier;

      // Bounce off walls with more natural angles
      if (newX < 0) {
        ant.position.x = 0;
        ant.direction = Math.PI - ant.direction + (Math.random() - 0.5) * 0.2;
      } else if (newX >= canvasSize.width) {
        ant.position.x = canvasSize.width - 1;
        ant.direction = Math.PI - ant.direction + (Math.random() - 0.5) * 0.2;
      } else {
        ant.position.x = newX;
      }

      if (newY < 0) {
        ant.position.y = 0;
        ant.direction = -ant.direction + (Math.random() - 0.5) * 0.2;
      } else if (newY >= canvasSize.height) {
        ant.position.y = canvasSize.height - 1;
        ant.direction = -ant.direction + (Math.random() - 0.5) * 0.2;
      } else {
        ant.position.y = newY;
      }

      // Check if ant found food
      if (!ant.hasFood) {
        const foundFoodIndex = newFood.findIndex(
          (f) => Math.hypot(ant.position.x - f.x, ant.position.y - f.y) < 5
        );

        if (foundFoodIndex >= 0 && newFood[foundFoodIndex].amount > 0) {
          // Take food based on amount available
          const foodTaken = Math.min(5, newFood[foundFoodIndex].amount);
          newFood[foundFoodIndex].amount -= foodTaken;

          // Ant takes food and heads back to nest
          ant.hasFood = true;
          ant.foodCarried = foodTaken;

          // Calculate direction to nest with less randomness
          const angleToNest = Math.atan2(
            nestPosition.y - ant.position.y,
            nestPosition.x - ant.position.x
          );
          // Add a small random factor to avoid all ants taking the exact same path
          ant.direction = angleToNest + (Math.random() - 0.5) * 0.2;

          // Remove food source if depleted
          if (newFood[foundFoodIndex].amount <= 0) {
            newFood.splice(foundFoodIndex, 1);
          }
        }
      }

      // Check if ant returned to nest with food
      if (ant.hasFood) {
        const distToNest = Math.hypot(
          ant.position.x - nestPosition.x,
          ant.position.y - nestPosition.y
        );

        if (distToNest < 15) {
          // Deposit food at nest
          newCollectedFood += ant.foodCarried;
          ant.hasFood = false;
          ant.foodCarried = 0;

          // Turn around and head back out with slight random direction
          ant.direction += Math.PI + (Math.random() - 0.5) * 1.0;

          // Increase pheromone strength when food is found to reinforce path
          const phX = Math.floor(ant.position.x);
          const phY = Math.floor(ant.position.y);

          if (inBounds({ x: phX, y: phY })) {
            try {
              // Create a stronger home pheromone signal when food is brought back
              newHomePheromones[phY][phX] = Math.min(
                1,
                (newHomePheromones[phY][phX] || 0) +
                config.pheromoneStrength * 0.01
              );
            } catch (e) {
              console.error(
                "Error updating nest pheromone at:",
                { x: phX, y: phY },
                e
              );
            }
          }
        }
      }

      // Lay pheromones
      const phX = Math.floor(ant.position.x);
      const phY = Math.floor(ant.position.y);

      if (inBounds({ x: phX, y: phY })) {
        try {
          if (ant.hasFood) {
            // Stronger home pheromones when carrying food back to nest
            newHomePheromones[phY][phX] = Math.min(
              1,
              (newHomePheromones[phY][phX] || 0) +
              config.pheromoneStrength * 0.01 * (0.5 + ant.foodCarried / 5)
            );
            // Weaker food pheromones when returning to nest
            newFoodPheromones[phY][phX] = Math.min(
              1,
              (newFoodPheromones[phY][phX] || 0) +
              config.pheromoneStrength * 0.002
            );
          } else {
            // Weaker home pheromones when searching
            newHomePheromones[phY][phX] = Math.min(
              1,
              (newHomePheromones[phY][phX] || 0) +
              config.pheromoneStrength * 0.002
            );
            // Stronger food pheromones when searching for food
            newFoodPheromones[phY][phX] = Math.min(
              1,
              (newFoodPheromones[phY][phX] || 0) +
              config.pheromoneStrength * 0.005
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
    setFood(newFood);
    setCollectedFood(newCollectedFood);

    // Clean up any food sources with 0 amount
    const remainingFood = newFood.filter((f) => f.amount > 0);
    if (remainingFood.length !== newFood.length) {
      setFood(remainingFood);
    }

    // End simulation if all food is collected
    if (remainingFood.length === 0) {
      setSimulationState("paused");
    }
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

    // Draw home pheromones (purple) - optimized rendering
    ctx.fillStyle = "rgba(168, 85, 247, 0.7)";
    for (let y = 0; y < canvasSize.height && y < homePheromones.length; y += 2) {
      for (let x = 0; x < canvasSize.width && x < homePheromones[y].length; x += 2) {
        const value = homePheromones[y][x];
        if (value > 0.02) {
          ctx.beginPath();
          ctx.arc(x, y, Math.min(value * 3, 4), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw food pheromones (cyan) - optimized rendering
    ctx.fillStyle = "rgba(0, 210, 255, 0.7)";
    for (let y = 0; y < canvasSize.height && y < foodPheromones.length; y += 2) {
      for (let x = 0; x < canvasSize.width && x < foodPheromones[y].length; x += 2) {
        const value = foodPheromones[y][x];
        if (value > 0.02) {
          ctx.beginPath();
          ctx.arc(x, y, Math.min(value * 3, 4), 0, Math.PI * 2);
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

    // Display collected food count at nest
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.textAlign = "center";
    ctx.fillText(`${collectedFood}`, nestPosition.x, nestPosition.y + 4);

    // Draw food with size based on amount
    food.forEach((f) => {
      const foodSize = Math.max(3, Math.min(8, 3 + f.amount / 25));
      ctx.beginPath();
      ctx.arc(f.x, f.y, foodSize, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 242, 255, 0.8)";
      ctx.fill();
      ctx.strokeStyle = "rgba(125, 211, 252, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Show food amount
      if (f.amount > 0) {
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.textAlign = "center";
        ctx.fillText(`${f.amount}`, f.x, f.y + 3);
      }
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

    // Display simulation status with better styling
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(8, 8, 200, 80);

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.textAlign = "left";
    ctx.fillText(`Food Sources: ${food.length}`, 12, 25);
    ctx.fillText(`Food Collected: ${collectedFood}`, 12, 45);
    ctx.fillText(`Active Ants: ${ants.length}`, 12, 65);

    // Add efficiency metric
    const efficiency = ants.length > 0 ? Math.round((collectedFood / (ants.length * 0.1)) * 100) : 0;
    ctx.fillText(`Efficiency: ${efficiency}%`, 12, 85);

    if (food.length === 0 && simulationState === "paused") {
      ctx.font = "24px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.textAlign = "center";
      ctx.fillText(
        "Simulation complete! All food collected",
        canvasSize.width / 2,
        canvasSize.height / 2
      );
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const parentElement = canvas.parentElement;
      if (!parentElement) return;

      // Get the new container dimensions
      const containerWidth = parentElement.clientWidth;
      const containerHeight = parentElement.clientHeight;

      // Update canvas size with pixel density adjustment
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = containerWidth * pixelRatio;
      canvas.height = containerHeight * pixelRatio;

      // Update CSS size
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;

      // Update context scale
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(pixelRatio, pixelRatio);
      }

      // Update simulation dimensions
      setCanvasSize({ width: containerWidth, height: containerHeight });

      // Update nest position
      setNestPosition({
        x: Math.floor(containerWidth / 2),
        y: Math.floor(containerHeight / 2),
      });
    };

    // Add resize observer for more reliable size updates
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (canvasRef.current?.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    // Clean up
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
      className="w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
