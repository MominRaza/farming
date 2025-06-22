import { state, resetGameState } from './state';
import { tileMap, type TileData } from './tile';
import { areaMap, type Area } from './area';

// Define the save data structure
export interface SaveData {
    version: string;
    timestamp: number;
    gameState: {
        offsetX: number;
        offsetY: number;
        scale: number;
        selectedTool: string | null;
        coins: number;
    };
    tiles: Array<{
        x: number;
        y: number;
        data: TileData;
    }>;
    areas: Array<{
        x: number;
        y: number;
        data: Area;
    }>;
}

// Current save format version
const SAVE_VERSION = '1.0.0';

// Local storage key for save data
const SAVE_KEY = 'farming-game-save';



/**
 * Create save data from current game state
 */
export function createSaveData(): SaveData {
    // Convert tile map to serializable format
    const tiles = Array.from(tileMap.entries()).map(([key, data]) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y, data };
    });

    // Convert area map to serializable format
    const areas = Array.from(areaMap.entries()).map(([key, data]) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y, data };
    });

    return {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        gameState: {
            offsetX: state.offsetX,
            offsetY: state.offsetY,
            scale: state.scale,
            selectedTool: state.selectedTool,
            coins: state.coins,
        },
        tiles,
        areas,
    };
}

/**
 * Save game data to localStorage
 */
export function saveGame(): boolean {
    try {
        const saveData = createSaveData();
        const serialized = JSON.stringify(saveData, null, 2);
        localStorage.setItem(SAVE_KEY, serialized);
        console.log('Game saved successfully!', saveData);
        return true;
    } catch (error) {
        console.error('Failed to save game:', error);
        return false;
    }
}

/**
 * Load game data from localStorage
 */
export function loadGame(): boolean {
    try {
        const serialized = localStorage.getItem(SAVE_KEY);
        if (!serialized) {
            console.log('No save data found');
            return false;
        }

        const saveData: SaveData = JSON.parse(serialized);

        // Version check (for future compatibility)
        if (saveData.version !== SAVE_VERSION) {
            console.warn(`Save data version mismatch. Expected ${SAVE_VERSION}, got ${saveData.version}`);
            // Could implement migration logic here in the future
        }

        // Restore game state
        state.offsetX = saveData.gameState.offsetX;
        state.offsetY = saveData.gameState.offsetY;
        state.scale = saveData.gameState.scale;
        state.selectedTool = saveData.gameState.selectedTool as any;
        state.coins = saveData.gameState.coins;

        // Clear existing maps
        tileMap.clear();
        areaMap.clear();

        // Restore tiles
        saveData.tiles.forEach(({ x, y, data }) => {
            const key = `${x},${y}`;
            tileMap.set(key, data);
        });

        // Restore areas
        saveData.areas.forEach(({ x, y, data }) => {
            const key = `${x},${y}`;
            areaMap.set(key, data);
        });

        console.log('Game loaded successfully!', saveData);
        return true;
    } catch (error) {
        console.error('Failed to load game:', error);
        return false;
    }
}

/**
 * Check if save data exists
 */
export function hasSaveData(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Delete save data
 */
export function deleteSaveData(): boolean {
    try {
        localStorage.removeItem(SAVE_KEY);

        // Clear all in-memory data
        resetGameState();
        tileMap.clear();
        areaMap.clear();

        console.log('Save data deleted and game state reset');
        return true;
    } catch (error) {
        console.error('Failed to delete save data:', error);
        return false;
    }
}

/**
 * Get save data info without loading it
 */
export function getSaveInfo(): { timestamp: number; version: string } | null {
    try {
        const serialized = localStorage.getItem(SAVE_KEY);
        if (!serialized) return null;

        const saveData: SaveData = JSON.parse(serialized);
        return {
            timestamp: saveData.timestamp,
            version: saveData.version,
        };
    } catch (error) {
        console.error('Failed to get save info:', error);
        return null;
    }
}

/**
 * Auto-save functionality
 */
let autoSaveInterval: number | null = null;

export function startAutoSave(intervalMs: number = 30000): void {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }

    autoSaveInterval = window.setInterval(() => {
        saveGame();
    }, intervalMs);

    console.log(`Auto-save started with ${intervalMs}ms interval`);
}

export function stopAutoSave(): void {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
        console.log('Auto-save stopped');
    }
}

/**
 * Export save data as downloadable file
 */
export function exportSaveData(): void {
    try {
        const saveData = createSaveData();
        const serialized = JSON.stringify(saveData, null, 2);
        const blob = new Blob([serialized], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `farming-game-save-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Save data exported');
    } catch (error) {
        console.error('Failed to export save data:', error);
    }
}

/**
 * Import save data from file
 */
export function importSaveData(file: File): Promise<boolean> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const saveData: SaveData = JSON.parse(content);

                // Store the imported data
                localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

                // Load the imported data
                const success = loadGame();
                resolve(success);
            } catch (error) {
                console.error('Failed to import save data:', error);
                resolve(false);
            }
        };
        reader.onerror = () => {
            console.error('Failed to read file');
            resolve(false);
        };
        reader.readAsText(file);
    });
}
