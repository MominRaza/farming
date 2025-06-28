// Helper functions for creating and emitting common game events

import { eventBus } from './EventBus';
import type {
    TileClickedEvent,
    TileChangedEvent,
    TileHoveredEvent,
    CropPlantedEvent,
    CropHarvestedEvent,
    CropGrownEvent,
    CropWateredEvent,
    CropFertilizedEvent,
    CoinsChangedEvent,
    PurchaseAttemptedEvent,
    AreaUnlockedEvent,
    ToolSelectedEvent,
    ToolUsedEvent,
    NotificationEvent,
    TooltipEvent,
    SaveGameEvent,
    LoadGameEvent,
    SaveDeletedEvent,
    MouseMoveEvent,
    KeyPressedEvent,
    CameraChangedEvent,
    ViewRefreshEvent,
    GameInitializedEvent,
    GameResetEvent
} from './EventTypes';
import type { ToolId } from '../types';

/**
 * Helper class for creating and emitting game events
 * Provides convenient methods to emit common events without manual event creation
 */
export class GameEvents {

    // Game lifecycle events
    static emitGameInitialized(): void {
        const event: GameInitializedEvent = {
            type: 'game:initialized',
            timestamp: Date.now()
        };
        eventBus.emit(event);
    }

    static emitGameReset(): void {
        const event: GameResetEvent = {
            type: 'game:reset',
            timestamp: Date.now()
        };
        eventBus.emit(event);
    }

    // Tile events
    static emitTileClicked(tileX: number, tileY: number, tool: ToolId | null): void {
        const event: TileClickedEvent = {
            type: 'tile:clicked',
            timestamp: Date.now(),
            tileX,
            tileY,
            tool
        };
        eventBus.emit(event);
    }

    static emitTileChanged(tileX: number, tileY: number, newType?: string, oldType?: string): void {
        const event: TileChangedEvent = {
            type: 'tile:changed',
            timestamp: Date.now(),
            tileX,
            tileY,
            newType,
            oldType
        };
        eventBus.emit(event);
    }

    static emitTileHovered(tileX: number, tileY: number): void {
        const event: TileHoveredEvent = {
            type: 'tile:hovered',
            timestamp: Date.now(),
            tileX,
            tileY
        };
        eventBus.emit(event);
    }

    // Crop events
    static emitCropPlanted(tileX: number, tileY: number, cropType: ToolId): void {
        const event: CropPlantedEvent = {
            type: 'crop:planted',
            timestamp: Date.now(),
            tileX,
            tileY,
            cropType
        };
        eventBus.emit(event);
    }

    static emitCropHarvested(tileX: number, tileY: number, cropType: ToolId, reward: number): void {
        const event: CropHarvestedEvent = {
            type: 'crop:harvested',
            timestamp: Date.now(),
            tileX,
            tileY,
            cropType,
            reward
        };
        eventBus.emit(event);
    }

    static emitCropGrown(tileX: number, tileY: number, newStage: number, maxStages: number): void {
        const event: CropGrownEvent = {
            type: 'crop:grown',
            timestamp: Date.now(),
            tileX,
            tileY,
            newStage,
            maxStages
        };
        eventBus.emit(event);
    }

    static emitCropWatered(tileX: number, tileY: number): void {
        const event: CropWateredEvent = {
            type: 'crop:watered',
            timestamp: Date.now(),
            tileX,
            tileY
        };
        eventBus.emit(event);
    }

    static emitCropFertilized(tileX: number, tileY: number): void {
        const event: CropFertilizedEvent = {
            type: 'crop:fertilized',
            timestamp: Date.now(),
            tileX,
            tileY
        };
        eventBus.emit(event);
    }

    // Economy events
    static emitCoinsChanged(oldAmount: number, newAmount: number, reason: string): void {
        const event: CoinsChangedEvent = {
            type: 'economy:coins-changed',
            timestamp: Date.now(),
            oldAmount,
            newAmount,
            change: newAmount - oldAmount,
            reason
        };
        eventBus.emit(event);
    }

    static emitPurchaseAttempted(item: string, cost: number, success: boolean): void {
        const event: PurchaseAttemptedEvent = {
            type: 'economy:purchase-attempted',
            timestamp: Date.now(),
            item,
            cost,
            success
        };
        eventBus.emit(event);
    }

    // Area events
    static emitAreaUnlocked(areaX: number, areaY: number, cost: number): void {
        const event: AreaUnlockedEvent = {
            type: 'area:unlocked',
            timestamp: Date.now(),
            areaX,
            areaY,
            cost
        };
        eventBus.emit(event);
    }

    // Tool events
    static emitToolSelected(toolId: ToolId | null, previousTool: ToolId | null): void {
        const event: ToolSelectedEvent = {
            type: 'tool:selected',
            timestamp: Date.now(),
            toolId,
            previousTool
        };
        eventBus.emit(event);
    }

    static emitToolUsed(toolId: ToolId, tileX: number, tileY: number, success: boolean): void {
        const event: ToolUsedEvent = {
            type: 'tool:used',
            timestamp: Date.now(),
            toolId,
            tileX,
            tileY,
            success
        };
        eventBus.emit(event);
    }

    // UI events
    static emitNotification(message: string, notificationType: 'success' | 'error' | 'warning' | 'info', duration?: number): void {
        const event: NotificationEvent = {
            type: 'ui:notification',
            timestamp: Date.now(),
            message,
            notificationType,
            duration
        };
        eventBus.emit(event);
    }

    static emitShowTooltip(content: string, x: number, y: number): void {
        const event: TooltipEvent = {
            type: 'ui:tooltip',
            timestamp: Date.now(),
            action: 'show',
            content,
            x,
            y
        };
        eventBus.emit(event);
    }

    static emitHideTooltip(): void {
        const event: TooltipEvent = {
            type: 'ui:tooltip',
            timestamp: Date.now(),
            action: 'hide'
        };
        eventBus.emit(event);
    }

    // Save/Load events
    static emitSaveGame(success: boolean): void {
        const event: SaveGameEvent = {
            type: 'save:game',
            timestamp: Date.now(),
            success
        };
        eventBus.emit(event);
    }

    static emitLoadGame(success: boolean): void {
        const event: LoadGameEvent = {
            type: 'save:load',
            timestamp: Date.now(),
            success
        };
        eventBus.emit(event);
    }

    static emitSaveDeleted(success: boolean): void {
        const event: SaveDeletedEvent = {
            type: 'save:deleted',
            timestamp: Date.now(),
            success
        };
        eventBus.emit(event);
    }

    // Input events
    static emitMouseMove(screenX: number, screenY: number, tileX: number, tileY: number): void {
        const event: MouseMoveEvent = {
            type: 'input:mouse-move',
            timestamp: Date.now(),
            screenX,
            screenY,
            tileX,
            tileY
        };
        eventBus.emit(event);
    }

    static emitKeyPressed(key: string, ctrlKey: boolean, altKey: boolean, shiftKey: boolean): void {
        const event: KeyPressedEvent = {
            type: 'input:key-pressed',
            timestamp: Date.now(),
            key,
            ctrlKey,
            altKey,
            shiftKey
        };
        eventBus.emit(event);
    }

    // Camera events
    static emitCameraChanged(offsetX: number, offsetY: number, scale: number): void {
        const event: CameraChangedEvent = {
            type: 'camera:changed',
            timestamp: Date.now(),
            offsetX,
            offsetY,
            scale
        };
        eventBus.emit(event);
    }

    // View events
    static emitViewRefresh(reason: string): void {
        const event: ViewRefreshEvent = {
            type: 'view:refresh',
            timestamp: Date.now(),
            reason
        };
        eventBus.emit(event);
    }
}

// Convenience export for direct event bus access
export { eventBus };
