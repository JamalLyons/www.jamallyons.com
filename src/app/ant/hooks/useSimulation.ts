import { useState, useCallback, useRef, useEffect } from 'react';
import {
    SimulationConfig,
    SimulationState,
    Ant,
    Food,
    Pheromone,
    Position,
    SIMULATION_CONSTANTS,
    DEFAULT_CONFIG
} from '../types';

export function useSimulation() {
    const [simulationState, setSimulationState] = useState<SimulationState>("stopped");
    const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
    const [nestPosition, setNestPosition] = useState<Position>({ x: 0, y: 0 });
    const [ants, setAnts] = useState<Ant[]>([]);
    const [food, setFood] = useState<Food[]>([]);
    const [pheromones, setPheromones] = useState<Pheromone[]>([]);
    const [collectedFood, setCollectedFood] = useState(0);
    const [fps, setFps] = useState(0);

    // Performance tracking refs
    const frameCountRef = useRef(0);
    const lastFpsTimeRef = useRef(0);
    const lastTimeRef = useRef(0);

    // Initialize simulation
    const initializeSimulation = useCallback((canvasWidth: number, canvasHeight: number) => {
        // Initialize nest at center
        const nest = {
            x: Math.floor(canvasWidth / 2),
            y: Math.floor(canvasHeight / 2),
        };
        setNestPosition(nest);

        // Initialize ants with better distribution and exploration
        const newAnts: Ant[] = Array.from({ length: config.antCount }, (_, i) => {
            // Spread ants around the nest in a small radius
            const angle = (i / config.antCount) * Math.PI * 2;
            const radius = 20 + Math.random() * 30;
            const position = {
                x: nest.x + Math.cos(angle) * radius,
                y: nest.y + Math.sin(angle) * radius,
            };

            return {
                id: i,
                position,
                direction: Math.random() * Math.PI * 2,
                hasFood: false,
                foodCarried: 0,
                explorationBias: 0.2 + Math.random() * 0.6, // Higher exploration bias
                lastPheromoneTime: 0,
                trailMemory: [],
                lastFoodTime: 0,
                explorationUrgency: 0,
            };
        });
        console.log("Created ants:", newAnts.length, "with config antCount:", config.antCount);
        setAnts(newAnts);

        // Initialize food with better distribution
        const newFood: Food[] = [];
        const minDistanceFromNest = Math.min(canvasWidth, canvasHeight) / 3;

        for (let i = 0; i < config.foodCount; i++) {
            let foodPos: Position;
            let attempts = 0;
            do {
                // Place food in corners and edges for better exploration
                const corner = Math.floor(Math.random() * 4);
                switch (corner) {
                    case 0: // Top-left
                        foodPos = {
                            x: 30 + Math.random() * (canvasWidth * 0.3),
                            y: 30 + Math.random() * (canvasHeight * 0.3),
                        };
                        break;
                    case 1: // Top-right
                        foodPos = {
                            x: canvasWidth * 0.7 + Math.random() * (canvasWidth * 0.3 - 30),
                            y: 30 + Math.random() * (canvasHeight * 0.3),
                        };
                        break;
                    case 2: // Bottom-left
                        foodPos = {
                            x: 30 + Math.random() * (canvasWidth * 0.3),
                            y: canvasHeight * 0.7 + Math.random() * (canvasHeight * 0.3 - 30),
                        };
                        break;
                    case 3: // Bottom-right
                        foodPos = {
                            x: canvasWidth * 0.7 + Math.random() * (canvasWidth * 0.3 - 30),
                            y: canvasHeight * 0.7 + Math.random() * (canvasHeight * 0.3 - 30),
                        };
                        break;
                    default:
                        foodPos = {
                            x: Math.random() * (canvasWidth - 40) + 20,
                            y: Math.random() * (canvasHeight - 40) + 20,
                        };
                }
                attempts++;
            } while (
                Math.hypot(foodPos.x - nest.x, foodPos.y - nest.y) < minDistanceFromNest &&
                attempts < 50
            );

            newFood.push({
                id: i,
                ...foodPos,
                amount: 80 + Math.floor(Math.random() * 120), // More food per source
                maxAmount: 80 + Math.floor(Math.random() * 120),
            });
        }
        console.log("Created food items:", newFood.length, "with config foodCount:", config.foodCount);
        setFood(newFood);

        // Reset collected food and pheromones
        setCollectedFood(0);
        setPheromones([]);
    }, [config.antCount, config.foodCount]);

    // Pheromone management
    const addPheromone = useCallback((position: Position, type: 'home' | 'food', strength: number) => {
        setPheromones(prev => [...prev, {
            type,
            strength,
            age: 0,
            position: { ...position }
        }]);
    }, []);

    const updatePheromones = useCallback(() => {
        setPheromones(prev => {
            const updated = prev
                .map(p => ({
                    ...p,
                    age: p.age + 1,
                    strength: p.strength * SIMULATION_CONSTANTS.PHEROMONE_DECAY_RATE
                }))
                .filter(p => p.strength > 0.01);

            return updated;
        });
    }, []);

    // Get pheromone strength at position
    const getPheromoneStrength = useCallback((position: Position, type: 'home' | 'food', radius: number = 20) => {
        let totalStrength = 0;
        pheromones.forEach(p => {
            if (p.type === type) {
                const distance = Math.hypot(position.x - p.position.x, position.y - p.position.y);
                if (distance < radius) {
                    totalStrength += p.strength * (1 - distance / radius);
                }
            }
        });
        return totalStrength;
    }, [pheromones]);

    // Update FPS counter
    const updateFps = useCallback((currentTime: number) => {
        frameCountRef.current++;
        if (currentTime - lastFpsTimeRef.current >= 1000) {
            setFps(Math.round(frameCountRef.current * 1000 / (currentTime - lastFpsTimeRef.current)));
            frameCountRef.current = 0;
            lastFpsTimeRef.current = currentTime;
        }
    }, []);

    // Reset performance counters
    const resetPerformanceCounters = useCallback(() => {
        lastTimeRef.current = performance.now();
        lastFpsTimeRef.current = performance.now();
        frameCountRef.current = 0;
    }, []);

    return {
        // State
        simulationState,
        setSimulationState,
        config,
        setConfig,
        nestPosition,
        setNestPosition,
        ants,
        setAnts,
        food,
        setFood,
        pheromones,
        collectedFood,
        setCollectedFood,
        fps,

        // Actions
        initializeSimulation,
        addPheromone,
        updatePheromones,
        getPheromoneStrength,
        updateFps,
        resetPerformanceCounters,
    };
}
