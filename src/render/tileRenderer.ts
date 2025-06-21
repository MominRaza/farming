import { tileMap, TILE_COLORS } from '../core/tile';
import { GRID_SIZE } from '../utils/constants';
import { getToolById } from '../core/tools';

export function drawTiles(ctx: CanvasRenderingContext2D): void {
    // Draw all tiles with their terrain and crops
    tileMap.forEach((tileData, key) => {
        const [x, y] = key.split(',').map(Number);

        // Draw terrain tile
        ctx.fillStyle = TILE_COLORS[tileData.type];
        ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

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
