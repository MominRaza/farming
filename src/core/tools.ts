import type { GameTool, TerrainTool, CropTool, ActionTool } from '../types';

// Terrain tools
export const terrainTools: TerrainTool[] = [
    {
        id: 'soil',
        name: 'Soil',
        category: 'terrain',
        icon: '🟫',
        action: 'place_tile',
        tileType: 'soil',
    },
    {
        id: 'road',
        name: 'Road',
        category: 'terrain',
        icon: '🛤️',
        action: 'place_tile',
        tileType: 'road',
    },
];

// Crop tools
export const cropTools: CropTool[] = [
    {
        id: 'wheat',
        name: 'Wheat',
        category: 'crop',
        icon: '🌾',
        action: 'plant_crop',
        growthStages: 4,
        growTime: 60,
    },
    {
        id: 'corn',
        name: 'Corn',
        category: 'crop',
        icon: '🌽',
        action: 'plant_crop',
        growthStages: 5,
        growTime: 90,
    },
    {
        id: 'tomato',
        name: 'Tomato',
        category: 'crop',
        icon: '🍅',
        action: 'plant_crop',
        growthStages: 4,
        growTime: 80,
    },
];

// Action tools
export const actionTools: ActionTool[] = [
    {
        id: 'harvest',
        name: 'Harvest',
        category: 'action',
        icon: '✋',
        action: 'harvest_crop',
    },
    {
        id: 'water',
        name: 'Water',
        category: 'action',
        icon: '💧',
        action: 'water_crop',
    },
    {
        id: 'fertilize',
        name: 'Fertilize',
        category: 'action',
        icon: '🌱',
        action: 'fertilize_crop',
    },
];

// All tools combined
export const allTools: GameTool[] = [
    ...terrainTools,
    ...cropTools,
    ...actionTools,
];

// Helper function to get tool by ID
export function getToolById(id: string): GameTool | undefined {
    return allTools.find(tool => tool.id === id);
}

// Helper function to get tools by category
export function getToolsByCategory(category: 'terrain' | 'crop' | 'action'): GameTool[] {
    return allTools.filter(tool => tool.category === category);
}
