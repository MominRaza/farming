import type { TileType, ToolId } from '../types';
import { ACTION_DATA } from '../utils/constants';

/**
 * Represents a planted crop on a tile
 */
export class PlantedCrop {
    public readonly cropType: ToolId;
    public readonly plantedAt: number;
    public stage: number;
    public readonly maxStages: number;

    constructor(cropType: ToolId, maxStages: number, plantedAt: number = Date.now()) {
        this.cropType = cropType;
        this.maxStages = maxStages;
        this.plantedAt = plantedAt;
        this.stage = 0;
    }

    /**
     * Get crop growth progress (0-1)
     */
    getProgress(): number {
        return this.stage / (this.maxStages - 1);
    }

    /**
     * Check if crop is mature (ready for harvest)
     */
    isMature(): boolean {
        return this.stage >= this.maxStages - 1;
    }

    /**
     * Update crop growth based on time elapsed and growth modifiers
     */
    updateGrowth(growTime: number, waterBonus: number = 0, fertilizerBonus: number = 0): boolean {
        const now = Date.now();
        const timeElapsed = now - this.plantedAt;

        // Calculate growth modifiers
        const growthMultiplier = 1.0 + waterBonus + fertilizerBonus;

        // Apply growth multiplier to reduce effective grow time
        const effectiveGrowTime = growTime / growthMultiplier;
        const timePerStage = effectiveGrowTime * 1000; // Convert seconds to milliseconds
        const expectedStage = Math.floor(timeElapsed / timePerStage);

        // Update stage, but don't exceed maxStages - 1 (0-indexed)
        const newStage = Math.min(expectedStage, this.maxStages - 1);

        if (newStage !== this.stage) {
            this.stage = newStage;
            return true; // Growth occurred
        }

        return false; // No growth
    }

    /**
     * Get time elapsed since planting (in seconds)
     */
    getTimeElapsed(): number {
        return Math.floor((Date.now() - this.plantedAt) / 1000);
    }

    /**
     * Serialize crop data
     */
    toJSON(): {
        cropType: ToolId;
        plantedAt: number;
        stage: number;
        maxStages: number;
    } {
        return {
            cropType: this.cropType,
            plantedAt: this.plantedAt,
            stage: this.stage,
            maxStages: this.maxStages
        };
    }

    /**
     * Create crop from serialized data
     */
    static fromJSON(data: {
        cropType: ToolId;
        plantedAt: number;
        stage: number;
        maxStages: number;
    }): PlantedCrop {
        const crop = new PlantedCrop(data.cropType, data.maxStages, data.plantedAt);
        crop.stage = data.stage;
        return crop;
    }
}

/**
 * Represents enhancement effects on a tile
 */
export class TileEnhancements {
    private _isWatered: boolean = false;
    private _isFertilized: boolean = false;
    private _wateredAt?: number;
    private _fertilizedAt?: number;
    private _fertilizerUsageCount: number = 0;
    private _fertilizerMaxUsage: number = ACTION_DATA.fertilize.maxUsage;

    // === Water Enhancement ===

    /**
     * Apply water enhancement
     */
    applyWater(): void {
        this._isWatered = true;
        this._wateredAt = Date.now();
    }

    /**
     * Check if tile is currently watered (not expired)
     */
    isWatered(): boolean {
        if (!this._isWatered || !this._wateredAt) {
            return false;
        }

        // Check if water effect has expired
        const now = Date.now();
        const timeElapsed = now - this._wateredAt;

        if (timeElapsed > ACTION_DATA.water.duration) {
            // Water effect has expired, remove it
            this._isWatered = false;
            this._wateredAt = undefined;
            return false;
        }

        return true;
    }

    /**
     * Get water enhancement bonus
     */
    getWaterBonus(): number {
        return this.isWatered() ? ACTION_DATA.water.speedBonus : 0;
    }

    /**
     * Get time remaining for water effect (in seconds)
     */
    getWaterTimeRemaining(): number {
        if (!this.isWatered() || !this._wateredAt) {
            return 0;
        }

        const timeElapsed = Date.now() - this._wateredAt;
        const timeRemaining = ACTION_DATA.water.duration - timeElapsed;
        return Math.max(0, Math.floor(timeRemaining / 1000));
    }

    // === Fertilizer Enhancement ===

    /**
     * Apply fertilizer enhancement
     */
    applyFertilizer(): void {
        this._isFertilized = true;
        this._fertilizedAt = Date.now();
        this._fertilizerUsageCount = 0; // Reset usage count
        this._fertilizerMaxUsage = ACTION_DATA.fertilize.maxUsage; // Set max usage
    }

    /**
     * Check if tile is currently fertilized (not used up)
     */
    isFertilized(): boolean {
        if (!this._isFertilized) {
            return false;
        }

        // Check if fertilizer usage has been exceeded
        if (this._fertilizerUsageCount >= this._fertilizerMaxUsage) {
            // Fertilizer has been used up, remove it
            this._isFertilized = false;
            this._fertilizedAt = undefined;
            this._fertilizerUsageCount = 0;
            return false;
        }

        return true;
    }

    /**
     * Get fertilizer enhancement bonus
     */
    getFertilizerBonus(): number {
        return this.isFertilized() ? ACTION_DATA.fertilize.speedBonus : 0;
    }

    /**
     * Use fertilizer (increment usage count)
     */
    useFertilizer(): void {
        if (this._isFertilized) {
            this._fertilizerUsageCount++;
        }
    }

    /**
     * Get fertilizer usage information
     */
    getFertilizerUsage(): { used: number; max: number; remaining: number } {
        return {
            used: this._fertilizerUsageCount,
            max: this._fertilizerMaxUsage,
            remaining: Math.max(0, this._fertilizerMaxUsage - this._fertilizerUsageCount)
        };
    }

    // === Combined Enhancement Methods ===

    /**
     * Get total growth bonus from all enhancements
     */
    getTotalGrowthBonus(): number {
        return this.getWaterBonus() + this.getFertilizerBonus();
    }

    /**
     * Get total yield bonus for harvest
     */
    getTotalYieldBonus(): number {
        let bonus = 1.0;

        // Watering bonus (10% extra yield)
        if (this.isWatered()) {
            bonus += 0.10;
        }

        // Fertilizer bonus (20% extra yield)
        if (this.isFertilized()) {
            bonus += 0.20;
        }

        return bonus;
    }

    /**
     * Check if any enhancements are active
     */
    hasAnyEnhancements(): boolean {
        return this.isWatered() || this.isFertilized();
    }

    /**
     * Get enhancement status summary
     */
    getEnhancementStatus(): {
        isWatered: boolean;
        isFertilized: boolean;
        waterTimeRemaining: number;
        fertilizerUsage: { used: number; max: number; remaining: number };
        totalGrowthBonus: number;
        totalYieldBonus: number;
    } {
        return {
            isWatered: this.isWatered(),
            isFertilized: this.isFertilized(),
            waterTimeRemaining: this.getWaterTimeRemaining(),
            fertilizerUsage: this.getFertilizerUsage(),
            totalGrowthBonus: this.getTotalGrowthBonus(),
            totalYieldBonus: this.getTotalYieldBonus()
        };
    }

    /**
     * Serialize enhancement data
     */
    toJSON(): {
        isWatered: boolean;
        isFertilized: boolean;
        wateredAt?: number;
        fertilizedAt?: number;
        fertilizerUsageCount: number;
        fertilizerMaxUsage: number;
    } {
        return {
            isWatered: this._isWatered,
            isFertilized: this._isFertilized,
            wateredAt: this._wateredAt,
            fertilizedAt: this._fertilizedAt,
            fertilizerUsageCount: this._fertilizerUsageCount,
            fertilizerMaxUsage: this._fertilizerMaxUsage
        };
    }

    /**
     * Create enhancements from serialized data
     */
    static fromJSON(data: {
        isWatered?: boolean;
        isFertilized?: boolean;
        wateredAt?: number;
        fertilizedAt?: number;
        fertilizerUsageCount?: number;
        fertilizerMaxUsage?: number;
    }): TileEnhancements {
        const enhancements = new TileEnhancements();
        enhancements._isWatered = data.isWatered || false;
        enhancements._isFertilized = data.isFertilized || false;
        enhancements._wateredAt = data.wateredAt;
        enhancements._fertilizedAt = data.fertilizedAt;
        enhancements._fertilizerUsageCount = data.fertilizerUsageCount || 0;
        enhancements._fertilizerMaxUsage = data.fertilizerMaxUsage || ACTION_DATA.fertilize.maxUsage;
        return enhancements;
    }
}

/**
 * Represents a game tile with its type, crop, and enhancements
 */
export class Tile {
    public readonly x: number;
    public readonly y: number;
    private _type: TileType;
    private _crop?: PlantedCrop;
    private _enhancements: TileEnhancements;

    constructor(x: number, y: number, type: TileType) {
        this.x = x;
        this.y = y;
        this._type = type;
        this._enhancements = new TileEnhancements();
    }

    // === Basic Properties ===

    /**
     * Get tile type
     */
    getType(): TileType {
        return this._type;
    }

    /**
     * Set tile type
     */
    setType(type: TileType): void {
        this._type = type;
        // Remove crop if changing to road (crops can't grow on roads)
        if (type === 'road' && this._crop) {
            this._crop = undefined;
        }
    }

    /**
     * Check if tile has soil
     */
    hasSoil(): boolean {
        return this._type === 'soil';
    }

    /**
     * Check if tile is a road
     */
    isRoad(): boolean {
        return this._type === 'road';
    }

    // === Crop Management ===

    /**
     * Plant a crop on this tile
     */
    plantCrop(cropType: ToolId, maxStages: number): boolean {
        // Check if tile has soil and no existing crop
        if (!this.hasSoil() || this._crop) {
            return false;
        }

        this._crop = new PlantedCrop(cropType, maxStages);

        // If tile is fertilized, use fertilizer
        if (this._enhancements.isFertilized()) {
            this._enhancements.useFertilizer();
        }

        return true;
    }

    /**
     * Remove crop from tile
     */
    removeCrop(): PlantedCrop | null {
        const crop = this._crop;
        this._crop = undefined;
        return crop || null;
    }

    /**
     * Get planted crop
     */
    getCrop(): PlantedCrop | null {
        return this._crop || null;
    }

    /**
     * Check if tile has a crop
     */
    hasCrop(): boolean {
        return this._crop !== undefined;
    }

    /**
     * Check if crop is mature
     */
    isCropMature(): boolean {
        return this._crop?.isMature() || false;
    }

    /**
     * Update crop growth
     */
    updateCropGrowth(growTime: number): boolean {
        if (!this._crop) {
            return false;
        }

        return this._crop.updateGrowth(
            growTime,
            this._enhancements.getWaterBonus(),
            this._enhancements.getFertilizerBonus()
        );
    }

    // === Enhancement Management ===

    /**
     * Water this tile
     */
    water(): boolean {
        if (!this.hasSoil()) {
            return false;
        }

        this._enhancements.applyWater();
        return true;
    }

    /**
     * Fertilize this tile
     */
    fertilize(): boolean {
        if (!this.hasSoil()) {
            return false;
        }

        this._enhancements.applyFertilizer();
        return true;
    }

    /**
     * Check if tile is watered
     */
    isWatered(): boolean {
        return this._enhancements.isWatered();
    }

    /**
     * Check if tile is fertilized
     */
    isFertilized(): boolean {
        return this._enhancements.isFertilized();
    }

    /**
     * Get enhancements object
     */
    getEnhancements(): TileEnhancements {
        return this._enhancements;
    }

    // === Information and Statistics ===

    /**
     * Get complete tile information
     */
    getInfo(): {
        x: number;
        y: number;
        type: TileType;
        hasCrop: boolean;
        crop?: {
            type: ToolId;
            stage: number;
            maxStages: number;
            progress: number;
            isMature: boolean;
            timeElapsed: number;
        };
        enhancements: {
            isWatered: boolean;
            isFertilized: boolean;
            waterTimeRemaining: number;
            fertilizerUsage: { used: number; max: number; remaining: number };
            totalGrowthBonus: number;
            totalYieldBonus: number;
        };
    } {
        const info = {
            x: this.x,
            y: this.y,
            type: this._type,
            hasCrop: this.hasCrop(),
            enhancements: this._enhancements.getEnhancementStatus()
        };

        if (this._crop) {
            return {
                ...info,
                crop: {
                    type: this._crop.cropType,
                    stage: this._crop.stage,
                    maxStages: this._crop.maxStages,
                    progress: this._crop.getProgress(),
                    isMature: this._crop.isMature(),
                    timeElapsed: this._crop.getTimeElapsed()
                }
            };
        }

        return info;
    }

    /**
     * Get tile coordinates as string key
     */
    getKey(): string {
        return `${this.x},${this.y}`;
    }

    /**
     * Calculate harvest reward for this tile's crop
     */
    calculateHarvestReward(baseReward: number): number {
        if (!this._crop) {
            return 0;
        }

        const reward = this._crop.isMature() ? baseReward : Math.floor(baseReward * 0.5);
        const enhancementBonus = this._enhancements.getTotalYieldBonus();
        return Math.floor(reward * enhancementBonus);
    }

    // === Serialization ===

    /**
     * Serialize tile data
     */
    toJSON(): {
        x: number;
        y: number;
        type: TileType;
        crop?: {
            cropType: ToolId;
            plantedAt: number;
            stage: number;
            maxStages: number;
        };
        enhancements: {
            isWatered: boolean;
            isFertilized: boolean;
            wateredAt?: number;
            fertilizedAt?: number;
            fertilizerUsageCount: number;
            fertilizerMaxUsage: number;
        };
    } {
        return {
            x: this.x,
            y: this.y,
            type: this._type,
            crop: this._crop?.toJSON(),
            enhancements: this._enhancements.toJSON()
        };
    }

    /**
     * Create tile from serialized data
     */
    static fromJSON(data: {
        x: number;
        y: number;
        type: TileType;
        crop?: {
            cropType: ToolId;
            plantedAt: number;
            stage: number;
            maxStages: number;
        };
        enhancements?: {
            isWatered?: boolean;
            isFertilized?: boolean;
            wateredAt?: number;
            fertilizedAt?: number;
            fertilizerUsageCount?: number;
            fertilizerMaxUsage?: number;
        };
    }): Tile {
        const tile = new Tile(data.x, data.y, data.type);

        if (data.crop) {
            tile._crop = PlantedCrop.fromJSON(data.crop);
        }

        if (data.enhancements) {
            tile._enhancements = TileEnhancements.fromJSON(data.enhancements);
        }

        return tile;
    }

    /**
     * Create a copy of this tile
     */
    clone(): Tile {
        return Tile.fromJSON(this.toJSON());
    }
}
