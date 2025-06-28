import { eventBus } from '../events/GameEvents';
import { state } from '../core/state';
import { drawGrid } from '../render/grid';
import { drawTiles, drawLockedAreas, drawAreaBoundaries } from '../render/tileRenderer';

/**
 * RenderService - Rendering coordination service
 * 
 * Responsibilities:
 * - Coordinate all rendering operations
 * - Manage render state and scheduling
 * - Handle canvas management
 * - Provide render control and optimization
 */
export class RenderService {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private isRenderingEnabled = true;
    private pendingRender = false;

    constructor() {
        this.setupEventListeners();
    }

    /**
     * Initialize the render service with a canvas
     */
    public initialize(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        if (!this.ctx) {
            throw new Error('Failed to get 2D context from canvas');
        }

        console.log('RenderService initialized with canvas');

        // Initial render
        this.render();
    }

    /**
     * Main render function
     */
    public render(): void {
        if (!this.isRenderingEnabled || !this.canvas || !this.ctx) {
            return;
        }

        // Clear any pending render request
        this.pendingRender = false;

        try {
            // Clear the canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Save context for transformations
            this.ctx.save();

            // Apply camera transformations
            this.ctx.translate(state.offsetX, state.offsetY);
            this.ctx.scale(state.scale, state.scale);

            // Render game layers in order
            this.renderGrid();
            this.renderTiles();
            this.renderAreaBoundaries();
            this.renderLockedAreas();

            // Restore context
            this.ctx.restore();

            // Note: Render complete event can be added to GameEvents if needed
            console.log('Render complete');

        } catch (error) {
            console.error('Render error:', error);
        }
    }

    /**
     * Request a render on the next animation frame
     */
    public requestRender(reason = 'Render requested'): void {
        if (this.pendingRender) {
            return; // Already have a pending render
        }

        this.pendingRender = true;
        requestAnimationFrame(() => {
            if (this.pendingRender) {
                console.log(`Rendering: ${reason}`);
                this.render();
            }
        });
    }

    /**
     * Enable/disable rendering
     */
    public setRenderingEnabled(enabled: boolean): void {
        this.isRenderingEnabled = enabled;
        if (enabled) {
            this.requestRender('Rendering re-enabled');
        }
    }

    /**
     * Check if rendering is enabled
     */
    public isRenderingActive(): boolean {
        return this.isRenderingEnabled;
    }

    /**
     * Get canvas dimensions
     */
    public getCanvasDimensions(): { width: number; height: number } | null {
        if (!this.canvas) {
            return null;
        }
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }

    /**
     * Handle canvas resize
     */
    public handleResize(width: number, height: number): void {
        if (!this.canvas) {
            return;
        }

        this.canvas.width = width;
        this.canvas.height = height;

        // Request a render after resize
        this.requestRender('Canvas resized');

        // Note: Canvas resize event can be added to GameEvents if needed
        console.log(`Canvas resized to ${width}x${height}`);
    }

    /**
     * Get current render statistics
     */
    public getRenderStats(): {
        isEnabled: boolean;
        hasPendingRender: boolean;
        canvasSize: { width: number; height: number } | null;
        cameraState: { offsetX: number; offsetY: number; scale: number };
    } {
        return {
            isEnabled: this.isRenderingEnabled,
            hasPendingRender: this.pendingRender,
            canvasSize: this.getCanvasDimensions(),
            cameraState: {
                offsetX: state.offsetX,
                offsetY: state.offsetY,
                scale: state.scale
            }
        };
    }

    /**
     * Render the grid layer
     */
    private renderGrid(): void {
        if (!this.canvas || !this.ctx) return;
        drawGrid(this.ctx, this.canvas);
    }

    /**
     * Render the tiles layer
     */
    private renderTiles(): void {
        if (!this.ctx) return;
        drawTiles(this.ctx);
    }

    /**
     * Render area boundaries
     */
    private renderAreaBoundaries(): void {
        if (!this.canvas || !this.ctx) return;
        drawAreaBoundaries(this.ctx, this.canvas);
    }

    /**
     * Render locked areas overlay
     */
    private renderLockedAreas(): void {
        if (!this.canvas || !this.ctx) return;
        drawLockedAreas(this.ctx, this.canvas);
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners(): void {
        // Listen for view refresh requests
        eventBus.on('view:refresh', (event) => {
            this.requestRender(event.reason || 'View refresh requested');
        });

        // Listen for tool selection changes
        eventBus.on('tool:selected', () => {
            this.requestRender('Tool selection changed');
        });

        // Listen for tile changes
        eventBus.on('tile:changed', () => {
            this.requestRender('Tile changed');
        });

        // Listen for area changes
        eventBus.on('area:unlocked', () => {
            this.requestRender('Area unlocked');
        });

        // Listen for crop updates
        eventBus.on('crop:planted', () => {
            this.requestRender('Crop planted');
        });

        eventBus.on('crop:harvested', () => {
            this.requestRender('Crop harvested');
        });

        // Listen for mouse movement for cursor updates (currently disabled)
        eventBus.on('input:mouse-move', () => {
            // Only render if we're showing cursor/hover effects
            // For now, we don't need to re-render on every mouse move
            // This can be enabled later for hover effects
        });

        // Listen for camera/viewport changes
        eventBus.on('camera:changed', () => {
            this.requestRender('Camera changed');
        });

        // Listen for game state changes
        eventBus.on('save:load', (event) => {
            if (event.success) {
                this.requestRender('Game loaded');
            }
        });

        eventBus.on('save:deleted', (event) => {
            if (event.success) {
                this.requestRender('Save deleted');
            }
        });
    }

    /**
     * Cleanup resources
     */
    public destroy(): void {
        this.setRenderingEnabled(false);
        this.canvas = null;
        this.ctx = null;
        console.log('RenderService destroyed');
    }
}

// Export singleton instance
export const renderService = new RenderService();
