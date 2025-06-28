import { state } from '../../core/state';
import { getTileData, hasCrop, getFertilizerUsage, isWatered, hasSoil, type TileData, type PlantedCrop } from '../../core/tile';
import { getToolById } from '../../core/tools';
import { ACTION_DATA } from '../../utils/constants';
import { isLockIcon } from '../../utils/areaHelpers';
import type { CropTool } from '../../types';

// Define fertilizer info interface
interface FertilizerInfo {
    used: number;
    max: number;
}

/**
 * Enhanced Tooltip Component - Handles rich tooltips with configurable content
 */
export class Tooltip {
    private element: HTMLDivElement | null = null;
    private timeout: number | null = null;
    private currentTileKey: string | null = null;
    private isInitialized = false;
    private delay = 500; // Default delay in milliseconds
    private isVisible = false;

    constructor() { }

    /**
     * Initialize the tooltip system
     */
    public init(): void {
        this.createElement();
        this.isInitialized = true;
    }

    /**
     * Create the tooltip DOM element
     */
    private createElement(): void {
        this.element = document.createElement('div');
        this.element.id = 'game-tooltip';
        this.element.style.cssText = `
            position: absolute;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 20, 0.95));
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.5;
            pointer-events: none;
            z-index: 1000;
            white-space: nowrap;
            display: none;
            border: 1px solid #444;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
            max-width: 280px;
            backdrop-filter: blur(4px);
            transform: translateY(-10px);
            opacity: 0;
            transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
        `;

        document.body.appendChild(this.element);
    }

    /**
     * Show tooltip for a tile
     */
    public showForTile(x: number, y: number, screenX: number, screenY: number): void {
        if (!this.element || !this.isInitialized) return;

        const tileKey = `${x},${y}`;

        // Check if this is a lock icon (purchasable area center) - only when no tool is selected
        if (state.selectedTool === null) {
            const lockInfo = isLockIcon(x, y);
            if (lockInfo.isLockIcon) {
                this.showLockTooltip(lockInfo.areaX!, lockInfo.areaY!, lockInfo.cost!, screenX, screenY, tileKey);
                return;
            }
        }

        // Original logic for soil tiles
        if (!hasSoil(x, y)) {
            this.hide();
            return;
        }

        this.showTileTooltip(x, y, screenX, screenY, tileKey);
    }

    /**
     * Show tooltip for lock icons
     */
    private showLockTooltip(areaX: number, areaY: number, cost: number, screenX: number, screenY: number, tileKey: string): void {
        if (!this.element) return;

        // If tooltip is already visible for the same tile, just update position
        if (this.currentTileKey === tileKey && this.isVisible) {
            this.updatePosition(screenX + 15, screenY - 10);
            return;
        }

        this.clearTimeout();
        this.currentTileKey = tileKey;

        // Show tooltip after delay
        this.timeout = setTimeout(() => {
            this.displayLockContent(areaX, areaY, cost, screenX + 15, screenY - 10);
        }, 300); // Shorter delay for lock icons
    }

    /**
     * Show tooltip for tile content
     */
    private showTileTooltip(x: number, y: number, screenX: number, screenY: number, tileKey: string): void {
        if (!this.element) return;

        // If tooltip is already visible for the same tile, just update position
        if (this.currentTileKey === tileKey && this.isVisible) {
            this.updatePosition(screenX, screenY);
            return;
        }

        this.clearTimeout();
        this.currentTileKey = tileKey;

        // Show tooltip after delay
        this.timeout = setTimeout(() => {
            this.displayTileContent(x, y, screenX, screenY);
        }, this.delay);
    }

    /**
     * Display lock icon tooltip content
     */
    private displayLockContent(areaX: number, areaY: number, cost: number, screenX: number, screenY: number): void {
        if (!this.element) return;

        const canAffordArea = state.coins >= cost;

        let content = '';
        content += `<div style="color: #FFD700; font-weight: bold; margin-bottom: 4px;">🔒 Locked Area</div>`;
        content += `<div style="color: #999; font-size: 10px; margin-bottom: 4px;">Area: (${areaX}, ${areaY})</div>`;
        content += `<div style="color: #FFA726; margin-bottom: 4px;">Cost: ${cost} coins</div>`;

        if (canAffordArea) {
            content += `<div style="color: #4CAF50;">✅ Click to unlock!</div>`;
            content += `<div style="color: #999; font-size: 10px; margin-top: 4px;">You have ${state.coins} coins</div>`;
        } else {
            content += `<div style="color: #F44336;">❌ Not enough coins</div>`;
            content += `<div style="color: #999; font-size: 10px; margin-top: 4px;">You have ${state.coins} coins (need ${cost - state.coins} more)</div>`;
        }

        content += `<div style="color: #666; font-size: 10px; margin-top: 8px; border-top: 1px solid #555; padding-top: 4px;">💡 Tip: Unlock areas to expand your farm</div>`;

        this.display(content, screenX, screenY);
    }

    /**
     * Display tile tooltip content
     */
    private displayTileContent(x: number, y: number, screenX: number, screenY: number): void {
        if (!this.element) return;

        const tileData = getTileData(x, y);
        if (!tileData || tileData.type !== 'soil') {
            this.hide();
            return;
        }

        const content = this.buildTileContent(x, y, tileData);
        this.display(content, screenX, screenY);
    }

    /**
     * Build tile content HTML
     */
    private buildTileContent(x: number, y: number, tileData: TileData): string {
        const fertilizerInfo = getFertilizerUsage(x, y);
        const isWateredTile = isWatered(x, y);
        const hasCropOnTile = hasCrop(x, y);

        let content = '';

        if (hasCropOnTile && tileData.crop) {
            content += this.buildCropContent(x, y, tileData, isWateredTile, fertilizerInfo);
        } else {
            content += this.buildEmptySoilContent(x, y);
        }

        // Add soil effects
        content += this.buildSoilEffectsContent(isWateredTile, fertilizerInfo, tileData, hasCropOnTile);

        return content;
    }

    /**
     * Build crop content
     */
    private buildCropContent(x: number, y: number, tileData: TileData, isWateredTile: boolean, fertilizerInfo: FertilizerInfo | null): string {
        if (!tileData.crop) return '';

        const cropTool = getToolById(tileData.crop.cropType);
        if (!cropTool || cropTool.category !== 'crop') return '';

        let content = '';
        content += `<div style="color: #4CAF50; font-weight: bold; margin-bottom: 4px;">${cropTool.icon} ${cropTool.name}</div>`;
        content += `<div style="color: #999; font-size: 10px; margin-bottom: 4px;">Position: (${x}, ${y})</div>`;

        // Crop stage and progress
        const progress = Math.round((tileData.crop.stage / (tileData.crop.maxStages - 1)) * 100);
        const isMature = tileData.crop.stage >= tileData.crop.maxStages - 1;

        content += `<div>Stage: ${tileData.crop.stage + 1}/${tileData.crop.maxStages}</div>`;
        content += `<div>Progress: ${progress}%</div>`;
        content += `<div style="color: ${isMature ? '#4CAF50' : '#FFA726'};">Status: ${isMature ? '✅ Ready to Harvest!' : '🌱 Growing...'}</div>`;

        // Time information
        const now = Date.now();
        const timeElapsed = Math.round((now - tileData.crop.plantedAt) / 1000);
        content += `<div>Age: ${timeElapsed}s</div>`;

        // Time to maturity estimation
        if (!isMature && 'growTime' in cropTool) {
            const remainingTime = this.calculateRemainingGrowthTime(cropTool, tileData.crop, isWateredTile, fertilizerInfo);
            if (remainingTime > 0) {
                const remainingSeconds = Math.round(remainingTime / 1000);
                content += `<div style="color: #FFA726;">⏳ Time to mature: ${remainingSeconds}s</div>`;
            }
        }

        // Reward information
        if ('reward' in cropTool && cropTool.reward && isMature) {
            content += `<div style="margin-top: 4px; color: #FFD54F;">💰 Harvest Value: ${cropTool.reward} coins</div>`;
        }

        return content;
    }

    /**
     * Build empty soil content
     */
    private buildEmptySoilContent(x: number, y: number): string {
        let content = '';
        content += `<div style="color: #8B4513; font-weight: bold; margin-bottom: 4px;">🟫 Empty Soil</div>`;
        content += `<div style="color: #999; font-size: 10px; margin-bottom: 4px;">Position: (${x}, ${y})</div>`;
        content += `<div style="color: #999;">Ready for planting</div>`;
        return content;
    }

    /**
     * Build soil effects content
     */
    private buildSoilEffectsContent(isWateredTile: boolean, fertilizerInfo: FertilizerInfo | null, tileData: TileData, hasCropOnTile: boolean): string {
        const effects = [];

        if (isWateredTile) {
            const now = Date.now();
            if (tileData.wateredAt) {
                const timeElapsed = now - tileData.wateredAt;
                const remainingTime = Math.max(0, ACTION_DATA.water.duration - timeElapsed);
                const remainingSeconds = Math.round(remainingTime / 1000);
                effects.push(`💧 Watered (+25% speed) - ${remainingSeconds}s left`);
            } else {
                effects.push('💧 Watered (+25% speed)');
            }
        }

        if (fertilizerInfo) {
            effects.push(`🌱 Fertilized (+40% speed) - ${fertilizerInfo.max - fertilizerInfo.used}/${fertilizerInfo.max} uses left`);
        }

        let content = '';
        if (effects.length > 0) {
            content += '<div style="margin-top: 4px; border-top: 1px solid #555; padding-top: 4px;">';
            effects.forEach(effect => {
                content += `<div style="color: #81C784;">${effect}</div>`;
            });
            content += '</div>';
        } else if (!hasCropOnTile) {
            content += '<div style="margin-top: 4px; border-top: 1px solid #555; padding-top: 4px;">';
            content += '<div style="color: #FFA726;">💡 Tip: Water and fertilize before planting</div>';
            content += '</div>';
        }

        return content;
    }

    /**
     * Calculate remaining growth time for a crop
     */
    private calculateRemainingGrowthTime(cropTool: CropTool, crop: PlantedCrop, isWateredTile: boolean, fertilizerInfo: FertilizerInfo | null): number {
        let growthMultiplier = 1.0;
        if (isWateredTile) growthMultiplier += 0.25; // 25% from water
        if (fertilizerInfo) growthMultiplier += 0.40; // 40% from fertilizer

        const effectiveGrowTime = cropTool.growTime / growthMultiplier;
        const timePerStage = effectiveGrowTime * 1000; // Convert to milliseconds
        const timeForFullGrowth = timePerStage * crop.maxStages;
        const now = Date.now();
        return Math.max(0, timeForFullGrowth - (now - crop.plantedAt));
    }

    /**
     * Display tooltip with content and position
     */
    private display(content: string, screenX: number, screenY: number): void {
        if (!this.element) return;

        this.element.innerHTML = content;
        this.updatePosition(screenX, screenY);

        this.element.style.display = 'block';
        this.isVisible = true;

        // Animate in
        setTimeout(() => {
            if (this.element) {
                this.element.style.opacity = '1';
                this.element.style.transform = 'translateY(0)';
            }
        }, 10);
    }

    /**
     * Update tooltip position
     */
    private updatePosition(screenX: number, screenY: number): void {
        if (!this.element) return;

        // Ensure tooltip doesn't go off-screen
        const rect = this.element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        let x = screenX;
        let y = screenY - rect.height - 10; // Position above cursor

        // Adjust if going off right edge
        if (x + rect.width > viewportWidth) {
            x = viewportWidth - rect.width - 10;
        }

        // Adjust if going off left edge
        if (x < 10) {
            x = 10;
        }

        // Adjust if going off top edge
        if (y < 10) {
            y = screenY + 20; // Position below cursor instead
        }

        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    /**
     * Hide the tooltip
     */
    public hide(): void {
        this.clearTimeout();
        this.currentTileKey = null;

        if (this.element && this.isVisible) {
            this.element.style.opacity = '0';
            this.element.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                if (this.element) {
                    this.element.style.display = 'none';
                }
            }, 200);

            this.isVisible = false;
        }
    }

    /**
     * Show custom tooltip with arbitrary content
     */
    public showCustom(content: string, screenX: number, screenY: number, duration?: number): void {
        if (!this.element || !this.isInitialized) return;

        this.clearTimeout();
        this.currentTileKey = null;

        this.display(content, screenX, screenY);

        if (duration && duration > 0) {
            setTimeout(() => this.hide(), duration);
        }
    }

    /**
     * Clear timeout
     */
    private clearTimeout(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    /**
     * Set tooltip delay
     */
    public setDelay(delay: number): void {
        this.delay = Math.max(0, delay);
    }

    /**
     * Check if tooltip is visible
     */
    public isTooltipVisible(): boolean {
        return this.isVisible;
    }

    /**
     * Check if tooltip is initialized
     */
    public isReady(): boolean {
        return this.isInitialized && this.element !== null;
    }

    /**
     * Destroy tooltip and clean up
     */
    public destroy(): void {
        this.clearTimeout();

        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        this.element = null;
        this.currentTileKey = null;
        this.isVisible = false;
        this.isInitialized = false;
    }

    /**
     * Get tooltip statistics
     */
    public getStats(): Record<string, string | number | boolean> {
        return {
            isReady: this.isReady(),
            isVisible: this.isVisible,
            delay: this.delay,
            hasElement: this.element !== null,
            currentTile: this.currentTileKey || 'none'
        };
    }
}
