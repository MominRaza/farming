
import { state } from '../core/state';
import { TileTypes, tileMap, getTileKey } from '../core/tile';
import type { TileType } from '../types';
import { getTileCoords } from '../utils/helpers';
export function initControls(
    canvas: HTMLCanvasElement,
    draw: () => void,
    updateCursorTile: (x: number, y: number) => void
): void {
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw();
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', (e) => {
        state.isDragging = true;
        state.lastMouseX = e.clientX;
        state.lastMouseY = e.clientY;
    });
    canvas.addEventListener('mousemove', (e) => {
        updateCursorTile(e.clientX, e.clientY);
        if (state.isDragging) {
            const dx = e.clientX - state.lastMouseX;
            const dy = e.clientY - state.lastMouseY;
            state.offsetX += dx;
            state.offsetY += dy;
            state.lastMouseX = e.clientX;
            state.lastMouseY = e.clientY;
            draw();
        }
    });
    canvas.addEventListener('mouseup', (e) => {
        if (state.isDragging) {
            const dx = Math.abs(e.clientX - state.lastMouseX);
            const dy = Math.abs(e.clientY - state.lastMouseY);
            if (dx < 5 && dy < 5) {
                const { tileX, tileY } = getTileCoords(e.clientX, e.clientY, state.offsetX, state.offsetY, state.scale);
                const key = getTileKey(tileX, tileY);
                const existingType = tileMap.get(key);
                if (existingType === state.currentTileType) {
                    tileMap.delete(key);
                } else {
                    tileMap.set(key, state.currentTileType as TileType);
                }
                draw();
            }
        }
        state.isDragging = false;
    });
    canvas.addEventListener('mouseleave', () => {
        state.isDragging = false;
    });
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const zoom = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = state.scale * zoom;
        if (newScale < 0.25 || newScale > 3) return;
        const worldX = (mouseX - state.offsetX) / state.scale;
        const worldY = (mouseY - state.offsetY) / state.scale;
        state.scale = newScale;
        state.offsetX = mouseX - worldX * state.scale;
        state.offsetY = mouseY - worldY * state.scale;
        draw();
    }, { passive: false });
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case '1': state.currentTileType = TileTypes.SOIL; break;
            case '2': state.currentTileType = TileTypes.ROAD; break;
        }
    });
}
