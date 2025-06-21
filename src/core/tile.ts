export type TileType = 'road' | 'soil';
export const TileType = {
    ROAD: 'road' as TileType,
    SOIL: 'soil' as TileType,
};

export const TILE_COLORS: Record<TileType, string> = {
    road: '#7f8c8d',
    soil: '#8b4513',
};

export const tileMap = new Map<string, TileType>();

export function getTileKey(x: number, y: number) {
    return `${x},${y}`;
}
