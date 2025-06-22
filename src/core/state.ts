import type { ToolId } from '../types';

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
