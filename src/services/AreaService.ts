import { eventBus, GameEvents } from '../events/GameEvents';
import { getStateManager } from '../state/globalState';
import {
    areaMap,
    isAreaUnlocked,
    canPurchaseArea,
    getAreaCost,
    unlockArea,
    isTileUnlocked,
    getTileArea,
    getOrCreateArea,
    type Area
} from '../core/area';

/**
 * AreaService - Area management service
 * 
 * Responsibilities:
 * - Handle area unlocking and purchasing
 * - Manage area states and validation
 * - Coordinate area-related events
 * - Provide area information and statistics
 */
export class AreaService {
    constructor() {
        this.setupEventListeners();
    }

    /**
     * Check if a tile is in an unlocked area
     */
    public isTileAccessible(tileX: number, tileY: number): boolean {
        return isTileUnlocked(tileX, tileY);
    }

    /**
     * Check if an area is unlocked
     */
    public isAreaAccessible(areaX: number, areaY: number): boolean {
        return isAreaUnlocked(areaX, areaY);
    }

    /**
     * Get area coordinates for a tile
     */
    public getTileAreaCoords(tileX: number, tileY: number): { areaX: number; areaY: number } {
        return getTileArea(tileX, tileY);
    }

    /**
     * Get area information
     */
    public getAreaInfo(areaX: number, areaY: number): Area | null {
        const area = getOrCreateArea(areaX, areaY);
        return area || null;
    }

    /**
     * Get the cost to purchase an area
     */
    public getAreaPurchaseCost(areaX: number, areaY: number): number {
        return getAreaCost(areaX, areaY);
    }

    /**
     * Check if an area can be purchased
     */
    public canPurchaseArea(areaX: number, areaY: number): boolean {
        return canPurchaseArea(areaX, areaY);
    }

    /**
     * Attempt to purchase an area
     */
    public async purchaseArea(areaX: number, areaY: number): Promise<{
        success: boolean;
        message: string;
        cost?: number;
    }> {
        try {
            // Check if area can be purchased
            if (!this.canPurchaseArea(areaX, areaY)) {
                return {
                    success: false,
                    message: 'This area cannot be purchased (either already unlocked or not adjacent to unlocked areas)'
                };
            }

            const cost = this.getAreaPurchaseCost(areaX, areaY);
            const stateManager = getStateManager();
            const currentCoins = stateManager.getState().economy.coins;

            // Check if player has enough coins
            if (currentCoins < cost) {
                return {
                    success: false,
                    message: `Not enough coins! Need ${cost} coins, but only have ${currentCoins}`,
                    cost
                };
            }

            // Spend coins
            stateManager.spendCoins(cost, `Purchased area (${areaX}, ${areaY})`);

            // Unlock the area
            const unlocked = unlockArea(areaX, areaY);

            if (unlocked) {
                // Update state manager with new area map
                stateManager.setAreasMap(areaMap);

                // Emit area unlocked event
                GameEvents.emitAreaUnlocked(areaX, areaY, cost);

                console.log(`AreaService: Area (${areaX}, ${areaY}) purchased for ${cost} coins`);

                return {
                    success: true,
                    message: `Area (${areaX}, ${areaY}) unlocked for ${cost} coins!`,
                    cost
                };
            } else {
                // Refund coins if unlock failed
                stateManager.earnCoins(cost, 'Area purchase refund');

                return {
                    success: false,
                    message: 'Failed to unlock area',
                    cost
                };
            }

        } catch (error) {
            console.error('AreaService: Error purchasing area:', error);
            return {
                success: false,
                message: 'Error occurred while purchasing area'
            };
        }
    }

    /**
     * Get all unlocked areas
     */
    public getUnlockedAreas(): Area[] {
        return Array.from(areaMap.values()).filter(area => area.unlocked);
    }

    /**
     * Get all locked areas that can be purchased
     */
    public getPurchaseableAreas(): Array<Area & { cost: number }> {
        const purchaseable: Array<Area & { cost: number }> = [];

        // Check areas adjacent to unlocked areas
        const unlockedAreas = this.getUnlockedAreas();
        const checkedAreas = new Set<string>();

        unlockedAreas.forEach(area => {
            // Check adjacent areas
            const adjacentCoords = [
                [area.x, area.y - 1],  // Top
                [area.x - 1, area.y],  // Left
                [area.x + 1, area.y],  // Right
                [area.x, area.y + 1]   // Bottom
            ];

            adjacentCoords.forEach(([adjX, adjY]) => {
                const key = `${adjX},${adjY}`;
                if (checkedAreas.has(key)) return;
                checkedAreas.add(key);

                if (this.canPurchaseArea(adjX, adjY)) {
                    const adjacentArea = getOrCreateArea(adjX, adjY);
                    const cost = this.getAreaPurchaseCost(adjX, adjY);

                    purchaseable.push({
                        ...adjacentArea,
                        cost
                    });
                }
            });
        });

        return purchaseable;
    }

    /**
     * Get area statistics
     */
    public getAreaStats(): {
        totalAreas: number;
        unlockedAreas: number;
        lockedAreas: number;
        purchaseableAreas: number;
        totalCostToPurchaseAll: number;
    } {
        const total = areaMap.size;
        const unlocked = this.getUnlockedAreas().length;
        const purchaseable = this.getPurchaseableAreas();
        const totalCost = purchaseable.reduce((sum, area) => sum + area.cost, 0);

        return {
            totalAreas: total,
            unlockedAreas: unlocked,
            lockedAreas: total - unlocked,
            purchaseableAreas: purchaseable.length,
            totalCostToPurchaseAll: totalCost
        };
    }

    /**
     * Get areas within a certain range
     */
    public getAreasInRange(centerX: number, centerY: number, range: number): Area[] {
        const areasInRange: Area[] = [];

        for (let x = centerX - range; x <= centerX + range; x++) {
            for (let y = centerY - range; y <= centerY + range; y++) {
                const area = getOrCreateArea(x, y);
                if (area) {
                    areasInRange.push(area);
                }
            }
        }

        return areasInRange;
    }

    /**
     * Validate area state consistency
     */
    public validateAreaState(): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const result = {
            isValid: true,
            errors: [] as string[],
            warnings: [] as string[]
        };

        try {
            const unlockedAreas = this.getUnlockedAreas();

            // Check if there's at least one unlocked area
            if (unlockedAreas.length === 0) {
                result.errors.push('No unlocked areas found');
                result.isValid = false;
            }

            // Check for orphaned unlocked areas (not connected to origin)
            // This is a simplified check - could be more sophisticated
            const hasOriginArea = unlockedAreas.some(area => area.x === 0 && area.y === 0);
            if (!hasOriginArea) {
                result.warnings.push('Origin area (0,0) is not unlocked');
            }

            // Check for duplicate areas
            const areaKeys = new Set<string>();
            areaMap.forEach((area, key) => {
                const expectedKey = `${area.x},${area.y}`;
                if (key !== expectedKey) {
                    result.errors.push(`Area key mismatch: ${key} vs ${expectedKey}`);
                    result.isValid = false;
                }

                if (areaKeys.has(expectedKey)) {
                    result.errors.push(`Duplicate area found: ${expectedKey}`);
                    result.isValid = false;
                }
                areaKeys.add(expectedKey);
            });

        } catch (error) {
            result.errors.push(`Validation error: ${error}`);
            result.isValid = false;
        }

        return result;
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners(): void {
        // Listen for tile clicks to handle area purchase requests
        eventBus.on('tile:clicked', async (event) => {
            // Check if the tile is in a locked area and handle purchase UI
            const { areaX, areaY } = this.getTileAreaCoords(event.tileX, event.tileY);

            if (!this.isAreaAccessible(areaX, areaY) && this.canPurchaseArea(areaX, areaY)) {
                const cost = this.getAreaPurchaseCost(areaX, areaY);

                // Show area purchase tooltip/notification
                GameEvents.emitShowTooltip(
                    `Purchase area (${areaX}, ${areaY}) for ${cost} coins?`,
                    event.tileX * 32, // Approximate tile position
                    event.tileY * 32
                );
            }
        });

        // Listen for purchase attempts
        eventBus.on('economy:purchase-attempted', async (event) => {
            if (event.item.startsWith('area:')) {
                // Parse area coordinates from item string
                const coords = event.item.substring(5).split(',');
                const areaX = parseInt(coords[0]);
                const areaY = parseInt(coords[1]);

                if (!isNaN(areaX) && !isNaN(areaY)) {
                    await this.purchaseArea(areaX, areaY);
                }
            }
        });
    }

    /**
     * Cleanup resources
     */
    public destroy(): void {
        console.log('AreaService destroyed');
    }
}

// Export singleton instance
export const areaService = new AreaService();
