/**
 * Game Configuration
 * Central configuration for game settings, balance, and core parameters
 */

export interface GameConfiguration {
    // Grid and World Settings
    world: {
        initialGridSize: number;
        maxGridSize: number;
        tileSize: number;
        initialPlayerCoins: number;
        debugMode: boolean;
    };

    // Economy Settings
    economy: {
        baseTileCost: number;
        areaCostMultiplier: number;
        maxAreaDistance: number;
        coinAnimationDuration: number;
        priceInflationRate: number;
    };

    // Growth and Time Settings
    growth: {
        baseGrowthTime: number; // milliseconds
        growthCheckInterval: number; // milliseconds
        autoHarvestEnabled: boolean;
        enhancementBonusMultiplier: number;
    };

    // UI and Rendering Settings
    ui: {
        tooltipDelay: number;
        notificationDuration: number;
        animationSpeed: number;
        showCoordinates: boolean;
        showPerformanceMetrics: boolean;
    };

    // Input Settings
    input: {
        panSensitivity: number;
        zoomSensitivity: number;
        keyRepeatDelay: number;
        doubleClickDelay: number;
    };

    // Save System Settings
    save: {
        autoSaveInterval: number; // milliseconds
        maxSaveSlots: number;
        compressionEnabled: boolean;
        backupRetention: number; // days
    };

    // Performance Settings
    performance: {
        maxRenderDistance: number;
        cullingEnabled: boolean;
        maxFPS: number;
        renderBatchSize: number;
    };
}

/**
 * Default game configuration
 * These values represent the balanced, default game experience
 */
export const DEFAULT_GAME_CONFIG: GameConfiguration = {
    world: {
        initialGridSize: 10,
        maxGridSize: 50,
        tileSize: 40,
        initialPlayerCoins: 100,
        debugMode: false,
    },

    economy: {
        baseTileCost: 10,
        areaCostMultiplier: 1.5,
        maxAreaDistance: 10,
        coinAnimationDuration: 1000,
        priceInflationRate: 0.1,
    },

    growth: {
        baseGrowthTime: 5000, // 5 seconds
        growthCheckInterval: 100, // 100ms
        autoHarvestEnabled: true,
        enhancementBonusMultiplier: 0.5, // 50% bonus
    },

    ui: {
        tooltipDelay: 500,
        notificationDuration: 3000,
        animationSpeed: 300,
        showCoordinates: false,
        showPerformanceMetrics: false,
    },

    input: {
        panSensitivity: 1.0,
        zoomSensitivity: 0.1,
        keyRepeatDelay: 100,
        doubleClickDelay: 300,
    },

    save: {
        autoSaveInterval: 30000, // 30 seconds
        maxSaveSlots: 10,
        compressionEnabled: true,
        backupRetention: 7, // 7 days
    },

    performance: {
        maxRenderDistance: 20,
        cullingEnabled: true,
        maxFPS: 60,
        renderBatchSize: 100,
    },
};

/**
 * Development configuration with debug features enabled
 */
export const DEVELOPMENT_CONFIG: Partial<GameConfiguration> = {
    world: {
        ...DEFAULT_GAME_CONFIG.world,
        debugMode: true,
        initialPlayerCoins: 1000, // More coins for testing
    },

    ui: {
        ...DEFAULT_GAME_CONFIG.ui,
        showCoordinates: true,
        showPerformanceMetrics: true,
        tooltipDelay: 100, // Faster tooltips for development
    },

    save: {
        ...DEFAULT_GAME_CONFIG.save,
        autoSaveInterval: 10000, // More frequent auto-saves
    },

    performance: {
        ...DEFAULT_GAME_CONFIG.performance,
        cullingEnabled: false, // Disable culling for debugging
    },
};

/**
 * Production configuration optimized for performance
 */
export const PRODUCTION_CONFIG: Partial<GameConfiguration> = {
    world: {
        ...DEFAULT_GAME_CONFIG.world,
        debugMode: false,
    },

    ui: {
        ...DEFAULT_GAME_CONFIG.ui,
        showCoordinates: false,
        showPerformanceMetrics: false,
    },

    performance: {
        ...DEFAULT_GAME_CONFIG.performance,
        cullingEnabled: true,
        maxFPS: 60,
        renderBatchSize: 200, // Larger batches for performance
    },
};

/**
 * Game configuration manager
 * Provides access to current configuration and allows runtime changes
 */
export class GameConfig {
    private static instance: GameConfig;
    private config: GameConfiguration;

    private constructor() {
        // Determine configuration based on environment
        const isDevelopment = import.meta.env.DEV;

        if (isDevelopment) {
            this.config = this.mergeConfigs(DEFAULT_GAME_CONFIG, DEVELOPMENT_CONFIG);
        } else {
            this.config = this.mergeConfigs(DEFAULT_GAME_CONFIG, PRODUCTION_CONFIG);
        }
    }

    /**
     * Get singleton instance of GameConfig
     */
    public static getInstance(): GameConfig {
        if (!GameConfig.instance) {
            GameConfig.instance = new GameConfig();
        }
        return GameConfig.instance;
    }

    /**
     * Get current configuration
     */
    public getConfig(): GameConfiguration {
        return { ...this.config };
    }

    /**
     * Get specific configuration section
     */
    public getWorld() { return { ...this.config.world }; }
    public getEconomy() { return { ...this.config.economy }; }
    public getGrowth() { return { ...this.config.growth }; }
    public getUI() { return { ...this.config.ui }; }
    public getInput() { return { ...this.config.input }; }
    public getSave() { return { ...this.config.save }; }
    public getPerformance() { return { ...this.config.performance }; }

    /**
     * Update configuration section
     */
    public updateConfig<K extends keyof GameConfiguration>(
        section: K,
        updates: Partial<GameConfiguration[K]>
    ): void {
        this.config[section] = { ...this.config[section], ...updates } as GameConfiguration[K];
    }

    /**
     * Reset to default configuration
     */
    public resetToDefaults(): void {
        this.config = { ...DEFAULT_GAME_CONFIG };
    }

    /**
     * Load configuration from JSON
     */
    public loadFromJSON(json: string): boolean {
        try {
            const loadedConfig = JSON.parse(json);
            if (this.validateConfig(loadedConfig)) {
                this.config = this.mergeConfigs(DEFAULT_GAME_CONFIG, loadedConfig);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    /**
     * Export configuration to JSON
     */
    public exportToJSON(): string {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Merge two configuration objects
     */
    private mergeConfigs(base: GameConfiguration, override: Partial<GameConfiguration>): GameConfiguration {
        return {
            world: { ...base.world, ...override.world },
            economy: { ...base.economy, ...override.economy },
            growth: { ...base.growth, ...override.growth },
            ui: { ...base.ui, ...override.ui },
            input: { ...base.input, ...override.input },
            save: { ...base.save, ...override.save },
            performance: { ...base.performance, ...override.performance },
        };
    }

    /**
     * Validate configuration object
     */
    private validateConfig(config: unknown): config is Partial<GameConfiguration> {
        // Basic validation - could be expanded
        return typeof config === 'object' && config !== null;
    }

    /**
     * Get configuration value by path (e.g., 'world.tileSize')
     */
    public getValue<T>(path: string): T | undefined {
        const keys = path.split('.');
        let value: unknown = this.config;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = (value as Record<string, unknown>)[key];
            } else {
                return undefined;
            }
        }

        return value as T;
    }

    /**
     * Set configuration value by path
     */
    public setValue(path: string, value: unknown): boolean {
        const keys = path.split('.');
        let current: unknown = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            if (current && typeof current === 'object' && keys[i] in current) {
                current = (current as Record<string, unknown>)[keys[i]];
            } else {
                return false;
            }
        }

        if (current && typeof current === 'object') {
            (current as Record<string, unknown>)[keys[keys.length - 1]] = value;
            return true;
        }

        return false;
    }
}

// Export singleton instance for easy access
export const gameConfig = GameConfig.getInstance();

// Export commonly used configuration getters
export const getWorldConfig = () => gameConfig.getWorld();
export const getEconomyConfig = () => gameConfig.getEconomy();
export const getGrowthConfig = () => gameConfig.getGrowth();
export const getUIConfig = () => gameConfig.getUI();
export const getInputConfig = () => gameConfig.getInput();
export const getSaveConfig = () => gameConfig.getSave();
export const getPerformanceConfig = () => gameConfig.getPerformance();
