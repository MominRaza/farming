import type { Camera } from './Camera';
import type { GameState } from '../state/GameState';
import type { ToolId } from '../types';
import type { TileData } from '../core/tile';
import { GRID_SIZE } from '../utils/constants';

/**
 * CropRenderer handles rendering crops on soil tiles
 * Shows crop growth stages, maturity, and visual indicators
 */
export class CropRenderer {
    private cropColors: Record<ToolId, string> = {
        // Crop colors
        'wheat': '#DAA520',     // Golden rod
        'spinach': '#228B22',   // Forest green
        'carrot': '#FF8C00',    // Dark orange
        'potato': '#CD853F',    // Peru
        'tomato': '#FF6347',    // Tomato red
        'corn': '#FFD700',      // Gold
        'onion': '#DDA0DD',     // Plum
        'pea': '#90EE90',       // Light green
        'eggplant': '#9370DB',  // Medium purple
        'pepper': '#DC143C',    // Crimson
        // Default for other tools
        'soil': '#8b4513',
        'road': '#7f8c8d',
        'harvest': '#000000',
        'water': '#0000FF',
        'fertilize': '#FFFF00'
    };

    /**
     * Render all visible crops
     */
    public render(ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement, camera: Camera, state: GameState): void {
        // Get visible bounds for optimization
        const bounds = camera.getVisibleBounds();

        // Calculate tile bounds
        const startTileX = Math.floor(bounds.left / GRID_SIZE);
        const startTileY = Math.floor(bounds.top / GRID_SIZE);
        const endTileX = Math.ceil(bounds.right / GRID_SIZE);
        const endTileY = Math.ceil(bounds.bottom / GRID_SIZE);

        // Render crops
        for (let tileX = startTileX; tileX <= endTileX; tileX++) {
            for (let tileY = startTileY; tileY <= endTileY; tileY++) {
                this.renderCrop(ctx, tileX, tileY, state, camera);
            }
        }
    }

    /**
     * Render a crop on a single tile if present
     */
    private renderCrop(ctx: CanvasRenderingContext2D, tileX: number, tileY: number, state: GameState, camera: Camera): void {
        const tileKey = `${tileX},${tileY}`;
        const tile = state.world.tiles.get(tileKey);

        if (!tile || tile.type !== 'soil' || !tile.crop) {
            return; // No crop to render
        }

        // Calculate world position
        const worldX = tileX * GRID_SIZE;
        const worldY = tileY * GRID_SIZE;

        // Render crop based on growth stage
        this.renderCropStage(ctx, worldX, worldY, tile);

        // Render maturity indicator if crop is ready
        if (this.isCropMature(tile)) {
            this.renderMaturityIndicator(ctx, worldX, worldY, camera);
        }

        // Render growth progress indicator
        this.renderGrowthProgress(ctx, worldX, worldY, tile, camera);
    }

    /**
     * Render crop visual based on growth stage
     */
    private renderCropStage(ctx: CanvasRenderingContext2D, worldX: number, worldY: number, tile: TileData): void {
        if (!tile.crop) return;

        const crop = tile.crop;
        const progress = crop.stage / (crop.maxStages - 1);
        const cropColor = this.cropColors[crop.cropType] || '#228B22';

        // Calculate crop size based on growth progress
        const maxSize = GRID_SIZE * 0.8;
        const minSize = GRID_SIZE * 0.2;
        const cropSize = minSize + (maxSize - minSize) * progress;

        // Center the crop in the tile
        const cropX = worldX + (GRID_SIZE - cropSize) / 2;
        const cropY = worldY + (GRID_SIZE - cropSize) / 2;

        // Render crop shape based on type and stage
        this.renderCropShape(ctx, cropX, cropY, cropSize, crop.cropType, progress, cropColor);
    }

    /**
     * Render specific crop shape
     */
    private renderCropShape(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, cropType: ToolId, progress: number, color: string): void {
        ctx.fillStyle = color;

        switch (cropType) {
            case 'wheat':
                this.renderWheat(ctx, x, y, size, progress);
                break;
            case 'corn':
                this.renderCorn(ctx, x, y, size, progress);
                break;
            case 'tomato':
                this.renderTomato(ctx, x, y, size, progress);
                break;
            case 'carrot':
                this.renderCarrot(ctx, x, y, size, progress);
                break;
            default:
                // Default: simple circle that grows
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }

    /**
     * Render wheat as vertical lines with tops
     */
    private renderWheat(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, progress: number): void {
        const stemHeight = size * progress;
        const stemWidth = Math.max(1, size * 0.1);
        const numStems = Math.max(1, Math.floor(size * 0.2));

        for (let i = 0; i < numStems; i++) {
            const stemX = x + (size / numStems) * i + stemWidth / 2;

            // Stem
            ctx.fillRect(stemX, y + size - stemHeight, stemWidth, stemHeight);

            // Wheat head (only when mature enough)
            if (progress > 0.7) {
                ctx.fillStyle = '#DAA520'; // Golden
                ctx.fillRect(stemX - stemWidth, y + size - stemHeight - stemWidth * 2, stemWidth * 3, stemWidth * 2);
                ctx.fillStyle = this.cropColors['wheat']; // Reset color
            }
        }
    }

    /**
     * Render corn as a tall stalk
     */
    private renderCorn(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, progress: number): void {
        const stalkHeight = size * progress;
        const stalkWidth = Math.max(2, size * 0.15);

        // Main stalk
        ctx.fillRect(x + size / 2 - stalkWidth / 2, y + size - stalkHeight, stalkWidth, stalkHeight);

        // Corn cob (only when mature)
        if (progress > 0.8) {
            ctx.fillStyle = '#FFD700'; // Gold
            const cobWidth = stalkWidth * 1.5;
            const cobHeight = stalkWidth * 3;
            ctx.fillRect(
                x + size / 2 - cobWidth / 2,
                y + size - stalkHeight + stalkHeight * 0.3,
                cobWidth,
                cobHeight
            );
            ctx.fillStyle = this.cropColors['corn']; // Reset color
        }
    }

    /**
     * Render tomato as round fruit
     */
    private renderTomato(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, progress: number): void {
        const plantSize = size * progress;

        // Plant base (green)
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + size / 2 - 1, y + size - plantSize, 2, plantSize);

        // Tomatoes (only when mature enough)
        if (progress > 0.6) {
            ctx.fillStyle = '#FF6347'; // Tomato red
            const tomatoSize = Math.max(2, size * 0.3 * progress);

            // Draw 2-3 tomatoes
            const numTomatoes = Math.min(3, Math.floor(progress * 4));
            for (let i = 0; i < numTomatoes; i++) {
                const angle = (i * Math.PI * 2) / 3;
                const tomatoX = x + size / 2 + Math.cos(angle) * (size * 0.2);
                const tomatoY = y + size / 2 + Math.sin(angle) * (size * 0.2);

                ctx.beginPath();
                ctx.arc(tomatoX, tomatoY, tomatoSize / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    /**
     * Render carrot as orange triangle underground
     */
    private renderCarrot(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, progress: number): void {
        // Green tops above ground
        const topHeight = size * 0.3 * progress;
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + size / 2 - 1, y + size - topHeight, 2, topHeight);

        // Orange carrot underground (visible portion)
        if (progress > 0.4) {
            ctx.fillStyle = '#FF8C00';
            const carrotHeight = size * 0.4 * progress;
            const carrotWidth = size * 0.2 * progress;

            // Triangle shape
            ctx.beginPath();
            ctx.moveTo(x + size / 2, y + size);
            ctx.lineTo(x + size / 2 - carrotWidth / 2, y + size - carrotHeight);
            ctx.lineTo(x + size / 2 + carrotWidth / 2, y + size - carrotHeight);
            ctx.closePath();
            ctx.fill();
        }
    }

    /**
     * Render maturity indicator (ready to harvest)
     */
    private renderMaturityIndicator(ctx: CanvasRenderingContext2D, worldX: number, worldY: number, camera: Camera): void {
        const indicatorSize = 6 / camera.zoom;

        // Glowing effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 4 / camera.zoom;

        // Star or sparkle indicator
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(
            worldX + GRID_SIZE - indicatorSize,
            worldY + indicatorSize,
            indicatorSize / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;
    }

    /**
     * Render growth progress bar
     */
    private renderGrowthProgress(ctx: CanvasRenderingContext2D, worldX: number, worldY: number, tile: TileData, camera: Camera): void {
        if (!tile.crop) return;

        const progress = tile.crop.stage / (tile.crop.maxStages - 1);
        const barWidth = GRID_SIZE * 0.8;
        const barHeight = 2 / camera.zoom;
        const barX = worldX + (GRID_SIZE - barWidth) / 2;
        const barY = worldY + GRID_SIZE - barHeight - 2 / camera.zoom;

        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress
        ctx.fillStyle = this.getProgressColor(progress);
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    }

    /**
     * Get progress bar color based on completion
     */
    private getProgressColor(progress: number): string {
        if (progress >= 1.0) return '#00FF00'; // Green for complete
        if (progress >= 0.8) return '#FFFF00'; // Yellow for nearly complete
        if (progress >= 0.5) return '#FFA500'; // Orange for halfway
        return '#FF0000'; // Red for early stage
    }

    /**
     * Check if crop is mature (ready to harvest)
     */
    private isCropMature(tile: TileData): boolean {
        if (!tile.crop) return false;
        return tile.crop.stage >= tile.crop.maxStages - 1;
    }

    /**
     * Set crop colors
     */
    public setCropColors(colors: Partial<Record<ToolId, string>>): void {
        this.cropColors = { ...this.cropColors, ...colors };
    }

    /**
     * Get crop colors
     */
    public getCropColors(): Record<ToolId, string> {
        return { ...this.cropColors };
    }
}
