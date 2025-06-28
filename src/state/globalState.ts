import { StateManager } from './StateManager';
import { eventBus } from '../events/EventBus';
import { createInitialGameState } from './GameState';
import { tileMap } from '../core/tile';
import { areaMap } from '../core/area';

/**
 * Global state manager instance
 * This provides a single source of truth for the entire application
 */

// Create the global state manager
const globalStateManager = new StateManager(eventBus, createInitialGameState());

// Initialize the state manager with existing data from legacy maps
function initializeGlobalState(): void {
    // Transfer existing tile data to the new state system
    globalStateManager.setTilesMap(tileMap);

    // Transfer existing area data to the new state system  
    globalStateManager.setAreasMap(areaMap);

    console.log('Global state manager initialized with existing data');
}

// Initialize on module load
initializeGlobalState();

/**
 * Get the global state manager instance
 */
export function getStateManager(): StateManager {
    return globalStateManager;
}

/**
 * Convenience functions for common state operations
 */

// UI State
export const getState = () => globalStateManager.getState();
export const updateCamera = (offsetX?: number, offsetY?: number, scale?: number) =>
    globalStateManager.updateCamera(offsetX, offsetY, scale);
export const updateMouseState = (isDragging?: boolean, lastMouseX?: number, lastMouseY?: number, tileX?: number, tileY?: number) =>
    globalStateManager.updateMouseState(isDragging, lastMouseX, lastMouseY, tileX, tileY);
export const updateSelectedTool = (toolId: import('../types').ToolId | null) =>
    globalStateManager.updateSelectedTool(toolId);

// Economy State  
export const canAfford = (cost: number) => globalStateManager.canAfford(cost);
export const spendCoins = (cost: number, reason?: string) => globalStateManager.spendCoins(cost, reason);
export const earnCoins = (amount: number, reason?: string) => globalStateManager.earnCoins(amount, reason);
export const setCoins = (amount: number) => globalStateManager.setCoins(amount);

// World State
export const getTilesMap = () => globalStateManager.getTilesMap();
export const getAreasMap = () => globalStateManager.getAreasMap();
export const setTilesMap = (tilesMap: Map<string, import('../core/tile').TileData>) =>
    globalStateManager.setTilesMap(tilesMap);
export const setAreasMap = (areasMap: Map<string, import('../core/area').Area>) =>
    globalStateManager.setAreasMap(areasMap);

// State Management
export const resetState = () => globalStateManager.resetState();
export const loadState = (serializedState: string) => globalStateManager.loadState(serializedState);
export const serializeState = () => globalStateManager.serializeState();

// Debug
export const getStateSummary = () => globalStateManager.getStateSummary();
export const validateCurrentState = () => globalStateManager.validateCurrentState();

/**
 * Legacy compatibility functions
 * These maintain backward compatibility with the old state system
 */

// Legacy state object that mimics the old structure
export const legacyState = {
    get offsetX() { return globalStateManager.getState().ui.offsetX; },
    set offsetX(value: number) { globalStateManager.updateCamera(value); },

    get offsetY() { return globalStateManager.getState().ui.offsetY; },
    set offsetY(value: number) { globalStateManager.updateCamera(undefined, value); },

    get scale() { return globalStateManager.getState().ui.scale; },
    set scale(value: number) { globalStateManager.updateCamera(undefined, undefined, value); },

    get isDragging() { return globalStateManager.getState().ui.isDragging; },
    set isDragging(value: boolean) { globalStateManager.updateMouseState(value); },

    get lastMouseX() { return globalStateManager.getState().ui.lastMouseX; },
    set lastMouseX(value: number) { globalStateManager.updateMouseState(undefined, value); },

    get lastMouseY() { return globalStateManager.getState().ui.lastMouseY; },
    set lastMouseY(value: number) { globalStateManager.updateMouseState(undefined, undefined, value); },

    get tileX() { return globalStateManager.getState().ui.tileX; },
    set tileX(value: number) { globalStateManager.updateMouseState(undefined, undefined, undefined, value); },

    get tileY() { return globalStateManager.getState().ui.tileY; },
    set tileY(value: number) { globalStateManager.updateMouseState(undefined, undefined, undefined, undefined, value); },

    get selectedTool() { return globalStateManager.getState().ui.selectedTool; },
    set selectedTool(value: import('../types').ToolId | null) { globalStateManager.updateSelectedTool(value); },

    get coins() { return globalStateManager.getState().economy.coins; },
    set coins(value: number) { globalStateManager.setCoins(value); },
};

// Legacy functions that maintain the same API
export function canAffordLegacy(cost: number): boolean {
    return globalStateManager.canAfford(cost);
}

export function spendCoinsLegacy(cost: number): boolean {
    return globalStateManager.spendCoins(cost);
}

export function earnCoinsLegacy(amount: number): void {
    globalStateManager.earnCoins(amount);
}

export function resetGameStateLegacy(): void {
    globalStateManager.resetState();
}

// Legacy camera functions
export function calculateInitialCameraPosition(canvasWidth: number, canvasHeight: number): { offsetX: number, offsetY: number, scale: number } {
    const AREA_SIZE = 12; // Should come from constants
    const GRID_SIZE = 50; // Should come from constants

    // The unlocked area spans from tile (0,0) to tile (AREA_SIZE-1, AREA_SIZE-1)
    // In world coordinates, this is from (0,0) to (AREA_SIZE * GRID_SIZE, AREA_SIZE * GRID_SIZE)

    const areaWorldWidth = AREA_SIZE * GRID_SIZE;  // 12 * 50 = 600 pixels
    const areaWorldHeight = AREA_SIZE * GRID_SIZE; // 12 * 50 = 600 pixels

    // Calculate the center of the unlocked area in world coordinates
    // Area goes from tile 0 to tile 11, so center is at tile 5.5 (which is pixel 5.5*50 = 275)
    const areaCenterX = (AREA_SIZE * GRID_SIZE) / 2; // Center of the 12x12 area
    const areaCenterY = (AREA_SIZE * GRID_SIZE) / 2; // Center of the 12x12 area

    // Calculate scale to fit the area with some padding (80% of available space)
    const scaleX = (canvasWidth * 0.8) / areaWorldWidth;
    const scaleY = (canvasHeight * 0.8) / areaWorldHeight;
    const scale = Math.min(scaleX, scaleY, 1.5); // Cap at 1.5x for reasonable zoom

    // Calculate offset to center the area
    const offsetX = canvasWidth / 2 - areaCenterX * scale;
    const offsetY = canvasHeight / 2 - areaCenterY * scale;

    return { offsetX, offsetY, scale };
}

export function initializeCameraPosition(canvasWidth: number, canvasHeight: number): void {
    if (canvasWidth <= 0 || canvasHeight <= 0) {
        console.warn('Invalid canvas dimensions, skipping camera initialization');
        return;
    }

    const { offsetX, offsetY, scale } = calculateInitialCameraPosition(canvasWidth, canvasHeight);
    globalStateManager.updateCamera(offsetX, offsetY, scale);
}
