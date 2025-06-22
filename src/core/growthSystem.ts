import { tileMap, updateCropGrowth } from './tile';
import { getToolById } from './tools';
import type { CropTool } from '../types';

// Growth system manager
export class GrowthSystem {
    private lastUpdateTime: number = Date.now();    // Update all crops growth
    updateAllCrops(): void {
        const now = Date.now();
        let cropsUpdated = 0;

        tileMap.forEach((tileData, key) => {
            if (tileData.crop) {
                const [x, y] = key.split(',').map(Number);
                const tool = getToolById(tileData.crop.cropType) as CropTool;

                if (tool && tool.category === 'crop') {
                    const hasGrown = updateCropGrowth(x, y, tool.growTime);
                    if (hasGrown) {
                        cropsUpdated++;
                    }
                }
            }
        });

        if (cropsUpdated > 0) {
            console.log(`🌱 ${cropsUpdated} crop(s) grew to the next stage!`);
        }

        this.lastUpdateTime = now;
    }

    // Check if enough time has passed for update (every second)
    shouldUpdate(): boolean {
        const now = Date.now();
        return now - this.lastUpdateTime >= 1000; // Update every second
    }
}

// Global growth system instance
export const growthSystem = new GrowthSystem();
