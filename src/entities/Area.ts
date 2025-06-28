import { AREA_SIZE, AREA_BASE_COST, AREA_DISTANCE_MULTIPLIER } from '../utils/constants';

/**
 * Area status enumeration
 */
export const AreaStatus = {
    LOCKED: 'locked',
    UNLOCKED: 'unlocked',
    PURCHASABLE: 'purchasable',
    INACCESSIBLE: 'inaccessible'
} as const;

export type AreaStatus = typeof AreaStatus[keyof typeof AreaStatus];

/**
 * Area unlock information
 */
export interface AreaUnlockInfo {
    isUnlocked: boolean;
    unlockedAt?: number;
    costPaid?: number;
    isPurchasable: boolean;
    purchaseCost: number;
    distanceFromOrigin: number;
}

/**
 * Area boundaries
 */
export interface AreaBounds {
    minTileX: number;
    maxTileX: number;
    minTileY: number;
    maxTileY: number;
    centerTileX: number;
    centerTileY: number;
}

/**
 * Represents a game area entity
 */
export class Area {
    public readonly x: number;
    public readonly y: number;
    private _unlocked: boolean = false;
    private _unlockedAt?: number;
    private _costPaid?: number;

    constructor(x: number, y: number, unlocked: boolean = false) {
        this.x = x;
        this.y = y;
        this._unlocked = unlocked;

        if (unlocked) {
            this._unlockedAt = Date.now();
            this._costPaid = this.isOrigin() ? 0 : this.calculatePurchaseCost();
        }
    }

    // === Basic Properties ===

    /**
     * Check if this area is unlocked
     */
    isUnlocked(): boolean {
        return this._unlocked;
    }

    /**
     * Check if this is the origin area (0,0)
     */
    isOrigin(): boolean {
        return this.x === 0 && this.y === 0;
    }

    /**
     * Get when this area was unlocked
     */
    getUnlockedAt(): number | undefined {
        return this._unlockedAt;
    }

    /**
     * Get cost paid to unlock this area
     */
    getCostPaid(): number | undefined {
        return this._costPaid;
    }

    /**
     * Get area coordinates as string key
     */
    getKey(): string {
        return `${this.x},${this.y}`;
    }

    // === Cost and Distance Calculations ===

    /**
     * Calculate Manhattan distance from origin (0, 0)
     */
    getDistanceFromOrigin(): number {
        return Math.abs(this.x) + Math.abs(this.y);
    }

    /**
     * Calculate purchase cost for this area
     */
    calculatePurchaseCost(): number {
        const distance = this.getDistanceFromOrigin();
        return AREA_BASE_COST + (distance * AREA_DISTANCE_MULTIPLIER);
    }

    /**
     * Calculate distance to another area
     */
    getDistanceToArea(otherArea: Area): number {
        return Math.abs(this.x - otherArea.x) + Math.abs(this.y - otherArea.y);
    }

    // === Area Bounds and Tile Management ===

    /**
     * Get area boundaries (tile coordinates)
     */
    getBounds(): AreaBounds {
        const minTileX = this.x * AREA_SIZE;
        const maxTileX = (this.x + 1) * AREA_SIZE - 1;
        const minTileY = this.y * AREA_SIZE;
        const maxTileY = (this.y + 1) * AREA_SIZE - 1;
        const centerTileX = Math.floor((minTileX + maxTileX) / 2);
        const centerTileY = Math.floor((minTileY + maxTileY) / 2);

        return {
            minTileX,
            maxTileX,
            minTileY,
            maxTileY,
            centerTileX,
            centerTileY
        };
    }

    /**
     * Check if a tile coordinate is within this area
     */
    containsTile(tileX: number, tileY: number): boolean {
        const bounds = this.getBounds();
        return tileX >= bounds.minTileX &&
            tileX <= bounds.maxTileX &&
            tileY >= bounds.minTileY &&
            tileY <= bounds.maxTileY;
    }

    /**
     * Get tile coordinates within this area
     */
    getTileCoordinates(): Array<{ x: number; y: number }> {
        const bounds = this.getBounds();
        const coordinates: Array<{ x: number; y: number }> = [];

        for (let y = bounds.minTileY; y <= bounds.maxTileY; y++) {
            for (let x = bounds.minTileX; x <= bounds.maxTileX; x++) {
                coordinates.push({ x, y });
            }
        }

        return coordinates;
    }

    /**
     * Get local coordinates within area (0 to AREA_SIZE-1)
     */
    getLocalCoordinates(tileX: number, tileY: number): { localX: number; localY: number } | null {
        if (!this.containsTile(tileX, tileY)) {
            return null;
        }

        const bounds = this.getBounds();
        return {
            localX: tileX - bounds.minTileX,
            localY: tileY - bounds.minTileY
        };
    }

    // === Adjacent Areas ===

    /**
     * Get coordinates of adjacent areas
     */
    getAdjacentAreaCoordinates(): Array<{ x: number; y: number }> {
        return [
            { x: this.x, y: this.y - 1 },     // Top
            { x: this.x - 1, y: this.y },     // Left
            { x: this.x + 1, y: this.y },     // Right
            { x: this.x, y: this.y + 1 }      // Bottom
        ];
    }

    /**
     * Get diagonal area coordinates
     */
    getDiagonalAreaCoordinates(): Array<{ x: number; y: number }> {
        return [
            { x: this.x - 1, y: this.y - 1 }, // Top-left
            { x: this.x + 1, y: this.y - 1 }, // Top-right
            { x: this.x - 1, y: this.y + 1 }, // Bottom-left
            { x: this.x + 1, y: this.y + 1 }  // Bottom-right
        ];
    }

    /**
     * Get all surrounding area coordinates (adjacent + diagonal)
     */
    getSurroundingAreaCoordinates(): Array<{ x: number; y: number }> {
        return [
            ...this.getAdjacentAreaCoordinates(),
            ...this.getDiagonalAreaCoordinates()
        ];
    }

    // === Area Status and Validation ===

    /**
     * Check if this area can be purchased (validation logic)
     */
    canBePurchased(unlockedAreas: Set<string>): boolean {
        // Already unlocked areas can't be purchased
        if (this._unlocked) {
            return false;
        }

        // Check if at least one adjacent area is unlocked
        const adjacentCoords = this.getAdjacentAreaCoordinates();
        return adjacentCoords.some(coord =>
            unlockedAreas.has(`${coord.x},${coord.y}`)
        );
    }

    /**
     * Get area status
     */
    getStatus(unlockedAreas: Set<string>): AreaStatus {
        if (this._unlocked) {
            return AreaStatus.UNLOCKED;
        }

        if (this.canBePurchased(unlockedAreas)) {
            return AreaStatus.PURCHASABLE;
        }

        // Check if any adjacent or diagonal area is unlocked
        const surroundingCoords = this.getSurroundingAreaCoordinates();
        const hasNearbyUnlocked = surroundingCoords.some(coord =>
            unlockedAreas.has(`${coord.x},${coord.y}`)
        );

        return hasNearbyUnlocked ? AreaStatus.LOCKED : AreaStatus.INACCESSIBLE;
    }

    /**
     * Get unlock information
     */
    getUnlockInfo(unlockedAreas: Set<string>): AreaUnlockInfo {
        return {
            isUnlocked: this._unlocked,
            unlockedAt: this._unlockedAt,
            costPaid: this._costPaid,
            isPurchasable: this.canBePurchased(unlockedAreas),
            purchaseCost: this.calculatePurchaseCost(),
            distanceFromOrigin: this.getDistanceFromOrigin()
        };
    }

    // === Area Management ===

    /**
     * Unlock this area
     */
    unlock(costPaid: number): boolean {
        if (this._unlocked) {
            return false; // Already unlocked
        }

        this._unlocked = true;
        this._unlockedAt = Date.now();
        this._costPaid = costPaid;
        return true;
    }

    /**
     * Lock this area (for debugging/testing)
     */
    lock(): void {
        this._unlocked = false;
        this._unlockedAt = undefined;
        this._costPaid = undefined;
    }

    // === Information and Statistics ===

    /**
     * Get area tier based on distance from origin
     */
    getTier(): number {
        const distance = this.getDistanceFromOrigin();
        return Math.floor(distance / 2) + 1; // Tier 1: distance 0-1, Tier 2: distance 2-3, etc.
    }

    /**
     * Get area direction from origin
     */
    getDirectionFromOrigin(): string {
        if (this.x === 0 && this.y === 0) return 'Origin';

        const directions: string[] = [];

        if (this.y < 0) directions.push('North');
        if (this.y > 0) directions.push('South');
        if (this.x < 0) directions.push('West');
        if (this.x > 0) directions.push('East');

        return directions.join('-') || 'Origin';
    }

    /**
     * Get comprehensive area information
     */
    getInfo(unlockedAreas: Set<string>): {
        coordinates: { x: number; y: number; key: string };
        status: AreaStatus;
        unlock: AreaUnlockInfo;
        bounds: AreaBounds;
        properties: {
            isOrigin: boolean;
            tier: number;
            direction: string;
            totalTiles: number;
        };
        adjacency: {
            adjacent: Array<{ x: number; y: number }>;
            diagonal: Array<{ x: number; y: number }>;
            surrounding: Array<{ x: number; y: number }>;
        };
    } {
        return {
            coordinates: {
                x: this.x,
                y: this.y,
                key: this.getKey()
            },
            status: this.getStatus(unlockedAreas),
            unlock: this.getUnlockInfo(unlockedAreas),
            bounds: this.getBounds(),
            properties: {
                isOrigin: this.isOrigin(),
                tier: this.getTier(),
                direction: this.getDirectionFromOrigin(),
                totalTiles: AREA_SIZE * AREA_SIZE
            },
            adjacency: {
                adjacent: this.getAdjacentAreaCoordinates(),
                diagonal: this.getDiagonalAreaCoordinates(),
                surrounding: this.getSurroundingAreaCoordinates()
            }
        };
    }

    // === Serialization ===

    /**
     * Serialize area data
     */
    toJSON(): {
        x: number;
        y: number;
        unlocked: boolean;
        unlockedAt?: number;
        costPaid?: number;
    } {
        return {
            x: this.x,
            y: this.y,
            unlocked: this._unlocked,
            unlockedAt: this._unlockedAt,
            costPaid: this._costPaid
        };
    }

    /**
     * Create area from serialized data
     */
    static fromJSON(data: {
        x: number;
        y: number;
        unlocked: boolean;
        unlockedAt?: number;
        costPaid?: number;
    }): Area {
        const area = new Area(data.x, data.y, data.unlocked);
        area._unlockedAt = data.unlockedAt;
        area._costPaid = data.costPaid;
        return area;
    }

    /**
     * Create a copy of this area
     */
    clone(): Area {
        return Area.fromJSON(this.toJSON());
    }

    // === Static Utility Methods ===

    /**
     * Calculate area coordinates for a given tile position
     */
    static getTileArea(tileX: number, tileY: number): { areaX: number; areaY: number } {
        const areaX = Math.floor(tileX / AREA_SIZE);
        const areaY = Math.floor(tileY / AREA_SIZE);
        return { areaX, areaY };
    }

    /**
     * Create origin area (0,0)
     */
    static createOrigin(): Area {
        return new Area(0, 0, true);
    }

    /**
     * Calculate area cost by coordinates
     */
    static calculateCost(areaX: number, areaY: number): number {
        const distance = Math.abs(areaX) + Math.abs(areaY);
        return AREA_BASE_COST + (distance * AREA_DISTANCE_MULTIPLIER);
    }

    /**
     * Generate area expansion pattern (spiral outward from origin)
     */
    static generateExpansionPattern(maxTier: number = 5): Array<{ x: number; y: number; tier: number; cost: number }> {
        const pattern: Array<{ x: number; y: number; tier: number; cost: number }> = [];

        // Add origin
        pattern.push({ x: 0, y: 0, tier: 1, cost: 0 });

        // Generate spiral pattern
        for (let tier = 1; tier <= maxTier; tier++) {
            const distance = tier * 2 - 1;

            // Generate coordinates at this tier
            for (let d = 0; d <= distance; d++) {
                const coords = [
                    { x: -tier + d, y: -tier },     // Top edge
                    { x: tier, y: -tier + d },      // Right edge
                    { x: tier - d, y: tier },       // Bottom edge
                    { x: -tier, y: tier - d }       // Left edge
                ];

                for (const coord of coords) {
                    // Avoid duplicates at corners
                    if (!pattern.some(p => p.x === coord.x && p.y === coord.y)) {
                        pattern.push({
                            x: coord.x,
                            y: coord.y,
                            tier: tier + 1,
                            cost: Area.calculateCost(coord.x, coord.y)
                        });
                    }
                }
            }
        }

        return pattern;
    }

    /**
     * Get recommended expansion areas based on efficiency
     */
    static getRecommendedExpansion(
        unlockedAreas: Area[],
        maxSuggestions: number = 3
    ): Array<{
        area: Area;
        priority: 'high' | 'medium' | 'low';
        reason: string;
        cost: number;
    }> {
        const unlockedSet = new Set(unlockedAreas.map(area => area.getKey()));
        const suggestions: Array<{
            area: Area;
            priority: 'high' | 'medium' | 'low';
            reason: string;
            cost: number;
        }> = [];

        // Find all purchasable areas
        const checked = new Set<string>();
        for (const unlockedArea of unlockedAreas) {
            const adjacentCoords = unlockedArea.getAdjacentAreaCoordinates();

            for (const coord of adjacentCoords) {
                const key = `${coord.x},${coord.y}`;
                if (checked.has(key) || unlockedSet.has(key)) {
                    continue;
                }

                checked.add(key);
                const area = new Area(coord.x, coord.y);
                const cost = area.calculatePurchaseCost();

                let priority: 'high' | 'medium' | 'low' = 'medium';
                let reason = 'Standard expansion';

                const distance = area.getDistanceFromOrigin();
                if (distance <= 2) {
                    priority = 'high';
                    reason = 'Close to origin - efficient expansion';
                } else if (cost <= AREA_BASE_COST + AREA_DISTANCE_MULTIPLIER) {
                    priority = 'high';
                    reason = 'Low cost expansion opportunity';
                } else if (distance >= 5) {
                    priority = 'low';
                    reason = 'Distant expansion - high cost but more space';
                }

                suggestions.push({ area, priority, reason, cost });
            }
        }

        // Sort by priority and cost
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        suggestions.sort((a, b) => {
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            return priorityDiff !== 0 ? priorityDiff : a.cost - b.cost;
        });

        return suggestions.slice(0, maxSuggestions);
    }
}
