import { EventBus } from '../events/EventBus';
import type { AreaUnlockedEvent, AreaHoveredEvent } from '../events/EventTypes';
import { AREA_SIZE, AREA_BASE_COST, AREA_DISTANCE_MULTIPLIER } from '../utils/constants';

/**
 * Area interface
 */
export interface Area {
    x: number;
    y: number;
    unlocked: boolean;
    unlockedAt?: number; // Timestamp when unlocked
    cost?: number; // Cost paid to unlock this area
}

/**
 * Area purchase result interface
 */
export interface AreaPurchaseResult {
    canPurchase: boolean;
    cost?: number;
    reason: string;
    areaX: number;
    areaY: number;
}

/**
 * AreaSystem manages area unlocking and access control
 * Handles area purchasing, validation, and tile access restrictions
 */
export class AreaSystem {
    private eventBus: EventBus;
    private areaMap = new Map<string, Area>();
    private readonly initialUnlockedArea = { x: 0, y: 0 };

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
        this.initializeStartingArea();
    }

    // === Area Key Management ===

    private getAreaKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    // === Initialization ===

    /**
     * Initialize the area system with the starting unlocked area
     */
    private initializeStartingArea(): void {
        this.areaMap.clear();
        const initialArea: Area = {
            x: this.initialUnlockedArea.x,
            y: this.initialUnlockedArea.y,
            unlocked: true,
            unlockedAt: Date.now(),
            cost: 0 // Starting area is free
        };
        this.areaMap.set(this.getAreaKey(0, 0), initialArea);
    }

    /**
     * Reset to initial state
     */
    reset(): void {
        this.initializeStartingArea();
    }

    // === Coordinate Conversion ===

    /**
     * Get the area coordinates for a given tile position
     */
    getTileArea(tileX: number, tileY: number): { areaX: number; areaY: number } {
        // Handle negative coordinates properly
        const areaX = Math.floor(tileX / AREA_SIZE);
        const areaY = Math.floor(tileY / AREA_SIZE);
        return { areaX, areaY };
    }

    /**
     * Get tile coordinates within an area (local coordinates)
     */
    getTileLocalCoordinates(tileX: number, tileY: number): { localX: number; localY: number } {
        const localX = ((tileX % AREA_SIZE) + AREA_SIZE) % AREA_SIZE;
        const localY = ((tileY % AREA_SIZE) + AREA_SIZE) % AREA_SIZE;
        return { localX, localY };
    }

    /**
     * Get area bounds (min/max tile coordinates)
     */
    getAreaBounds(areaX: number, areaY: number): {
        minTileX: number;
        maxTileX: number;
        minTileY: number;
        maxTileY: number;
    } {
        const minTileX = areaX * AREA_SIZE;
        const maxTileX = (areaX + 1) * AREA_SIZE - 1;
        const minTileY = areaY * AREA_SIZE;
        const maxTileY = (areaY + 1) * AREA_SIZE - 1;

        return { minTileX, maxTileX, minTileY, maxTileY };
    }

    // === Area Access and Validation ===

    /**
     * Check if a tile is in an unlocked area
     */
    isTileUnlocked(tileX: number, tileY: number): boolean {
        const { areaX, areaY } = this.getTileArea(tileX, tileY);
        return this.isAreaUnlocked(areaX, areaY);
    }

    /**
     * Check if an area is unlocked
     */
    isAreaUnlocked(areaX: number, areaY: number): boolean {
        const area = this.areaMap.get(this.getAreaKey(areaX, areaY));
        return area ? area.unlocked : false;
    }

    /**
     * Get or create an area (defaults to locked)
     */
    getOrCreateArea(areaX: number, areaY: number): Area {
        const areaKey = this.getAreaKey(areaX, areaY);
        let area = this.areaMap.get(areaKey);

        if (!area) {
            area = {
                x: areaX,
                y: areaY,
                unlocked: false
            };
            this.areaMap.set(areaKey, area);
        }

        return area;
    }

    /**
     * Get area information
     */
    getAreaInfo(areaX: number, areaY: number): Area | null {
        return this.areaMap.get(this.getAreaKey(areaX, areaY)) || null;
    }

    // === Cost Calculation ===

    /**
     * Calculate the cost of purchasing an area based on distance from origin
     */
    getAreaCost(areaX: number, areaY: number): number {
        // Calculate Manhattan distance from origin (0, 0)
        const distance = Math.abs(areaX) + Math.abs(areaY);

        // Cost formula from balance doc: 200 + (distance * 100)
        return AREA_BASE_COST + (distance * AREA_DISTANCE_MULTIPLIER);
    }

    // === Purchase Validation and Processing ===

    /**
     * Check if an area can be purchased
     */
    canPurchaseArea(areaX: number, areaY: number): AreaPurchaseResult {
        // Area must not already be unlocked
        if (this.isAreaUnlocked(areaX, areaY)) {
            return {
                canPurchase: false,
                reason: 'Area is already unlocked',
                areaX,
                areaY
            };
        }

        // Area must be adjacent to at least one unlocked area
        const adjacentAreas = [
            [areaX, areaY - 1],     // Top
            [areaX - 1, areaY],     // Left
            [areaX + 1, areaY],     // Right
            [areaX, areaY + 1]      // Bottom
        ];

        const hasAdjacentUnlockedArea = adjacentAreas.some(([adjX, adjY]) =>
            this.isAreaUnlocked(adjX, adjY)
        );

        if (!hasAdjacentUnlockedArea) {
            return {
                canPurchase: false,
                reason: 'Area must be adjacent to an unlocked area',
                areaX,
                areaY
            };
        }

        const cost = this.getAreaCost(areaX, areaY);

        return {
            canPurchase: true,
            cost,
            reason: `Can purchase area (${areaX}, ${areaY}) for ${cost} coins`,
            areaX,
            areaY
        };
    }

    /**
     * Unlock an area (called after successful payment)
     */
    unlockArea(areaX: number, areaY: number, costPaid: number): boolean {
        const area = this.getOrCreateArea(areaX, areaY);

        if (area.unlocked) {
            return false; // Already unlocked
        }

        area.unlocked = true;
        area.unlockedAt = Date.now();
        area.cost = costPaid;

        // Emit area unlocked event
        const event: AreaUnlockedEvent = {
            type: 'area:unlocked',
            timestamp: Date.now(),
            areaX,
            areaY,
            cost: costPaid
        };
        this.eventBus.emit(event);

        return true;
    }

    /**
     * Handle area hover events
     */
    onAreaHover(areaX: number, areaY: number): void {
        const isLocked = !this.isAreaUnlocked(areaX, areaY);

        const event: AreaHoveredEvent = {
            type: 'area:hovered',
            timestamp: Date.now(),
            areaX,
            areaY,
            isLocked
        };
        this.eventBus.emit(event);
    }

    // === Area Discovery and Navigation ===

    /**
     * Get all unlocked areas
     */
    getUnlockedAreas(): Area[] {
        return Array.from(this.areaMap.values()).filter(area => area.unlocked);
    }

    /**
     * Get all locked areas adjacent to unlocked areas (purchasable areas)
     */
    getPurchasableAreas(): Array<{ area: Area; cost: number }> {
        const purchasable: Array<{ area: Area; cost: number }> = [];
        const unlockedAreas = this.getUnlockedAreas();

        // For each unlocked area, check its adjacent areas
        for (const unlockedArea of unlockedAreas) {
            const adjacentCoords = [
                [unlockedArea.x, unlockedArea.y - 1],     // Top
                [unlockedArea.x - 1, unlockedArea.y],     // Left
                [unlockedArea.x + 1, unlockedArea.y],     // Right
                [unlockedArea.x, unlockedArea.y + 1]      // Bottom
            ];

            for (const [adjX, adjY] of adjacentCoords) {
                if (!this.isAreaUnlocked(adjX, adjY)) {
                    const area = this.getOrCreateArea(adjX, adjY);
                    const cost = this.getAreaCost(adjX, adjY);

                    // Avoid duplicates
                    const alreadyAdded = purchasable.some(p =>
                        p.area.x === adjX && p.area.y === adjY
                    );

                    if (!alreadyAdded) {
                        purchasable.push({ area, cost });
                    }
                }
            }
        }

        return purchasable;
    }

    /**
     * Get the cheapest purchasable area
     */
    getCheapestPurchasableArea(): { area: Area; cost: number } | null {
        const purchasable = this.getPurchasableAreas();

        if (purchasable.length === 0) {
            return null;
        }

        return purchasable.reduce((cheapest, current) =>
            current.cost < cheapest.cost ? current : cheapest
        );
    }

    // === Statistics ===

    /**
     * Get area statistics
     */
    getStatistics(): {
        unlockedAreas: number;
        totalAreasCost: number;
        averageAreaCost: number;
        furthestDistance: number;
        purchasableAreas: number;
        cheapestPurchasableCost: number;
        totalTilesAvailable: number;
        areasByDistance: Record<number, number>;
    } {
        const unlockedAreas = this.getUnlockedAreas();
        const purchasable = this.getPurchasableAreas();

        let totalCost = 0;
        let furthestDistance = 0;
        const areasByDistance: Record<number, number> = {};

        for (const area of unlockedAreas) {
            if (area.cost) {
                totalCost += area.cost;
            }

            const distance = Math.abs(area.x) + Math.abs(area.y);
            furthestDistance = Math.max(furthestDistance, distance);
            areasByDistance[distance] = (areasByDistance[distance] || 0) + 1;
        }

        const averageAreaCost = unlockedAreas.length > 1
            ? totalCost / (unlockedAreas.length - 1) // Exclude free starting area
            : 0;

        const cheapestPurchasable = this.getCheapestPurchasableArea();

        return {
            unlockedAreas: unlockedAreas.length,
            totalAreasCost: totalCost,
            averageAreaCost,
            furthestDistance,
            purchasableAreas: purchasable.length,
            cheapestPurchasableCost: cheapestPurchasable?.cost || 0,
            totalTilesAvailable: unlockedAreas.length * AREA_SIZE * AREA_SIZE,
            areasByDistance
        };
    }

    /**
     * Get area expansion suggestions
     */
    getExpansionSuggestions(): Array<{
        areaX: number;
        areaY: number;
        cost: number;
        priority: 'low' | 'medium' | 'high';
        reason: string;
    }> {
        const purchasable = this.getPurchasableAreas();

        return purchasable.map(({ area, cost }) => {
            const distance = Math.abs(area.x) + Math.abs(area.y);

            let priority: 'low' | 'medium' | 'high' = 'medium';
            let reason = 'Standard expansion';

            if (distance <= 2) {
                priority = 'high';
                reason = 'Close to starting area - good for early expansion';
            } else if (cost <= AREA_BASE_COST + AREA_DISTANCE_MULTIPLIER) {
                priority = 'high';
                reason = 'Low cost expansion opportunity';
            } else if (distance >= 5) {
                priority = 'low';
                reason = 'Far from starting area - expensive but provides more space';
            }

            return {
                areaX: area.x,
                areaY: area.y,
                cost,
                priority,
                reason
            };
        }).sort((a, b) => {
            // Sort by priority (high first), then by cost (low first)
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            return priorityDiff !== 0 ? priorityDiff : a.cost - b.cost;
        });
    }

    // === Serialization ===

    /**
     * Get area data for saving
     */
    getAreaData(): Map<string, Area> {
        return new Map(this.areaMap);
    }

    /**
     * Set area data from save
     */
    setAreaData(areaData: Map<string, Area>): void {
        this.areaMap.clear();
        areaData.forEach((area, key) => {
            this.areaMap.set(key, { ...area });
        });

        // Ensure starting area exists and is unlocked
        if (!this.isAreaUnlocked(0, 0)) {
            this.initializeStartingArea();
        }
    }

    /**
     * Clear all areas and reset to initial state
     */
    clear(): void {
        this.reset();
    }
}
