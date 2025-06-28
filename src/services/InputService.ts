import { eventBus, GameEvents } from '../events/GameEvents';
import { getTileCoords } from '../utils/helpers';
import { state } from '../core/state';

/**
 * InputService - Input handling service
 * 
 * Responsibilities:
 * - Centralize all input handling (mouse, keyboard, touch)
 * - Translate raw input events to game actions
 * - Handle input state and context
 * - Provide input configuration and customization
 */
export class InputService {
    private canvas: HTMLCanvasElement | null = null;
    private isInputEnabled = true;
    private currentCursorPosition = { x: 0, y: 0 };
    private currentTilePosition = { x: 0, y: 0 };

    // Store bound listener functions for cleanup
    private boundListeners = {
        mouseDown: null as ((event: MouseEvent) => void) | null,
        mouseMove: null as ((event: MouseEvent) => void) | null,
        mouseUp: null as ((event: MouseEvent) => void) | null,
        contextMenu: null as ((event: MouseEvent) => void) | null,
        wheel: null as ((event: WheelEvent) => void) | null,
        keyDown: null as ((event: KeyboardEvent) => void) | null,
        keyUp: null as ((event: KeyboardEvent) => void) | null
    };

    // Input state tracking
    private mouseState = {
        isDown: false,
        button: -1,
        dragStart: { x: 0, y: 0 },
        isDragging: false
    };

    private keyState = {
        pressedKeys: new Set<string>(),
        ctrlKey: false,
        altKey: false,
        shiftKey: false
    };

    constructor() {
        this.setupEventListeners();
    }

    /**
     * Initialize input service with canvas
     */
    public initialize(canvas: HTMLCanvasElement): void {
        if (this.canvas) {
            this.removeCanvasListeners();
        }

        this.canvas = canvas;
        this.setupCanvasListeners();

        console.log('InputService initialized with canvas');
    }

    /**
     * Enable/disable input handling
     */
    public setInputEnabled(enabled: boolean): void {
        this.isInputEnabled = enabled;
        console.log(`InputService: Input ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Check if input is enabled
     */
    public isInputActive(): boolean {
        return this.isInputEnabled;
    }

    /**
     * Get current cursor position
     */
    public getCursorPosition(): { x: number; y: number } {
        return { ...this.currentCursorPosition };
    }

    /**
     * Get current tile position under cursor
     */
    public getCurrentTilePosition(): { x: number; y: number } {
        return { ...this.currentTilePosition };
    }

    /**
     * Get current mouse state
     */
    public getMouseState(): {
        isDown: boolean;
        button: number;
        isDragging: boolean;
        dragStart: { x: number; y: number };
    } {
        return {
            isDown: this.mouseState.isDown,
            button: this.mouseState.button,
            isDragging: this.mouseState.isDragging,
            dragStart: { ...this.mouseState.dragStart }
        };
    }

    /**
     * Get current keyboard state
     */
    public getKeyboardState(): {
        pressedKeys: string[];
        ctrlKey: boolean;
        altKey: boolean;
        shiftKey: boolean;
    } {
        return {
            pressedKeys: Array.from(this.keyState.pressedKeys),
            ctrlKey: this.keyState.ctrlKey,
            altKey: this.keyState.altKey,
            shiftKey: this.keyState.shiftKey
        };
    }

    /**
     * Check if a key is currently pressed
     */
    public isKeyPressed(key: string): boolean {
        return this.keyState.pressedKeys.has(key.toLowerCase());
    }

    /**
     * Update cursor and tile positions
     */
    private updateCursorPosition(screenX: number, screenY: number): void {
        this.currentCursorPosition = { x: screenX, y: screenY };

        // Calculate tile coordinates
        const { tileX, tileY } = getTileCoords(
            screenX,
            screenY,
            state.offsetX,
            state.offsetY,
            state.scale
        );

        this.currentTilePosition = { x: tileX, y: tileY };

        // Update state (for backward compatibility)
        state.tileX = tileX;
        state.tileY = tileY;

        // Emit mouse move event
        GameEvents.emitMouseMove(screenX, screenY, tileX, tileY);
    }

    /**
     * Setup canvas event listeners
     */
    private setupCanvasListeners(): void {
        if (!this.canvas) return;

        // Bind listeners and store references
        this.boundListeners.mouseDown = this.handleMouseDown.bind(this);
        this.boundListeners.mouseMove = this.handleMouseMove.bind(this);
        this.boundListeners.mouseUp = this.handleMouseUp.bind(this);
        this.boundListeners.contextMenu = this.handleContextMenu.bind(this);
        this.boundListeners.wheel = this.handleWheel.bind(this);

        // Add canvas listeners
        this.canvas.addEventListener('mousedown', this.boundListeners.mouseDown);
        this.canvas.addEventListener('mousemove', this.boundListeners.mouseMove);
        this.canvas.addEventListener('mouseup', this.boundListeners.mouseUp);
        this.canvas.addEventListener('contextmenu', this.boundListeners.contextMenu);
        this.canvas.addEventListener('wheel', this.boundListeners.wheel);

        // Bind keyboard listeners and store references
        this.boundListeners.keyDown = this.handleKeyDown.bind(this);
        this.boundListeners.keyUp = this.handleKeyUp.bind(this);

        // Add global keyboard listeners
        document.addEventListener('keydown', this.boundListeners.keyDown);
        document.addEventListener('keyup', this.boundListeners.keyUp);
    }

    /**
     * Remove canvas event listeners
     */
    private removeCanvasListeners(): void {
        if (!this.canvas) return;

        // Remove canvas listeners
        if (this.boundListeners.mouseDown) {
            this.canvas.removeEventListener('mousedown', this.boundListeners.mouseDown);
        }
        if (this.boundListeners.mouseMove) {
            this.canvas.removeEventListener('mousemove', this.boundListeners.mouseMove);
        }
        if (this.boundListeners.mouseUp) {
            this.canvas.removeEventListener('mouseup', this.boundListeners.mouseUp);
        }
        if (this.boundListeners.contextMenu) {
            this.canvas.removeEventListener('contextmenu', this.boundListeners.contextMenu);
        }
        if (this.boundListeners.wheel) {
            this.canvas.removeEventListener('wheel', this.boundListeners.wheel);
        }

        // Remove global listeners
        if (this.boundListeners.keyDown) {
            document.removeEventListener('keydown', this.boundListeners.keyDown);
        }
        if (this.boundListeners.keyUp) {
            document.removeEventListener('keyup', this.boundListeners.keyUp);
        }

        // Clear references
        this.boundListeners.mouseDown = null;
        this.boundListeners.mouseMove = null;
        this.boundListeners.mouseUp = null;
        this.boundListeners.contextMenu = null;
        this.boundListeners.wheel = null;
        this.boundListeners.keyDown = null;
        this.boundListeners.keyUp = null;
    }

    /**
     * Handle mouse down events
     */
    private handleMouseDown(event: MouseEvent): void {
        if (!this.isInputEnabled) return;

        this.mouseState.isDown = true;
        this.mouseState.button = event.button;
        this.mouseState.dragStart = { x: event.clientX, y: event.clientY };
        this.mouseState.isDragging = false;

        this.updateCursorPosition(event.clientX, event.clientY);

        // Emit tile clicked event with current tool
        const stateManager = state; // TODO: Replace with proper state access
        GameEvents.emitTileClicked(
            this.currentTilePosition.x,
            this.currentTilePosition.y,
            stateManager.selectedTool
        );
    }

    /**
     * Handle mouse move events
     */
    private handleMouseMove(event: MouseEvent): void {
        if (!this.isInputEnabled) return;

        this.updateCursorPosition(event.clientX, event.clientY);

        // Check for drag threshold
        if (this.mouseState.isDown && !this.mouseState.isDragging) {
            const dragDistance = Math.sqrt(
                Math.pow(event.clientX - this.mouseState.dragStart.x, 2) +
                Math.pow(event.clientY - this.mouseState.dragStart.y, 2)
            );

            if (dragDistance > 5) { // 5px drag threshold
                this.mouseState.isDragging = true;
            }
        }

        // Emit tile hovered event
        GameEvents.emitTileHovered(
            this.currentTilePosition.x,
            this.currentTilePosition.y
        );
    }

    /**
     * Handle mouse up events
     */
    private handleMouseUp(event: MouseEvent): void {
        if (!this.isInputEnabled) return;

        this.mouseState.isDown = false;
        this.mouseState.button = -1;
        this.mouseState.isDragging = false;

        this.updateCursorPosition(event.clientX, event.clientY);
    }

    /**
     * Handle context menu (right-click)
     */
    private handleContextMenu(event: MouseEvent): void {
        event.preventDefault(); // Prevent browser context menu
    }

    /**
     * Handle mouse wheel events (for zooming)
     */
    private handleWheel(event: WheelEvent): void {
        if (!this.isInputEnabled) return;

        event.preventDefault();

        // Handle zoom
        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.max(0.5, Math.min(3.0, state.scale + delta));

        if (newScale !== state.scale) {
            state.scale = newScale;

            // Emit camera changed event
            GameEvents.emitCameraChanged(state.offsetX, state.offsetY, state.scale);
        }
    }

    /**
     * Handle key down events
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (!this.isInputEnabled) return;

        const key = event.key.toLowerCase();

        this.keyState.pressedKeys.add(key);
        this.keyState.ctrlKey = event.ctrlKey;
        this.keyState.altKey = event.altKey;
        this.keyState.shiftKey = event.shiftKey;

        // Emit key pressed event
        GameEvents.emitKeyPressed(key, event.ctrlKey, event.altKey, event.shiftKey);

        // Handle specific key combinations
        if (event.ctrlKey && key === 's') {
            event.preventDefault();
            // Emit save game request
            GameEvents.emitSaveGame(false); // false indicates this is a request, not completion
        }
    }

    /**
     * Handle key up events
     */
    private handleKeyUp(event: KeyboardEvent): void {
        if (!this.isInputEnabled) return;

        const key = event.key.toLowerCase();

        this.keyState.pressedKeys.delete(key);
        this.keyState.ctrlKey = event.ctrlKey;
        this.keyState.altKey = event.altKey;
        this.keyState.shiftKey = event.shiftKey;
    }

    /**
     * Setup event listeners for input coordination
     */
    private setupEventListeners(): void {
        // Listen for game state changes that might affect input
        eventBus.on('game:initialized', () => {
            // Game ready, input can be enabled
            this.setInputEnabled(true);
        });

        eventBus.on('game:reset', () => {
            // Reset input state
            this.mouseState.isDown = false;
            this.mouseState.isDragging = false;
            this.keyState.pressedKeys.clear();
        });
    }

    /**
     * Get input statistics for debugging
     */
    public getInputStats(): {
        isEnabled: boolean;
        cursorPosition: { x: number; y: number };
        tilePosition: { x: number; y: number };
        mouseState: object;
        keyboardState: object;
    } {
        return {
            isEnabled: this.isInputEnabled,
            cursorPosition: this.getCursorPosition(),
            tilePosition: this.getCurrentTilePosition(),
            mouseState: this.getMouseState(),
            keyboardState: this.getKeyboardState()
        };
    }

    /**
     * Cleanup resources
     */
    public destroy(): void {
        this.removeCanvasListeners();
        this.canvas = null;
        this.setInputEnabled(false);
        console.log('InputService destroyed');
    }
}

// Export singleton instance
export const inputService = new InputService();
