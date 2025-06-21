import { tileMap, TILE_COLORS } from '../core/tile';
import { GRID_SIZE } from '../utils/constants';
import { getToolById } from '../core/tools';

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
        }

        // Draw crop if present
        if (tileData.crop) {
            const tool = getToolById(tileData.crop.cropType);

            if (tool && 'icon' in tool) {
                // Draw crop background (light green to show it's planted)
                ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
                ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

                // Draw crop icon/text
                ctx.fillStyle = '#27ae60';
                ctx.font = `${GRID_SIZE * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Use emoji icon or first letter of crop name
                const icon = tool.icon || tool.name[0];
                ctx.fillText(
                    icon,
                    x * GRID_SIZE + GRID_SIZE / 2,
                    y * GRID_SIZE + GRID_SIZE / 2
                );
            }
        }
    });
}
