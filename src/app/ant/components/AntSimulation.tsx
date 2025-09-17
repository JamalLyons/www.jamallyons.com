"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { useSimulation } from "../hooks/useSimulation";
import {
  createSensors,
  updateAntDirection,
  updateAntPosition,
  handleFoodInteraction
} from "../utils/antBehavior";
import {
  renderPheromones,
  renderNest,
  renderFood,
  renderAnts,
  renderStatsPanel,
  renderCompletionMessage
} from "../utils/rendering";
import { SimulationConfig, SimulationState, SIMULATION_CONSTANTS } from "../types";

interface AntSimulationProps {
  config: SimulationConfig;
  simulationState: SimulationState;
  setSimulationState: (state: SimulationState) => void;
}

export default function AntSimulation({
  config,
  simulationState,
  setSimulationState,
}: AntSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    nestPosition,
    ants,
    setAnts,
    food,
    setFood,
    pheromones,
    collectedFood,
    setCollectedFood,
    fps,
    initializeSimulation,
    addPheromone,
    updatePheromones,
    getPheromoneStrength,
    updateFps,
    resetPerformanceCounters,
  } = useSimulation();

  // Initialize simulation
  const initialize = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parentElement = canvas.parentElement;
    if (!parentElement) return;

    const containerWidth = parentElement.clientWidth;
    const containerHeight = parentElement.clientHeight;

    // Set canvas size with pixel ratio for crisp rendering
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = containerWidth * pixelRatio;
    canvas.height = containerHeight * pixelRatio;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    ctx.scale(pixelRatio, pixelRatio);

    // Use display size for simulation logic, not scaled size
    setCanvasSize({ width: containerWidth, height: containerHeight });
    console.log("Initializing simulation with size:", { containerWidth, containerHeight, pixelRatio });
    initializeSimulation(containerWidth, containerHeight);
    setIsInitialized(true);
    console.log("Simulation initialized");
  }, [initializeSimulation]);

  // Initialize on mount and config changes
  useEffect(() => {
    if (simulationState === "stopped") {
      initialize();
    }
  }, [simulationState, initialize]);

  // Reinitialize when config changes (but only if stopped)
  useEffect(() => {
    if (simulationState === "stopped" && isInitialized) {
      console.log("Config changed, reinitializing simulation with new config:", config);
      initialize();
    }
  }, [config, simulationState, isInitialized, initialize]);

  // Main simulation loop
  const simulationStep = useCallback((currentTime: number) => {
    if (!isInitialized || simulationState !== "running") {
      console.log("Simulation not running:", { isInitialized, simulationState });
      return;
    }

    const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 1 / SIMULATION_CONSTANTS.MIN_FPS);
    lastTimeRef.current = currentTime;

    // Update FPS counter
    updateFps(currentTime);

    // Update ants
    setAnts(prevAnts => {
      const updatedAnts = prevAnts.map(ant => {
        // Create sensors and get pheromone readings
        const sensors = createSensors(ant, config).map(sensor => ({
          ...sensor,
          homePheromone: getPheromoneStrength(sensor, 'home'),
          foodPheromone: getPheromoneStrength(sensor, 'food')
        }));

        // Update direction based on pheromones
        const newDirection = updateAntDirection(ant, sensors, config, currentTime);

        // Update position
        const speed = config.antSpeed * deltaTime * 60; // Normalize to 60fps
        let updatedAnt = updateAntPosition(ant, newDirection, speed, canvasSize.width, canvasSize.height);

        // Handle food interaction
        updatedAnt = handleFoodInteraction(
          updatedAnt,
          food,
          nestPosition,
          setFood,
          setCollectedFood,
          addPheromone,
          config
        );

        // Add pheromones
        if (currentTime - updatedAnt.lastPheromoneTime > SIMULATION_CONSTANTS.PHEROMONE_UPDATE_INTERVAL) {
          const pheromoneType = updatedAnt.hasFood ? 'home' : 'food';
          const strength = config.pheromoneStrength * (updatedAnt.hasFood ? 1.5 : 1.0);
          addPheromone(updatedAnt.position, pheromoneType, strength);
          updatedAnt.lastPheromoneTime = currentTime;
        }

        return updatedAnt;
      });

      return updatedAnts;
    });

    // Update pheromones
    updatePheromones();

    // Check if all food is collected
    const remainingFood = food.filter(f => f.amount > 0);
    if (remainingFood.length === 0) {
      setSimulationState("paused");
    }

    animationRef.current = requestAnimationFrame(simulationStep);
  }, [
    isInitialized,
    simulationState,
    config,
    canvasSize,
    nestPosition,
    food,
    getPheromoneStrength,
    addPheromone,
    updatePheromones,
    setAnts,
    setFood,
    setCollectedFood,
    setSimulationState,
    updateFps
  ]);

  // Start/stop simulation
  useEffect(() => {
    if (simulationState === "running" && isInitialized) {
      resetPerformanceCounters();
      animationRef.current = requestAnimationFrame(simulationStep);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [simulationState, isInitialized, simulationStep, resetPerformanceCounters]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("No canvas ref");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("No canvas context");
      return;
    }

    console.log("Rendering:", {
      ants: ants.length,
      food: food.length,
      canvasSize,
      canvasActualSize: { width: canvas.width, height: canvas.height },
      canvasDisplaySize: { width: canvas.style.width, height: canvas.style.height }
    });

    // Clear canvas
    ctx.fillStyle = "rgba(10, 10, 15, 1)";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Render all elements
    renderPheromones(ctx, pheromones);
    renderNest(ctx, nestPosition, collectedFood);
    renderFood(ctx, food);
    renderAnts(ctx, ants);
    renderStatsPanel(ctx, food, collectedFood, ants, fps);

    // Completion message
    if (food.filter(f => f.amount > 0).length === 0 && simulationState === "paused") {
      renderCompletionMessage(ctx, canvasSize.width, canvasSize.height);
    }
  }, [ants, food, pheromones, nestPosition, collectedFood, canvasSize, fps, simulationState]);

  // Render on state changes
  useEffect(() => {
    if (isInitialized) {
      render();
    }
  }, [isInitialized, render]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const parentElement = canvas.parentElement;
      if (!parentElement) return;

      const containerWidth = parentElement.clientWidth;
      const containerHeight = parentElement.clientHeight;

      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = containerWidth * pixelRatio;
      canvas.height = containerHeight * pixelRatio;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(pixelRatio, pixelRatio);
      }

      setCanvasSize({ width: containerWidth, height: containerHeight });
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (canvasRef.current?.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{
        imageRendering: "pixelated",
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain"
      }}
    />
  );
}