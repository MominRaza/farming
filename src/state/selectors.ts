import type { GameState } from './GameState';
import type { ToolId } from '../types';
import type { TileData } from '../core/tile';
import type { Area } from '../core/area';

/**
 * State selectors - convenient functions to access specific parts of the game state
 * These functions provide a clean interface for reading state without exposing internal structure
 */

// ================================
// UI State Selectors
// ================================

export const getCamera = (state: GameState) => ({
    offsetX: state.ui.offsetX,
    offsetY: state.ui.offsetY,
    scale: state.ui.scale,
});

export const getCameraOffset = (state: GameState) => ({
    x: state.ui.offsetX,
    y: state.ui.offsetY,
});

export const getCameraScale = (state: GameState): number => state.ui.scale;

export const getMouseState = (state: GameState) => ({
    isDragging: state.ui.isDragging,
    lastMouseX: state.ui.lastMouseX,
    lastMouseY: state.ui.lastMouseY,
    tileX: state.ui.tileX,
    tileY: state.ui.tileY,
});

export const getSelectedTool = (state: GameState): ToolId | null => state.ui.selectedTool;

export const getCurrentTilePosition = (state: GameState) => ({
    x: state.ui.tileX,
    y: state.ui.tileY,
});

// ================================
// Economy State Selectors
// ================================

export const getCoins = (state: GameState): number => state.economy.coins;

export const canAffordAmount = (state: GameState, cost: number): boolean =>
    state.economy.coins >= cost;

// ================================
// World State Selectors
// ================================

export const getTile = (state: GameState, x: number, y: number): TileData | undefined => {
    const key = `${x},${y}`;
    return state.world.tiles.get(key);
};

export const getArea = (state: GameState, x: number, y: number): Area | undefined => {
    const key = `${x},${y}`;
    return state.world.areas.get(key);
};

export const getAllTiles = (state: GameState): Map<string, TileData> => state.world.tiles;

export const getAllAreas = (state: GameState): Map<string, Area> => state.world.areas;

export const getTilesInArea = (state: GameState, areaX: number, areaY: number): TileData[] => {
    const tiles: TileData[] = [];
    const AREA_SIZE = 12; // Should come from constants

    for (let x = areaX * AREA_SIZE; x < (areaX + 1) * AREA_SIZE; x++) {
        for (let y = areaY * AREA_SIZE; y < (areaY + 1) * AREA_SIZE; y++) {
            const tile = getTile(state, x, y);
            if (tile) {
                tiles.push(tile);
            }
        }
    }

    return tiles;
};

// ================================
// Computed State Selectors
// ================================

export const getTileCount = (state: GameState): number => state.world.tiles.size;

export const getAreaCount = (state: GameState): number => state.world.areas.size;

export const getUnlockedAreasCount = (state: GameState): number => {
    let count = 0;
    state.world.areas.forEach(area => {
        if (area.unlocked) count++;
    });
    return count;
};

export const getCropsCount = (state: GameState): number => {
    let count = 0;
    state.world.tiles.forEach(tile => {
        if (tile.crop) count++;
    });
    return count;
};

export const getMatureCropsCount = (state: GameState): number => {
    let count = 0;
    state.world.tiles.forEach(tile => {
        if (tile.crop && tile.crop.stage >= tile.crop.maxStages - 1) count++;
    });
    return count;
};

export const getSoilTilesCount = (state: GameState): number => {
    let count = 0;
    state.world.tiles.forEach(tile => {
        if (tile.type === 'soil') count++;
    });
    return count;
};

export const getWateredTilesCount = (state: GameState): number => {
    let count = 0;
    state.world.tiles.forEach(tile => {
        if (tile.type === 'soil' && tile.isWatered) count++;
    });
    return count;
};

export const getFertilizedTilesCount = (state: GameState): number => {
    let count = 0;
    state.world.tiles.forEach(tile => {
        if (tile.type === 'soil' && tile.isFertilized) count++;
    });
    return count;
};

// ================================
// Meta State Selectors
// ================================

export const getLastSaveTime = (state: GameState): number => state.meta.lastSaveTime;

export const getGameStartTime = (state: GameState): number => state.meta.gameStartTime;

export const getGameVersion = (state: GameState): string => state.meta.version;

export const getGameDuration = (state: GameState): number =>
    Date.now() - state.meta.gameStartTime;

export const getFormattedGameDuration = (state: GameState): string => {
    const duration = getGameDuration(state);
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
};

// ================================
// Complex State Selectors
// ================================

export const getGameStats = (state: GameState) => ({
    coins: getCoins(state),
    duration: getFormattedGameDuration(state),
    tilesCount: getTileCount(state),
    areasCount: getAreaCount(state),
    unlockedAreasCount: getUnlockedAreasCount(state),
    cropsCount: getCropsCount(state),
    matureCropsCount: getMatureCropsCount(state),
    soilTilesCount: getSoilTilesCount(state),
    wateredTilesCount: getWateredTilesCount(state),
    fertilizedTilesCount: getFertilizedTilesCount(state),
});

export const getUIState = (state: GameState) => ({
    camera: getCamera(state),
    mouse: getMouseState(state),
    selectedTool: getSelectedTool(state),
    currentTile: getCurrentTilePosition(state),
});

// ================================
// Validation Selectors
// ================================

export const isValidTilePosition = (_state: GameState, x: number, y: number): boolean => {
    return Number.isInteger(x) && Number.isInteger(y);
};

export const hasTileAt = (state: GameState, x: number, y: number): boolean => {
    const key = `${x},${y}`;
    return state.world.tiles.has(key);
};

export const hasAreaAt = (state: GameState, x: number, y: number): boolean => {
    const key = `${x},${y}`;
    return state.world.areas.has(key);
};

export const isAreaUnlocked = (state: GameState, x: number, y: number): boolean => {
    const area = getArea(state, x, y);
    return area ? area.unlocked : false;
};

// ================================
// Debug Selectors
// ================================

export const getStateSize = (state: GameState): number => {
    return JSON.stringify(state).length;
};

export const getStateSummary = (state: GameState): Record<string, unknown> => ({
    coins: getCoins(state),
    selectedTool: getSelectedTool(state),
    camera: getCamera(state),
    stats: getGameStats(state),
    size: getStateSize(state),
});
