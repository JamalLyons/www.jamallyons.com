import { Ant, Position, SensorReading, SimulationConfig, SIMULATION_CONSTANTS } from '../types';

export function createSensors(ant: Ant, config: SimulationConfig): SensorReading[] {
    return Array.from({ length: SIMULATION_CONSTANTS.SENSOR_COUNT }, (_, i) => {
        const angle = ant.direction + (i - 1) * (config.sensorAngle * Math.PI / 180);
        return {
            x: ant.position.x + Math.cos(angle) * config.sensorDistance,
            y: ant.position.y + Math.sin(angle) * config.sensorDistance,
            angle,
            homePheromone: 0, // Will be set by caller
            foodPheromone: 0, // Will be set by caller
        };
    });
}

export function updateAntDirection(
    ant: Ant,
    sensors: SensorReading[],
    config: SimulationConfig,
    currentTime: number
): number {
    // Find best direction based on pheromones
    let bestDirection = ant.direction;
    let maxSignal = 0;

    if (ant.hasFood) {
        // When carrying food, follow home pheromones
        sensors.forEach(sensor => {
            const signal = sensor.homePheromone;
            if (signal > maxSignal) {
                maxSignal = signal;
                bestDirection = sensor.angle;
            }
        });
    } else {
        // When searching, follow food pheromones
        sensors.forEach(sensor => {
            const signal = sensor.foodPheromone;
            if (signal > maxSignal) {
                maxSignal = signal;
                bestDirection = sensor.angle;
            }
        });
    }

    // Calculate exploration urgency based on time since last food
    const timeSinceFood = currentTime - ant.lastFoodTime;
    const explorationUrgency = Math.min(1.0, timeSinceFood / 10000); // Increases over 10 seconds

    // Improved blending logic for better exploration
    const pheromoneWeight = Math.min(0.6, maxSignal * 1.5); // Reduced max weight
    const explorationWeight = (ant.explorationBias + explorationUrgency * 0.5) * (1.2 - maxSignal * 0.5);
    const randomWeight = 0.15 + explorationUrgency * 0.1; // More randomness when urgent

    // Add some random walk even when following pheromones
    const randomAngle = (Math.random() - 0.5) * Math.PI * (0.3 + explorationUrgency * 0.4);

    return ant.direction * (1 - pheromoneWeight - explorationWeight - randomWeight) +
        bestDirection * pheromoneWeight +
        (Math.random() - 0.5) * Math.PI * explorationWeight +
        randomAngle * randomWeight;
}

export function updateAntPosition(
    ant: Ant,
    direction: number,
    speed: number,
    canvasWidth: number,
    canvasHeight: number
): Ant {
    const newAnt = { ...ant };
    newAnt.direction = direction;

    // Update position
    const newX = newAnt.position.x + Math.cos(newAnt.direction) * speed;
    const newY = newAnt.position.y + Math.sin(newAnt.direction) * speed;

    // Boundary collision with bounce
    if (newX < 0 || newX >= canvasWidth) {
        newAnt.direction = Math.PI - newAnt.direction;
        newAnt.position.x = Math.max(0, Math.min(canvasWidth - 1, newX));
    } else {
        newAnt.position.x = newX;
    }

    if (newY < 0 || newY >= canvasHeight) {
        newAnt.direction = -newAnt.direction;
        newAnt.position.y = Math.max(0, Math.min(canvasHeight - 1, newY));
    } else {
        newAnt.position.y = newY;
    }

    // Update trail memory
    newAnt.trailMemory.push({ ...newAnt.position });
    if (newAnt.trailMemory.length > SIMULATION_CONSTANTS.MAX_TRAIL_MEMORY) {
        newAnt.trailMemory.shift();
    }

    return newAnt;
}

export function handleFoodInteraction(
    ant: Ant,
    food: any[],
    nestPosition: Position,
    setFood: (updater: (prev: any[]) => any[]) => void,
    setCollectedFood: (updater: (prev: number) => number) => void,
    addPheromone: (position: Position, type: 'home' | 'food', strength: number) => void,
    config: SimulationConfig
): Ant {
    const newAnt = { ...ant };

    if (!newAnt.hasFood) {
        // Check for food pickup
        const nearbyFood = food.find(f =>
            Math.hypot(newAnt.position.x - f.x, newAnt.position.y - f.y) < SIMULATION_CONSTANTS.FOOD_PICKUP_DISTANCE &&
            f.amount > 0
        );

        if (nearbyFood) {
            const foodTaken = Math.min(5, nearbyFood.amount);
            newAnt.hasFood = true;
            newAnt.foodCarried = foodTaken;
            newAnt.direction = Math.atan2(nestPosition.y - newAnt.position.y, nestPosition.x - newAnt.position.x);
            newAnt.lastFoodTime = performance.now(); // Update last food time

            // Update food
            setFood(prev => prev.map(f =>
                f.id === nearbyFood.id
                    ? { ...f, amount: f.amount - foodTaken }
                    : f
            ));
        }
    } else {
        // Check for nest return
        const distanceToNest = Math.hypot(
            newAnt.position.x - nestPosition.x,
            newAnt.position.y - nestPosition.y
        );

        if (distanceToNest < SIMULATION_CONSTANTS.NEST_RADIUS) {
            setCollectedFood(prev => prev + newAnt.foodCarried);
            newAnt.hasFood = false;
            newAnt.foodCarried = 0;
            newAnt.direction += Math.PI + (Math.random() - 0.5) * 1.0;

            // Add strong home pheromone at nest
            addPheromone(nestPosition, 'home', config.pheromoneStrength * 2);
        }
    }

    return newAnt;
}
