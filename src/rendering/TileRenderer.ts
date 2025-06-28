import type { Camera } from './Camera';
import type { GameState } from '../state/GameState';
import type { TileType } from '../types';
import type { TileData } from '../core/tile';
import { GRID_SIZE } from '../utils/constants';
import { TILE_COLORS } from '../core/tile';

/**
 * TileRenderer handles rendering all tiles in the game world
 * Renders different tile types with appropriate colors and styles
 */
export class TileRenderer {
    private tileBorderColor: string = '#654321';
    private tileBorderWidth: number = 1;

    /**
     * Render all visible tiles
     */
    public render(ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement, camera: Camera, state: GameState): void {
        // Get visible bounds for optimization
        const bounds = camera.getVisibleBounds();

        // Calculate tile bounds
        const startTileX = Math.floor(bounds.left / GRID_SIZE);
        const startTileY = Math.floor(bounds.top / GRID_SIZE);
        const endTileX = Math.ceil(bounds.right / GRID_SIZE);
        const endTileY = Math.ceil(bounds.bottom / GRID_SIZE);

        // Render tiles
        for (let tileX = startTileX; tileX <= endTileX; tileX++) {
            for (let tileY = startTileY; tileY <= endTileY; tileY++) {
                this.renderTile(ctx, tileX, tileY, state, camera);
            }
        }
    }

    /**
     * Render a single tile
     */
    private renderTile(ctx: CanvasRenderingContext2D, tileX: number, tileY: number, state: GameState, camera: Camera): void {
        const tileKey = `${tileX},${tileY}`;
        const tile = state.world.tiles.get(tileKey);

        if (!tile) {
            return; // Don't render non-existent tiles
        }

        // Calculate world position
        const worldX = tileX * GRID_SIZE;
        const worldY = tileY * GRID_SIZE;

        // Get tile color based on type
        const fillColor = this.getTileColor(tile.type, tile);

        // Fill tile
        ctx.fillStyle = fillColor;
        ctx.fillRect(worldX, worldY, GRID_SIZE, GRID_SIZE);

        // Draw tile border
        ctx.strokeStyle = this.tileBorderColor;
        ctx.lineWidth = this.tileBorderWidth / camera.zoom;
        ctx.strokeRect(worldX, worldY, GRID_SIZE, GRID_SIZE);

        // Render enhancement indicators
        this.renderEnhancements(ctx, worldX, worldY, tile, camera);

        // Render tile coordinates (for debugging - can be toggled)
        if (this.shouldShowCoordinates(camera.zoom)) {
            this.renderCoordinates(ctx, worldX, worldY, tileX, tileY, camera);
        }
    }

    /**
     * Get tile color based on type and properties
     */
    private getTileColor(type: TileType, tile: TileData): string {
        const baseColor = TILE_COLORS[type] || TILE_COLORS['soil'];

        // Modify color for soil tiles with enhancements
        if (type === 'soil') {
            if (tile.isWatered && tile.isFertilized) {
                // Both enhancements - blend blue and yellow
                return this.blendColors('#4169e1', '#ffd700');
            } else if (tile.isWatered) {
                return '#4169e1'; // Royal blue for watered
            } else if (tile.isFertilized) {
                return '#ffd700'; // Gold for fertilized
            }
        }

        return baseColor;
    }

    /**
     * Render enhancement indicators on tile
     */
    private renderEnhancements(ctx: CanvasRenderingContext2D, worldX: number, worldY: number, tile: TileData, camera: Camera): void {
        if (tile.type !== 'soil') return;

        const indicatorSize = 4 / camera.zoom;
        const padding = 2 / camera.zoom;

        // Water indicator (blue dot in top-left)
        if (tile.isWatered) {
            ctx.fillStyle = '#0066cc';
            ctx.fillRect(
                worldX + padding,
                worldY + padding,
                indicatorSize,
                indicatorSize
            );
        }

        // Fertilizer indicator (yellow dot in top-right)
        if (tile.isFertilized) {
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(
                worldX + GRID_SIZE - indicatorSize - padding,
                worldY + padding,
                indicatorSize,
                indicatorSize
            );
        }
    }

    /**
     * Render tile coordinates (for debugging)
     */
    private renderCoordinates(ctx: CanvasRenderingContext2D, worldX: number, worldY: number, tileX: number, tileY: number, camera: Camera): void {
        const fontSize = 8 / camera.zoom;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const text = `${tileX},${tileY}`;
        ctx.fillText(text, worldX + GRID_SIZE / 2, worldY + GRID_SIZE / 2);
    }

    /**
     * Check if coordinates should be shown based on zoom level
     */
    private shouldShowCoordinates(zoom: number): boolean {
        return zoom > 2.0; // Only show when zoomed in enough
    }

    /**
     * Blend two colors together
     */
    private blendColors(color1: string, color2: string): string {
        // Simple color blending - convert hex to RGB, average, and convert back
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);

        if (!rgb1 || !rgb2) return color1;

        const blended = {
            r: Math.round((rgb1.r + rgb2.r) / 2),
            g: Math.round((rgb1.g + rgb2.g) / 2),
            b: Math.round((rgb1.b + rgb2.b) / 2)
        };

        return this.rgbToHex(blended.r, blended.g, blended.b);
    }

    /**
     * Convert hex color to RGB
     */
    private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert RGB to hex color
     */
    private rgbToHex(r: number, g: number, b: number): string {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    /**
     * Set tile border appearance
     */
    public setBorderAppearance(color: string, width: number): void {
        this.tileBorderColor = color;
        this.tileBorderWidth = width;
    }

    /**
     * Get tile colors
     */
    public getTileColors(): Record<TileType, string> {
        return { ...TILE_COLORS };
    }
}
