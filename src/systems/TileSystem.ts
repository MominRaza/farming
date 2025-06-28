import type { TileType, ToolId } from '../types';
import { EventBus } from '../events/EventBus';
import type { TileChangedEvent, CropPlantedEvent, CropHarvestedEvent } from '../events/EventTypes';
import { ACTION_DATA } from '../utils/constants';

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

/**
 * TileSystem manages all tile operations and state
 * Handles tile creation, modification, and crop management
 */
export class TileSystem {
    private tileMap = new Map<string, TileData>();
    private eventBus: EventBus;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
    }

    // === Helper Methods ===

    private getTileKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    private emitTileChanged(x: number, y: number, tileData: TileData | undefined): void {
        const event: TileChangedEvent = {
            type: 'tile:changed',
            timestamp: Date.now(),
            tileX: x,
            tileY: y,
            newType: tileData?.type,
            oldType: undefined // We could track this if needed
        };
        this.eventBus.emit(event);
    }

    // === Tile Query Methods ===

    /**
     * Get tile data at specified coordinates
     */
    getTileData(x: number, y: number): TileData | undefined {
        const key = this.getTileKey(x, y);
        return this.tileMap.get(key);
    }

    /**
     * Check if a tile has soil
     */
    hasSoil(x: number, y: number): boolean {
        const tileData = this.getTileData(x, y);
        return tileData?.type === 'soil';
    }

    /**
     * Check if a tile has a crop
     */
    hasCrop(x: number, y: number): boolean {
        const tileData = this.getTileData(x, y);
        return tileData?.crop !== undefined;
    }

    /**
     * Check if a crop is mature (ready for harvest)
     */
    isCropMature(x: number, y: number): boolean {
        const tileData = this.getTileData(x, y);
        if (!tileData?.crop) {
            return false;
        }
        return tileData.crop.stage >= tileData.crop.maxStages - 1;
    }

    /**
     * Get crop growth progress (0-1)
     */
    getCropProgress(x: number, y: number): number {
        const tileData = this.getTileData(x, y);
        if (!tileData?.crop) {
            return 0;
        }
        return tileData.crop.stage / (tileData.crop.maxStages - 1);
    }

    // === Enhancement Status Methods ===

    /**
     * Check if a tile is watered (and not expired)
     */
    isWatered(x: number, y: number): boolean {
        const tileData = this.getTileData(x, y);

        if (!tileData?.isWatered || !tileData.wateredAt) {
            return false;
        }

        // Check if water effect has expired
        const now = Date.now();
        const timeElapsed = now - tileData.wateredAt;

        if (timeElapsed > ACTION_DATA.water.duration) {
            // Water effect has expired, remove it
            tileData.isWatered = false;
            delete tileData.wateredAt;
            this.emitTileChanged(x, y, tileData);
            return false;
        }

        return true;
    }

    /**
     * Check if a tile is fertilized (and not used up)
     */
    isFertilized(x: number, y: number): boolean {
        const tileData = this.getTileData(x, y);

        if (!tileData?.isFertilized) {
            return false;
        }

        // Check if fertilizer usage has been exceeded
        const usageCount = tileData.fertilizerUsageCount || 0;
        const maxUsage = tileData.fertilizerMaxUsage || ACTION_DATA.fertilize.maxUsage;

        if (usageCount >= maxUsage) {
            // Fertilizer has been used up, remove it
            tileData.isFertilized = false;
            delete tileData.fertilizedAt;
            delete tileData.fertilizerUsageCount;
            delete tileData.fertilizerMaxUsage;
            this.emitTileChanged(x, y, tileData);
            return false;
        }

        return true;
    }

    /**
     * Get fertilizer usage information
     */
    getFertilizerUsage(x: number, y: number): { used: number; max: number } | null {
        const tileData = this.getTileData(x, y);

        if (!tileData?.isFertilized) {
            return null;
        }

        return {
            used: tileData.fertilizerUsageCount || 0,
            max: tileData.fertilizerMaxUsage || ACTION_DATA.fertilize.maxUsage
        };
    }

    // === Tile Modification Methods ===

    /**
     * Set tile type (creates new tile or updates existing)
     */
    setTileType(x: number, y: number, type: TileType): boolean {
        const key = this.getTileKey(x, y);
        const existingData = this.tileMap.get(key);

        if (existingData) {
            // Update existing tile type, preserve crop if compatible
            existingData.type = type;
            // Remove crop if changing to road (crops can't grow on roads)
            if (type === 'road') {
                delete existingData.crop;
            }
        } else {
            // Create new tile
            this.tileMap.set(key, { type });
        }

        const newTileData = this.tileMap.get(key)!;
        this.emitTileChanged(x, y, newTileData);
        return true;
    }

    /**
     * Remove entire tile
     */
    removeTile(x: number, y: number): boolean {
        const key = this.getTileKey(x, y);
        const removed = this.tileMap.delete(key);

        if (removed) {
            // Emit removal event
            this.emitTileChanged(x, y, undefined);
        }

        return removed;
    }

    // === Crop Management Methods ===

    /**
     * Plant a crop on a tile
     */
    plantCrop(x: number, y: number, cropType: ToolId, maxStages: number): boolean {
        const tileData = this.getTileData(x, y);

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

        this.emitTileChanged(x, y, tileData);

        // Emit crop planted event
        const cropEvent: CropPlantedEvent = {
            type: 'crop:planted',
            timestamp: Date.now(),
            tileX: x,
            tileY: y,
            cropType
        };
        this.eventBus.emit(cropEvent);

        return true;
    }

    /**
     * Remove a crop from a tile (for harvest or destruction)
     */
    removeCrop(x: number, y: number, harvested: boolean = false): boolean {
        const tileData = this.getTileData(x, y);

        if (!tileData?.crop) {
            return false;
        }

        const cropType = tileData.crop.cropType;

        delete tileData.crop;
        this.emitTileChanged(x, y, tileData);

        // Emit crop harvested event if this was a harvest
        if (harvested) {
            // I need to check CropHarvestedEvent structure to get the reward
            const harvestEvent: CropHarvestedEvent = {
                type: 'crop:harvested',
                timestamp: Date.now(),
                tileX: x,
                tileY: y,
                cropType,
                reward: 0 // This should be calculated by CropSystem
            };
            this.eventBus.emit(harvestEvent);
        }

        return true;
    }

    /**
     * Update crop growth based on time elapsed
     */
    updateCropGrowth(x: number, y: number, growTime: number): boolean {
        const tileData = this.getTileData(x, y);

        if (!tileData?.crop) {
            return false;
        }

        const now = Date.now();
        const timeElapsed = now - tileData.crop.plantedAt;

        // Calculate growth modifiers
        let growthMultiplier = 1.0;

        // Watering speeds up growth
        if (this.isWatered(x, y)) {
            growthMultiplier += ACTION_DATA.water.speedBonus;
        }

        // Fertilizing speeds up growth
        if (this.isFertilized(x, y)) {
            growthMultiplier += ACTION_DATA.fertilize.speedBonus;
        }

        // Apply growth multiplier to reduce effective grow time
        const effectiveGrowTime = growTime / growthMultiplier;
        const timePerStage = effectiveGrowTime * 1000; // Convert seconds to milliseconds
        const expectedStage = Math.floor(timeElapsed / timePerStage);

        // Update stage, but don't exceed maxStages - 1 (0-indexed)
        const newStage = Math.min(expectedStage, tileData.crop.maxStages - 1);

        if (newStage !== tileData.crop.stage) {
            tileData.crop.stage = newStage;
            this.emitTileChanged(x, y, tileData);
            return true; // Growth occurred
        }

        return false; // No growth
    }

    // === Enhancement Methods ===

    /**
     * Water a soil tile
     */
    waterTile(x: number, y: number): boolean {
        const tileData = this.getTileData(x, y);

        // Can only water soil tiles
        if (!tileData || tileData.type !== 'soil') {
            return false;
        }

        tileData.isWatered = true;
        tileData.wateredAt = Date.now();
        this.emitTileChanged(x, y, tileData);
        return true;
    }

    /**
     * Fertilize a soil tile
     */
    fertilizeTile(x: number, y: number): boolean {
        const tileData = this.getTileData(x, y);

        // Can only fertilize soil tiles
        if (!tileData || tileData.type !== 'soil') {
            return false;
        }

        tileData.isFertilized = true;
        tileData.fertilizedAt = Date.now();
        tileData.fertilizerUsageCount = 0; // Reset usage count
        tileData.fertilizerMaxUsage = ACTION_DATA.fertilize.maxUsage; // Set max usage
        this.emitTileChanged(x, y, tileData);
        return true;
    }

    // === Batch Operations ===

    /**
     * Update water and fertilizer effects for all tiles
     */
    updateAllEffects(): number {
        let effectsExpired = 0;

        this.tileMap.forEach((tileData, key) => {
            const [x, y] = key.split(',').map(Number);

            // Check water expiration (time-based)
            if (tileData.isWatered && tileData.wateredAt) {
                const now = Date.now();
                const timeElapsed = now - tileData.wateredAt;

                if (timeElapsed > ACTION_DATA.water.duration) {
                    tileData.isWatered = false;
                    delete tileData.wateredAt;
                    this.emitTileChanged(x, y, tileData);
                    effectsExpired++;
                }
            }

            // Fertilizer expiration is checked in isFertilized method
        });

        return effectsExpired;
    }

    /**
     * Get all tiles with crops
     */
    getAllCropTiles(): Array<{ x: number; y: number; tileData: TileData }> {
        const cropTiles: Array<{ x: number; y: number; tileData: TileData }> = [];

        this.tileMap.forEach((tileData, key) => {
            if (tileData.crop) {
                const [x, y] = key.split(',').map(Number);
                cropTiles.push({ x, y, tileData });
            }
        });

        return cropTiles;
    }

    /**
     * Get all tiles
     */
    getAllTiles(): Array<{ x: number; y: number; tileData: TileData }> {
        const allTiles: Array<{ x: number; y: number; tileData: TileData }> = [];

        this.tileMap.forEach((tileData, key) => {
            const [x, y] = key.split(',').map(Number);
            allTiles.push({ x, y, tileData });
        });

        return allTiles;
    }

    // === Debug and Info Methods ===

    /**
     * Get detailed crop information for debugging
     */
    getCropInfo(x: number, y: number): string | null {
        const tileData = this.getTileData(x, y);

        if (!tileData?.crop) {
            return null;
        }

        const now = Date.now();
        const timeElapsed = now - tileData.crop.plantedAt;
        const progress = this.getCropProgress(x, y);
        const isMature = this.isCropMature(x, y);

        return `Crop: ${tileData.crop.cropType} | Stage: ${tileData.crop.stage + 1}/${tileData.crop.maxStages} | Progress: ${Math.round(progress * 100)}% | ${isMature ? 'MATURE' : 'Growing'} | Time: ${Math.round(timeElapsed / 1000)}s`;
    }

    /**
     * Get tile statistics
     */
    getStatistics(): {
        totalTiles: number;
        soilTiles: number;
        roadTiles: number;
        cropsPlanted: number;
        matureCrops: number;
        wateredTiles: number;
        fertilizedTiles: number;
    } {
        let soilTiles = 0;
        let roadTiles = 0;
        let cropsPlanted = 0;
        let matureCrops = 0;
        let wateredTiles = 0;
        let fertilizedTiles = 0;

        this.tileMap.forEach((tileData, key) => {
            const [x, y] = key.split(',').map(Number);

            if (tileData.type === 'soil') {
                soilTiles++;
                if (this.isWatered(x, y)) wateredTiles++;
                if (this.isFertilized(x, y)) fertilizedTiles++;
            } else if (tileData.type === 'road') {
                roadTiles++;
            }

            if (tileData.crop) {
                cropsPlanted++;
                if (this.isCropMature(x, y)) matureCrops++;
            }
        });

        return {
            totalTiles: this.tileMap.size,
            soilTiles,
            roadTiles,
            cropsPlanted,
            matureCrops,
            wateredTiles,
            fertilizedTiles
        };
    }

    // === Legacy Compatibility ===

    /**
     * Get the internal tile map (for legacy compatibility)
     * @deprecated Use proper TileSystem methods instead
     */
    getTileMap(): Map<string, TileData> {
        return this.tileMap;
    }

    /**
     * Set tile map data (for save/load)
     */
    setTileMap(tileMap: Map<string, TileData>): void {
        this.tileMap.clear();
        tileMap.forEach((value, key) => {
            this.tileMap.set(key, { ...value });
        });

        // Emit events for all loaded tiles
        this.tileMap.forEach((tileData, key) => {
            const [x, y] = key.split(',').map(Number);
            this.emitTileChanged(x, y, tileData);
        });
    }

    /**
     * Clear all tiles
     */
    clear(): void {
        this.tileMap.clear();
    }
}
