"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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

interface SimulationControlsProps {
  config: SimulationConfigType;
  setConfig: (config: SimulationConfigType) => void;
  simulationState: "stopped" | "running" | "paused";
  setSimulationState: (state: "stopped" | "running" | "paused") => void;
}

export default function SimulationControls({
  config,
  setConfig,
  simulationState,
  setSimulationState,
}: SimulationControlsProps) {
  const [localConfig, setLocalConfig] = useState(config);

  // Debug log for simulation state changes
  useEffect(() => {
    console.log(
      "SimulationControls: Simulation state changed to:",
      simulationState
    );
  }, [simulationState]);

  // Debug log for config changes
  useEffect(() => {
    console.log("SimulationControls: Config changed:", config);
  }, [config]);

  // Update local config when parent config changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleConfigChange = (
    key: keyof SimulationConfigType,
    value: number
  ) => {
    console.log("SimulationControls: Config change requested:", key, value);
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    setConfig(newConfig);
  };

  const handleStart = () => {
    console.log("SimulationControls: Start button clicked");
    setSimulationState("running");
  };

  const handlePause = () => {
    console.log("SimulationControls: Pause button clicked");
    setSimulationState("paused");
  };

  const handleStop = () => {
    console.log("SimulationControls: Stop button clicked");
    setSimulationState("stopped");
  };

  const handleReset = () => {
    console.log("SimulationControls: Reset button clicked");
    setSimulationState("stopped");
    setConfig({
      antCount: 100,
      foodCount: 5,
      evaporationRate: 0.01,
      diffusionRate: 0.1,
      antSpeed: 1,
      pheromoneStrength: 1,
      sensorAngle: 30,
      sensorDistance: 10,
    });
  };

  // Format the evaporation and diffusion rates for display
  const formatRate = (rate: number) => {
    if (rate < 0.01) return rate.toFixed(4);
    if (rate < 0.1) return rate.toFixed(3);
    return rate.toFixed(2);
  };

  return (
    <Card className="p-4 md:p-6" hover={false} interactive={false}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg md:text-xl text-purple-300 font-semibold mb-2">
            Simulation Controls
          </h2>
          <p className="text-gray-400 text-sm">
            Adjust parameters to see how they affect ant behavior
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {simulationState === "stopped" && (
            <Button variant="primary" onClick={handleStart} className="flex-1 md:flex-none">
              Start
            </Button>
          )}

          {simulationState === "running" && (
            <Button variant="secondary" onClick={handlePause} className="flex-1 md:flex-none">
              Pause
            </Button>
          )}

          {simulationState === "paused" && (
            <Button variant="secondary" onClick={handleStart} className="flex-1 md:flex-none">
              Resume
            </Button>
          )}

          {(simulationState === "running" || simulationState === "paused") && (
            <Button variant="outline" onClick={handleStop} className="flex-1 md:flex-none">
              Stop
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Ant Count */}
        <div>
          <label className="block text-sm text-purple-300 mb-1">
            Ant Count
          </label>
          <div className="flex items-center">
            <Input
              type="range"
              min="10"
              max="500"
              step="10"
              value={localConfig.antCount}
              onChange={(e) =>
                handleConfigChange("antCount", parseInt(e.target.value))
              }
              className="flex-1"
              disabled={simulationState !== "stopped"}
            />
            <span className="ml-3 text-gray-300 w-10 text-right">
              {localConfig.antCount}
            </span>
          </div>
        </div>

        {/* Food Count */}
        <div>
          <label className="block text-sm text-purple-300 mb-1">
            Food Count
          </label>
          <div className="flex items-center">
            <Input
              type="range"
              min="1"
              max="10"
              step="1"
              value={localConfig.foodCount}
              onChange={(e) =>
                handleConfigChange("foodCount", parseInt(e.target.value))
              }
              className="flex-1"
              disabled={simulationState !== "stopped"}
            />
            <span className="ml-3 text-gray-300 w-10 text-right">
              {localConfig.foodCount}
            </span>
          </div>
        </div>

        {/* Ant Speed */}
        <div>
          <label className="block text-sm text-purple-300 mb-1">
            Ant Speed
          </label>
          <div className="flex items-center">
            <Input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={localConfig.antSpeed}
              onChange={(e) =>
                handleConfigChange("antSpeed", parseFloat(e.target.value))
              }
              className="flex-1"
            />
            <span className="ml-3 text-gray-300 w-10 text-right">
              {localConfig.antSpeed.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Pheromone Strength */}
        <div>
          <label className="block text-sm text-purple-300 mb-1">
            Pheromone Strength
          </label>
          <div className="flex items-center">
            <Input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={localConfig.pheromoneStrength}
              onChange={(e) =>
                handleConfigChange(
                  "pheromoneStrength",
                  parseFloat(e.target.value)
                )
              }
              className="flex-1"
            />
            <span className="ml-3 text-gray-300 w-10 text-right">
              {localConfig.pheromoneStrength.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Evaporation Rate */}
        <div>
          <label className="block text-sm text-purple-300 mb-1">
            Evaporation Rate
          </label>
          <div className="flex items-center">
            <Input
              type="range"
              min="0.001"
              max="0.1"
              step="0.001"
              value={localConfig.evaporationRate}
              onChange={(e) =>
                handleConfigChange(
                  "evaporationRate",
                  parseFloat(e.target.value)
                )
              }
              className="flex-1"
            />
            <span className="ml-3 text-gray-300 w-14 text-right">
              {formatRate(localConfig.evaporationRate)}
            </span>
          </div>
        </div>

        {/* Diffusion Rate */}
        <div>
          <label className="block text-sm text-purple-300 mb-1">
            Diffusion Rate
          </label>
          <div className="flex items-center">
            <Input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={localConfig.diffusionRate}
              onChange={(e) =>
                handleConfigChange("diffusionRate", parseFloat(e.target.value))
              }
              className="flex-1"
            />
            <span className="ml-3 text-gray-300 w-14 text-right">
              {formatRate(localConfig.diffusionRate)}
            </span>
          </div>
        </div>

        {/* Sensor Angle */}
        <div>
          <label className="block text-sm text-purple-300 mb-1">
            Sensor Angle (°)
          </label>
          <div className="flex items-center">
            <Input
              type="range"
              min="5"
              max="90"
              step="5"
              value={localConfig.sensorAngle}
              onChange={(e) =>
                handleConfigChange("sensorAngle", parseInt(e.target.value))
              }
              className="flex-1"
            />
            <span className="ml-3 text-gray-300 w-10 text-right">
              {localConfig.sensorAngle}
            </span>
          </div>
        </div>

        {/* Sensor Distance */}
        <div>
          <label className="block text-sm text-purple-300 mb-1">
            Sensor Distance
          </label>
          <div className="flex items-center">
            <Input
              type="range"
              min="5"
              max="50"
              step="1"
              value={localConfig.sensorDistance}
              onChange={(e) =>
                handleConfigChange("sensorDistance", parseInt(e.target.value))
              }
              className="flex-1"
            />
            <span className="ml-3 text-gray-300 w-10 text-right">
              {localConfig.sensorDistance}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-purple-900/30 text-sm text-gray-400">
        <h3 className="text-purple-300 mb-2">How it works</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Ants start from the purple nest and search for cyan food sources
          </li>
          <li>
            When an ant finds food, it returns to the nest leaving a cyan
            pheromone trail
          </li>
          <li>
            When an ant returns to the nest, it follows the cyan trail back to
            the food
          </li>
          <li>
            Pheromones evaporate over time according to the evaporation rate
          </li>
          <li>
            Ants sense pheromones through three sensors positioned at their
            front
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
        <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto">
          Reset to Defaults
        </Button>
        <div className="text-center text-xs text-gray-500">
          Tip: Try different ant counts and speeds to see emergent behavior!
        </div>
      </div>
    </Card>
  );
}
