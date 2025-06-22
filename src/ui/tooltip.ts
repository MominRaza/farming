import { state } from '../core/state';
import { getTileData, hasCrop, getFertilizerUsage, isWatered, hasSoil } from '../core/tile';
import { getToolById } from '../core/tools';
import { WATER_DURATION } from '../utils/constants';

// Tooltip element and state
let tooltip: HTMLDivElement | null = null;
let tooltipTimeout: number | null = null;
let currentTooltipTile: string | null = null;

// Initialize tooltip
export function initTooltip(): void {
    tooltip = document.createElement('div');
    tooltip.id = 'crop-tooltip'; tooltip.style.cssText = `
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
    `;
    document.body.appendChild(tooltip);
}

// Show tooltip with soil and crop information
export function showTooltip(x: number, y: number, screenX: number, screenY: number): void {
    if (!tooltip) return;

    const tileKey = `${x},${y}`;

    // Only show tooltip if no tool is selected and tile has soil
    if (state.selectedTool !== null || !hasSoil(x, y)) {
        hideTooltip();
        return;
    }

    // If tooltip is already visible for the same tile, just update position
    if (currentTooltipTile === tileKey && tooltip.style.display === 'block') {
        tooltip.style.left = `${screenX}px`;
        tooltip.style.top = `${screenY}px`;
        return;
    }

    // Clear any existing timeout
    if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
    }

    currentTooltipTile = tileKey;

    // Show tooltip after a short delay
    tooltipTimeout = setTimeout(() => {
        displayTooltipContent(x, y, screenX, screenY);
    }, 500); // 500ms delay
}

// Display the actual tooltip content
function displayTooltipContent(x: number, y: number, screenX: number, screenY: number): void {
    if (!tooltip) return;

    const tileData = getTileData(x, y);
    if (!tileData || tileData.type !== 'soil') {
        hideTooltip();
        return;
    }

    // Get soil effects information
    const fertilizerInfo = getFertilizerUsage(x, y);
    const isWateredTile = isWatered(x, y);
    const hasCropOnTile = hasCrop(x, y);

    // Build tooltip content
    let content = '';

    if (hasCropOnTile && tileData.crop) {
        // Show crop information
        const cropTool = getToolById(tileData.crop.cropType);
        if (cropTool && cropTool.category === 'crop') {
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

            // Time to maturity estimation (if not mature) 
            if (!isMature && 'growTime' in cropTool) {
                // Calculate effective grow time with modifiers
                let growthMultiplier = 1.0;
                if (isWateredTile) growthMultiplier += 0.25; // 25% from water
                if (fertilizerInfo) growthMultiplier += 0.40; // 40% from fertilizer

                const effectiveGrowTime = cropTool.growTime / growthMultiplier;
                const timePerStage = effectiveGrowTime * 1000; // Convert to milliseconds
                const timeForFullGrowth = timePerStage * tileData.crop.maxStages;
                const remainingTime = Math.max(0, timeForFullGrowth - (now - tileData.crop.plantedAt));
                const remainingSeconds = Math.round(remainingTime / 1000);

                if (remainingSeconds > 0) {
                    content += `<div style="color: #FFA726;">⏳ Time to mature: ${remainingSeconds}s</div>`;
                }
            }

            // Reward information
            if ('reward' in cropTool && cropTool.reward && isMature) {
                content += `<div style="margin-top: 4px; color: #FFD54F;">💰 Harvest Value: ${cropTool.reward} coins</div>`;
            }
        }
    } else {
        // Show empty soil information
        content += `<div style="color: #8B4513; font-weight: bold; margin-bottom: 4px;">🟫 Empty Soil</div>`;
        content += `<div style="color: #999; font-size: 10px; margin-bottom: 4px;">Position: (${x}, ${y})</div>`;
        content += `<div style="color: #999;">Ready for planting</div>`;
    }

    // Show soil effects (for both empty and planted soil)
    const effects = [];
    if (isWateredTile) {
        // Calculate remaining water time
        const now = Date.now();
        if (tileData.wateredAt) {
            const timeElapsed = now - tileData.wateredAt;
            const remainingTime = Math.max(0, WATER_DURATION - timeElapsed);
            const remainingSeconds = Math.round(remainingTime / 1000);
            effects.push(`💧 Watered (+25% speed) - ${remainingSeconds}s left`);
        } else {
            effects.push('💧 Watered (+25% speed)');
        }
    }
    if (fertilizerInfo) {
        effects.push(`🌱 Fertilized (+40% speed) - ${fertilizerInfo.max - fertilizerInfo.used}/${fertilizerInfo.max} uses left`);
    }

    if (effects.length > 0) {
        content += '<div style="margin-top: 4px; border-top: 1px solid #555; padding-top: 4px;">';
        effects.forEach(effect => {
            content += `<div style="color: #81C784;">${effect}</div>`;
        });
        content += '</div>';
    } else if (!hasCropOnTile) {
        // Show suggestions for empty soil
        content += '<div style="margin-top: 4px; border-top: 1px solid #555; padding-top: 4px;">';
        content += '<div style="color: #FFA726;">� Tip: Water and fertilize before planting</div>';
        content += '</div>';
    }

    // Position tooltip at the cursor
    tooltip.innerHTML = content;
    tooltip.style.left = `${screenX}px`;
    tooltip.style.top = `${screenY}px`;
    tooltip.style.display = 'block';
}

// Hide tooltip
export function hideTooltip(): void {
    if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
    }

    currentTooltipTile = null;

    if (tooltip) {
        tooltip.style.display = 'none';
    }
}
