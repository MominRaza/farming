import type { Camera } from './Camera';
import { GRID_SIZE } from '../utils/constants';

/**
 * GridRenderer handles rendering the background grid
 * Provides visual reference for tile positions and boundaries
 */
export class GridRenderer {
    private gridColor: string = '#34495e';
    private gridLineWidth: number = 1;
    private gridOpacity: number = 0.3;

    /**
     * Render the grid based on camera position and zoom
     */
    public render(ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement, camera: Camera): void {
        // Get visible bounds for optimization
        const bounds = camera.getVisibleBounds();

        // Calculate grid bounds with some padding
        const padding = GRID_SIZE * 2;
        const startX = Math.floor((bounds.left - padding) / GRID_SIZE) * GRID_SIZE;
        const startY = Math.floor((bounds.top - padding) / GRID_SIZE) * GRID_SIZE;
        const endX = Math.ceil((bounds.right + padding) / GRID_SIZE) * GRID_SIZE;
        const endY = Math.ceil((bounds.bottom + padding) / GRID_SIZE) * GRID_SIZE;

        // Set up grid style
        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = this.gridLineWidth / camera.zoom;
        ctx.globalAlpha = this.gridOpacity;

        // Draw vertical lines
        for (let x = startX; x <= endX; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = startY; y <= endY; y += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }

        // Reset alpha
        ctx.globalAlpha = 1.0;
    }

    /**
     * Set grid appearance
     */
    public setAppearance(color: string, lineWidth: number, opacity: number): void {
        this.gridColor = color;
        this.gridLineWidth = lineWidth;
        this.gridOpacity = Math.max(0, Math.min(1, opacity));
    }

    /**
     * Get grid appearance settings
     */
    public getAppearance(): { color: string; lineWidth: number; opacity: number } {
        return {
            color: this.gridColor,
            lineWidth: this.gridLineWidth,
            opacity: this.gridOpacity
        };
    }
}
