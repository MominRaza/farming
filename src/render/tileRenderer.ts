import { tileMap, TILE_COLORS, getCropProgress, isCropMature } from '../core/tile';
import { GRID_SIZE } from '../utils/constants';
import { getToolById } from '../core/tools';
import { isTileUnlocked, isAreaUnlocked, getTileArea } from '../core/area';
import { AREA_SIZE } from '../utils/constants';
import { state } from '../core/state';

export function drawTiles(ctx: CanvasRenderingContext2D): void {
    // Draw all tiles with their terrain and crops
    tileMap.forEach((tileData, key) => {
        const [x, y] = key.split(',').map(Number);

        // Draw base terrain tile
        let baseColor = TILE_COLORS[tileData.type];

        // Darken soil color if watered
        if (tileData.type === 'soil' && tileData.isWatered) {
            baseColor = '#5d3a1a'; // Darker brown for watered soil
        }

        ctx.fillStyle = baseColor;
        ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

        // Draw fertilizer dots if fertilized
        if (tileData.type === 'soil' && tileData.isFertilized) {
            ctx.fillStyle = '#f1c40f'; // Yellow dots for fertilizer
            const dotSize = 3;
            const spacing = GRID_SIZE / 4;

            // Draw 4 small dots in corners
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    const dotX = x * GRID_SIZE + spacing + (i * spacing * 2) - dotSize / 2;
                    const dotY = y * GRID_SIZE + spacing + (j * spacing * 2) - dotSize / 2;

                    ctx.beginPath();
                    ctx.arc(dotX, dotY, dotSize, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }        // Draw crop if present
        if (tileData.crop) {
            const tool = getToolById(tileData.crop.cropType);

            if (tool && 'icon' in tool) {
                // Draw crop icon/text directly on soil (no background)
                ctx.fillStyle = '#27ae60';
                ctx.font = `${GRID_SIZE * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Use emoji icon or first letter of crop name
                const icon = tool.icon || tool.name[0];
                ctx.fillText(
                    icon,
                    x * GRID_SIZE + GRID_SIZE / 2,
                    y * GRID_SIZE + GRID_SIZE / 2);

                // Draw growth progress bar at bottom of tile
                const progress = getCropProgress(x, y);
                const isMature = isCropMature(x, y);

                // Progress bar dimensions
                const barWidth = GRID_SIZE * 0.8;
                const barHeight = 4;
                const barX = x * GRID_SIZE + (GRID_SIZE - barWidth) / 2;
                const barY = y * GRID_SIZE + GRID_SIZE - barHeight - 2;

                // Background bar (gray)
                ctx.fillStyle = '#34495e';
                ctx.fillRect(barX, barY, barWidth, barHeight);

                // Progress bar (color based on maturity)
                if (progress > 0) {
                    let progressColor;
                    if (isMature) {
                        progressColor = '#27ae60'; // Green for mature
                    } else if (progress > 0.7) {
                        progressColor = '#f39c12'; // Orange for almost ready
                    } else if (progress > 0.4) {
                        progressColor = '#e67e22'; // Light orange for growing
                    } else {
                        progressColor = '#e74c3c'; // Red for just planted
                    }

                    ctx.fillStyle = progressColor;
                    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
                }
            }
        }
    });
}

// Draw locked area overlays
export function drawLockedAreas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Calculate visible area bounds
    const startX = Math.floor(-state.offsetX / state.scale / GRID_SIZE);
    const startY = Math.floor(-state.offsetY / state.scale / GRID_SIZE);
    const endX = startX + Math.ceil(canvas.width / state.scale / GRID_SIZE) + 1;
    const endY = startY + Math.ceil(canvas.height / state.scale / GRID_SIZE) + 1;

    // Draw locked area overlays
    for (let tileX = startX; tileX <= endX; tileX++) {
        for (let tileY = startY; tileY <= endY; tileY++) {
            if (!isTileUnlocked(tileX, tileY)) {                // Draw gray overlay for locked tiles
                ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
                ctx.fillRect(tileX * GRID_SIZE, tileY * GRID_SIZE, GRID_SIZE, GRID_SIZE);                // Add lock icon in the center of area (only once per area, and only if adjacent to unlocked area)
                // Calculate if this tile is the center of its area
                const { areaX, areaY } = getTileArea(tileX, tileY);
                const areaCenterTileX = areaX * AREA_SIZE + Math.floor(AREA_SIZE / 2);
                const areaCenterTileY = areaY * AREA_SIZE + Math.floor(AREA_SIZE / 2);

                if (tileX === areaCenterTileX && tileY === areaCenterTileY) {
                    // Debug log for areas around origin
                    if (Math.abs(areaX) <= 2 && Math.abs(areaY) <= 2) {
                        console.log(`Checking area (${areaX}, ${areaY}) at tile (${tileX}, ${tileY}) - Adjacent: ${isAdjacentToUnlockedArea(areaX, areaY)}`);
                    }

                    // Only show lock icon if this area is adjacent to an unlocked area
                    if (isAdjacentToUnlockedArea(areaX, areaY)) {
                        ctx.fillStyle = 'rgba(220, 220, 220, 0.9)';
                        ctx.font = `${GRID_SIZE * 0.8}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🔒',
                            tileX * GRID_SIZE + GRID_SIZE / 2,
                            tileY * GRID_SIZE + GRID_SIZE / 2
                        );
                    }
                }
            }
        }
    }
}

// Draw area boundaries
export function drawAreaBoundaries(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Calculate visible area bounds
    const startX = Math.floor(-state.offsetX / state.scale / GRID_SIZE);
    const startY = Math.floor(-state.offsetY / state.scale / GRID_SIZE);
    const endX = startX + Math.ceil(canvas.width / state.scale / GRID_SIZE) + 1;
    const endY = startY + Math.ceil(canvas.height / state.scale / GRID_SIZE) + 1;

    // Draw area boundaries
    ctx.strokeStyle = '#e74c3c'; // Red color for area boundaries
    ctx.lineWidth = 2 / state.scale;

    // Draw vertical boundaries
    for (let tileX = startX; tileX <= endX; tileX++) {
        if (tileX % AREA_SIZE === 0) {
            ctx.beginPath();
            ctx.moveTo(tileX * GRID_SIZE, startY * GRID_SIZE);
            ctx.lineTo(tileX * GRID_SIZE, endY * GRID_SIZE);
            ctx.stroke();
        }
    }

    // Draw horizontal boundaries
    for (let tileY = startY; tileY <= endY; tileY++) {
        if (tileY % AREA_SIZE === 0) {
            ctx.beginPath();
            ctx.moveTo(startX * GRID_SIZE, tileY * GRID_SIZE);
            ctx.lineTo(endX * GRID_SIZE, tileY * GRID_SIZE);
            ctx.stroke();
        }
    }
}

// Helper function to check if a locked area is adjacent to an unlocked area
function isAdjacentToUnlockedArea(areaX: number, areaY: number): boolean {
    // Check all 8 surrounding areas (including diagonals)
    const adjacentAreas = [
        [areaX - 1, areaY - 1], // Top-left
        [areaX, areaY - 1],     // Top
        [areaX + 1, areaY - 1], // Top-right
        [areaX - 1, areaY],     // Left
        [areaX + 1, areaY],     // Right
        [areaX - 1, areaY + 1], // Bottom-left
        [areaX, areaY + 1],     // Bottom
        [areaX + 1, areaY + 1]  // Bottom-right
    ];

    // Debug for areas around origin
    if (Math.abs(areaX) <= 2 && Math.abs(areaY) <= 2) {
        const unlockedNeighbors = adjacentAreas.filter(([adjX, adjY]) => isAreaUnlocked(adjX, adjY));
        console.log(`Area (${areaX}, ${areaY}) has ${unlockedNeighbors.length} unlocked neighbors:`, unlockedNeighbors);
    }

    // Return true if any adjacent area is unlocked
    return adjacentAreas.some(([adjX, adjY]) => isAreaUnlocked(adjX, adjY));
}
