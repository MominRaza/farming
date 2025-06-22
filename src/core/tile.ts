import type { TileType, ToolId } from '../types';
import { WATER_DURATION, WATER_SPEED_BONUS, FERTILIZER_SPEED_BONUS, FERTILIZER_MAX_USAGE } from '../utils/constants';

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
    isWatered?: boolean; // Optional water status for soil tiles
    isFertilized?: boolean; // Optional fertilizer status for soil tiles
    wateredAt?: number; // Timestamp when watered (for duration)
    fertilizedAt?: number; // Timestamp when fertilized (for duration)
    fertilizerUsageCount?: number; // How many crops have used this fertilizer
    fertilizerMaxUsage?: number; // Maximum number of crops this fertilizer can support
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

    // If tile is fertilized, increment usage count
    if (tileData.isFertilized) {
        tileData.fertilizerUsageCount = (tileData.fertilizerUsageCount || 0) + 1;
    }

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

// Water a soil tile
export function waterTile(x: number, y: number): boolean {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);

    // Can only water soil tiles
    if (!tileData || tileData.type !== 'soil') {
        return false;
    }

    tileData.isWatered = true;
    tileData.wateredAt = Date.now();
    return true;
}

// Fertilize a soil tile
export function fertilizeTile(x: number, y: number): boolean {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);

    // Can only fertilize soil tiles
    if (!tileData || tileData.type !== 'soil') {
        return false;
    }

    tileData.isFertilized = true;
    tileData.fertilizedAt = Date.now();
    tileData.fertilizerUsageCount = 0; // Reset usage count
    tileData.fertilizerMaxUsage = FERTILIZER_MAX_USAGE; // Set max usage
    return true;
}

// Check if a tile is watered
export function isWatered(x: number, y: number): boolean {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);

    if (!tileData?.isWatered || !tileData.wateredAt) {
        return false;
    }

    // Check if water effect has expired
    const now = Date.now();
    const timeElapsed = now - tileData.wateredAt;

    if (timeElapsed > WATER_DURATION) {
        // Water effect has expired, remove it
        tileData.isWatered = false;
        delete tileData.wateredAt;
        return false;
    }

    return true;
}

// Check if a tile is fertilized
export function isFertilized(x: number, y: number): boolean {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);

    if (!tileData?.isFertilized) {
        return false;
    }

    // Check if fertilizer usage has been exceeded
    const usageCount = tileData.fertilizerUsageCount || 0;
    const maxUsage = tileData.fertilizerMaxUsage || FERTILIZER_MAX_USAGE;

    if (usageCount >= maxUsage) {
        // Fertilizer has been used up, remove it
        tileData.isFertilized = false;
        delete tileData.fertilizedAt;
        delete tileData.fertilizerUsageCount;
        delete tileData.fertilizerMaxUsage;
        return false;
    }

    return true;
}

// Get fertilizer usage information
export function getFertilizerUsage(x: number, y: number): { used: number; max: number } | null {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);

    if (!tileData?.isFertilized) {
        return null;
    }

    return {
        used: tileData.fertilizerUsageCount || 0,
        max: tileData.fertilizerMaxUsage || FERTILIZER_MAX_USAGE
    };
}

// Update crop growth based on time elapsed
export function updateCropGrowth(x: number, y: number, growTime: number): boolean {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);

    if (!tileData?.crop) {
        return false;
    }

    const now = Date.now();
    const timeElapsed = now - tileData.crop.plantedAt;

    // Calculate growth modifiers
    let growthMultiplier = 1.0;

    // Watering speeds up growth by 25%
    if (isWatered(x, y)) {
        growthMultiplier += WATER_SPEED_BONUS;
    }

    // Fertilizing speeds up growth by 40%
    if (isFertilized(x, y)) {
        growthMultiplier += FERTILIZER_SPEED_BONUS;
    }

    // Apply growth multiplier to reduce effective grow time
    const effectiveGrowTime = growTime / growthMultiplier;
    const timePerStage = effectiveGrowTime * 1000; // Convert seconds to milliseconds
    const expectedStage = Math.floor(timeElapsed / timePerStage);

    // Update stage, but don't exceed maxStages - 1 (0-indexed)
    const newStage = Math.min(expectedStage, tileData.crop.maxStages - 1);

    if (newStage !== tileData.crop.stage) {
        tileData.crop.stage = newStage;
        return true; // Growth occurred
    }

    return false; // No growth
}

// Check if a crop is mature (ready for harvest)
export function isCropMature(x: number, y: number): boolean {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);

    if (!tileData?.crop) {
        return false;
    }

    return tileData.crop.stage >= tileData.crop.maxStages - 1;
}

// Get crop growth progress (0-1)
export function getCropProgress(x: number, y: number): number {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);

    if (!tileData?.crop) {
        return 0;
    }

    return tileData.crop.stage / (tileData.crop.maxStages - 1);
}

// Update all crops growth
export function updateAllCropsGrowth(): void {
    // This function will be called from the main game loop
    // Individual crop updates are handled by updateCropGrowth
}

// Update water and fertilizer effects for all tiles
export function updateAllEffects(): number {
    let effectsExpired = 0;

    tileMap.forEach((tileData) => {
        // Check water expiration (time-based)
        if (tileData.isWatered && tileData.wateredAt) {
            const now = Date.now();
            const timeElapsed = now - tileData.wateredAt;

            if (timeElapsed > WATER_DURATION) {
                tileData.isWatered = false;
                delete tileData.wateredAt;
                effectsExpired++;
            }
        }

        // Check fertilizer expiration (usage-based, handled in isFertilized function)
        // No need to check time-based expiration for fertilizer anymore
    });

    return effectsExpired;
}

// Get detailed crop information for debugging
export function getCropInfo(x: number, y: number): string | null {
    const key = getTileKey(x, y);
    const tileData = tileMap.get(key);

    if (!tileData?.crop) {
        return null;
    }

    const now = Date.now();
    const timeElapsed = now - tileData.crop.plantedAt;
    const progress = getCropProgress(x, y);
    const isMature = isCropMature(x, y);

    return `Crop: ${tileData.crop.cropType} | Stage: ${tileData.crop.stage + 1}/${tileData.crop.maxStages} | Progress: ${Math.round(progress * 100)}% | ${isMature ? 'MATURE' : 'Growing'} | Time: ${Math.round(timeElapsed / 1000)}s`;
}
