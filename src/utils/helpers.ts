import { GRID_SIZE } from "./constants";

export function getTileCoords(
    screenX: number,
    screenY: number,
    offsetX: number,
    offsetY: number,
    scale: number
): { tileX: number; tileY: number } {
    const worldX = (screenX - offsetX) / scale;
    const worldY = (screenY - offsetY) / scale;
    return {
        tileX: Math.floor(worldX / GRID_SIZE),
        tileY: Math.floor(worldY / GRID_SIZE),
    };
}
