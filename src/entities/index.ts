// Entity exports for the farming game

// Tile-related entities
export { Tile, PlantedCrop, TileEnhancements } from './Tile';

// Crop-related entities
export { Crop, CropStage } from './Crop';
export type { CropGrowthInfo, CropHarvestInfo } from './Crop';

// Area-related entities
export { Area, AreaStatus } from './Area';
export type { AreaUnlockInfo, AreaBounds } from './Area';

// Tool-related entities
export { Tool, ToolCategory } from './Tool';
export type {
    ToolRequirements,
    ToolUsageStats,
    ToolPerformance
} from './Tool';

// Re-export useful types from other modules
export type { TileType, ToolId } from '../types';
