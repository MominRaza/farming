import { EventBus } from '../events/EventBus';
import type {
    CropGrownEvent,
    CropWateredEvent,
    CropFertilizedEvent,
    CropHarvestedEvent
} from '../events/EventTypes';
import type { TileSystem } from './TileSystem';
import type { ToolId, CropTool } from '../types';
import { CROP_DATA } from '../utils/constants';

/**
 * CropSystem manages crop growth, enhancement effects, and lifecycle
 * Works in coordination with TileSystem for crop management
 */
export class CropSystem {
    private eventBus: EventBus;
    private tileSystem: TileSystem;
    private lastUpdateTime: number = Date.now();

    constructor(eventBus: EventBus, tileSystem: TileSystem) {
        this.eventBus = eventBus;
        this.tileSystem = tileSystem;
    }

    // === Crop Lifecycle Methods ===

    /**
     * Plant a crop on a tile
     */
    plantCrop(x: number, y: number, cropTool: CropTool): boolean {
        return this.tileSystem.plantCrop(x, y, cropTool.id as ToolId, cropTool.growthStages);
    }

    /**
     * Harvest a crop from a tile
     */
    harvestCrop(x: number, y: number): { success: boolean; reward: number; cropType?: ToolId } {
        const tileData = this.tileSystem.getTileData(x, y);

        if (!tileData?.crop) {
            return { success: false, reward: 0 };
        }

        const cropType = tileData.crop.cropType;
        const isMature = this.tileSystem.isCropMature(x, y);

        // Calculate reward based on crop maturity and type
        let reward = 0;
        const cropData = CROP_DATA[cropType as keyof typeof CROP_DATA];

        if (cropData) {
            if (isMature) {
                // Full reward for mature crops
                reward = cropData.reward;
            } else {
                // Partial reward for immature crops (50% of base reward)
                reward = Math.floor(cropData.reward * 0.5);
            }

            // Apply enhancement bonuses
            const enhancementBonus = this.calculateEnhancementBonus(x, y);
            reward = Math.floor(reward * enhancementBonus);
        }

        // Remove the crop from tile
        const success = this.tileSystem.removeCrop(x, y, true);

        if (success) {
            // Emit harvest event with actual reward
            const harvestEvent: CropHarvestedEvent = {
                type: 'crop:harvested',
                timestamp: Date.now(),
                tileX: x,
                tileY: y,
                cropType,
                reward
            };
            this.eventBus.emit(harvestEvent);
        }

        return { success, reward, cropType };
    }

    /**
     * Water a crop (enhances growth speed)
     */
    waterCrop(x: number, y: number): boolean {
        const success = this.tileSystem.waterTile(x, y);

        if (success) {
            const event: CropWateredEvent = {
                type: 'crop:watered',
                timestamp: Date.now(),
                tileX: x,
                tileY: y
            };
            this.eventBus.emit(event);
        }

        return success;
    }

    /**
     * Fertilize a crop (enhances growth speed and yield)
     */
    fertilizeCrop(x: number, y: number): boolean {
        const success = this.tileSystem.fertilizeTile(x, y);

        if (success) {
            const event: CropFertilizedEvent = {
                type: 'crop:fertilized',
                timestamp: Date.now(),
                tileX: x,
                tileY: y
            };
            this.eventBus.emit(event);
        }

        return success;
    }

    // === Growth Management ===

    /**
     * Update all crops growth
     */
    updateAllCrops(): { cropsUpdated: number; effectsExpired: number } {
        const now = Date.now();
        let cropsUpdated = 0;

        // Update water and fertilizer effects first
        const effectsExpired = this.tileSystem.updateAllEffects();

        // Update each crop individually
        const cropTiles = this.tileSystem.getAllCropTiles();

        for (const { x, y, tileData } of cropTiles) {
            if (tileData.crop) {
                const cropData = CROP_DATA[tileData.crop.cropType as keyof typeof CROP_DATA];

                if (cropData) {
                    const hasGrown = this.tileSystem.updateCropGrowth(x, y, cropData.growTime);

                    if (hasGrown) {
                        cropsUpdated++;

                        // Emit growth event
                        const growthEvent: CropGrownEvent = {
                            type: 'crop:grown',
                            timestamp: Date.now(),
                            tileX: x,
                            tileY: y,
                            newStage: tileData.crop.stage,
                            maxStages: tileData.crop.maxStages
                        };
                        this.eventBus.emit(growthEvent);
                    }
                }
            }
        }

        this.lastUpdateTime = now;
        return { cropsUpdated, effectsExpired };
    }

    /**
     * Check if enough time has passed for update (every second)
     */
    shouldUpdate(): boolean {
        const now = Date.now();
        return now - this.lastUpdateTime >= 1000; // Update every second
    }

    // === Enhancement and Bonus Calculations ===

    /**
     * Calculate enhancement bonus for harvest rewards
     */
    private calculateEnhancementBonus(x: number, y: number): number {
        let bonus = 1.0;

        // Watering bonus (10% extra yield)
        if (this.tileSystem.isWatered(x, y)) {
            bonus += 0.10;
        }

        // Fertilizer bonus (20% extra yield)
        if (this.tileSystem.isFertilized(x, y)) {
            bonus += 0.20;
        }

        return bonus;
    }

    /**
     * Get crop growth information
     */
    getCropInfo(x: number, y: number): {
        cropType: ToolId;
        stage: number;
        maxStages: number;
        progress: number;
        isMature: boolean;
        isWatered: boolean;
        isFertilized: boolean;
        growthTime: number;
        timeElapsed: number;
        expectedReward: number;
    } | null {
        const tileData = this.tileSystem.getTileData(x, y);

        if (!tileData?.crop) {
            return null;
        }

        const cropType = tileData.crop.cropType;
        const cropData = CROP_DATA[cropType as keyof typeof CROP_DATA];

        if (!cropData) {
            return null;
        }

        const progress = this.tileSystem.getCropProgress(x, y);
        const isMature = this.tileSystem.isCropMature(x, y);
        const isWatered = this.tileSystem.isWatered(x, y);
        const isFertilized = this.tileSystem.isFertilized(x, y);

        const timeElapsed = Date.now() - tileData.crop.plantedAt;

        // Calculate expected reward
        let expectedReward = isMature ? cropData.reward : Math.floor(cropData.reward * 0.5);
        const enhancementBonus = this.calculateEnhancementBonus(x, y);
        expectedReward = Math.floor(expectedReward * enhancementBonus);

        return {
            cropType,
            stage: tileData.crop.stage,
            maxStages: tileData.crop.maxStages,
            progress,
            isMature,
            isWatered,
            isFertilized,
            growthTime: cropData.growTime,
            timeElapsed: Math.floor(timeElapsed / 1000), // Convert to seconds
            expectedReward
        };
    }

    // === Statistics and Analysis ===

    /**
     * Get crop statistics
     */
    getStatistics(): {
        totalCrops: number;
        matureCrops: number;
        growingCrops: number;
        wateredCrops: number;
        fertilizedCrops: number;
        cropsByType: Record<string, number>;
        averageGrowthProgress: number;
        totalExpectedValue: number;
    } {
        const cropTiles = this.tileSystem.getAllCropTiles();

        let matureCrops = 0;
        let wateredCrops = 0;
        let fertilizedCrops = 0;
        let totalProgress = 0;
        let totalExpectedValue = 0;

        const cropsByType: Record<string, number> = {};

        for (const { x, y, tileData } of cropTiles) {
            if (tileData.crop) {
                const cropType = tileData.crop.cropType;

                // Count by type
                cropsByType[cropType] = (cropsByType[cropType] || 0) + 1;

                // Count maturity
                if (this.tileSystem.isCropMature(x, y)) {
                    matureCrops++;
                }

                // Count enhancements
                if (this.tileSystem.isWatered(x, y)) {
                    wateredCrops++;
                }

                if (this.tileSystem.isFertilized(x, y)) {
                    fertilizedCrops++;
                }

                // Calculate progress and value
                const progress = this.tileSystem.getCropProgress(x, y);
                totalProgress += progress;

                const cropInfo = this.getCropInfo(x, y);
                if (cropInfo) {
                    totalExpectedValue += cropInfo.expectedReward;
                }
            }
        }

        const totalCrops = cropTiles.length;
        const growingCrops = totalCrops - matureCrops;
        const averageGrowthProgress = totalCrops > 0 ? totalProgress / totalCrops : 0;

        return {
            totalCrops,
            matureCrops,
            growingCrops,
            wateredCrops,
            fertilizedCrops,
            cropsByType,
            averageGrowthProgress,
            totalExpectedValue
        };
    }

    /**
     * Get crops ready for harvest
     */
    getMatureCrops(): Array<{ x: number; y: number; cropType: ToolId; expectedReward: number }> {
        const matureCrops: Array<{ x: number; y: number; cropType: ToolId; expectedReward: number }> = [];
        const cropTiles = this.tileSystem.getAllCropTiles();

        for (const { x, y, tileData } of cropTiles) {
            if (tileData.crop && this.tileSystem.isCropMature(x, y)) {
                const cropInfo = this.getCropInfo(x, y);
                if (cropInfo) {
                    matureCrops.push({
                        x,
                        y,
                        cropType: cropInfo.cropType,
                        expectedReward: cropInfo.expectedReward
                    });
                }
            }
        }

        return matureCrops;
    }

    /**
     * Get crops that need attention (not watered or fertilized)
     */
    getCropsNeedingAttention(): Array<{
        x: number;
        y: number;
        cropType: ToolId;
        needsWater: boolean;
        needsFertilizer: boolean;
    }> {
        const needsAttention: Array<{
            x: number;
            y: number;
            cropType: ToolId;
            needsWater: boolean;
            needsFertilizer: boolean;
        }> = [];

        const cropTiles = this.tileSystem.getAllCropTiles();

        for (const { x, y, tileData } of cropTiles) {
            if (tileData.crop && !this.tileSystem.isCropMature(x, y)) {
                const needsWater = !this.tileSystem.isWatered(x, y);
                const needsFertilizer = !this.tileSystem.isFertilized(x, y);

                if (needsWater || needsFertilizer) {
                    needsAttention.push({
                        x,
                        y,
                        cropType: tileData.crop.cropType,
                        needsWater,
                        needsFertilizer
                    });
                }
            }
        }

        return needsAttention;
    }

    /**
     * Auto-harvest all mature crops
     */
    autoHarvestAll(): { harvested: number; totalReward: number; crops: Array<{ cropType: ToolId; reward: number }> } {
        const matureCrops = this.getMatureCrops();
        let totalReward = 0;
        const harvestedCrops: Array<{ cropType: ToolId; reward: number }> = [];

        for (const { x, y, cropType } of matureCrops) {
            const result = this.harvestCrop(x, y);
            if (result.success) {
                totalReward += result.reward;
                harvestedCrops.push({ cropType, reward: result.reward });
            }
        }

        return {
            harvested: harvestedCrops.length,
            totalReward,
            crops: harvestedCrops
        };
    }

    // === Debug Methods ===

    /**
     * Get detailed crop information for debugging
     */
    getDetailedCropInfo(x: number, y: number): string | null {
        const cropInfo = this.getCropInfo(x, y);

        if (!cropInfo) {
            return null;
        }

        const enhancementText = [];
        if (cropInfo.isWatered) enhancementText.push('💧');
        if (cropInfo.isFertilized) enhancementText.push('🌱');

        return `${cropInfo.cropType} | Stage: ${cropInfo.stage + 1}/${cropInfo.maxStages} | Progress: ${Math.round(cropInfo.progress * 100)}% | ${cropInfo.isMature ? 'MATURE' : 'Growing'} | Time: ${cropInfo.timeElapsed}s | Reward: ${cropInfo.expectedReward} | ${enhancementText.join(' ')}`;
    }
}
