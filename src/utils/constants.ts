// always sync with GAME_BALANCE_DOCUMENT.md

// 💰 Starting Resources
export const STARTING_COINS = 300;

// 🏗️ Area System
export const GRID_SIZE = 50;
export const AREA_SIZE = 12; // Each area is 12x12 tiles
export const AREA_BASE_COST = 200; // Base cost for purchasing an area
export const AREA_DISTANCE_MULTIPLIER = 100; // Cost per distance unit

// 🟫 Terrain Building Costs
export const TERRAIN_COSTS = {
    soil: 3,
    road: 8,
} as const;

// 🌱 Crop Data (Cost, Reward, Growth Time in seconds)
export const CROP_DATA = {
    wheat: { cost: 12, reward: 20, growTime: 25, stages: 5 },
    spinach: { cost: 8, reward: 15, growTime: 18, stages: 5 },
    carrot: { cost: 15, reward: 25, growTime: 30, stages: 5 },
    potato: { cost: 10, reward: 18, growTime: 22, stages: 5 },
    tomato: { cost: 20, reward: 35, growTime: 35, stages: 5 },
    corn: { cost: 25, reward: 45, growTime: 40, stages: 5 },
    onion: { cost: 18, reward: 32, growTime: 45, stages: 5 },
    pea: { cost: 16, reward: 28, growTime: 28, stages: 5 },
    eggplant: { cost: 30, reward: 55, growTime: 50, stages: 5 },
    pepper: { cost: 35, reward: 65, growTime: 55, stages: 5 },
} as const;

// 🚿 Action Tool Data (Cost, Effects, and Limits)
export const ACTION_DATA = {
    harvest: { cost: 0 },
    water: { cost: 5, duration: 60000, speedBonus: 0.30 },
    fertilize: { cost: 15, speedBonus: 0.50, maxUsage: 3 },
} as const;
