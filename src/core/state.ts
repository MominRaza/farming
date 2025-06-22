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
