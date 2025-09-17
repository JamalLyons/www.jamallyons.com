import { Ant, Food, Pheromone, Position, SIMULATION_CONSTANTS } from '../types';

export function renderPheromones(
    ctx: CanvasRenderingContext2D,
    pheromones: Pheromone[]
): void {
    ctx.globalAlpha = 0.6;
    pheromones.forEach(p => {
        if (p.strength > 0.01) {
            ctx.fillStyle = p.type === 'home'
                ? `rgba(168, 85, 247, ${p.strength * 0.8})`
                : `rgba(0, 210, 255, ${p.strength * 0.8})`;
            ctx.beginPath();
            ctx.arc(p.position.x, p.position.y, p.strength * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.globalAlpha = 1.0;
}

export function renderNest(
    ctx: CanvasRenderingContext2D,
    nestPosition: Position,
    collectedFood: number
): void {
    // Draw nest
    ctx.beginPath();
    ctx.arc(nestPosition.x, nestPosition.y, SIMULATION_CONSTANTS.NEST_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(168, 85, 247, 0.8)";
    ctx.fill();
    ctx.strokeStyle = "rgba(216, 180, 254, 0.9)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw collected food count
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.textAlign = "center";
    ctx.fillText(`${collectedFood}`, nestPosition.x, nestPosition.y + 5);
}

export function renderFood(
    ctx: CanvasRenderingContext2D,
    food: Food[]
): void {
    food.forEach(f => {
        if (f.amount > 0) {
            const size = Math.max(3, Math.min(8, 3 + f.amount / 25));
            ctx.beginPath();
            ctx.arc(f.x, f.y, size, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 193, 7, 0.9)"; // Bright yellow
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 235, 59, 0.9)"; // Lighter yellow border
            ctx.lineWidth = 2;
            ctx.stroke();

            // Show food amount
            ctx.font = "10px sans-serif";
            ctx.fillStyle = "rgba(0, 0, 0, 0.9)"; // Black text for better contrast on yellow
            ctx.textAlign = "center";
            ctx.fillText(`${f.amount}`, f.x, f.y + 3);
        }
    });
}

export function renderAnts(
    ctx: CanvasRenderingContext2D,
    ants: Ant[]
): void {
    ants.forEach(ant => {
        // Draw ant body
        ctx.beginPath();
        ctx.arc(ant.position.x, ant.position.y, ant.hasFood ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = ant.hasFood
            ? "rgba(125, 211, 252, 0.9)"
            : "rgba(216, 180, 254, 0.9)";
        ctx.fill();

        // Draw direction indicator
        ctx.beginPath();
        ctx.moveTo(ant.position.x, ant.position.y);
        ctx.lineTo(
            ant.position.x + Math.cos(ant.direction) * 5,
            ant.position.y + Math.sin(ant.direction) * 5
        );
        ctx.strokeStyle = ant.hasFood
            ? "rgba(125, 211, 252, 0.7)"
            : "rgba(216, 180, 254, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });
}

export function renderStatsPanel(
    ctx: CanvasRenderingContext2D,
    food: Food[],
    collectedFood: number,
    ants: Ant[],
    fps: number
): void {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(8, 8, 220, 100);

    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.textAlign = "left";
    ctx.fillText(`Food Sources: ${food.filter(f => f.amount > 0).length}`, 12, 25);
    ctx.fillText(`Food Collected: ${collectedFood}`, 12, 45);
    ctx.fillText(`Active Ants: ${ants.length}`, 12, 65);
    ctx.fillText(`FPS: ${fps}`, 12, 85);
}

export function renderCompletionMessage(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number
): void {
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.textAlign = "center";
    ctx.fillText(
        "Simulation Complete!",
        canvasWidth / 2,
        canvasHeight / 2
    );
}
