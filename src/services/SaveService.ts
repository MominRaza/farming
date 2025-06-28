import { eventBus, GameEvents } from '../events/GameEvents';
import { getStateManager } from '../state/globalState';
import {
    saveGame as coreeSaveGame,
    loadGame as coreLoadGame,
    deleteSaveData as coreDeleteSaveData,
    hasSaveData as coreHasSaveData,
    getSaveInfo as coreGetSaveInfo,
    exportSaveData as coreExportSaveData,
    importSaveData as coreImportSaveData,
    startAutoSave as coreStartAutoSave,
    stopAutoSave as coreStopAutoSave,
    createSaveData,
    type SaveData
} from '../core/saveSystem';

/**
 * SaveService - Save/load operations service
 * 
 * Responsibilities:
 * - Manage save/load operations with proper state coordination
 * - Handle auto-save functionality
 * - Provide save data validation and migration
 * - Coordinate save events with other systems
 */
export class SaveService {
    private autoSaveEnabled = false;
    private autoSaveInterval = 30000; // 30 seconds default
    private lastSaveTime = 0;

    constructor() {
        this.setupEventListeners();
    }

    /**
     * Save the current game state
     */
    public async saveGame(): Promise<boolean> {
        try {
            console.log('SaveService: Saving game...');

            const success = coreeSaveGame();

            if (success) {
                this.lastSaveTime = Date.now();
                console.log('SaveService: Game saved successfully');

                // Emit save success event
                GameEvents.emitSaveGame(true);
                GameEvents.emitNotification('Game saved successfully!', 'success', 3000);
            } else {
                console.error('SaveService: Failed to save game');
                GameEvents.emitSaveGame(false);
                GameEvents.emitNotification('Failed to save game', 'error', 3000);
            }

            return success;
        } catch (error) {
            console.error('SaveService: Error during save operation:', error);
            GameEvents.emitSaveGame(false);
            GameEvents.emitNotification('Error saving game', 'error', 3000);
            return false;
        }
    }

    /**
     * Load game state from storage
     */
    public async loadGame(): Promise<boolean> {
        try {
            console.log('SaveService: Loading game...');

            const success = coreLoadGame();

            if (success) {
                console.log('SaveService: Game loaded successfully');

                // Emit load success event
                GameEvents.emitLoadGame(true);
                GameEvents.emitNotification('Game loaded successfully!', 'success', 3000);
            } else {
                console.error('SaveService: Failed to load game');
                GameEvents.emitLoadGame(false);
                GameEvents.emitNotification('Failed to load game', 'error', 3000);
            }

            return success;
        } catch (error) {
            console.error('SaveService: Error during load operation:', error);
            GameEvents.emitLoadGame(false);
            GameEvents.emitNotification('Error loading game', 'error', 3000);
            return false;
        }
    }

    /**
     * Delete save data and reset game
     */
    public async deleteSaveData(): Promise<boolean> {
        try {
            console.log('SaveService: Deleting save data...');

            const success = coreDeleteSaveData();

            if (success) {
                console.log('SaveService: Save data deleted successfully');

                // Emit delete success event
                GameEvents.emitSaveDeleted(true);
                GameEvents.emitNotification('Save data deleted successfully!', 'info', 3000);
            } else {
                console.error('SaveService: Failed to delete save data');
                GameEvents.emitSaveDeleted(false);
                GameEvents.emitNotification('Failed to delete save data', 'error', 3000);
            }

            return success;
        } catch (error) {
            console.error('SaveService: Error during delete operation:', error);
            GameEvents.emitSaveDeleted(false);
            GameEvents.emitNotification('Error deleting save data', 'error', 3000);
            return false;
        }
    }

    /**
     * Check if save data exists
     */
    public hasSaveData(): boolean {
        return coreHasSaveData();
    }

    /**
     * Get save data information
     */
    public getSaveInfo(): { timestamp: number; version: string } | null {
        return coreGetSaveInfo();
    }

    /**
     * Get formatted save information
     */
    public getFormattedSaveInfo(): string | null {
        const saveInfo = this.getSaveInfo();
        if (!saveInfo) {
            return null;
        }

        const date = new Date(saveInfo.timestamp);
        return `Save from ${date.toLocaleDateString()} at ${date.toLocaleTimeString()} (Version ${saveInfo.version})`;
    }

    /**
     * Export save data as downloadable file
     */
    public exportSaveData(): void {
        try {
            coreExportSaveData();
            GameEvents.emitNotification('Save data exported successfully!', 'success', 3000);
        } catch (error) {
            console.error('SaveService: Error exporting save data:', error);
            GameEvents.emitNotification('Failed to export save data', 'error', 3000);
        }
    }

    /**
     * Import save data from file
     */
    public async importSaveData(file: File): Promise<boolean> {
        try {
            console.log('SaveService: Importing save data...');

            const success = await coreImportSaveData(file);

            if (success) {
                console.log('SaveService: Save data imported successfully');
                GameEvents.emitLoadGame(true);
                GameEvents.emitNotification('Save data imported successfully!', 'success', 3000);
            } else {
                console.error('SaveService: Failed to import save data');
                GameEvents.emitNotification('Failed to import save data', 'error', 3000);
            }

            return success;
        } catch (error) {
            console.error('SaveService: Error importing save data:', error);
            GameEvents.emitNotification('Error importing save data', 'error', 3000);
            return false;
        }
    }

    /**
     * Start auto-save functionality
     */
    public startAutoSave(intervalMs: number = 30000): void {
        this.autoSaveInterval = intervalMs;
        this.autoSaveEnabled = true;

        coreStartAutoSave(intervalMs);

        console.log(`SaveService: Auto-save started with ${intervalMs}ms interval`);
        GameEvents.emitNotification(`Auto-save enabled (every ${Math.round(intervalMs / 1000)}s)`, 'info', 3000);
    }

    /**
     * Stop auto-save functionality
     */
    public stopAutoSave(): void {
        this.autoSaveEnabled = false;

        coreStopAutoSave();

        console.log('SaveService: Auto-save stopped');
        GameEvents.emitNotification('Auto-save disabled', 'info', 3000);
    }

    /**
     * Check if auto-save is enabled
     */
    public isAutoSaveEnabled(): boolean {
        return this.autoSaveEnabled;
    }

    /**
     * Get auto-save interval
     */
    public getAutoSaveInterval(): number {
        return this.autoSaveInterval;
    }

    /**
     * Get time since last save
     */
    public getTimeSinceLastSave(): number {
        return Date.now() - this.lastSaveTime;
    }

    /**
     * Get save statistics
     */
    public getSaveStats(): {
        hasSave: boolean;
        autoSaveEnabled: boolean;
        autoSaveInterval: number;
        timeSinceLastSave: number;
        saveInfo: { timestamp: number; version: string } | null;
    } {
        return {
            hasSave: this.hasSaveData(),
            autoSaveEnabled: this.autoSaveEnabled,
            autoSaveInterval: this.autoSaveInterval,
            timeSinceLastSave: this.getTimeSinceLastSave(),
            saveInfo: this.getSaveInfo()
        };
    }

    /**
     * Create save data preview (for debugging)
     */
    public createSaveDataPreview(): SaveData {
        return createSaveData();
    }

    /**
     * Validate save data integrity
     */
    public validateSaveData(): {
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
            const stateManager = getStateManager();
            const currentState = stateManager.getState();

            // Validate state structure
            if (typeof currentState.economy.coins !== 'number') {
                result.errors.push('Invalid coins value');
                result.isValid = false;
            }

            if (currentState.economy.coins < 0) {
                result.warnings.push('Negative coins detected');
            }

            // Validate maps
            const tilesMap = stateManager.getTilesMap();
            const areasMap = stateManager.getAreasMap();

            if (!tilesMap || !areasMap) {
                result.errors.push('Missing game maps');
                result.isValid = false;
            }

            // Add more validation rules as needed

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
        // Listen for manual save requests
        eventBus.on('save:game', async (event) => {
            if (!event.success) {
                // This might be a request to save, not a completed save
                await this.saveGame();
            }
        });

        // Listen for state changes that might trigger auto-validation
        eventBus.on('economy:coins-changed', () => {
            // Could validate state after significant changes
        });

        eventBus.on('area:unlocked', () => {
            // State changed, could trigger validation
        });
    }

    /**
     * Cleanup resources
     */
    public destroy(): void {
        this.stopAutoSave();
        console.log('SaveService destroyed');
    }
}

// Export singleton instance
export const saveService = new SaveService();
