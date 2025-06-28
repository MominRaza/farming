import type { GameState } from './GameState';
import { createInitialGameState, StateValidator, StateTransformer } from './GameState';
import { EventBus } from '../events/EventBus';
import { GameEvents } from '../events/GameEvents';
import type { ToolId } from '../types';

/**
 * Centralized state manager for the farming game
 * Handles all state mutations and ensures data consistency
 */
export class StateManager {
    private _state: GameState;

    constructor(_eventBus: EventBus, initialState?: GameState) {
        this._state = initialState || createInitialGameState();

        // Validate initial state
        if (!StateValidator.isValidGameState(this._state)) {
            console.warn('Invalid initial state provided, creating fresh state');
            this._state = createInitialGameState();
        }
    }

    /**
     * Get the current game state (immutable copy)
     */
    getState(): Readonly<GameState> {
        return this._state;
    }

    /**
     * Apply a state update with validation and events
     */
    private updateState(updater: (state: GameState) => GameState, eventEmitter?: () => void): void {
        const previousState = this._state;
        const newState = updater(StateTransformer.cloneState(previousState));

        // Validate the new state
        if (!StateValidator.isValidGameState(newState)) {
            console.error('State update would result in invalid state, rejecting update');
            return;
        }

        this._state = newState;

        // Emit events if provided
        if (eventEmitter) {
            eventEmitter();
        }
    }

    // ================================
    // UI State Management
    // ================================

    /**
     * Update camera position and scale
     */
    updateCamera(offsetX?: number, offsetY?: number, scale?: number): void {
        this.updateState(state => {
            if (offsetX !== undefined && StateValidator.validateOffset(offsetX)) {
                state.ui.offsetX = offsetX;
            }
            if (offsetY !== undefined && StateValidator.validateOffset(offsetY)) {
                state.ui.offsetY = offsetY;
            }
            if (scale !== undefined && StateValidator.validateScale(scale)) {
                state.ui.scale = scale;
            }
            return state;
        });
    }

    /**
     * Update mouse/drag state
     */
    updateMouseState(
        isDragging?: boolean,
        lastMouseX?: number,
        lastMouseY?: number,
        tileX?: number,
        tileY?: number
    ): void {
        this.updateState(state => {
            if (isDragging !== undefined) state.ui.isDragging = isDragging;
            if (lastMouseX !== undefined) state.ui.lastMouseX = lastMouseX;
            if (lastMouseY !== undefined) state.ui.lastMouseY = lastMouseY;
            if (tileX !== undefined) state.ui.tileX = tileX;
            if (tileY !== undefined) state.ui.tileY = tileY;
            return state;
        });
    }

    /**
     * Update selected tool
     */
    updateSelectedTool(toolId: ToolId | null): void {
        const previousTool = this._state.ui.selectedTool;

        this.updateState(
            state => {
                state.ui.selectedTool = toolId;
                return state;
            },
            () => {
                GameEvents.emitToolSelected(previousTool, toolId);
            }
        );
    }

    // ================================
    // Economy State Management
    // ================================

    /**
     * Check if player can afford a cost
     */
    canAfford(cost: number): boolean {
        return StateValidator.validateCoins(cost) && this._state.economy.coins >= cost;
    }

    /**
     * Spend coins if available
     */
    spendCoins(cost: number, reason = 'purchase'): boolean {
        if (!this.canAfford(cost)) {
            return false;
        }

        const previousCoins = this._state.economy.coins;

        this.updateState(
            state => {
                state.economy.coins -= cost;
                return state;
            },
            () => {
                GameEvents.emitCoinsChanged(previousCoins, this._state.economy.coins, `spent on ${reason} (${cost} coins)`);
            }
        );

        return true;
    }

    /**
     * Earn coins
     */
    earnCoins(amount: number, reason = 'sale'): void {
        if (!StateValidator.validateCoins(amount) || amount <= 0) {
            console.warn('Invalid coin amount for earning:', amount);
            return;
        }

        const previousCoins = this._state.economy.coins;

        this.updateState(
            state => {
                state.economy.coins += amount;
                return state;
            },
            () => {
                GameEvents.emitCoinsChanged(previousCoins, this._state.economy.coins, `earned from ${reason} (+${amount} coins)`);
            }
        );
    }

    /**
     * Set coins directly (for loading saved games)
     */
    setCoins(amount: number): void {
        if (!StateValidator.validateCoins(amount)) {
            console.warn('Invalid coin amount:', amount);
            return;
        }

        this.updateState(state => {
            state.economy.coins = amount;
            return state;
        });
    }

    // ================================
    // World State Management
    // ================================

    /**
     * Get tiles map reference (for direct access)
     */
    getTilesMap(): Map<string, import('../core/tile').TileData> {
        return this._state.world.tiles;
    }

    /**
     * Get areas map reference (for direct access)
     */
    getAreasMap(): Map<string, import('../core/area').Area> {
        return this._state.world.areas;
    }

    /**
     * Replace the entire tiles map (for save/load)
     */
    setTilesMap(tilesMap: Map<string, import('../core/tile').TileData>): void {
        this.updateState(state => {
            state.world.tiles = new Map(tilesMap);
            return state;
        });
    }

    /**
     * Replace the entire areas map (for save/load)
     */
    setAreasMap(areasMap: Map<string, import('../core/area').Area>): void {
        this.updateState(state => {
            state.world.areas = new Map(areasMap);
            return state;
        });
    }

    // ================================
    // Meta State Management
    // ================================

    /**
     * Update last save time
     */
    updateLastSaveTime(): void {
        this.updateState(state => {
            state.meta.lastSaveTime = Date.now();
            return state;
        });
    }

    /**
     * Get game duration in milliseconds
     */
    getGameDuration(): number {
        return Date.now() - this._state.meta.gameStartTime;
    }

    // ================================
    // State Reset and Serialization
    // ================================

    /**
     * Reset to initial state
     */
    resetState(): void {
        const newState = createInitialGameState();
        this._state = newState;

        // Emit state reset event
        GameEvents.emitGameReset();
    }

    /**
     * Load state from serialized data
     */
    loadState(serializedState: string): boolean {
        try {
            const parsedState = JSON.parse(serializedState);

            // Try to validate as new format first
            if (StateValidator.isValidGameState(parsedState)) {
                this._state = parsedState;
                return true;
            }

            // Fall back to legacy migration
            if (typeof parsedState === 'object' && parsedState !== null) {
                this._state = StateTransformer.migrateLegacyState(parsedState as Record<string, unknown>);
                console.log('Successfully migrated legacy state format');
                return true;
            }

            console.error('Unable to load state: invalid format');
            return false;

        } catch (error) {
            console.error('Failed to parse saved state:', error);
            return false;
        }
    }

    /**
     * Serialize current state for saving
     */
    serializeState(): string {
        try {
            // Create a serializable version of the state
            const serializableState = {
                ui: this._state.ui,
                economy: this._state.economy,
                world: {
                    tiles: Array.from(this._state.world.tiles.entries()),
                    areas: Array.from(this._state.world.areas.entries()),
                },
                meta: this._state.meta,
            };

            return JSON.stringify(serializableState);
        } catch (error) {
            console.error('Failed to serialize state:', error);
            throw error;
        }
    }

    // ================================
    // Debug and Development
    // ================================

    /**
     * Get state summary for debugging
     */
    getStateSummary(): string {
        const state = this._state;
        return `State Summary:
- Coins: ${state.economy.coins}
- Camera: (${state.ui.offsetX.toFixed(1)}, ${state.ui.offsetY.toFixed(1)}) scale: ${state.ui.scale.toFixed(2)}
- Selected Tool: ${state.ui.selectedTool || 'none'}
- Tiles: ${state.world.tiles.size}
- Areas: ${state.world.areas.size}
- Game Duration: ${Math.round(this.getGameDuration() / 1000)}s`;
    }

    /**
     * Validate current state (for debugging)
     */
    validateCurrentState(): boolean {
        const isValid = StateValidator.isValidGameState(this._state);
        if (!isValid) {
            console.error('Current state is invalid!', this._state);
        }
        return isValid;
    }
}
