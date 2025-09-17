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
    <div className="min-h-screen bg-[#0a0a0f] text-purple-300">
      {/* Grid background */}
      <div className="grid-background" />

      <div className="container mx-auto px-4 py-6 flex flex-col gap-6 min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-300 mb-2">
            Ant Colony Simulation
          </h1>
          <p className="text-purple-400/80 text-sm md:text-base">
            Watch emergent behavior as ants find food and create pheromone trails
          </p>
        </div>

        <SimulationControls
          config={config}
          setConfig={handleConfigChange}
          simulationState={simulationState}
          setSimulationState={handleSimulationStateChange}
        />

        <div className="relative w-full aspect-square max-w-4xl mx-auto bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl overflow-hidden shadow-2xl border border-purple-800/30">
          <AntSimulation
            config={config}
            simulationState={simulationState}
            setSimulationState={handleSimulationStateChange}
          />
        </div>
      </div>
    </div>
  );
}
