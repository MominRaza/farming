// Event interfaces and types for the farming game

import type { ToolId } from '../types';

// Base event interface
export interface GameEvent {
    type: string;
    timestamp: number;
}

// Game state events
export interface GameInitializedEvent extends GameEvent {
    type: 'game:initialized';
}

export interface GameResetEvent extends GameEvent {
    type: 'game:reset';
}

// Tile-related events
export interface TileClickedEvent extends GameEvent {
    type: 'tile:clicked';
    tileX: number;
    tileY: number;
    tool: ToolId | null;
}

export interface TileChangedEvent extends GameEvent {
    type: 'tile:changed';
    tileX: number;
    tileY: number;
    newType?: string;
    oldType?: string;
}

export interface TileHoveredEvent extends GameEvent {
    type: 'tile:hovered';
    tileX: number;
    tileY: number;
}

// Crop-related events
export interface CropPlantedEvent extends GameEvent {
    type: 'crop:planted';
    tileX: number;
    tileY: number;
    cropType: ToolId;
}

export interface CropHarvestedEvent extends GameEvent {
    type: 'crop:harvested';
    tileX: number;
    tileY: number;
    cropType: ToolId;
    reward: number;
}

export interface CropGrownEvent extends GameEvent {
    type: 'crop:grown';
    tileX: number;
    tileY: number;
    newStage: number;
    maxStages: number;
}

export interface CropWateredEvent extends GameEvent {
    type: 'crop:watered';
    tileX: number;
    tileY: number;
}

export interface CropFertilizedEvent extends GameEvent {
    type: 'crop:fertilized';
    tileX: number;
    tileY: number;
}

// Economy events
export interface CoinsChangedEvent extends GameEvent {
    type: 'economy:coins-changed';
    oldAmount: number;
    newAmount: number;
    change: number;
    reason: string;
}

export interface PurchaseAttemptedEvent extends GameEvent {
    type: 'economy:purchase-attempted';
    item: string;
    cost: number;
    success: boolean;
}

// Area events
export interface AreaUnlockedEvent extends GameEvent {
    type: 'area:unlocked';
    areaX: number;
    areaY: number;
    cost: number;
}

export interface AreaHoveredEvent extends GameEvent {
    type: 'area:hovered';
    areaX: number;
    areaY: number;
    isLocked: boolean;
}

// Tool events
export interface ToolSelectedEvent extends GameEvent {
    type: 'tool:selected';
    toolId: ToolId | null;
    previousTool: ToolId | null;
}

export interface ToolUsedEvent extends GameEvent {
    type: 'tool:used';
    toolId: ToolId;
    tileX: number;
    tileY: number;
    success: boolean;
}

// UI events
export interface UIStateChangedEvent extends GameEvent {
    type: 'ui:state-changed';
    component: string;
    newState: Record<string, unknown>;
}

export interface NotificationEvent extends GameEvent {
    type: 'ui:notification';
    message: string;
    notificationType: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export interface TooltipEvent extends GameEvent {
    type: 'ui:tooltip';
    action: 'show' | 'hide';
    content?: string;
    x?: number;
    y?: number;
}

// Save/Load events
export interface SaveGameEvent extends GameEvent {
    type: 'save:game';
    success: boolean;
}

export interface LoadGameEvent extends GameEvent {
    type: 'save:load';
    success: boolean;
}

export interface SaveDeletedEvent extends GameEvent {
    type: 'save:deleted';
    success: boolean;
}

// Input events
export interface MouseMoveEvent extends GameEvent {
    type: 'input:mouse-move';
    screenX: number;
    screenY: number;
    tileX: number;
    tileY: number;
}

export interface KeyPressedEvent extends GameEvent {
    type: 'input:key-pressed';
    key: string;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
}

// Camera/View events
export interface CameraChangedEvent extends GameEvent {
    type: 'camera:changed';
    offsetX: number;
    offsetY: number;
    scale: number;
}

export interface ViewRefreshEvent extends GameEvent {
    type: 'view:refresh';
    reason: string;
}

// Union type of all possible events
export type AllGameEvents =
    | GameInitializedEvent
    | GameResetEvent
    | TileClickedEvent
    | TileChangedEvent
    | TileHoveredEvent
    | CropPlantedEvent
    | CropHarvestedEvent
    | CropGrownEvent
    | CropWateredEvent
    | CropFertilizedEvent
    | CoinsChangedEvent
    | PurchaseAttemptedEvent
    | AreaUnlockedEvent
    | AreaHoveredEvent
    | ToolSelectedEvent
    | ToolUsedEvent
    | UIStateChangedEvent
    | NotificationEvent
    | TooltipEvent
    | SaveGameEvent
    | LoadGameEvent
    | SaveDeletedEvent
    | MouseMoveEvent
    | KeyPressedEvent
    | CameraChangedEvent
    | ViewRefreshEvent;

// Event listener type
export type EventListener<T extends GameEvent = GameEvent> = (event: T) => void;

// Event listener map type for type safety
export type EventListenerMap = {
    [K in AllGameEvents['type']]: EventListener<Extract<AllGameEvents, { type: K }>>;
};
