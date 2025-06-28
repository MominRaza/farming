/**
 * Crop Configuration
 * Defines all crops available in the game with their growth properties and characteristics
 */

export interface CropDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    category: CropCategory;
    growth: GrowthProperties;
    economics: EconomicProperties;
    requirements?: CropRequirements;
    bonuses?: CropBonuses;
    metadata?: CropMetadata;
}

export interface GrowthProperties {
    baseGrowTime: number; // milliseconds
    stages: number;
    waterSpeedBonus: number; // multiplier (e.g., 1.5 = 50% faster)
    fertilizerValueBonus: number; // multiplier (e.g., 2.0 = 100% more value)
    seasonalMultiplier?: Record<string, number>;
}

export interface EconomicProperties {
    seedCost: number;
    baseValue: number;
    sellPrice: number;
    profitMargin: number; // calculated: sellPrice - seedCost
    roi: number; // return on investment percentage
}

export interface CropRequirements {
    minLevel?: number;
    unlockedAreas?: number;
    harvestedCrops?: number;
    totalCoins?: number;
    prerequisites?: string[]; // other crop IDs
}

export interface CropBonuses {
    experienceGain: number;
    chainBonus?: number; // bonus for planting same crop multiple times
    comboBonus?: string[]; // bonus when planted near these crops
    specialEffects?: string[];
}

export interface CropMetadata {
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    tags: string[];
    unlockMessage?: string;
    tips?: string[];
}

export const CropCategory = {
    GRAINS: 'grains',
    VEGETABLES: 'vegetables',
    FRUITS: 'fruits',
    HERBS: 'herbs',
    SPECIAL: 'special'
} as const;

export type CropCategory = typeof CropCategory[keyof typeof CropCategory];

/**
 * All available crops in the game
 */
export const CROP_DEFINITIONS: Record<string, CropDefinition> = {
    // Grains - Fast growing, low value, beginner friendly
    wheat: {
        id: 'wheat',
        name: 'Wheat',
        description: 'A basic grain crop that grows quickly and provides steady income',
        icon: '🌾',
        color: '#D4AF37',
        category: CropCategory.GRAINS,
        growth: {
            baseGrowTime: 5000, // 5 seconds
            stages: 3,
            waterSpeedBonus: 1.5,
            fertilizerValueBonus: 2.0
        },
        economics: {
            seedCost: 5,
            baseValue: 8,
            sellPrice: 15,
            profitMargin: 10,
            roi: 200
        },
        bonuses: {
            experienceGain: 5,
            chainBonus: 1.1
        },
        metadata: {
            rarity: 'common',
            difficulty: 'easy',
            tags: ['beginner', 'fast', 'reliable'],
            tips: ['Great for beginners', 'Fast growth makes it ideal for quick income']
        }
    },

    // Vegetables - Balanced growth and value
    carrot: {
        id: 'carrot',
        name: 'Carrot',
        description: 'A nutritious root vegetable with moderate growth time and good value',
        icon: '🥕',
        color: '#FF8C00',
        category: CropCategory.VEGETABLES,
        growth: {
            baseGrowTime: 8000, // 8 seconds
            stages: 4,
            waterSpeedBonus: 1.3,
            fertilizerValueBonus: 1.8
        },
        economics: {
            seedCost: 10,
            baseValue: 15,
            sellPrice: 25,
            profitMargin: 15,
            roi: 150
        },
        bonuses: {
            experienceGain: 8,
            comboBonus: ['tomato', 'onion']
        },
        metadata: {
            rarity: 'common',
            difficulty: 'easy',
            tags: ['balanced', 'nutritious', 'versatile'],
            tips: ['Grows well with tomatoes and onions nearby']
        }
    },

    corn: {
        id: 'corn',
        name: 'Corn',
        description: 'A tall grain crop with longer growth time but excellent value',
        icon: '🌽',
        color: '#FFD700',
        category: CropCategory.GRAINS,
        growth: {
            baseGrowTime: 12000, // 12 seconds
            stages: 5,
            waterSpeedBonus: 1.4,
            fertilizerValueBonus: 2.2
        },
        economics: {
            seedCost: 15,
            baseValue: 25,
            sellPrice: 40,
            profitMargin: 25,
            roi: 167
        },
        requirements: {
            harvestedCrops: 5
        },
        bonuses: {
            experienceGain: 12,
            chainBonus: 1.15
        },
        metadata: {
            rarity: 'common',
            difficulty: 'medium',
            tags: ['valuable', 'tall', 'grain'],
            unlockMessage: 'Corn unlocked! Plant after harvesting 5 crops.',
            tips: ['Higher value than wheat but takes longer to grow']
        }
    },

    tomato: {
        id: 'tomato',
        name: 'Tomato',
        description: 'A juicy fruit with excellent value and beautiful appearance',
        icon: '🍅',
        color: '#FF6347',
        category: CropCategory.FRUITS,
        growth: {
            baseGrowTime: 10000, // 10 seconds
            stages: 4,
            waterSpeedBonus: 1.6,
            fertilizerValueBonus: 2.5
        },
        economics: {
            seedCost: 20,
            baseValue: 30,
            sellPrice: 50,
            profitMargin: 30,
            roi: 150
        },
        requirements: {
            harvestedCrops: 10
        },
        bonuses: {
            experienceGain: 15,
            comboBonus: ['carrot', 'onion', 'pepper']
        },
        metadata: {
            rarity: 'uncommon',
            difficulty: 'medium',
            tags: ['valuable', 'fruit', 'combo'],
            unlockMessage: 'Tomatoes unlocked! A premium crop with great value.',
            tips: ['Excellent profit margins', 'Grows well with vegetables']
        }
    },

    // Additional vegetables
    onion: {
        id: 'onion',
        name: 'Onion',
        description: 'A pungent bulb vegetable that adds flavor and value to your farm',
        icon: '🧅',
        color: '#DDA0DD',
        category: CropCategory.VEGETABLES,
        growth: {
            baseGrowTime: 9000, // 9 seconds
            stages: 3,
            waterSpeedBonus: 1.2,
            fertilizerValueBonus: 1.7
        },
        economics: {
            seedCost: 12,
            baseValue: 18,
            sellPrice: 28,
            profitMargin: 16,
            roi: 133
        },
        requirements: {
            harvestedCrops: 8
        },
        bonuses: {
            experienceGain: 10,
            comboBonus: ['tomato', 'carrot', 'pepper']
        },
        metadata: {
            rarity: 'common',
            difficulty: 'easy',
            tags: ['versatile', 'combo', 'flavorful'],
            tips: ['Great combo crop for increased yields']
        }
    },

    potato: {
        id: 'potato',
        name: 'Potato',
        description: 'A hearty tuber crop that provides substantial value and nutrition',
        icon: '🥔',
        color: '#DEB887',
        category: CropCategory.VEGETABLES,
        growth: {
            baseGrowTime: 11000, // 11 seconds
            stages: 4,
            waterSpeedBonus: 1.3,
            fertilizerValueBonus: 2.0
        },
        economics: {
            seedCost: 18,
            baseValue: 28,
            sellPrice: 42,
            profitMargin: 24,
            roi: 133
        },
        requirements: {
            harvestedCrops: 15
        },
        bonuses: {
            experienceGain: 14,
            chainBonus: 1.2
        },
        metadata: {
            rarity: 'common',
            difficulty: 'medium',
            tags: ['hearty', 'nutritious', 'valuable'],
            tips: ['Reliable crop with good profit margins']
        }
    },

    // Herbs - Special properties
    spinach: {
        id: 'spinach',
        name: 'Spinach',
        description: 'A leafy green with quick growth and health benefits',
        icon: '🥬',
        color: '#228B22',
        category: CropCategory.HERBS,
        growth: {
            baseGrowTime: 6000, // 6 seconds
            stages: 3,
            waterSpeedBonus: 1.8,
            fertilizerValueBonus: 1.5
        },
        economics: {
            seedCost: 8,
            baseValue: 12,
            sellPrice: 20,
            profitMargin: 12,
            roi: 150
        },
        bonuses: {
            experienceGain: 6,
            specialEffects: ['health_boost']
        },
        metadata: {
            rarity: 'common',
            difficulty: 'easy',
            tags: ['fast', 'healthy', 'leafy'],
            tips: ['Fast growing and responds well to water']
        }
    },

    // Advanced crops
    pepper: {
        id: 'pepper',
        name: 'Pepper',
        description: 'A spicy vegetable with premium value and special growing requirements',
        icon: '🌶️',
        color: '#FF4500',
        category: CropCategory.VEGETABLES,
        growth: {
            baseGrowTime: 14000, // 14 seconds
            stages: 5,
            waterSpeedBonus: 1.5,
            fertilizerValueBonus: 3.0
        },
        economics: {
            seedCost: 25,
            baseValue: 40,
            sellPrice: 70,
            profitMargin: 45,
            roi: 180
        },
        requirements: {
            harvestedCrops: 25,
            unlockedAreas: 2
        },
        bonuses: {
            experienceGain: 20,
            comboBonus: ['tomato', 'onion']
        },
        metadata: {
            rarity: 'rare',
            difficulty: 'hard',
            tags: ['spicy', 'premium', 'advanced'],
            unlockMessage: 'Peppers unlocked! A premium crop for experienced farmers.',
            tips: ['High value but requires patience and skill']
        }
    },

    eggplant: {
        id: 'eggplant',
        name: 'Eggplant',
        description: 'A sophisticated purple vegetable with excellent profit potential',
        icon: '🍆',
        color: '#800080',
        category: CropCategory.VEGETABLES,
        growth: {
            baseGrowTime: 13000, // 13 seconds
            stages: 4,
            waterSpeedBonus: 1.4,
            fertilizerValueBonus: 2.8
        },
        economics: {
            seedCost: 22,
            baseValue: 35,
            sellPrice: 60,
            profitMargin: 38,
            roi: 173
        },
        requirements: {
            harvestedCrops: 20,
            totalCoins: 500
        },
        bonuses: {
            experienceGain: 18,
            specialEffects: ['luxury_bonus']
        },
        metadata: {
            rarity: 'uncommon',
            difficulty: 'hard',
            tags: ['sophisticated', 'purple', 'luxury'],
            tips: ['Premium vegetable with excellent returns']
        }
    },

    pea: {
        id: 'pea',
        name: 'Pea',
        description: 'Small green legumes that grow in pods and provide steady income',
        icon: '🫛',
        color: '#90EE90',
        category: CropCategory.VEGETABLES,
        growth: {
            baseGrowTime: 7000, // 7 seconds
            stages: 3,
            waterSpeedBonus: 1.6,
            fertilizerValueBonus: 1.8
        },
        economics: {
            seedCost: 9,
            baseValue: 14,
            sellPrice: 22,
            profitMargin: 13,
            roi: 144
        },
        bonuses: {
            experienceGain: 7,
            chainBonus: 1.1,
            specialEffects: ['nitrogen_fixing']
        },
        metadata: {
            rarity: 'common',
            difficulty: 'easy',
            tags: ['legume', 'green', 'nitrogen'],
            tips: ['Enriches soil for nearby crops']
        }
    }
};

/**
 * Crop categories configuration
 */
export const CROP_CATEGORIES = {
    [CropCategory.GRAINS]: {
        name: 'Grains',
        description: 'Fast-growing staple crops',
        icon: '🌾',
        color: '#D4AF37',
        bonus: 'Fast growth'
    },
    [CropCategory.VEGETABLES]: {
        name: 'Vegetables',
        description: 'Nutritious and diverse crops',
        icon: '🥕',
        color: '#228B22',
        bonus: 'Combo bonuses'
    },
    [CropCategory.FRUITS]: {
        name: 'Fruits',
        description: 'High-value sweet crops',
        icon: '🍅',
        color: '#FF6347',
        bonus: 'High profit'
    },
    [CropCategory.HERBS]: {
        name: 'Herbs',
        description: 'Special effects and benefits',
        icon: '🌿',
        color: '#32CD32',
        bonus: 'Special effects'
    },
    [CropCategory.SPECIAL]: {
        name: 'Special',
        description: 'Unique and exotic crops',
        icon: '⭐',
        color: '#9C27B0',
        bonus: 'Unique abilities'
    }
};

/**
 * Helper functions for crop management
 */
export class CropConfig {
    /**
     * Get all crops
     */
    public static getAllCrops(): CropDefinition[] {
        return Object.values(CROP_DEFINITIONS);
    }

    /**
     * Get crop by ID
     */
    public static getCrop(id: string): CropDefinition | undefined {
        return CROP_DEFINITIONS[id];
    }

    /**
     * Get crops by category
     */
    public static getCropsByCategory(category: CropCategory): CropDefinition[] {
        return Object.values(CROP_DEFINITIONS).filter(crop => crop.category === category);
    }

    /**
     * Get crops by rarity
     */
    public static getCropsByRarity(rarity: string): CropDefinition[] {
        return Object.values(CROP_DEFINITIONS).filter(crop => crop.metadata?.rarity === rarity);
    }

    /**
     * Get available crops based on player progress
     */
    public static getAvailableCrops(playerState: {
        level?: number;
        unlockedAreas: number;
        harvestedCrops: number;
        totalCoins: number;
    }): CropDefinition[] {
        return Object.values(CROP_DEFINITIONS).filter(crop => {
            const req = crop.requirements;
            if (!req) return true;

            return (
                (!req.minLevel || (playerState.level || 1) >= req.minLevel) &&
                (!req.unlockedAreas || playerState.unlockedAreas >= req.unlockedAreas) &&
                (!req.harvestedCrops || playerState.harvestedCrops >= req.harvestedCrops) &&
                (!req.totalCoins || playerState.totalCoins >= req.totalCoins)
            );
        });
    }

    /**
     * Get beginner-friendly crops
     */
    public static getBeginnerCrops(): CropDefinition[] {
        return Object.values(CROP_DEFINITIONS).filter(
            crop => crop.metadata?.difficulty === 'easy' && !crop.requirements
        );
    }

    /**
     * Get advanced crops
     */
    public static getAdvancedCrops(): CropDefinition[] {
        return Object.values(CROP_DEFINITIONS).filter(
            crop => crop.metadata?.difficulty === 'hard' || crop.metadata?.difficulty === 'expert'
        );
    }

    /**
     * Calculate profit for a crop
     */
    public static calculateProfit(cropId: string, enhancements: {
        fertilizer?: boolean;
        water?: boolean;
    } = {}): number {
        const crop = CROP_DEFINITIONS[cropId];
        if (!crop) return 0;

        let value = crop.economics.baseValue;

        if (enhancements.fertilizer) {
            value *= crop.growth.fertilizerValueBonus;
        }

        return value - crop.economics.seedCost;
    }

    /**
     * Calculate growth time with enhancements
     */
    public static calculateGrowthTime(cropId: string, enhancements: {
        water?: boolean;
    } = {}): number {
        const crop = CROP_DEFINITIONS[cropId];
        if (!crop) return 0;

        let time = crop.growth.baseGrowTime;

        if (enhancements.water) {
            time /= crop.growth.waterSpeedBonus;
        }

        return time;
    }

    /**
     * Get crop recommendations based on player state
     */
    public static getRecommendations(playerState: {
        coins: number;
        level?: number;
        harvestedCrops: number;
        preference?: 'fast' | 'profit' | 'experience';
    }): CropDefinition[] {
        const available = this.getAvailableCrops({
            level: playerState.level,
            unlockedAreas: 1,
            harvestedCrops: playerState.harvestedCrops,
            totalCoins: playerState.coins
        });

        const affordable = available.filter(crop =>
            playerState.coins >= crop.economics.seedCost
        );

        switch (playerState.preference) {
            case 'fast':
                return affordable.sort((a, b) => a.growth.baseGrowTime - b.growth.baseGrowTime).slice(0, 3);
            case 'profit':
                return affordable.sort((a, b) => b.economics.profitMargin - a.economics.profitMargin).slice(0, 3);
            case 'experience':
                return affordable.sort((a, b) =>
                    (b.bonuses?.experienceGain || 0) - (a.bonuses?.experienceGain || 0)
                ).slice(0, 3);
            default:
                return affordable.sort((a, b) => b.economics.roi - a.economics.roi).slice(0, 3);
        }
    }

    /**
     * Get combo bonus for crop placement
     */
    public static getComboBonus(cropId: string, nearbyCrops: string[]): number {
        const crop = CROP_DEFINITIONS[cropId];
        if (!crop?.bonuses?.comboBonus) return 1;

        const matches = crop.bonuses.comboBonus.filter(combo =>
            nearbyCrops.includes(combo)
        ).length;

        return 1 + (matches * 0.1); // 10% bonus per matching neighbor
    }

    /**
     * Validate crop definition
     */
    public static validateCrop(crop: CropDefinition): boolean {
        return !!(
            crop.id &&
            crop.name &&
            crop.description &&
            crop.icon &&
            crop.color &&
            crop.category &&
            crop.growth &&
            crop.economics &&
            typeof crop.growth.baseGrowTime === 'number' &&
            typeof crop.economics.seedCost === 'number'
        );
    }
}

// Export commonly used crop sets
export const BEGINNER_CROPS = CropConfig.getBeginnerCrops().map(crop => crop.id);
export const ADVANCED_CROPS = CropConfig.getAdvancedCrops().map(crop => crop.id);
export const FAST_CROPS = Object.values(CROP_DEFINITIONS)
    .filter(crop => crop.growth.baseGrowTime <= 8000)
    .map(crop => crop.id);
export const PROFITABLE_CROPS = Object.values(CROP_DEFINITIONS)
    .filter(crop => crop.economics.roi >= 150)
    .map(crop => crop.id);
