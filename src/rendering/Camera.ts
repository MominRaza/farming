import { eventBus } from '../events/EventBus';

/**
 * Camera class for handling viewport management and transformations
 * Manages pan, zoom, and coordinate transformations for the game world
 */
export class Camera {
    private canvas: HTMLCanvasElement;

    // Camera state
    private _x: number = 0;
    private _y: number = 0;
    private _zoom: number = 1;

    // Constraints
    private minZoom: number = 0.1;
    private maxZoom: number = 5.0;

    // Movement
    private panSpeed: number = 1.0;
    private zoomSpeed: number = 0.1;

    // Input state
    private isPanning: boolean = false;
    private lastMousePos: { x: number; y: number } = { x: 0, y: 0 };

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.setupEventListeners();
    }

    /**
     * Set up event listeners for camera controls
     */
    private setupEventListeners(): void {
        // Mouse events for panning
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        // Wheel event for zooming
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));

        // Context menu prevention
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Handle mouse down for panning
     */
    private handleMouseDown(event: MouseEvent): void {
        if (event.button === 1 || (event.button === 0 && event.ctrlKey)) { // Middle mouse or Ctrl+Click
            this.isPanning = true;
            this.lastMousePos = { x: event.clientX, y: event.clientY };
            this.canvas.style.cursor = 'grabbing';
        }
    }

    /**
     * Handle mouse move for panning
     */
    private handleMouseMove(event: MouseEvent): void {
        if (this.isPanning) {
            const deltaX = event.clientX - this.lastMousePos.x;
            const deltaY = event.clientY - this.lastMousePos.y;

            this.pan(deltaX * this.panSpeed, deltaY * this.panSpeed);

            this.lastMousePos = { x: event.clientX, y: event.clientY };
        }
    }

    /**
     * Handle mouse up to stop panning
     */
    private handleMouseUp(): void {
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = 'default';
        }
    }

    /**
     * Handle wheel event for zooming
     */
    private handleWheel(event: WheelEvent): void {
        event.preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Convert mouse position to world coordinates before zoom
        const worldX = (mouseX - this.canvas.width / 2 - this._x) / this._zoom;
        const worldY = (mouseY - this.canvas.height / 2 - this._y) / this._zoom;

        // Calculate zoom delta
        const zoomDelta = event.deltaY > 0 ? -this.zoomSpeed : this.zoomSpeed;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this._zoom + zoomDelta));

        if (newZoom !== this._zoom) {
            this._zoom = newZoom;

            // Adjust camera position to keep mouse position in the same world location
            this._x = mouseX - this.canvas.width / 2 - worldX * this._zoom;
            this._y = mouseY - this.canvas.height / 2 - worldY * this._zoom;

            this.emitCameraChange();
        }
    }

    /**
     * Pan the camera by the given offset
     */
    public pan(deltaX: number, deltaY: number): void {
        this._x += deltaX;
        this._y += deltaY;
        this.emitCameraChange();
    }

    /**
     * Set camera position
     */
    public setPosition(x: number, y: number): void {
        this._x = x;
        this._y = y;
        this.emitCameraChange();
    }

    /**
     * Set camera zoom
     */
    public setZoom(zoom: number): void {
        this._zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
        this.emitCameraChange();
    }

    /**
     * Center camera on a world position
     */
    public centerOn(worldX: number, worldY: number): void {
        this._x = this.canvas.width / 2 - worldX * this._zoom;
        this._y = this.canvas.height / 2 - worldY * this._zoom;
        this.emitCameraChange();
    }

    /**
     * Apply camera transform to canvas context
     */
    public applyTransform(ctx: CanvasRenderingContext2D): void {
        ctx.setTransform(this._zoom, 0, 0, this._zoom, this._x + this.canvas.width / 2, this._y + this.canvas.height / 2);
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
        return {
            x: (screenX - this.canvas.width / 2 - this._x) / this._zoom,
            y: (screenY - this.canvas.height / 2 - this._y) / this._zoom
        };
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
        return {
            x: worldX * this._zoom + this._x + this.canvas.width / 2,
            y: worldY * this._zoom + this._y + this.canvas.height / 2
        };
    }

    /**
     * Get visible world bounds
     */
    public getVisibleBounds(): {
        left: number;
        top: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
    } {
        const topLeft = this.screenToWorld(0, 0);
        const bottomRight = this.screenToWorld(this.canvas.width, this.canvas.height);

        return {
            left: topLeft.x,
            top: topLeft.y,
            right: bottomRight.x,
            bottom: bottomRight.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y
        };
    }

    /**
     * Check if a world position is visible
     */
    public isVisible(worldX: number, worldY: number, margin: number = 0): boolean {
        const bounds = this.getVisibleBounds();
        return worldX >= bounds.left - margin &&
            worldX <= bounds.right + margin &&
            worldY >= bounds.top - margin &&
            worldY <= bounds.bottom + margin;
    }

    /**
     * Handle canvas resize
     */
    public handleResize(): void {
        // Update canvas size
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        this.emitCameraChange();
    }

    /**
     * Reset camera to default position and zoom
     */
    public reset(): void {
        this._x = 0;
        this._y = 0;
        this._zoom = 1;
        this.emitCameraChange();
    }

    /**
     * Emit camera change event
     */
    private emitCameraChange(): void {
        eventBus.emit({
            type: 'view:refresh',
            timestamp: Date.now(),
            reason: 'camera-changed'
        });
    }

    // Getters
    public get x(): number { return this._x; }
    public get y(): number { return this._y; }
    public get zoom(): number { return this._zoom; }
    public get offsetX(): number { return this._x; }
    public get offsetY(): number { return this._y; }
    public get scale(): number { return this._zoom; }

    /**
     * Get camera state for serialization
     */
    public getState(): { x: number; y: number; zoom: number } {
        return {
            x: this._x,
            y: this._y,
            zoom: this._zoom
        };
    }

    /**
     * Set camera state from serialization
     */
    public setState(state: { x: number; y: number; zoom: number }): void {
        this._x = state.x;
        this._y = state.y;
        this._zoom = Math.max(this.minZoom, Math.min(this.maxZoom, state.zoom));
        this.emitCameraChange();
    }

    /**
     * Set zoom constraints
     */
    public setZoomConstraints(minZoom: number, maxZoom: number): void {
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this._zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this._zoom));
    }

    /**
     * Set movement speeds
     */
    public setSpeeds(panSpeed: number, zoomSpeed: number): void {
        this.panSpeed = panSpeed;
        this.zoomSpeed = zoomSpeed;
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        // Remove event listeners if needed
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
        this.canvas.removeEventListener('wheel', this.handleWheel);
        this.canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
    }
}
