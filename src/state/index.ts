/**
 * State module exports
 * Provides centralized state management for the farming game
 */

export type { GameState } from './GameState';
export { createInitialGameState, StateValidator, StateTransformer } from './GameState';
export { StateManager } from './StateManager';
export * as selectors from './selectors';

// Export global state manager and convenience functions
export * from './globalState';

// Re-export common selector functions for convenience
export {
    getCoins,
    canAffordAmount,
    getSelectedTool,
    getCamera,
    getTile,
    getArea,
    getGameStats,
} from './selectors';
