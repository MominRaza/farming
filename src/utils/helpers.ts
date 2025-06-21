export function getTileCoords(screenX: number, screenY: number, offsetX: number, offsetY: number, scale: number, gridSize: number) {
    const worldX = (screenX - offsetX) / scale;
    const worldY = (screenY - offsetY) / scale;
    return {
        tileX: Math.floor(worldX / gridSize),
        tileY: Math.floor(worldY / gridSize),
    };
}
