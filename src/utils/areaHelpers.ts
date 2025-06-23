import { isTileUnlocked, getTileArea, canPurchaseArea, getAreaCost } from '../core/area';
import { AREA_SIZE } from './constants';

/**
 * Helper function to check if a tile is the center of a purchasable locked area (lock icon)
 */
export function isLockIcon(tileX: number, tileY: number): { isLockIcon: boolean, areaX?: number, areaY?: number, cost?: number } {
    // Check if tile is locked
    if (isTileUnlocked(tileX, tileY)) {
        return { isLockIcon: false };
    }

    // Get area coordinates
    const { areaX, areaY } = getTileArea(tileX, tileY);

    // Calculate the center tile of this area
    const areaCenterTileX = areaX * AREA_SIZE + Math.floor(AREA_SIZE / 2);
    const areaCenterTileY = areaY * AREA_SIZE + Math.floor(AREA_SIZE / 2);

    // Check if clicked tile is the center tile and area can be purchased
    if (tileX === areaCenterTileX && tileY === areaCenterTileY && canPurchaseArea(areaX, areaY)) {
        const cost = getAreaCost(areaX, areaY);
        return { isLockIcon: true, areaX, areaY, cost };
    }

    return { isLockIcon: false };
}
