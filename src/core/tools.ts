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
        hotkey: '1',
    },
    {
        id: 'road',
        name: 'Road',
        category: 'terrain',
        icon: '🛤️',
        action: 'place_tile',
        tileType: 'road',
        hotkey: '2',
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
        hotkey: 'Q',
    },
    {
        id: 'corn',
        name: 'Corn',
        category: 'crop',
        icon: '🌽',
        action: 'plant_crop',
        growthStages: 5,
        growTime: 90,
        hotkey: 'W',
    },
    {
        id: 'tomato',
        name: 'Tomato',
        category: 'crop',
        icon: '🍅',
        action: 'plant_crop',
        growthStages: 4,
        growTime: 80,
        hotkey: 'E',
    },
    {
        id: 'potato',
        name: 'Potato',
        category: 'crop',
        icon: '🥔',
        action: 'plant_crop',
        growthStages: 3,
        growTime: 70,
        hotkey: 'R',
    },
    {
        id: 'carrot',
        name: 'Carrot',
        category: 'crop',
        icon: '🥕',
        action: 'plant_crop',
        growthStages: 4,
        growTime: 75,
        hotkey: 'T',
    },
    {
        id: 'pepper',
        name: 'Pepper',
        category: 'crop',
        icon: '🌶️',
        action: 'plant_crop',
        growthStages: 4,
        growTime: 85,
        hotkey: 'Y',
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
        hotkey: '3',
    },
    {
        id: 'water',
        name: 'Water',
        category: 'action',
        icon: '💧',
        action: 'water_crop',
        hotkey: '4',
    },
    {
        id: 'fertilize',
        name: 'Fertilize',
        category: 'action',
        icon: '🌱',
        action: 'fertilize_crop',
        hotkey: '5',
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
