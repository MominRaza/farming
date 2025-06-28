import { eventBus, GameEvents } from '../events/GameEvents';
import { getStateManager } from '../state/globalState';
import {
    tileMap,
    hasCrop,
    hasSoil,
    plantCrop,
    removeCrop,
    isCropMature,
    getCropProgress,
    waterTile,
    fertilizeTile,
    isWatered,
    isFertilized,
    getTileData
} from '../core/tile';
import { growthSystem } from '../core/growthSystem';
import { areaService } from './AreaService';
import type { ToolId } from '../types';
import { CROP_DATA } from '../utils/constants';

/**
 * CropService - Crop-related operations service
 * 
 * Responsibilities:
 * - Handle crop planting, growing, and harvesting
 * - Manage crop enhancement (watering, fertilizing)
 * - Calculate crop yields and rewards
 * - Coordinate crop events and state updates
 */
export class CropService {
    constructor() {
        this.setupEventListeners();
    }

    /**
     * Check if a crop can be planted at a location
     */
    public canPlantCrop(tileX: number, tileY: number, cropType: ToolId): boolean {
        // Check if tile is accessible
        if (!areaService.isTileAccessible(tileX, tileY)) {
            return false;
        }

        // Check if tile has soil
        if (!hasSoil(tileX, tileY)) {
            return false;
        }

        // Check if tile already has a crop
        if (hasCrop(tileX, tileY)) {
            return false;
        }

        // Check if crop type is valid
        if (!(cropType in CROP_DATA)) {
            return false;
        }

        return true;
    }

    /**
     * Check if a tool ID is a crop type
     */
    private isCropType(toolId: ToolId): toolId is keyof typeof CROP_DATA {
        return toolId in CROP_DATA;
    }

    /**
     * Plant a crop at a location
     */
    public async plantCrop(tileX: number, tileY: number, cropType: ToolId): Promise<{
        success: boolean;
        message: string;
        cost?: number;
    }> {
        try {
            // Check if crop can be planted
            if (!this.canPlantCrop(tileX, tileY, cropType)) {
                return {
                    success: false,
                    message: 'Cannot plant crop at this location'
                };
            }

            // Check if crop type is valid
            if (!this.isCropType(cropType)) {
                return {
                    success: false,
                    message: 'Invalid crop type'
                };
            }

            const cropInfo = CROP_DATA[cropType];

            const cost = cropInfo.cost;
            const stateManager = getStateManager();

            // Check if player can afford the seed
            if (!stateManager.canAfford(cost)) {
                return {
                    success: false,
                    message: `Not enough coins! Need ${cost} coins to plant ${cropType}`,
                    cost
                };
            }

            // Spend coins for the seed
            const spentSuccessfully = stateManager.spendCoins(cost, `${cropType} seed`);
            if (!spentSuccessfully) {
                return {
                    success: false,
                    message: 'Failed to purchase seed',
                    cost
                };
            }

            // Plant the crop
            const planted = plantCrop(tileX, tileY, cropType, cropInfo.stages);

            if (planted) {
                // Update state manager with new tile map
                stateManager.setTilesMap(tileMap);

                // Emit crop planted event
                GameEvents.emitCropPlanted(tileX, tileY, cropType);

                console.log(`CropService: ${cropType} planted at (${tileX}, ${tileY}) for ${cost} coins`);

                return {
                    success: true,
                    message: `${cropType} planted for ${cost} coins!`,
                    cost
                };
            } else {
                // Refund coins if planting failed
                stateManager.earnCoins(cost, 'Seed purchase refund');

                return {
                    success: false,
                    message: 'Failed to plant crop',
                    cost
                };
            }

        } catch (error) {
            console.error('CropService: Error planting crop:', error);
            return {
                success: false,
                message: 'Error occurred while planting crop'
            };
        }
    }

    /**
     * Harvest a crop from a location
     */
    public async harvestCrop(tileX: number, tileY: number): Promise<{
        success: boolean;
        message: string;
        reward?: number;
        cropType?: ToolId;
    }> {
        try {
            // Check if tile has a crop
            if (!hasCrop(tileX, tileY)) {
                return {
                    success: false,
                    message: 'No crop to harvest at this location'
                };
            }

            // Check if crop is mature
            if (!isCropMature(tileX, tileY)) {
                return {
                    success: false,
                    message: 'Crop is not ready for harvest yet'
                };
            }

            const tileData = getTileData(tileX, tileY);
            if (!tileData?.crop) {
                return {
                    success: false,
                    message: 'No crop data found'
                };
            }

            const cropType = tileData.crop.cropType;

            if (!this.isCropType(cropType)) {
                return {
                    success: false,
                    message: 'Invalid crop data'
                };
            }

            const cropInfo = CROP_DATA[cropType];

            // Calculate reward (base reward + bonuses)
            let reward: number = cropInfo.reward;

            // Apply bonuses based on tile enhancements
            if (isWatered(tileX, tileY)) {
                reward = Math.round(reward * 1.2); // 20% bonus for watering
            }

            if (isFertilized(tileX, tileY)) {
                reward = Math.round(reward * 1.3); // 30% bonus for fertilizing
            }

            // Remove the crop
            const removed = removeCrop(tileX, tileY);
            if (!removed) {
                return {
                    success: false,
                    message: 'Failed to harvest crop'
                };
            }

            // Award coins
            const stateManager = getStateManager();
            stateManager.earnCoins(reward, `${cropType} harvest`);

            // Update state manager with new tile map
            stateManager.setTilesMap(tileMap);

            // Emit crop harvested event
            GameEvents.emitCropHarvested(tileX, tileY, cropType, reward);

            console.log(`CropService: ${cropType} harvested from (${tileX}, ${tileY}) for ${reward} coins`);

            return {
                success: true,
                message: `${cropType} harvested for ${reward} coins!`,
                reward,
                cropType
            };

        } catch (error) {
            console.error('CropService: Error harvesting crop:', error);
            return {
                success: false,
                message: 'Error occurred while harvesting crop'
            };
        }
    }

    /**
     * Water a tile to boost crop growth
     */
    public async waterTile(tileX: number, tileY: number): Promise<{
        success: boolean;
        message: string;
        cost?: number;
    }> {
        try {
            // Check if tile is accessible
            if (!areaService.isTileAccessible(tileX, tileY)) {
                return {
                    success: false,
                    message: 'Cannot access this tile'
                };
            }

            // Check if tile has soil
            if (!hasSoil(tileX, tileY)) {
                return {
                    success: false,
                    message: 'Can only water soil tiles'
                };
            }

            // Check if tile is already watered
            if (isWatered(tileX, tileY)) {
                return {
                    success: false,
                    message: 'Tile is already watered'
                };
            }

            const cost = 5; // TODO: Move to constants
            const stateManager = getStateManager();

            // Check if player can afford watering
            if (!stateManager.canAfford(cost)) {
                return {
                    success: false,
                    message: `Not enough coins! Need ${cost} coins to water`,
                    cost
                };
            }

            // Spend coins for watering
            const spentSuccessfully = stateManager.spendCoins(cost, 'watering');
            if (!spentSuccessfully) {
                return {
                    success: false,
                    message: 'Failed to pay for watering',
                    cost
                };
            }

            // Water the tile
            const watered = waterTile(tileX, tileY);

            if (watered) {
                // Update state manager with new tile map
                stateManager.setTilesMap(tileMap);

                // Emit crop watered event
                GameEvents.emitCropWatered(tileX, tileY);

                console.log(`CropService: Tile watered at (${tileX}, ${tileY}) for ${cost} coins`);

                return {
                    success: true,
                    message: `Tile watered for ${cost} coins!`,
                    cost
                };
            } else {
                // Refund coins if watering failed
                stateManager.earnCoins(cost, 'Watering refund');

                return {
                    success: false,
                    message: 'Failed to water tile',
                    cost
                };
            }

        } catch (error) {
            console.error('CropService: Error watering tile:', error);
            return {
                success: false,
                message: 'Error occurred while watering tile'
            };
        }
    }

    /**
     * Fertilize a tile to boost crop growth
     */
    public async fertilizeTile(tileX: number, tileY: number): Promise<{
        success: boolean;
        message: string;
        cost?: number;
    }> {
        try {
            // Check if tile is accessible
            if (!areaService.isTileAccessible(tileX, tileY)) {
                return {
                    success: false,
                    message: 'Cannot access this tile'
                };
            }

            // Check if tile has soil
            if (!hasSoil(tileX, tileY)) {
                return {
                    success: false,
                    message: 'Can only fertilize soil tiles'
                };
            }

            // Check if tile is already fertilized
            if (isFertilized(tileX, tileY)) {
                return {
                    success: false,
                    message: 'Tile is already fertilized'
                };
            }

            const cost = 15; // TODO: Move to constants
            const stateManager = getStateManager();

            // Check if player can afford fertilizing
            if (!stateManager.canAfford(cost)) {
                return {
                    success: false,
                    message: `Not enough coins! Need ${cost} coins to fertilize`,
                    cost
                };
            }

            // Spend coins for fertilizing
            const spentSuccessfully = stateManager.spendCoins(cost, 'fertilizing');
            if (!spentSuccessfully) {
                return {
                    success: false,
                    message: 'Failed to pay for fertilizing',
                    cost
                };
            }

            // Fertilize the tile
            const fertilized = fertilizeTile(tileX, tileY);

            if (fertilized) {
                // Update state manager with new tile map
                stateManager.setTilesMap(tileMap);

                // Emit crop fertilized event
                GameEvents.emitCropFertilized(tileX, tileY);

                console.log(`CropService: Tile fertilized at (${tileX}, ${tileY}) for ${cost} coins`);

                return {
                    success: true,
                    message: `Tile fertilized for ${cost} coins!`,
                    cost
                };
            } else {
                // Refund coins if fertilizing failed
                stateManager.earnCoins(cost, 'Fertilizing refund');

                return {
                    success: false,
                    message: 'Failed to fertilize tile',
                    cost
                };
            }

        } catch (error) {
            console.error('CropService: Error fertilizing tile:', error);
            return {
                success: false,
                message: 'Error occurred while fertilizing tile'
            };
        }
    }

    /**
     * Get crop information for a tile
     */
    public getCropInfo(tileX: number, tileY: number): {
        hasCrop: boolean;
        cropType?: ToolId;
        stage?: number;
        maxStages?: number;
        progress?: number;
        isMature?: boolean;
        isWatered?: boolean;
        isFertilized?: boolean;
        timeRemaining?: number;
        plantedAt?: number;
    } {
        const tileData = getTileData(tileX, tileY);

        if (!tileData?.crop) {
            return { hasCrop: false };
        }

        const crop = tileData.crop;
        const progress = getCropProgress(tileX, tileY);
        const mature = isCropMature(tileX, tileY);
        const watered = isWatered(tileX, tileY);
        const fertilized = isFertilized(tileX, tileY);

        // Calculate time remaining (approximate)
        let growTime = 60; // Default 60 seconds
        if (this.isCropType(crop.cropType)) {
            const cropInfo = CROP_DATA[crop.cropType];
            growTime = cropInfo.growTime;
        }

        const totalGrowTime = growTime * 1000; // Convert to milliseconds
        const timeElapsed = Date.now() - crop.plantedAt;
        const timeRemaining = Math.max(0, totalGrowTime - timeElapsed);

        return {
            hasCrop: true,
            cropType: crop.cropType,
            stage: crop.stage,
            maxStages: crop.maxStages,
            progress,
            isMature: mature,
            isWatered: watered,
            isFertilized: fertilized,
            timeRemaining,
            plantedAt: crop.plantedAt
        };
    }

    /**
     * Get all crops currently growing
     */
    public getAllGrowingCrops(): Array<{
        tileX: number;
        tileY: number;
        cropInfo: {
            hasCrop: boolean;
            cropType?: ToolId;
            stage?: number;
            maxStages?: number;
            progress?: number;
            isMature?: boolean;
            isWatered?: boolean;
            isFertilized?: boolean;
            timeRemaining?: number;
            plantedAt?: number;
        };
    }> {
        const growingCrops: Array<{
            tileX: number;
            tileY: number;
            cropInfo: {
                hasCrop: boolean;
                cropType?: ToolId;
                stage?: number;
                maxStages?: number;
                progress?: number;
                isMature?: boolean;
                isWatered?: boolean;
                isFertilized?: boolean;
                timeRemaining?: number;
                plantedAt?: number;
            };
        }> = [];

        tileMap.forEach((tileData, key) => {
            if (tileData.crop) {
                const [x, y] = key.split(',').map(Number);
                const cropInfo = this.getCropInfo(x, y);

                growingCrops.push({
                    tileX: x,
                    tileY: y,
                    cropInfo
                });
            }
        });

        return growingCrops;
    }

    /**
     * Get crop statistics
     */
    public getCropStats(): {
        totalCrops: number;
        matureCrops: number;
        growingCrops: number;
        wateredTiles: number;
        fertilizedTiles: number;
        cropsByType: Record<ToolId, number>;
    } {
        const stats = {
            totalCrops: 0,
            matureCrops: 0,
            growingCrops: 0,
            wateredTiles: 0,
            fertilizedTiles: 0,
            cropsByType: {} as Record<ToolId, number>
        };

        const allCrops = this.getAllGrowingCrops();
        stats.totalCrops = allCrops.length;

        allCrops.forEach(({ cropInfo }) => {
            if (cropInfo.isMature) {
                stats.matureCrops++;
            } else {
                stats.growingCrops++;
            }

            if (cropInfo.isWatered) {
                stats.wateredTiles++;
            }

            if (cropInfo.isFertilized) {
                stats.fertilizedTiles++;
            }

            if (cropInfo.cropType && this.isCropType(cropInfo.cropType)) {
                stats.cropsByType[cropInfo.cropType] = (stats.cropsByType[cropInfo.cropType] || 0) + 1;
            }
        });

        return stats;
    }

    /**
     * Update all crops (called by growth system)
     */
    public updateAllCrops(): void {
        growthSystem.updateAllCrops();
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners(): void {
        // Listen for tool usage on tiles
        eventBus.on('tool:used', async (event) => {
            if (!event.success) return;

            const { toolId, tileX, tileY } = event;

            // Handle crop-related tool usage
            switch (toolId) {
                case 'carrot':
                case 'potato':
                case 'wheat':
                    await this.plantCrop(tileX, tileY, toolId);
                    break;

                case 'harvest':
                    await this.harvestCrop(tileX, tileY);
                    break;

                case 'water':
                    await this.waterTile(tileX, tileY);
                    break;

                case 'fertilize':
                    await this.fertilizeTile(tileX, tileY);
                    break;
            }
        });

        // Listen for growth system updates
        eventBus.on('crop:grown', () => {
            // Update state manager when crops grow
            const stateManager = getStateManager();
            stateManager.setTilesMap(tileMap);
        });
    }

    /**
     * Cleanup resources
     */
    public destroy(): void {
        console.log('CropService destroyed');
    }
}

// Export singleton instance
export const cropService = new CropService();
