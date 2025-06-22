import type { ToolId } from '../types';
import { GRID_SIZE } from '../utils/constants';
import { AREA_SIZE } from './area';

export const state = {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    tileX: 0,
    tileY: 0,
    selectedTool: null as ToolId | null,
    coins: 100, // Starting coins
};

// Coin management functions
export function canAfford(cost: number): boolean {
    return state.coins >= cost;
}

export function spendCoins(cost: number): boolean {
    if (canAfford(cost)) {
        state.coins -= cost;
        return true;
    }
    return false;
}

export function earnCoins(amount: number): void {
    state.coins += amount;
}

// Reset game state to defaults
export function resetGameState(): void {
    // Reset UI state (camera will be set by initializeCameraPosition when canvas is available)
    state.offsetX = 0;
    state.offsetY = 0;
    state.scale = 1;
    state.isDragging = false;
    state.lastMouseX = 0;
    state.lastMouseY = 0;
    state.tileX = 0;
    state.tileY = 0;
    state.selectedTool = null;
    state.coins = 100; // Starting coins
}

// Calculate initial camera position to center the unlocked area
export function calculateInitialCameraPosition(canvasWidth: number, canvasHeight: number): { offsetX: number, offsetY: number, scale: number } {
    // The unlocked area spans from tile (0,0) to tile (AREA_SIZE-1, AREA_SIZE-1)
    // In world coordinates, this is from (0,0) to (AREA_SIZE * GRID_SIZE, AREA_SIZE * GRID_SIZE)

    const areaWorldWidth = AREA_SIZE * GRID_SIZE;  // 15 * 50 = 750 pixels
    const areaWorldHeight = AREA_SIZE * GRID_SIZE; // 15 * 50 = 750 pixels

    // Calculate the center of the unlocked area in world coordinates
    // Area goes from tile 0 to tile 14, so center is at tile 7 (which is pixel 7*50 + 25 = 375)
    const areaCenterX = (AREA_SIZE * GRID_SIZE) / 2; // Center of the 15x15 area
    const areaCenterY = (AREA_SIZE * GRID_SIZE) / 2; // Center of the 15x15 area

    // Calculate scale to fit the area with some padding (80% of available space)
    const scaleX = (canvasWidth * 0.8) / areaWorldWidth;
    const scaleY = (canvasHeight * 0.8) / areaWorldHeight;
    const scale = Math.min(scaleX, scaleY, 1.5); // Cap at 1.5x for reasonable zoom

    // Calculate offset to center the area
    const offsetX = canvasWidth / 2 - areaCenterX * scale;
    const offsetY = canvasHeight / 2 - areaCenterY * scale;

    return { offsetX, offsetY, scale };
}

// Initialize camera to center the unlocked area
export function initializeCameraPosition(canvasWidth: number, canvasHeight: number): void {
    if (canvasWidth <= 0 || canvasHeight <= 0) {
        console.warn('Invalid canvas dimensions, skipping camera initialization');
        return;
    }

    const { offsetX, offsetY, scale } = calculateInitialCameraPosition(canvasWidth, canvasHeight);
    state.offsetX = offsetX;
    state.offsetY = offsetY;
    state.scale = scale;
}
