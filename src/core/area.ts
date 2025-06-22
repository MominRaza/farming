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
export const AREA_SIZE = 15; // Each area is 15x15 tiles
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
