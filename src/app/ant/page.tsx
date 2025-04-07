"use client";

import React, { useState, useEffect } from "react";
import AntSimulation from "./components/AntSimulation";
import SimulationControls from "./components/SimulationControls";

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

export default function AntPage() {
  const [simulationState, setSimulationState] = useState<
    "stopped" | "running" | "paused"
  >("stopped");
  const [config, setConfig] = useState<SimulationConfigType>({
    antCount: 100,
    foodCount: 5,
    evaporationRate: 0.01,
    diffusionRate: 0.1,
    antSpeed: 1,
    pheromoneStrength: 1,
    sensorAngle: 30,
    sensorDistance: 10,
  });

  // Debug log for simulation state changes
  useEffect(() => {
    console.log("AntPage: Simulation state changed to:", simulationState);
  }, [simulationState]);

  // Debug log for config changes
  useEffect(() => {
    console.log("AntPage: Config changed:", config);
  }, [config]);

  const handleConfigChange = (newConfig: SimulationConfigType) => {
    console.log("AntPage: Config change requested:", newConfig);
    setConfig(newConfig);
  };

  const handleSimulationStateChange = (
    newState: "stopped" | "running" | "paused"
  ) => {
    console.log("AntPage: Simulation state change requested:", newState);
    setSimulationState(newState);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-4 min-h-screen">
      <h1 className="text-3xl font-bold text-white text-center">
        Ant Colony Simulation
      </h1>

      <SimulationControls
        config={config}
        setConfig={handleConfigChange}
        simulationState={simulationState}
        setSimulationState={handleSimulationStateChange}
      />

      <div className="relative w-full aspect-square max-w-4xl mx-auto bg-zinc-900 rounded-lg overflow-hidden shadow-xl">
        <AntSimulation
          config={config}
          simulationState={simulationState}
          setSimulationState={handleSimulationStateChange}
        />
      </div>
    </div>
  );
}
