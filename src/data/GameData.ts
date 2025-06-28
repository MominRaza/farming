/**
 * Game Data
 * Centralized static game data and constants
 */

import { TOOL_DEFINITIONS, TOOL_CATEGORIES } from '../config/ToolConfig';
import { CROP_DEFINITIONS, CROP_CATEGORIES } from '../config/CropConfig';
import type { ToolDefinition } from '../config/ToolConfig';
import type { CropDefinition } from '../config/CropConfig';

/**
 * Achievement definitions
 */
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: AchievementCategory;
    requirements: AchievementRequirements;
    rewards: AchievementRewards;
    hidden?: boolean;
}

export interface AchievementRequirements {
    harvestedCrops?: number;
    totalCoins?: number;
    unlockedAreas?: number;
    cropsPlanted?: number;
    timePlayedMinutes?: number;
    specificCrops?: Record<string, number>;
    consecutiveDays?: number;
}

export interface AchievementRewards {
    coins?: number;
    experience?: number;
    title?: string;
    unlockCrop?: string;
    unlockTool?: string;
}

export const AchievementCategory = {
    PLANTING: 'planting',
    HARVESTING: 'harvesting',
    ECONOMIC: 'economic',
    EXPLORATION: 'exploration',
    MASTERY: 'mastery',
    SPECIAL: 'special'
} as const;

export type AchievementCategory = typeof AchievementCategory[keyof typeof AchievementCategory];

/**
 * Game level definitions
 */
export interface LevelDefinition {
    level: number;
    experienceRequired: number;
    rewards: LevelRewards;
    unlocks: LevelUnlocks;
}

export interface LevelRewards {
    coins: number;
    title?: string;
    badge?: string;
}

export interface LevelUnlocks {
    crops?: string[];
    tools?: string[];
    features?: string[];
    areas?: number;
}

/**
 * Tutorial step definitions
 */
export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    target?: string;
    action: TutorialAction;
    highlight?: boolean;
    skipable?: boolean;
}

export const TutorialAction = {
    CLICK: 'click',
    PLANT: 'plant',
    HARVEST: 'harvest',
    ENHANCE: 'enhance',
    PURCHASE: 'purchase',
    WAIT: 'wait',
    INFO: 'info'
} as const;

export type TutorialAction = typeof TutorialAction[keyof typeof TutorialAction];

/**
 * All game achievements
 */
export const ACHIEVEMENTS: Record<string, Achievement> = {
    first_harvest: {
        id: 'first_harvest',
        name: 'First Harvest',
        description: 'Harvest your first crop',
        icon: '🌾',
        category: AchievementCategory.HARVESTING,
        requirements: { harvestedCrops: 1 },
        rewards: { coins: 10, experience: 25 }
    },

    green_thumb: {
        id: 'green_thumb',
        name: 'Green Thumb',
        description: 'Plant 10 crops',
        icon: '🌱',
        category: AchievementCategory.PLANTING,
        requirements: { cropsPlanted: 10 },
        rewards: { coins: 25, experience: 50 }
    },

    harvest_master: {
        id: 'harvest_master',
        name: 'Harvest Master',
        description: 'Harvest 100 crops',
        icon: '🏆',
        category: AchievementCategory.HARVESTING,
        requirements: { harvestedCrops: 100 },
        rewards: { coins: 100, experience: 200, title: 'Harvest Master' }
    },

    wealthy_farmer: {
        id: 'wealthy_farmer',
        name: 'Wealthy Farmer',
        description: 'Accumulate 1000 coins',
        icon: '💰',
        category: AchievementCategory.ECONOMIC,
        requirements: { totalCoins: 1000 },
        rewards: { experience: 150, title: 'Wealthy Farmer' }
    },

    explorer: {
        id: 'explorer',
        name: 'Explorer',
        description: 'Unlock 5 areas',
        icon: '🗺️',
        category: AchievementCategory.EXPLORATION,
        requirements: { unlockedAreas: 5 },
        rewards: { coins: 200, experience: 100 }
    },

    wheat_specialist: {
        id: 'wheat_specialist',
        name: 'Wheat Specialist',
        description: 'Harvest 50 wheat crops',
        icon: '🌾',
        category: AchievementCategory.MASTERY,
        requirements: { specificCrops: { wheat: 50 } },
        rewards: { coins: 75, experience: 100, unlockTool: 'super_fertilizer' }
    },

    diverse_farmer: {
        id: 'diverse_farmer',
        name: 'Diverse Farmer',
        description: 'Plant all basic crop types',
        icon: '🌈',
        category: AchievementCategory.PLANTING,
        requirements: {
            specificCrops: { wheat: 1, corn: 1, carrot: 1, tomato: 1 }
        },
        rewards: { coins: 100, experience: 150, unlockCrop: 'pepper' }
    },

    efficiency_expert: {
        id: 'efficiency_expert',
        name: 'Efficiency Expert',
        description: 'Complete 1000 harvests',
        icon: '⚡',
        category: AchievementCategory.MASTERY,
        requirements: { harvestedCrops: 1000 },
        rewards: { coins: 500, experience: 1000, unlockTool: 'auto_harvester' }
    },

    dedication: {
        id: 'dedication',
        name: 'Dedication',
        description: 'Play for 7 consecutive days',
        icon: '📅',
        category: AchievementCategory.SPECIAL,
        requirements: { consecutiveDays: 7 },
        rewards: { coins: 300, experience: 200, title: 'Dedicated Farmer' },
        hidden: true
    }
};

/**
 * Game level progression
 */
export const LEVEL_DEFINITIONS: Record<number, LevelDefinition> = {
    1: {
        level: 1,
        experienceRequired: 0,
        rewards: { coins: 0 },
        unlocks: { crops: ['wheat'], tools: ['harvest_tool', 'water'] }
    },
    2: {
        level: 2,
        experienceRequired: 100,
        rewards: { coins: 50, title: 'Novice Farmer' },
        unlocks: { crops: ['carrot'], tools: ['fertilizer'] }
    },
    3: {
        level: 3,
        experienceRequired: 250,
        rewards: { coins: 75 },
        unlocks: { crops: ['spinach'], areas: 1 }
    },
    4: {
        level: 4,
        experienceRequired: 500,
        rewards: { coins: 100, title: 'Apprentice Farmer' },
        unlocks: { crops: ['corn'], tools: ['shovel'] }
    },
    5: {
        level: 5,
        experienceRequired: 800,
        rewards: { coins: 150 },
        unlocks: { crops: ['onion'], areas: 1 }
    },
    6: {
        level: 6,
        experienceRequired: 1200,
        rewards: { coins: 200, title: 'Skilled Farmer' },
        unlocks: { crops: ['pea'], tools: ['area_expander'] }
    },
    7: {
        level: 7,
        experienceRequired: 1700,
        rewards: { coins: 250 },
        unlocks: { crops: ['potato'], areas: 2 }
    },
    8: {
        level: 8,
        experienceRequired: 2300,
        rewards: { coins: 300, title: 'Expert Farmer' },
        unlocks: { crops: ['tomato'] }
    },
    9: {
        level: 9,
        experienceRequired: 3000,
        rewards: { coins: 400 },
        unlocks: { crops: ['eggplant'], areas: 2 }
    },
    10: {
        level: 10,
        experienceRequired: 4000,
        rewards: { coins: 500, title: 'Master Farmer', badge: '🏆' },
        unlocks: { crops: ['pepper'], tools: ['super_fertilizer'], features: ['auto_save'] }
    }
};

/**
 * Tutorial steps
 */
export const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Farming Game!',
        description: 'Learn the basics of farming and growing crops.',
        action: TutorialAction.INFO
    },
    {
        id: 'select_wheat',
        title: 'Select Wheat Seeds',
        description: 'Click on the wheat seeds tool to select it.',
        target: 'tool-wheat_seeds',
        action: TutorialAction.CLICK,
        highlight: true
    },
    {
        id: 'plant_first_crop',
        title: 'Plant Your First Crop',
        description: 'Click on an empty tile to plant wheat.',
        action: TutorialAction.PLANT,
        highlight: true
    },
    {
        id: 'wait_for_growth',
        title: 'Wait for Growth',
        description: 'Watch your crop grow! It will change stages as it matures.',
        action: TutorialAction.WAIT
    },
    {
        id: 'harvest_crop',
        title: 'Harvest Your Crop',
        description: 'Click on the mature crop to harvest it and earn coins.',
        action: TutorialAction.HARVEST,
        highlight: true
    },
    {
        id: 'use_water',
        title: 'Speed Up Growth',
        description: 'Select water and use it on a growing crop to speed up growth.',
        target: 'tool-water',
        action: TutorialAction.ENHANCE,
        highlight: true
    },
    {
        id: 'use_fertilizer',
        title: 'Increase Value',
        description: 'Use fertilizer to increase the harvest value of crops.',
        target: 'tool-fertilizer',
        action: TutorialAction.ENHANCE,
        highlight: true
    },
    {
        id: 'expand_farm',
        title: 'Expand Your Farm',
        description: 'Purchase new areas to grow more crops.',
        action: TutorialAction.PURCHASE,
        skipable: true
    },
    {
        id: 'tutorial_complete',
        title: 'Tutorial Complete!',
        description: 'You\'re ready to become a master farmer. Good luck!',
        action: TutorialAction.INFO
    }
];

/**
 * Game statistics tracking
 */
export interface GameStatistics {
    gameplay: {
        totalPlayTimeMinutes: number;
        sessionsPlayed: number;
        lastPlayDate: string;
        consecutiveDays: number;
    };
    crops: {
        totalPlanted: number;
        totalHarvested: number;
        cropTypeStats: Record<string, { planted: number; harvested: number; }>;
        fastestGrowth: number;
        mostValuableCrop: string;
    };
    economy: {
        totalCoinsEarned: number;
        totalCoinsSpent: number;
        currentCoins: number;
        biggestTransaction: number;
        totalTransactions: number;
    };
    progress: {
        currentLevel: number;
        totalExperience: number;
        achievementsUnlocked: string[];
        areasUnlocked: number;
        cropsUnlocked: string[];
        toolsUnlocked: string[];
    };
    performance: {
        averageHarvestTime: number;
        efficiencyRating: number;
        bestDay: { date: string; harvests: number; coins: number; };
        streaks: { current: number; best: number; };
    };
}

/**
 * Default game statistics
 */
export const DEFAULT_STATISTICS: GameStatistics = {
    gameplay: {
        totalPlayTimeMinutes: 0,
        sessionsPlayed: 0,
        lastPlayDate: '',
        consecutiveDays: 0
    },
    crops: {
        totalPlanted: 0,
        totalHarvested: 0,
        cropTypeStats: {},
        fastestGrowth: 0,
        mostValuableCrop: ''
    },
    economy: {
        totalCoinsEarned: 0,
        totalCoinsSpent: 0,
        currentCoins: 100,
        biggestTransaction: 0,
        totalTransactions: 0
    },
    progress: {
        currentLevel: 1,
        totalExperience: 0,
        achievementsUnlocked: [],
        areasUnlocked: 1,
        cropsUnlocked: ['wheat'],
        toolsUnlocked: ['wheat_seeds', 'harvest_tool']
    },
    performance: {
        averageHarvestTime: 0,
        efficiencyRating: 0,
        bestDay: { date: '', harvests: 0, coins: 0 },
        streaks: { current: 0, best: 0 }
    }
};

/**
 * Game data manager
 * Provides centralized access to all game data
 */
export class GameData {
    /**
     * Get all tools
     */
    public static getTools(): Record<string, ToolDefinition> {
        return TOOL_DEFINITIONS;
    }

    /**
     * Get all crops
     */
    public static getCrops(): Record<string, CropDefinition> {
        return CROP_DEFINITIONS;
    }

    /**
     * Get all achievements
     */
    public static getAchievements(): Record<string, Achievement> {
        return ACHIEVEMENTS;
    }

    /**
     * Get level definitions
     */
    public static getLevels(): Record<number, LevelDefinition> {
        return LEVEL_DEFINITIONS;
    }

    /**
     * Get tutorial steps
     */
    public static getTutorial(): TutorialStep[] {
        return TUTORIAL_STEPS;
    }

    /**
     * Get tool categories
     */
    public static getToolCategories(): typeof TOOL_CATEGORIES {
        return TOOL_CATEGORIES;
    }

    /**
     * Get crop categories
     */
    public static getCropCategories(): typeof CROP_CATEGORIES {
        return CROP_CATEGORIES;
    }

    /**
     * Calculate experience required for level
     */
    public static getExperienceForLevel(level: number): number {
        const levelDef = LEVEL_DEFINITIONS[level];
        return levelDef ? levelDef.experienceRequired : level * 200;
    }

    /**
     * Get level from experience
     */
    public static getLevelFromExperience(experience: number): number {
        let level = 1;

        for (const [levelNum, levelDef] of Object.entries(LEVEL_DEFINITIONS)) {
            if (experience >= levelDef.experienceRequired) {
                level = parseInt(levelNum);
            } else {
                break;
            }
        }

        return level;
    }

    /**
     * Get unlocked content for level
     */
    public static getUnlocksForLevel(level: number): LevelUnlocks {
        const allUnlocks: LevelUnlocks = {
            crops: [],
            tools: [],
            features: [],
            areas: 0
        };

        for (let i = 1; i <= level; i++) {
            const levelDef = LEVEL_DEFINITIONS[i];
            if (levelDef?.unlocks) {
                if (levelDef.unlocks.crops) {
                    allUnlocks.crops?.push(...levelDef.unlocks.crops);
                }
                if (levelDef.unlocks.tools) {
                    allUnlocks.tools?.push(...levelDef.unlocks.tools);
                }
                if (levelDef.unlocks.features) {
                    allUnlocks.features?.push(...levelDef.unlocks.features);
                }
                if (levelDef.unlocks.areas) {
                    allUnlocks.areas! += levelDef.unlocks.areas;
                }
            }
        }

        return allUnlocks;
    }

    /**
     * Check if achievement is completed
     */
    public static checkAchievement(achievementId: string, stats: Partial<GameStatistics>): boolean {
        const achievement = ACHIEVEMENTS[achievementId];
        if (!achievement) return false;

        const req = achievement.requirements;

        if (req.harvestedCrops && (!stats.crops || stats.crops.totalHarvested < req.harvestedCrops)) {
            return false;
        }

        if (req.totalCoins && (!stats.economy || stats.economy.totalCoinsEarned < req.totalCoins)) {
            return false;
        }

        if (req.unlockedAreas && (!stats.progress || stats.progress.areasUnlocked < req.unlockedAreas)) {
            return false;
        }

        if (req.cropsPlanted && (!stats.crops || stats.crops.totalPlanted < req.cropsPlanted)) {
            return false;
        }

        if (req.timePlayedMinutes && (!stats.gameplay || stats.gameplay.totalPlayTimeMinutes < req.timePlayedMinutes)) {
            return false;
        }

        if (req.specificCrops && stats.crops?.cropTypeStats) {
            for (const [cropId, requiredCount] of Object.entries(req.specificCrops)) {
                const harvested = stats.crops.cropTypeStats[cropId]?.harvested || 0;
                if (harvested < requiredCount) {
                    return false;
                }
            }
        }

        if (req.consecutiveDays && (!stats.gameplay || stats.gameplay.consecutiveDays < req.consecutiveDays)) {
            return false;
        }

        return true;
    }

    /**
     * Get achievements by category
     */
    public static getAchievementsByCategory(category: AchievementCategory): Achievement[] {
        return Object.values(ACHIEVEMENTS).filter(achievement =>
            achievement.category === category
        );
    }

    /**
     * Get visible achievements (non-hidden)
     */
    public static getVisibleAchievements(): Achievement[] {
        return Object.values(ACHIEVEMENTS).filter(achievement => !achievement.hidden);
    }

    /**
     * Validate game data integrity
     */
    public static validateData(): { valid: boolean; errors: string[]; } {
        const errors: string[] = [];

        // Check for duplicate IDs
        const toolIds = Object.keys(TOOL_DEFINITIONS);
        const cropIds = Object.keys(CROP_DEFINITIONS);
        const achievementIds = Object.keys(ACHIEVEMENTS);

        const allIds = [...toolIds, ...cropIds, ...achievementIds];
        const uniqueIds = new Set(allIds);

        if (allIds.length !== uniqueIds.size) {
            errors.push('Duplicate IDs found in game data');
        }

        // Validate required fields
        Object.values(TOOL_DEFINITIONS).forEach(tool => {
            if (!tool.id || !tool.name || !tool.icon) {
                errors.push(`Invalid tool definition: ${tool.id}`);
            }
        });

        Object.values(CROP_DEFINITIONS).forEach(crop => {
            if (!crop.id || !crop.name || !crop.icon || !crop.economics) {
                errors.push(`Invalid crop definition: ${crop.id}`);
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

// Export data for easy access
export { TOOL_DEFINITIONS, CROP_DEFINITIONS, TOOL_CATEGORIES, CROP_CATEGORIES };
