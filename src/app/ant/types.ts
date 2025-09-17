// Shared types for the ant simulation

export type Position = {
    x: number;
    y: number;
};

export type Ant = {
  id: number;
  position: Position;
  direction: number;
  hasFood: boolean;
  foodCarried: number;
  explorationBias: number;
  lastPheromoneTime: number;
  trailMemory: Position[];
  lastFoodTime: number; // Track when ant last found food
  explorationUrgency: number; // Increases over time without food
};

export type Food = Position & {
    id: number;
    amount: number;
    maxAmount: number;
};

export type PheromoneType = 'home' | 'food';

export type Pheromone = {
    type: PheromoneType;
    strength: number;
    age: number;
    position: Position;
};

export type SimulationConfig = {
    antCount: number;
    foodCount: number;
    evaporationRate: number;
    diffusionRate: number;
    antSpeed: number;
    pheromoneStrength: number;
    sensorAngle: number;
    sensorDistance: number;
};

export type SimulationState = "stopped" | "running" | "paused";

export type SensorReading = {
    x: number;
    y: number;
    angle: number;
    homePheromone: number;
    foodPheromone: number;
};

// Constants
export const SIMULATION_CONSTANTS = {
  NEST_RADIUS: 15,
  FOOD_PICKUP_DISTANCE: 5,
  PHEROMONE_DECAY_RATE: 0.995, // Slower decay for longer trails
  MAX_TRAIL_MEMORY: 50,
  SENSOR_COUNT: 3,
  MIN_FPS: 30,
  PHEROMONE_UPDATE_INTERVAL: 80, // More frequent pheromone updates
} as const;

// Default configuration - optimized for realistic ant behavior
export const DEFAULT_CONFIG: SimulationConfig = {
  antCount: 80,           // Slightly fewer ants for better performance
  foodCount: 4,           // Fewer food sources for more focused behavior
  evaporationRate: 0.005, // Slower evaporation for stronger trails
  diffusionRate: 0.05,    // Reduced diffusion for clearer paths
  antSpeed: 2.5,          // Faster movement for better exploration
  pheromoneStrength: 2.5, // Stronger pheromones for better trail following
  sensorAngle: 45,        // Wider sensor range for better detection
  sensorDistance: 25,     // Longer sensor range for better exploration
};
