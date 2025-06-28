import {
    legacyState,
    canAffordLegacy,
    spendCoinsLegacy,
    earnCoinsLegacy,
    resetGameStateLegacy,
    calculateInitialCameraPosition,
    initializeCameraPosition
} from '../state/globalState';

// Re-export the legacy state object for backward compatibility
export const state = legacyState;

// Re-export legacy functions for backward compatibility
export const canAfford = canAffordLegacy;
export const spendCoins = spendCoinsLegacy;
export const earnCoins = earnCoinsLegacy;
export const resetGameState = resetGameStateLegacy;

// Re-export camera functions
export { calculateInitialCameraPosition, initializeCameraPosition };
