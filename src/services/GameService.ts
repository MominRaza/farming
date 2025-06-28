import { getStateManager } from '../state/globalState';
import { eventBus, GameEvents } from '../events/GameEvents';
import { initializeAreaSystem, areaMap } from '../core/area';
import { growthSystem } from '../core/growthSystem';
import { initializeCameraPosition } from '../core/state';
import { isCropMature } from '../core/tile';

/**
 * GameService - Main game logic coordinator
 * 
 * Responsibilities:
 * - Game initialization and setup
 * - Game loop management
 * - High-level game state coordination
 * - Integration between different systems
 */
export class GameService {
    private isInitialized = false;
    private gameLoopId: number | null = null;

    constructor() {
        this.setupEventListeners();
    }

    /**
     * Initialize the game system
     */
    public async initialize(canvasWidth: number, canvasHeight: number): Promise<void> {
        if (this.isInitialized) {
            console.warn('GameService already initialized');
            return;
        }

        console.log('Initializing GameService...');

        try {
            // Initialize camera position
            initializeCameraPosition(canvasWidth, canvasHeight);

            // Initialize area system if no areas exist
            if (areaMap.size === 0) {
                console.log('No areas found, initializing default area system');
                initializeAreaSystem();
            }

            // Update state manager with current maps
            const stateManager = getStateManager();
            stateManager.setAreasMap(areaMap);

            this.isInitialized = true;

            // Emit game initialized event
            GameEvents.emitGameInitialized();

            console.log('GameService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize GameService:', error);
            throw error;
        }
    }

    /**
     * Start the game loop
     */
    public startGameLoop(): void {
        if (this.gameLoopId !== null) {
            console.warn('Game loop already running');
            return;
        }

        console.log('Starting game loop...');
        this.gameLoop();
    }

    /**
     * Stop the game loop
     */
    public stopGameLoop(): void {
        if (this.gameLoopId !== null) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
            console.log('Game loop stopped');
        }
    }

    /**
     * Main game loop
     */
    private gameLoop = (): void => {
        // Update game systems
        this.update();

        // Schedule next frame
        this.gameLoopId = requestAnimationFrame(this.gameLoop);
    };

    /**
     * Update game systems
     */
    private update(): void {
        // Update crop growth system
        if (growthSystem.shouldUpdate()) {
            growthSystem.updateAllCrops();
            // Request view refresh for updated progress bars
            GameEvents.emitViewRefresh('Growth system updated crops');
        }

        // Future: Add other system updates here that may need deltaTime
        // - Weather system updates
        // - Animal system updates  
        // - Market price fluctuations
        // etc.
    }

    /**
     * Reset the game to initial state
     */
    public resetGame(): void {
        console.log('Resetting game state...');

        // Stop game loop during reset
        const wasRunning = this.gameLoopId !== null;
        this.stopGameLoop();

        try {
            // Reset state manager
            const stateManager = getStateManager();
            stateManager.resetState();

            // Reinitialize area system
            initializeAreaSystem();
            stateManager.setAreasMap(areaMap);

            // Emit game reset event
            GameEvents.emitGameReset();

            console.log('Game reset completed');

            // Restart game loop if it was running
            if (wasRunning) {
                this.startGameLoop();
            }
        } catch (error) {
            console.error('Failed to reset game:', error);
            throw error;
        }
    }

    /**
     * Get current game statistics
     */
    public getGameStats(): {
        coins: number;
        unlockedAreas: number;
        totalTiles: number;
        plantsGrowing: number;
    } {
        const stateManager = getStateManager();
        const gameState = stateManager.getState();

        // Count unlocked areas
        const unlockedAreas = Array.from(areaMap.values()).filter(area => area.unlocked).length;

        // Count tiles and growing plants
        const tileMap = stateManager.getTilesMap();
        const totalTiles = tileMap.size;
        const plantsGrowing = Array.from(tileMap.entries()).filter(([key, tile]) => {
            if (!tile.crop) return false;
            const [x, y] = key.split(',').map(Number);
            return !isCropMature(x, y);
        }).length;

        return {
            coins: gameState.economy.coins,
            unlockedAreas,
            totalTiles,
            plantsGrowing
        };
    }

    /**
     * Check if the game is properly initialized
     */
    public isGameInitialized(): boolean {
        return this.isInitialized;
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners(): void {
        // Listen for save/load events to refresh the game state
        eventBus.on('save:load', (event) => {
            if (event.success) {
                // Reinitialize game after loading
                this.handleGameStateReload();
            }
        });

        // Listen for save deletion to reset the game
        eventBus.on('save:deleted', (event) => {
            if (event.success) {
                this.resetGame();
            }
        });

        // Listen for area unlock events to update state
        eventBus.on('area:unlocked', () => {
            const stateManager = getStateManager();
            stateManager.setAreasMap(areaMap);
            GameEvents.emitViewRefresh('Area unlocked');
        });
    }

    /**
     * Handle game state reload after save/load operations
     */
    private handleGameStateReload(): void {
        console.log('Handling game state reload...');

        try {
            const stateManager = getStateManager();

            // Update state manager with current maps
            stateManager.setAreasMap(areaMap);

            // Initialize camera if needed
            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            if (canvas) {
                initializeCameraPosition(canvas.width, canvas.height);
            }

            // Request view refresh
            GameEvents.emitViewRefresh('Game state reloaded');

            console.log('Game state reload completed');
        } catch (error) {
            console.error('Failed to handle game state reload:', error);
        }
    }

    /**
     * Cleanup resources
     */
    public destroy(): void {
        this.stopGameLoop();
        // Remove event listeners if needed
        this.isInitialized = false;
        console.log('GameService destroyed');
    }
}

// Export singleton instance
export const gameService = new GameService();
