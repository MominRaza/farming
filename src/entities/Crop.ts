import type { ToolId } from '../types';
import { CROP_DATA } from '../utils/constants';

/**
 * Represents different growth stages of a crop
 */
export const CropStage = {
    SEED: 0,
    SPROUT: 1,
    GROWING: 2,
    FLOWERING: 3,
    MATURE: 4
} as const;

export type CropStage = typeof CropStage[keyof typeof CropStage];

/**
 * Crop growth information
 */
export interface CropGrowthInfo {
    stage: CropStage;
    progress: number;
    timeElapsed: number;
    timeToNextStage: number;
    timeToMaturity: number;
    isMature: boolean;
    growthRate: number;
}

/**
 * Crop harvest information
 */
export interface CropHarvestInfo {
    baseReward: number;
    enhancementMultiplier: number;
    finalReward: number;
    harvestableAmount: number;
    wasMature: boolean;
}

/**
 * Represents a crop entity with its properties and behaviors
 */
export class Crop {
    public readonly cropType: ToolId;
    public readonly name: string;
    public readonly icon: string;
    public readonly cost: number;
    public readonly baseReward: number;
    public readonly growTime: number; // in seconds
    public readonly maxStages: number;

    private _plantedAt: number;
    private _currentStage: number = 0;
    private _isHarvested: boolean = false;

    constructor(cropType: ToolId, plantedAt: number = Date.now()) {
        this.cropType = cropType;
        this._plantedAt = plantedAt;

        // Get crop data from constants
        const cropData = CROP_DATA[cropType as keyof typeof CROP_DATA];
        if (!cropData) {
            throw new Error(`Unknown crop type: ${cropType}`);
        }

        this.cost = cropData.cost;
        this.baseReward = cropData.reward;
        this.growTime = cropData.growTime;
        this.maxStages = cropData.stages;

        // Set display properties based on crop type
        const cropInfo = this.getCropDisplayInfo(cropType);
        this.name = cropInfo.name;
        this.icon = cropInfo.icon;
    }

    // === Growth Management ===

    /**
     * Update crop growth based on time elapsed and growth modifiers
     */
    updateGrowth(waterBonus: number = 0, fertilizerBonus: number = 0): boolean {
        if (this._isHarvested) {
            return false;
        }

        const now = Date.now();
        const timeElapsed = now - this._plantedAt;

        // Calculate growth modifiers
        const growthMultiplier = 1.0 + waterBonus + fertilizerBonus;

        // Apply growth multiplier to reduce effective grow time
        const effectiveGrowTime = this.growTime / growthMultiplier;
        const timePerStage = (effectiveGrowTime * 1000) / (this.maxStages - 1); // Convert to milliseconds and divide by stages
        const expectedStage = Math.floor(timeElapsed / timePerStage);

        // Update stage, but don't exceed maxStages - 1 (0-indexed)
        const newStage = Math.min(expectedStage, this.maxStages - 1);

        if (newStage !== this._currentStage) {
            this._currentStage = newStage;
            return true; // Growth occurred
        }

        return false; // No growth
    }

    /**
     * Get current growth stage
     */
    getCurrentStage(): number {
        return this._currentStage;
    }

    /**
     * Get growth stage as enum
     */
    getStageEnum(): CropStage {
        // Map numeric stage to enum (works for standard 5-stage crops)
        return Math.min(this._currentStage, CropStage.MATURE) as CropStage;
    }

    /**
     * Get growth progress (0-1)
     */
    getProgress(): number {
        if (this.maxStages <= 1) {
            return this._currentStage >= this.maxStages - 1 ? 1 : 0;
        }
        return this._currentStage / (this.maxStages - 1);
    }

    /**
     * Check if crop is mature (ready for harvest)
     */
    isMature(): boolean {
        return this._currentStage >= this.maxStages - 1;
    }

    /**
     * Check if crop has been harvested
     */
    isHarvested(): boolean {
        return this._isHarvested;
    }

    /**
     * Get detailed growth information
     */
    getGrowthInfo(waterBonus: number = 0, fertilizerBonus: number = 0): CropGrowthInfo {
        const now = Date.now();
        const timeElapsed = now - this._plantedAt;
        const growthMultiplier = 1.0 + waterBonus + fertilizerBonus;
        const effectiveGrowTime = this.growTime / growthMultiplier;
        const timePerStage = (effectiveGrowTime * 1000) / (this.maxStages - 1);

        const timeToNextStage = this.isMature()
            ? 0
            : Math.max(0, timePerStage * (this._currentStage + 1) - timeElapsed);

        const timeToMaturity = this.isMature()
            ? 0
            : Math.max(0, timePerStage * (this.maxStages - 1) - timeElapsed);

        return {
            stage: this.getStageEnum(),
            progress: this.getProgress(),
            timeElapsed: Math.floor(timeElapsed / 1000),
            timeToNextStage: Math.floor(timeToNextStage / 1000),
            timeToMaturity: Math.floor(timeToMaturity / 1000),
            isMature: this.isMature(),
            growthRate: growthMultiplier
        };
    }

    // === Harvest Management ===

    /**
     * Harvest this crop
     */
    harvest(enhancementMultiplier: number = 1.0): CropHarvestInfo {
        if (this._isHarvested) {
            throw new Error('Crop has already been harvested');
        }

        const wasMature = this.isMature();
        const harvestableAmount = wasMature ? 1.0 : 0.5; // Full amount if mature, half if premature

        const baseReward = this.baseReward * harvestableAmount;
        const finalReward = Math.floor(baseReward * enhancementMultiplier);

        this._isHarvested = true;

        return {
            baseReward: this.baseReward,
            enhancementMultiplier,
            finalReward,
            harvestableAmount,
            wasMature
        };
    }

    /**
     * Calculate potential harvest reward without actually harvesting
     */
    calculateHarvestReward(enhancementMultiplier: number = 1.0): number {
        const harvestableAmount = this.isMature() ? 1.0 : 0.5;
        const baseReward = this.baseReward * harvestableAmount;
        return Math.floor(baseReward * enhancementMultiplier);
    }

    // === Information Methods ===

    /**
     * Get time since planting (in seconds)
     */
    getTimeElapsed(): number {
        return Math.floor((Date.now() - this._plantedAt) / 1000);
    }

    /**
     * Get planting timestamp
     */
    getPlantedAt(): number {
        return this._plantedAt;
    }

    /**
     * Get crop efficiency (reward per second)
     */
    getEfficiency(): number {
        return this.baseReward / this.growTime;
    }

    /**
     * Get crop profitability (reward - cost)
     */
    getProfitability(): number {
        return this.baseReward - this.cost;
    }

    /**
     * Get return on investment percentage
     */
    getROI(): number {
        return this.cost > 0 ? (this.getProfitability() / this.cost) * 100 : 0;
    }

    /**
     * Get crop display information
     */
    private getCropDisplayInfo(cropType: ToolId): { name: string; icon: string } {
        const cropDisplayMap: Record<string, { name: string; icon: string }> = {
            'wheat': { name: 'Wheat', icon: '🌾' },
            'spinach': { name: 'Spinach', icon: '🥬' },
            'carrot': { name: 'Carrot', icon: '🥕' },
            'potato': { name: 'Potato', icon: '🥔' },
            'tomato': { name: 'Tomato', icon: '🍅' },
            'corn': { name: 'Corn', icon: '🌽' },
            'onion': { name: 'Onion', icon: '🧅' },
            'pea': { name: 'Pea', icon: '🫛' },
            'eggplant': { name: 'Eggplant', icon: '🍆' },
            'pepper': { name: 'Pepper', icon: '🌶️' }
        };

        return cropDisplayMap[cropType] || { name: cropType, icon: '🌱' };
    }

    /**
     * Get stage display information
     */
    getStageDisplay(): { name: string; icon: string; description: string } {
        const stageDisplayMap: Record<CropStage, { name: string; icon: string; description: string }> = {
            [CropStage.SEED]: {
                name: 'Seed',
                icon: '🌰',
                description: 'Crop has been planted and is beginning to germinate'
            },
            [CropStage.SPROUT]: {
                name: 'Sprout',
                icon: '🌱',
                description: 'Small sprout has emerged from the soil'
            },
            [CropStage.GROWING]: {
                name: 'Growing',
                icon: '🌿',
                description: 'Crop is actively growing and developing'
            },
            [CropStage.FLOWERING]: {
                name: 'Flowering',
                icon: '🌸',
                description: 'Crop is flowering and almost ready for harvest'
            },
            [CropStage.MATURE]: {
                name: 'Mature',
                icon: this.icon,
                description: 'Crop is fully mature and ready for harvest'
            }
        };

        return stageDisplayMap[this.getStageEnum()];
    }

    /**
     * Get comprehensive crop information
     */
    getInfo(waterBonus: number = 0, fertilizerBonus: number = 0): {
        crop: {
            type: ToolId;
            name: string;
            icon: string;
            cost: number;
            baseReward: number;
            growTime: number;
            efficiency: number;
            profitability: number;
            roi: number;
        };
        growth: CropGrowthInfo;
        stage: {
            name: string;
            icon: string;
            description: string;
        };
        harvest: {
            potentialReward: number;
            isHarvestable: boolean;
            isHarvested: boolean;
        };
    } {
        const growthInfo = this.getGrowthInfo(waterBonus, fertilizerBonus);
        const stageDisplay = this.getStageDisplay();

        return {
            crop: {
                type: this.cropType,
                name: this.name,
                icon: this.icon,
                cost: this.cost,
                baseReward: this.baseReward,
                growTime: this.growTime,
                efficiency: this.getEfficiency(),
                profitability: this.getProfitability(),
                roi: this.getROI()
            },
            growth: growthInfo,
            stage: stageDisplay,
            harvest: {
                potentialReward: this.calculateHarvestReward(),
                isHarvestable: this.isMature(),
                isHarvested: this.isHarvested()
            }
        };
    }

    // === Serialization ===

    /**
     * Serialize crop data
     */
    toJSON(): {
        cropType: ToolId;
        plantedAt: number;
        currentStage: number;
        isHarvested: boolean;
    } {
        return {
            cropType: this.cropType,
            plantedAt: this._plantedAt,
            currentStage: this._currentStage,
            isHarvested: this._isHarvested
        };
    }

    /**
     * Create crop from serialized data
     */
    static fromJSON(data: {
        cropType: ToolId;
        plantedAt: number;
        currentStage: number;
        isHarvested: boolean;
    }): Crop {
        const crop = new Crop(data.cropType, data.plantedAt);
        crop._currentStage = data.currentStage;
        crop._isHarvested = data.isHarvested;
        return crop;
    }

    /**
     * Create a copy of this crop
     */
    clone(): Crop {
        return Crop.fromJSON(this.toJSON());
    }

    // === Static Methods ===

    /**
     * Get all available crop types
     */
    static getAvailableCrops(): ToolId[] {
        return Object.keys(CROP_DATA) as ToolId[];
    }

    /**
     * Get crop data for a specific crop type
     */
    static getCropData(cropType: ToolId): {
        cost: number;
        reward: number;
        growTime: number;
        stages: number;
        efficiency: number;
        profitability: number;
        roi: number;
    } | null {
        const cropData = CROP_DATA[cropType as keyof typeof CROP_DATA];
        if (!cropData) {
            return null;
        }

        const efficiency = cropData.reward / cropData.growTime;
        const profitability = cropData.reward - cropData.cost;
        const roi = cropData.cost > 0 ? (profitability / cropData.cost) * 100 : 0;

        return {
            cost: cropData.cost,
            reward: cropData.reward,
            growTime: cropData.growTime,
            stages: cropData.stages,
            efficiency,
            profitability,
            roi
        };
    }

    /**
     * Compare crops by efficiency
     */
    static compareByEfficiency(cropA: ToolId, cropB: ToolId): number {
        const dataA = Crop.getCropData(cropA);
        const dataB = Crop.getCropData(cropB);

        if (!dataA || !dataB) return 0;

        return dataB.efficiency - dataA.efficiency; // Higher efficiency first
    }

    /**
     * Compare crops by profitability
     */
    static compareByProfitability(cropA: ToolId, cropB: ToolId): number {
        const dataA = Crop.getCropData(cropA);
        const dataB = Crop.getCropData(cropB);

        if (!dataA || !dataB) return 0;

        return dataB.profitability - dataA.profitability; // Higher profitability first
    }

    /**
     * Compare crops by ROI
     */
    static compareByROI(cropA: ToolId, cropB: ToolId): number {
        const dataA = Crop.getCropData(cropA);
        const dataB = Crop.getCropData(cropB);

        if (!dataA || !dataB) return 0;

        return dataB.roi - dataA.roi; // Higher ROI first
    }

    /**
     * Get best crops by specific criteria
     */
    static getBestCrops(criteria: 'efficiency' | 'profitability' | 'roi', limit: number = 3): ToolId[] {
        const crops = Crop.getAvailableCrops();

        let compareFn: (a: ToolId, b: ToolId) => number;
        switch (criteria) {
            case 'efficiency':
                compareFn = Crop.compareByEfficiency;
                break;
            case 'profitability':
                compareFn = Crop.compareByProfitability;
                break;
            case 'roi':
                compareFn = Crop.compareByROI;
                break;
        }

        return crops.sort(compareFn).slice(0, limit);
    }
}
