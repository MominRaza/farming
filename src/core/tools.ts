import type { GameTool, TerrainTool, CropTool, ActionTool } from '../types';
import { TERRAIN_COSTS, CROP_DATA, ACTION_DATA } from '../utils/constants';

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
        cost: TERRAIN_COSTS.soil,
    },
    {
        id: 'road',
        name: 'Road',
        category: 'terrain',
        icon: '🛤️',
        action: 'place_tile',
        tileType: 'road',
        hotkey: '2',
        cost: TERRAIN_COSTS.road,
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
        growthStages: CROP_DATA.wheat.stages,
        growTime: CROP_DATA.wheat.growTime,
        hotkey: 'Q',
        cost: CROP_DATA.wheat.cost,
        reward: CROP_DATA.wheat.reward,
    },
    {
        id: 'spinach',
        name: 'Spinach',
        category: 'crop',
        icon: '🥬',
        action: 'plant_crop',
        growthStages: CROP_DATA.spinach.stages,
        growTime: CROP_DATA.spinach.growTime,
        hotkey: 'W',
        cost: CROP_DATA.spinach.cost,
        reward: CROP_DATA.spinach.reward,
    },
    {
        id: 'carrot',
        name: 'Carrot',
        category: 'crop',
        icon: '🥕',
        action: 'plant_crop',
        growthStages: CROP_DATA.carrot.stages,
        growTime: CROP_DATA.carrot.growTime,
        hotkey: 'E',
        cost: CROP_DATA.carrot.cost,
        reward: CROP_DATA.carrot.reward,
    },
    {
        id: 'potato',
        name: 'Potato',
        category: 'crop',
        icon: '🥔',
        action: 'plant_crop',
        growthStages: CROP_DATA.potato.stages,
        growTime: CROP_DATA.potato.growTime,
        hotkey: 'R',
        cost: CROP_DATA.potato.cost,
        reward: CROP_DATA.potato.reward,
    },
    {
        id: 'tomato',
        name: 'Tomato',
        category: 'crop',
        icon: '🍅',
        action: 'plant_crop',
        growthStages: CROP_DATA.tomato.stages,
        growTime: CROP_DATA.tomato.growTime,
        hotkey: 'T',
        cost: CROP_DATA.tomato.cost,
        reward: CROP_DATA.tomato.reward,
    },
    {
        id: 'corn',
        name: 'Corn',
        category: 'crop',
        icon: '🌽',
        action: 'plant_crop',
        growthStages: CROP_DATA.corn.stages,
        growTime: CROP_DATA.corn.growTime,
        hotkey: 'Y',
        cost: CROP_DATA.corn.cost,
        reward: CROP_DATA.corn.reward,
    },
    {
        id: 'onion',
        name: 'Onion',
        category: 'crop',
        icon: '🧅',
        action: 'plant_crop',
        growthStages: CROP_DATA.onion.stages,
        growTime: CROP_DATA.onion.growTime,
        hotkey: 'U',
        cost: CROP_DATA.onion.cost,
        reward: CROP_DATA.onion.reward,
    },
    {
        id: 'pea',
        name: 'Pea',
        category: 'crop',
        icon: '🫛',
        action: 'plant_crop',
        growthStages: CROP_DATA.pea.stages,
        growTime: CROP_DATA.pea.growTime,
        hotkey: 'I',
        cost: CROP_DATA.pea.cost,
        reward: CROP_DATA.pea.reward,
    },
    {
        id: 'eggplant',
        name: 'Eggplant',
        category: 'crop',
        icon: '🍆',
        action: 'plant_crop',
        growthStages: CROP_DATA.eggplant.stages,
        growTime: CROP_DATA.eggplant.growTime,
        hotkey: 'O',
        cost: CROP_DATA.eggplant.cost,
        reward: CROP_DATA.eggplant.reward,
    },
    {
        id: 'pepper',
        name: 'Pepper',
        category: 'crop',
        icon: '🌶️',
        action: 'plant_crop',
        growthStages: CROP_DATA.pepper.stages,
        growTime: CROP_DATA.pepper.growTime,
        hotkey: 'P',
        cost: CROP_DATA.pepper.cost,
        reward: CROP_DATA.pepper.reward,
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
        cost: ACTION_DATA.harvest.cost,
    },
    {
        id: 'water',
        name: 'Water',
        category: 'action',
        icon: '💧',
        action: 'water_crop',
        hotkey: '4',
        cost: ACTION_DATA.water.cost,
    },
    {
        id: 'fertilize',
        name: 'Fertilize',
        category: 'action',
        icon: '🌱',
        action: 'fertilize_crop',
        hotkey: '5',
        cost: ACTION_DATA.fertilize.cost,
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
