import { AREA_SIZE, AREA_BASE_COST, AREA_DISTANCE_MULTIPLIER } from '../utils/constants';

export interface Area {
    x: number;
    y: number;
    unlocked: boolean;
}

export const areaMap = new Map<string, Area>();
export function getAreaKey(x: number, y: number): string {
    return `${x},${y}`;
}

// Area system constants
export const INITIAL_UNLOCKED_AREA = { x: 0, y: 0 }; // Starting unlocked area at origin

// Initialize the area system with one unlocked area
export function initializeAreaSystem(): void {
    areaMap.clear();
    // Create the initial unlocked area at (0, 0)
    const initialArea: Area = {
        x: INITIAL_UNLOCKED_AREA.x,
        y: INITIAL_UNLOCKED_AREA.y,
        unlocked: true
    };
    areaMap.set(getAreaKey(0, 0), initialArea);
}

// Get the area coordinates for a given tile position
export function getTileArea(tileX: number, tileY: number): { areaX: number, areaY: number } {
    // Handle negative coordinates properly
    const areaX = Math.floor(tileX / AREA_SIZE);
    const areaY = Math.floor(tileY / AREA_SIZE);
    return { areaX, areaY };
}

// Check if a tile is in an unlocked area
export function isTileUnlocked(tileX: number, tileY: number): boolean {
    const { areaX, areaY } = getTileArea(tileX, tileY);
    const areaKey = getAreaKey(areaX, areaY);
    const area = areaMap.get(areaKey);
    return area ? area.unlocked : false;
}

// Get or create an area (defaults to locked)
export function getOrCreateArea(areaX: number, areaY: number): Area {
    const areaKey = getAreaKey(areaX, areaY);
    let area = areaMap.get(areaKey);

    if (!area) {
        area = {
            x: areaX,
            y: areaY,
            unlocked: false
        };
        areaMap.set(areaKey, area);
    }

    return area;
}

// Check if an area is unlocked
export function isAreaUnlocked(areaX: number, areaY: number): boolean {
    const area = areaMap.get(getAreaKey(areaX, areaY));
    return area ? area.unlocked : false;
}

// Calculate the cost of purchasing an area based on distance from origin
export function getAreaCost(areaX: number, areaY: number): number {
    // Calculate Manhattan distance from origin (0, 0)
    const distance = Math.abs(areaX) + Math.abs(areaY);

    // Cost formula from balance doc: 200 + (distance * 100)
    return AREA_BASE_COST + (distance * AREA_DISTANCE_MULTIPLIER);
}

// Check if an area can be purchased (is locked and adjacent to unlocked area)
export function canPurchaseArea(areaX: number, areaY: number): boolean {
    // Area must be locked
    if (isAreaUnlocked(areaX, areaY)) {
        return false;
    }

    // Area must be adjacent to at least one unlocked area
    const adjacentAreas = [
        [areaX, areaY - 1],     // Top
        [areaX - 1, areaY],     // Left
        [areaX + 1, areaY],     // Right
        [areaX, areaY + 1]      // Bottom
    ];

    return adjacentAreas.some(([adjX, adjY]) => isAreaUnlocked(adjX, adjY));
}

// Purchase an area (unlock it for coins)
export function purchaseArea(areaX: number, areaY: number): { success: boolean, cost?: number, message: string } {
    // Check if area can be purchased
    if (!canPurchaseArea(areaX, areaY)) {
        return {
            success: false,
            message: 'This area cannot be purchased (either already unlocked or not adjacent to unlocked areas)'
        };
    }

    const cost = getAreaCost(areaX, areaY);

    return {
        success: false, // Will be handled by the caller (controls) to check coins and spend them
        cost: cost,
        message: `Purchase area (${areaX}, ${areaY}) for ${cost} coins?`
    };
}

// Unlock an area (called after successful payment)
export function unlockArea(areaX: number, areaY: number): boolean {
    const area = getOrCreateArea(areaX, areaY);
    if (!area.unlocked) {
        area.unlocked = true;
        console.log(`Area (${areaX}, ${areaY}) unlocked!`);
        return true;
    }
    return false;
}
