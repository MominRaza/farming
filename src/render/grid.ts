import { state } from '../core/state';
import { GRID_SIZE } from '../utils/constants';

export function drawGrid(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const startX = Math.floor(-state.offsetX / state.scale / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(-state.offsetY / state.scale / GRID_SIZE) * GRID_SIZE;
    const endX = startX + (canvas.width / state.scale) + GRID_SIZE;
    const endY = startY + (canvas.height / state.scale) + GRID_SIZE;
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 1 / state.scale;
    for (let x = startX; x <= endX; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }
    for (let y = startY; y <= endY; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }
}
