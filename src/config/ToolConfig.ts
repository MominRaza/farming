/**
 * Tool Configuration
 * Defines all tools available in the game with their properties and behavior
 */

export interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: string;
    hotkey?: string;
    category: ToolCategory;
    requirements?: ToolRequirements;
    effects?: ToolEffects;
    metadata?: ToolMetadata;
}

export interface ToolRequirements {
    minCoins?: number;
    unlockedAreas?: number;
    harvestedCrops?: number;
    level?: number;
}

export interface ToolEffects {
    coinModifier?: number;
    growthSpeedBonus?: number;
    harvestMultiplier?: number;
    autoHarvest?: boolean;
    waterBonus?: boolean;
    fertilizerBonus?: boolean;
}

export interface ToolMetadata {
    isConsumable?: boolean;
    maxUses?: number;
    cooldown?: number;
    stackable?: boolean;
    rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const ToolCategory = {
    PLANTING: 'planting',
    ENHANCEMENT: 'enhancement',
    HARVESTING: 'harvesting',
    UTILITY: 'utility',
    PREMIUM: 'premium'
} as const;

export type ToolCategory = typeof ToolCategory[keyof typeof ToolCategory];

/**
 * All available tools in the game
 */
export const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
    // Planting Tools
    wheat_seeds: {
        id: 'wheat_seeds',
        name: 'Wheat Seeds',
        description: 'Plant wheat crops that grow quickly and provide steady income',
        cost: 5,
        icon: '🌾',
        hotkey: '1',
        category: ToolCategory.PLANTING,
        requirements: {
            minCoins: 5
        },
        metadata: {
            isConsumable: true,
            rarity: 'common'
        }
    },

    corn_seeds: {
        id: 'corn_seeds',
        name: 'Corn Seeds',
        description: 'Plant corn crops with higher value but longer growth time',
        cost: 15,
        icon: '🌽',
        hotkey: '2',
        category: ToolCategory.PLANTING,
        requirements: {
            minCoins: 15,
            harvestedCrops: 5
        },
        metadata: {
            isConsumable: true,
            rarity: 'common'
        }
    },

    carrot_seeds: {
        id: 'carrot_seeds',
        name: 'Carrot Seeds',
        description: 'Plant carrot crops with balanced growth time and value',
        cost: 10,
        icon: '🥕',
        hotkey: '3',
        category: ToolCategory.PLANTING,
        requirements: {
            minCoins: 10
        },
        metadata: {
            isConsumable: true,
            rarity: 'common'
        }
    },

    tomato_seeds: {
        id: 'tomato_seeds',
        name: 'Tomato Seeds',
        description: 'Plant tomato crops with excellent value and moderate growth time',
        cost: 20,
        icon: '🍅',
        hotkey: '4',
        category: ToolCategory.PLANTING,
        requirements: {
            minCoins: 20,
            harvestedCrops: 10
        },
        metadata: {
            isConsumable: true,
            rarity: 'uncommon'
        }
    },

    // Enhancement Tools
    water: {
        id: 'water',
        name: 'Water',
        description: 'Speeds up crop growth by 50%',
        cost: 8,
        icon: '💧',
        hotkey: 'w',
        category: ToolCategory.ENHANCEMENT,
        requirements: {
            minCoins: 8
        },
        effects: {
            growthSpeedBonus: 0.5,
            waterBonus: true
        },
        metadata: {
            isConsumable: true,
            rarity: 'common'
        }
    },

    fertilizer: {
        id: 'fertilizer',
        name: 'Fertilizer',
        description: 'Increases crop harvest value by 100%',
        cost: 12,
        icon: '🧪',
        hotkey: 'f',
        category: ToolCategory.ENHANCEMENT,
        requirements: {
            minCoins: 12,
            harvestedCrops: 3
        },
        effects: {
            harvestMultiplier: 2.0,
            fertilizerBonus: true
        },
        metadata: {
            isConsumable: true,
            rarity: 'common'
        }
    },

    super_fertilizer: {
        id: 'super_fertilizer',
        name: 'Super Fertilizer',
        description: 'Premium fertilizer that increases harvest value by 200%',
        cost: 25,
        icon: '🧪',
        hotkey: 's',
        category: ToolCategory.PREMIUM,
        requirements: {
            minCoins: 25,
            harvestedCrops: 20
        },
        effects: {
            harvestMultiplier: 3.0,
            fertilizerBonus: true
        },
        metadata: {
            isConsumable: true,
            rarity: 'rare'
        }
    },

    // Harvesting Tools
    harvest_tool: {
        id: 'harvest_tool',
        name: 'Harvest Tool',
        description: 'Manually harvest mature crops',
        cost: 0,
        icon: '🔨',
        hotkey: 'h',
        category: ToolCategory.HARVESTING,
        metadata: {
            rarity: 'common'
        }
    },

    auto_harvester: {
        id: 'auto_harvester',
        name: 'Auto Harvester',
        description: 'Automatically harvests crops when they mature',
        cost: 100,
        icon: '🤖',
        hotkey: 'a',
        category: ToolCategory.PREMIUM,
        requirements: {
            minCoins: 100,
            harvestedCrops: 50
        },
        effects: {
            autoHarvest: true
        },
        metadata: {
            rarity: 'epic'
        }
    },

    // Utility Tools
    shovel: {
        id: 'shovel',
        name: 'Shovel',
        description: 'Remove crops or clear tiles',
        cost: 3,
        icon: '🪣',
        hotkey: 'x',
        category: ToolCategory.UTILITY,
        requirements: {
            minCoins: 3
        },
        metadata: {
            rarity: 'common'
        }
    },

    area_expander: {
        id: 'area_expander',
        name: 'Area Expander',
        description: 'Unlock new areas for farming',
        cost: 50,
        icon: '📐',
        hotkey: 'e',
        category: ToolCategory.UTILITY,
        requirements: {
            minCoins: 50
        },
        metadata: {
            rarity: 'uncommon'
        }
    }
};

/**
 * Tool categories for organization and filtering
 */
export const TOOL_CATEGORIES = {
    [ToolCategory.PLANTING]: {
        name: 'Planting',
        description: 'Seeds and planting tools',
        icon: '🌱',
        color: '#4CAF50'
    },
    [ToolCategory.ENHANCEMENT]: {
        name: 'Enhancement',
        description: 'Tools to improve crop growth and yield',
        icon: '⚡',
        color: '#FF9800'
    },
    [ToolCategory.HARVESTING]: {
        name: 'Harvesting',
        description: 'Tools for collecting mature crops',
        icon: '🔨',
        color: '#795548'
    },
    [ToolCategory.UTILITY]: {
        name: 'Utility',
        description: 'General purpose farming tools',
        icon: '🔧',
        color: '#607D8B'
    },
    [ToolCategory.PREMIUM]: {
        name: 'Premium',
        description: 'Advanced tools with special abilities',
        icon: '⭐',
        color: '#9C27B0'
    }
};

/**
 * Tool rarity configuration
 */
export const TOOL_RARITY_CONFIG = {
    common: {
        color: '#9E9E9E',
        label: 'Common',
        dropChance: 0.6
    },
    uncommon: {
        color: '#4CAF50',
        label: 'Uncommon',
        dropChance: 0.25
    },
    rare: {
        color: '#2196F3',
        label: 'Rare',
        dropChance: 0.1
    },
    epic: {
        color: '#9C27B0',
        label: 'Epic',
        dropChance: 0.04
    },
    legendary: {
        color: '#FF9800',
        label: 'Legendary',
        dropChance: 0.01
    }
};

/**
 * Helper functions for tool management
 */
export class ToolConfig {
    /**
     * Get all tools
     */
    public static getAllTools(): ToolDefinition[] {
        return Object.values(TOOL_DEFINITIONS);
    }

    /**
     * Get tool by ID
     */
    public static getTool(id: string): ToolDefinition | undefined {
        return TOOL_DEFINITIONS[id];
    }

    /**
     * Get tools by category
     */
    public static getToolsByCategory(category: ToolCategory): ToolDefinition[] {
        return Object.values(TOOL_DEFINITIONS).filter(tool => tool.category === category);
    }

    /**
     * Get tools by rarity
     */
    public static getToolsByRarity(rarity: string): ToolDefinition[] {
        return Object.values(TOOL_DEFINITIONS).filter(tool => tool.metadata?.rarity === rarity);
    }

    /**
     * Get available tools based on player state
     */
    public static getAvailableTools(playerState: {
        coins: number;
        unlockedAreas: number;
        harvestedCrops: number;
        level?: number;
    }): ToolDefinition[] {
        return Object.values(TOOL_DEFINITIONS).filter(tool => {
            const req = tool.requirements;
            if (!req) return true;

            return (
                (!req.minCoins || playerState.coins >= req.minCoins) &&
                (!req.unlockedAreas || playerState.unlockedAreas >= req.unlockedAreas) &&
                (!req.harvestedCrops || playerState.harvestedCrops >= req.harvestedCrops) &&
                (!req.level || (playerState.level || 1) >= req.level)
            );
        });
    }

    /**
     * Check if player can afford tool
     */
    public static canAfford(toolId: string, playerCoins: number): boolean {
        const tool = TOOL_DEFINITIONS[toolId];
        return tool ? playerCoins >= tool.cost : false;
    }

    /**
     * Get tool hotkeys mapping
     */
    public static getHotkeys(): Record<string, string> {
        const hotkeys: Record<string, string> = {};
        Object.values(TOOL_DEFINITIONS).forEach(tool => {
            if (tool.hotkey) {
                hotkeys[tool.hotkey] = tool.id;
            }
        });
        return hotkeys;
    }

    /**
     * Get tools that plant specific crop types
     */
    public static getPlantingTools(): Record<string, string> {
        return {
            wheat: 'wheat_seeds',
            corn: 'corn_seeds',
            carrot: 'carrot_seeds',
            tomato: 'tomato_seeds'
        };
    }

    /**
     * Get enhancement tools
     */
    public static getEnhancementTools(): string[] {
        return ['water', 'fertilizer', 'super_fertilizer'];
    }

    /**
     * Get utility tools
     */
    public static getUtilityTools(): string[] {
        return ['harvest_tool', 'shovel', 'area_expander', 'auto_harvester'];
    }

    /**
     * Validate tool definition
     */
    public static validateTool(tool: ToolDefinition): boolean {
        return !!(
            tool.id &&
            tool.name &&
            tool.description &&
            typeof tool.cost === 'number' &&
            tool.icon &&
            tool.category &&
            Object.values(ToolCategory).includes(tool.category)
        );
    }

    /**
     * Get tool effectiveness rating
     */
    public static getEffectivenessRating(toolId: string): number {
        const tool = TOOL_DEFINITIONS[toolId];
        if (!tool || !tool.effects) return 1;

        let rating = 1;
        const effects = tool.effects;

        if (effects.growthSpeedBonus) rating += effects.growthSpeedBonus;
        if (effects.harvestMultiplier) rating += (effects.harvestMultiplier - 1);
        if (effects.autoHarvest) rating += 0.5;
        if (effects.waterBonus) rating += 0.2;
        if (effects.fertilizerBonus) rating += 0.3;

        return Math.round(rating * 100) / 100;
    }

    /**
     * Get recommended tools for beginners
     */
    public static getBeginnerTools(): string[] {
        return ['wheat_seeds', 'water', 'fertilizer', 'harvest_tool'];
    }

    /**
     * Get advanced tools
     */
    public static getAdvancedTools(): string[] {
        return ['super_fertilizer', 'auto_harvester', 'tomato_seeds'];
    }
}

// Export commonly used tool sets
export const CROP_TOOLS = ToolConfig.getPlantingTools();
export const ENHANCEMENT_TOOLS = ToolConfig.getEnhancementTools();
export const UTILITY_TOOLS = ToolConfig.getUtilityTools();
export const HOTKEY_MAP = ToolConfig.getHotkeys();
