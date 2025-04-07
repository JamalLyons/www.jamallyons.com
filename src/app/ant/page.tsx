"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        Ant Colony Simulation
      </h1>

      <SimulationControls
        config={config}
        setConfig={handleConfigChange}
        simulationState={simulationState}
        setSimulationState={handleSimulationStateChange}
      />

      <Card className="relative aspect-[16/9] w-full overflow-hidden">
        <AntSimulation
          config={config}
          simulationState={simulationState}
          setSimulationState={handleSimulationStateChange}
        />
      </Card>
    </div>
  );
}
