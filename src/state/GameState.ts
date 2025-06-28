import type { ToolId } from '../types';
import type { Area } from '../core/area';
import type { TileData } from '../core/tile';

/**
 * Centralized game state interface
 * All game data is contained within this single state object
 */
export interface GameState {
    // UI/Camera state
    ui: {
        offsetX: number;
        offsetY: number;
        scale: number;
        isDragging: boolean;
        lastMouseX: number;
        lastMouseY: number;
        tileX: number;
        tileY: number;
        selectedTool: ToolId | null;
    };

    // Economic state
    economy: {
        coins: number;
    };

    // World state
    world: {
        tiles: Map<string, TileData>;
        areas: Map<string, Area>;
    };

    // Game meta state
    meta: {
        lastSaveTime: number;
        gameStartTime: number;
        version: string;
    };
}

/**
 * Initial state factory - creates a fresh game state
 */
export function createInitialGameState(): GameState {
    return {
        ui: {
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            isDragging: false,
            lastMouseX: 0,
            lastMouseY: 0,
            tileX: 0,
            tileY: 0,
            selectedTool: null,
        },
        economy: {
            coins: 1000, // Starting coins - will be moved to config later
        },
        world: {
            tiles: new Map<string, TileData>(),
            areas: new Map<string, Area>(),
        },
        meta: {
            lastSaveTime: 0,
            gameStartTime: Date.now(),
            version: '1.0.0',
        },
    };
}

/**
 * State validation helpers
 */
export class StateValidator {
    static isValidGameState(state: unknown): state is GameState {
        if (!state || typeof state !== 'object') return false;

        const stateObj = state as Record<string, unknown>;

        // Check required top-level properties
        if (!stateObj.ui || !stateObj.economy || !stateObj.world || !stateObj.meta) return false;

        // Check UI state
        const ui = stateObj.ui as Record<string, unknown>;
        if (typeof ui.offsetX !== 'number' || typeof ui.offsetY !== 'number' ||
            typeof ui.scale !== 'number' || typeof ui.isDragging !== 'boolean') {
            return false;
        }

        // Check economy state
        const economy = stateObj.economy as Record<string, unknown>;
        if (typeof economy.coins !== 'number') return false;

        // Check world state
        const world = stateObj.world as Record<string, unknown>;
        if (!(world.tiles instanceof Map) || !(world.areas instanceof Map)) {
            return false;
        }

        return true;
    }

    static validateCoins(coins: number): boolean {
        return typeof coins === 'number' && coins >= 0 && Number.isFinite(coins);
    }

    static validateScale(scale: number): boolean {
        return typeof scale === 'number' && scale > 0 && scale <= 10 && Number.isFinite(scale);
    }

    static validateOffset(offset: number): boolean {
        return typeof offset === 'number' && Number.isFinite(offset);
    }
}

/**
 * State transformation helpers
 */
export class StateTransformer {
    /**
     * Deep clone the game state for immutable updates
     */
    static cloneState(state: GameState): GameState {
        return {
            ui: { ...state.ui },
            economy: { ...state.economy },
            world: {
                tiles: new Map(state.world.tiles),
                areas: new Map(state.world.areas),
            },
            meta: { ...state.meta },
        };
    }

    /**
     * Merge partial state updates into existing state
     */
    static mergeState(currentState: GameState, updates: Partial<GameState>): GameState {
        const newState = this.cloneState(currentState);

        if (updates.ui) {
            Object.assign(newState.ui, updates.ui);
        }

        if (updates.economy) {
            Object.assign(newState.economy, updates.economy);
        }

        if (updates.world) {
            if (updates.world.tiles) {
                newState.world.tiles = new Map(updates.world.tiles);
            }
            if (updates.world.areas) {
                newState.world.areas = new Map(updates.world.areas);
            }
        }

        if (updates.meta) {
            Object.assign(newState.meta, updates.meta);
        }

        return newState;
    }

    /**
     * Convert legacy state format to new format
     */
    static migrateLegacyState(legacyState: Record<string, unknown>): GameState {
        const newState = createInitialGameState();

        // Migrate UI state with type validation
        if (typeof legacyState.offsetX === 'number') newState.ui.offsetX = legacyState.offsetX;
        if (typeof legacyState.offsetY === 'number') newState.ui.offsetY = legacyState.offsetY;
        if (typeof legacyState.scale === 'number') newState.ui.scale = legacyState.scale;
        if (typeof legacyState.isDragging === 'boolean') newState.ui.isDragging = legacyState.isDragging;
        if (typeof legacyState.lastMouseX === 'number') newState.ui.lastMouseX = legacyState.lastMouseX;
        if (typeof legacyState.lastMouseY === 'number') newState.ui.lastMouseY = legacyState.lastMouseY;
        if (typeof legacyState.tileX === 'number') newState.ui.tileX = legacyState.tileX;
        if (typeof legacyState.tileY === 'number') newState.ui.tileY = legacyState.tileY;
        if (typeof legacyState.selectedTool === 'string' || legacyState.selectedTool === null) {
            newState.ui.selectedTool = legacyState.selectedTool as ToolId | null;
        }

        // Migrate economy state
        if (typeof legacyState.coins === 'number') newState.economy.coins = legacyState.coins;

        return newState;
    }
}
