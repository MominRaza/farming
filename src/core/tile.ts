
import type { TileType, ToolId } from '../types';

export const TileTypes = {
    ROAD: 'road' as TileType,
    SOIL: 'soil' as TileType,
};

export const TILE_COLORS: Record<TileType, string> = {
    road: '#7f8c8d',
    soil: '#8b4513',
};

// Interface for planted crops
export interface PlantedCrop {
    cropType: ToolId;
    plantedAt: number;
    stage: number;
    maxStages: number;
}

// Enhanced tile interface that can contain crop data
export interface TileData {
    type: TileType;
    crop?: PlantedCrop; // Optional crop data for soil tiles
}

// Single unified map for all tile data
export const tileMap = new Map<string, TileData>();

export function getTileKey(x: number, y: number): string {
    return `${x},${y}`;
}

// Helper function to check if a tile has soil
export function hasSoil(x: number, y: number): boolean {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);
    return tileData?.type === 'soil';
}

// Helper function to check if a tile has a crop
export function hasCrop(x: number, y: number): boolean {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);
    return tileData?.crop !== undefined;
}

// Get tile data
export function getTileData(x: number, y: number): TileData | undefined {
    const key = getTileKey(x, y);
    return tileMap.get(key);
}

// Set tile type (creates new tile or updates existing)
export function setTileType(x: number, y: number, type: TileType): void {
    const key = getTileKey(x, y);
    const existingData = tileMap.get(key);

    if (existingData) {
        // Update existing tile type, preserve crop if compatible
        existingData.type = type;
        // Remove crop if changing to road (crops can't grow on roads)
        if (type === 'road') {
            delete existingData.crop;
        }
    } else {
        // Create new tile
        tileMap.set(key, { type });
    }
}

// Plant a crop on a tile
export function plantCrop(x: number, y: number, cropType: ToolId, maxStages: number): boolean {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);

    // Check if tile has soil and no existing crop
    if (!tileData || tileData.type !== 'soil' || tileData.crop) {
        return false;
    }

    // Add crop data to the soil tile
    tileData.crop = {
        cropType,
        plantedAt: Date.now(),
        stage: 0,
        maxStages
    };

    return true;
}

// Remove a crop from a tile
export function removeCrop(x: number, y: number): boolean {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);

    if (tileData?.crop) {
        delete tileData.crop;
        return true;
    }

    return false;
}

// Remove entire tile
export function removeTile(x: number, y: number): boolean {
    const key = getTileKey(x, y);
    return tileMap.delete(key);
}
