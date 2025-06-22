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
        cost: 5,
    },
    {
        id: 'road',
        name: 'Road',
        category: 'terrain',
        icon: '🛤️',
        action: 'place_tile',
        tileType: 'road',
        hotkey: '2',
        cost: 10,
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
        growTime: 10,
        hotkey: 'Q',
        cost: 15,
        reward: 25,
    },
    {
        id: 'corn',
        name: 'Corn',
        category: 'crop',
        icon: '🌽',
        action: 'plant_crop',
        growthStages: 5,
        growTime: 15,
        hotkey: 'W',
        cost: 20,
        reward: 35,
    },
    {
        id: 'tomato',
        name: 'Tomato',
        category: 'crop',
        icon: '🍅',
        action: 'plant_crop',
        growthStages: 4,
        growTime: 12,
        hotkey: 'E',
        cost: 25,
        reward: 40,
    },
    {
        id: 'potato',
        name: 'Potato',
        category: 'crop',
        icon: '🥔',
        action: 'plant_crop',
        growthStages: 3,
        growTime: 9,
        hotkey: 'R',
        cost: 18,
        reward: 30,
    },
    {
        id: 'carrot',
        name: 'Carrot',
        category: 'crop',
        icon: '🥕',
        action: 'plant_crop',
        growthStages: 4,
        growTime: 12,
        hotkey: 'T',
        cost: 22,
        reward: 35,
    },
    {
        id: 'pepper',
        name: 'Pepper',
        category: 'crop',
        icon: '🌶️',
        action: 'plant_crop',
        growthStages: 4,
        growTime: 16,
        hotkey: 'Y',
        cost: 30,
        reward: 50,
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
        cost: 0,
    },
    {
        id: 'water',
        name: 'Water',
        category: 'action',
        icon: '💧',
        action: 'water_crop',
        hotkey: '4',
        cost: 2,
    },
    {
        id: 'fertilize',
        name: 'Fertilize',
        category: 'action',
        icon: '🌱',
        action: 'fertilize_crop',
        hotkey: '5',
        cost: 8,
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
