import { eventBus } from '../events/EventBus';
import { getStateManager } from '../state/globalState';
import { GridRenderer } from './GridRenderer';
import { TileRenderer } from './TileRenderer';
import { CropRenderer } from './CropRenderer';
import { UIRenderer } from './UIRenderer';
import { Camera } from './Camera';
import type { GameState } from '../state/GameState';

/**
 * Main renderer class that coordinates all rendering operations
 * Provides a unified interface for rendering the game world and UI
 */
export class Renderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private camera: Camera;
    private gridRenderer: GridRenderer;
    private tileRenderer: TileRenderer;
    private cropRenderer: CropRenderer;
    private uiRenderer: UIRenderer;

    private animationFrameId: number | null = null;
    private lastFrameTime: number = 0;
    private frameCount: number = 0;
    private fpsUpdateTime: number = 0;
    private currentFps: number = 0;

    // Performance monitoring
    private renderTimes: number[] = [];
    private maxRenderTimeHistory = 60; // Keep last 60 frames

    // Render scheduling
    private renderRequested: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context from canvas');
        }
        this.ctx = ctx;

        // Initialize camera and renderers
        this.camera = new Camera(canvas);
        this.gridRenderer = new GridRenderer();
        this.tileRenderer = new TileRenderer();
        this.cropRenderer = new CropRenderer();
        this.uiRenderer = new UIRenderer();

        // Set up event listeners
        this.setupEventListeners();

        // Start the render loop
        this.startRenderLoop();
    }

    /**
     * Set up event listeners for render triggers
     */
    private setupEventListeners(): void {
        // Listen for events that should trigger a re-render
        eventBus.on('game:initialized', () => this.requestRender());
        eventBus.on('tile:clicked', () => this.requestRender());
        eventBus.on('tile:changed', () => this.requestRender());
        eventBus.on('tool:selected', () => this.requestRender());
        eventBus.on('economy:coins-changed', () => this.requestRender());
        eventBus.on('crop:grown', () => this.requestRender());
        eventBus.on('crop:harvested', () => this.requestRender());
        eventBus.on('crop:planted', () => this.requestRender());
        eventBus.on('area:unlocked', () => this.requestRender());
        eventBus.on('view:refresh', () => this.requestRender());

        // Handle canvas resize
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Handle canvas resize
     */
    private handleResize(): void {
        this.camera.handleResize();
        this.requestRender();
    }

    /**
     * Request a render on the next animation frame
     */
    public requestRender(): void {
        if (!this.renderRequested) {
            this.renderRequested = true;
            requestAnimationFrame(() => {
                this.renderRequested = false;
                this.render();
            });
        }
    }

    /**
     * Start the continuous render loop
     */
    private startRenderLoop(): void {
        const renderFrame = (timestamp: number) => {
            // Calculate FPS
            this.updateFPS(timestamp);

            // Render the frame
            this.render();

            // Schedule next frame
            this.animationFrameId = requestAnimationFrame(renderFrame);
        };

        this.animationFrameId = requestAnimationFrame(renderFrame);
    }

    /**
     * Stop the render loop
     */
    public stopRenderLoop(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Update FPS calculation
     */
    private updateFPS(timestamp: number): void {
        if (this.lastFrameTime === 0) {
            this.lastFrameTime = timestamp;
            return;
        }

        this.lastFrameTime = timestamp;
        this.frameCount++;

        // Update FPS every second
        if (timestamp - this.fpsUpdateTime >= 1000) {
            this.currentFps = Math.round((this.frameCount * 1000) / (timestamp - this.fpsUpdateTime));
            this.frameCount = 0;
            this.fpsUpdateTime = timestamp;
        }
    }

    /**
     * Main render method
     */
    public render(): void {
        const startTime = performance.now();

        try {
            const state = getStateManager().getState();

            // Clear the canvas
            this.clearCanvas();

            // Set up camera transform
            this.camera.applyTransform(this.ctx);

            // Render world elements (affected by camera)
            this.renderWorld(state);

            // Reset transform for UI elements
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);

            // Render UI elements (not affected by camera)
            this.renderUI(state);

        } catch (error) {
            console.error('Render error:', error);
        }

        // Track performance
        const renderTime = performance.now() - startTime;
        this.trackRenderTime(renderTime);
    }

    /**
     * Clear the canvas
     */
    private clearCanvas(): void {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render world elements (affected by camera transform)
     */
    private renderWorld(state: GameState): void {
        // Render grid
        this.gridRenderer.render(this.ctx, this.canvas, this.camera);

        // Render tiles
        this.tileRenderer.render(this.ctx, this.canvas, this.camera, state);

        // Render crops
        this.cropRenderer.render(this.ctx, this.canvas, this.camera, state);
    }

    /**
     * Render UI elements (not affected by camera transform)
     */
    private renderUI(state: GameState): void {
        this.uiRenderer.render(this.ctx, this.canvas, state);
    }

    /**
     * Track render time for performance monitoring
     */
    private trackRenderTime(renderTime: number): void {
        this.renderTimes.push(renderTime);
        if (this.renderTimes.length > this.maxRenderTimeHistory) {
            this.renderTimes.shift();
        }
    }

    /**
     * Get current FPS
     */
    public getFPS(): number {
        return this.currentFps;
    }

    /**
     * Get average render time
     */
    public getAverageRenderTime(): number {
        if (this.renderTimes.length === 0) return 0;
        const sum = this.renderTimes.reduce((a, b) => a + b, 0);
        return sum / this.renderTimes.length;
    }

    /**
     * Get maximum render time
     */
    public getMaxRenderTime(): number {
        if (this.renderTimes.length === 0) return 0;
        return Math.max(...this.renderTimes);
    }

    /**
     * Get camera instance
     */
    public getCamera(): Camera {
        return this.camera;
    }

    /**
     * Get renderer statistics
     */
    public getStats(): {
        fps: number;
        averageRenderTime: number;
        maxRenderTime: number;
        frameCount: number;
    } {
        return {
            fps: this.currentFps,
            averageRenderTime: this.getAverageRenderTime(),
            maxRenderTime: this.getMaxRenderTime(),
            frameCount: this.frameCount
        };
    }

    /**
     * Enable/disable render loop
     */
    public setRenderLoop(enabled: boolean): void {
        if (enabled && this.animationFrameId === null) {
            this.startRenderLoop();
        } else if (!enabled && this.animationFrameId !== null) {
            this.stopRenderLoop();
        }
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        this.stopRenderLoop();
        // Remove event listeners if needed
    }
}
