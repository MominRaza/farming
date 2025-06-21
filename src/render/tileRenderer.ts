import { tileMap, TILE_COLORS } from '../core/tile';
import { GRID_SIZE } from '../utils/constants';

export function drawTiles(ctx: CanvasRenderingContext2D) {
    tileMap.forEach((type, key) => {
        const [x, y] = key.split(',').map(Number);
        ctx.fillStyle = TILE_COLORS[type];
        ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });
}
