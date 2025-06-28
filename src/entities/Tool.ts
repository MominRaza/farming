import type { GameTool, TerrainTool, CropTool, ToolId, TileType } from '../types';
import { terrainTools, cropTools, actionTools, allTools } from '../core/tools';

/**
 * Tool category enumeration
 */
export const ToolCategory = {
    TERRAIN: 'terrain',
    CROP: 'crop',
    ACTION: 'action'
} as const;

export type ToolCategory = typeof ToolCategory[keyof typeof ToolCategory];

/**
 * Tool usage requirements
 */
export interface ToolRequirements {
    requiresSoil: boolean;
    requiresCrop: boolean;
    requiresMatureCrop: boolean;
    requiresUnlockedArea: boolean;
    cost: number;
    canUseOn: string[];
}

/**
 * Tool usage statistics
 */
export interface ToolUsageStats {
    totalUses: number;
    successfulUses: number;
    failedUses: number;
    lastUsed?: number;
    totalCostSpent: number;
    averageCostPerUse: number;
    successRate: number;
}

/**
 * Tool performance metrics
 */
export interface ToolPerformance {
    efficiency: number;        // Output per cost
    profitability: number;     // Profit per use
    timeEfficiency: number;    // Output per time
    usageFrequency: number;    // How often tool is used
    recommendation: 'highly-recommended' | 'recommended' | 'situational' | 'not-recommended';
}

/**
 * Represents a game tool entity with enhanced functionality
 */
export class Tool {
    public readonly id: ToolId;
    public readonly name: string;
    public readonly category: ToolCategory;
    public readonly icon: string;
    public readonly action: string;
    public readonly hotkey?: string;
    public readonly cost: number;

    // Category-specific properties
    public readonly tileType?: TileType;        // For terrain tools
    public readonly growthStages?: number;      // For crop tools
    public readonly growTime?: number;          // For crop tools
    public readonly reward?: number;            // For crop tools

    private _usageStats: ToolUsageStats;

    constructor(toolData: GameTool) {
        this.id = toolData.id as ToolId;
        this.name = toolData.name;
        this.category = toolData.category as ToolCategory;
        this.icon = toolData.icon;
        this.action = toolData.action;
        this.hotkey = toolData.hotkey;
        this.cost = toolData.cost || 0;

        // Set category-specific properties
        if (toolData.category === 'terrain') {
            const terrainTool = toolData as TerrainTool;
            this.tileType = terrainTool.tileType;
        } else if (toolData.category === 'crop') {
            const cropTool = toolData as CropTool;
            this.growthStages = cropTool.growthStages;
            this.growTime = cropTool.growTime;
            this.reward = cropTool.reward;
        }

        // Initialize usage stats
        this._usageStats = {
            totalUses: 0,
            successfulUses: 0,
            failedUses: 0,
            totalCostSpent: 0,
            averageCostPerUse: 0,
            successRate: 0
        };
    }

    // === Basic Properties ===

    /**
     * Check if this is a terrain tool
     */
    isTerrainTool(): boolean {
        return this.category === ToolCategory.TERRAIN;
    }

    /**
     * Check if this is a crop tool
     */
    isCropTool(): boolean {
        return this.category === ToolCategory.CROP;
    }

    /**
     * Check if this is an action tool
     */
    isActionTool(): boolean {
        return this.category === ToolCategory.ACTION;
    }

    /**
     * Check if tool has a cost
     */
    hasCost(): boolean {
        return this.cost > 0;
    }

    /**
     * Check if tool has a hotkey
     */
    hasHotkey(): boolean {
        return !!this.hotkey;
    }

    // === Requirements and Validation ===

    /**
     * Get tool usage requirements
     */
    getRequirements(): ToolRequirements {
        let requiresSoil = false;
        let requiresCrop = false;
        let requiresMatureCrop = false;
        const requiresUnlockedArea = true; // All tools require unlocked areas
        const canUseOn: string[] = [];

        // Determine requirements based on tool type and action
        if (this.category === ToolCategory.CROP) {
            requiresSoil = true; // Crops need soil
            canUseOn.push('soil tiles');
        } else if (this.category === ToolCategory.ACTION) {
            switch (this.action) {
                case 'harvest_crop':
                    requiresCrop = true;
                    requiresMatureCrop = true;
                    canUseOn.push('mature crops');
                    break;
                case 'water_crop':
                case 'fertilize_crop':
                    requiresSoil = true; // Can water/fertilize soil with or without crops
                    canUseOn.push('soil tiles');
                    break;
            }
        } else if (this.category === ToolCategory.TERRAIN) {
            canUseOn.push('any unlocked tile');
        }

        return {
            requiresSoil,
            requiresCrop,
            requiresMatureCrop,
            requiresUnlockedArea,
            cost: this.cost,
            canUseOn
        };
    }

    /**
     * Check if tool can be afforded with given coins
     */
    canAfford(coins: number): boolean {
        return coins >= this.cost;
    }

    /**
     * Validate if tool can be used in general
     */
    isUsable(coins: number): { canUse: boolean; reason: string } {
        if (!this.canAfford(coins)) {
            return {
                canUse: false,
                reason: `Insufficient funds: need ${this.cost}, have ${coins}`
            };
        }

        return {
            canUse: true,
            reason: 'Tool is usable'
        };
    }

    // === Usage Tracking ===

    /**
     * Record a tool usage
     */
    recordUsage(success: boolean, costSpent: number = this.cost): void {
        this._usageStats.totalUses++;
        this._usageStats.totalCostSpent += costSpent;
        this._usageStats.lastUsed = Date.now();

        if (success) {
            this._usageStats.successfulUses++;
        } else {
            this._usageStats.failedUses++;
        }

        // Update calculated stats
        this._usageStats.averageCostPerUse = this._usageStats.totalCostSpent / this._usageStats.totalUses;
        this._usageStats.successRate = this._usageStats.successfulUses / this._usageStats.totalUses;
    }

    /**
     * Get usage statistics
     */
    getUsageStats(): ToolUsageStats {
        return { ...this._usageStats };
    }

    /**
     * Reset usage statistics
     */
    resetUsageStats(): void {
        this._usageStats = {
            totalUses: 0,
            successfulUses: 0,
            failedUses: 0,
            totalCostSpent: 0,
            averageCostPerUse: 0,
            successRate: 0
        };
    }

    // === Performance Analysis ===

    /**
     * Calculate tool efficiency (for crop tools: reward per cost)
     */
    getEfficiency(): number {
        if (this.category === ToolCategory.CROP && this.reward && this.cost > 0) {
            return this.reward / this.cost;
        }
        return 0;
    }

    /**
     * Calculate tool profitability (for crop tools: reward - cost)
     */
    getProfitability(): number {
        if (this.category === ToolCategory.CROP && this.reward) {
            return this.reward - this.cost;
        }
        return -this.cost; // For non-crop tools, cost is expense
    }

    /**
     * Calculate time efficiency (for crop tools: reward per time)
     */
    getTimeEfficiency(): number {
        if (this.category === ToolCategory.CROP && this.reward && this.growTime) {
            return this.reward / this.growTime;
        }
        return 0;
    }

    /**
     * Get usage frequency (uses per hour based on recent usage)
     */
    getUsageFrequency(): number {
        if (!this._usageStats.lastUsed || this._usageStats.totalUses === 0) {
            return 0;
        }

        const timeSinceFirstUse = Date.now() - (this._usageStats.lastUsed - (this._usageStats.totalUses - 1) * 60000); // Estimate
        const hoursActive = Math.max(1, timeSinceFirstUse / (1000 * 60 * 60));
        return this._usageStats.totalUses / hoursActive;
    }

    /**
     * Get performance metrics
     */
    getPerformance(): ToolPerformance {
        const efficiency = this.getEfficiency();
        const profitability = this.getProfitability();
        const timeEfficiency = this.getTimeEfficiency();
        const usageFrequency = this.getUsageFrequency();

        // Determine recommendation based on multiple factors
        let recommendation: ToolPerformance['recommendation'] = 'situational';

        if (this.category === ToolCategory.CROP) {
            if (efficiency > 2.0 && profitability > 10 && this._usageStats.successRate > 0.8) {
                recommendation = 'highly-recommended';
            } else if (efficiency > 1.5 && profitability > 5) {
                recommendation = 'recommended';
            } else if (profitability < 0) {
                recommendation = 'not-recommended';
            }
        } else if (this.category === ToolCategory.ACTION) {
            if (this._usageStats.successRate > 0.9 && usageFrequency > 0.5) {
                recommendation = 'highly-recommended';
            } else if (this._usageStats.successRate > 0.7) {
                recommendation = 'recommended';
            }
        } else if (this.category === ToolCategory.TERRAIN) {
            // Terrain tools are generally recommended based on usage
            if (usageFrequency > 1.0) {
                recommendation = 'highly-recommended';
            } else if (usageFrequency > 0.2) {
                recommendation = 'recommended';
            }
        }

        return {
            efficiency,
            profitability,
            timeEfficiency,
            usageFrequency,
            recommendation
        };
    }

    // === Information Methods ===

    /**
     * Get comprehensive tool information
     */
    getInfo(): {
        basic: {
            id: ToolId;
            name: string;
            category: ToolCategory;
            icon: string;
            action: string;
            hotkey?: string;
            cost: number;
        };
        properties: {
            tileType?: TileType;
            growthStages?: number;
            growTime?: number;
            reward?: number;
        };
        requirements: ToolRequirements;
        usage: ToolUsageStats;
        performance: ToolPerformance;
    } {
        return {
            basic: {
                id: this.id,
                name: this.name,
                category: this.category,
                icon: this.icon,
                action: this.action,
                hotkey: this.hotkey,
                cost: this.cost
            },
            properties: {
                tileType: this.tileType,
                growthStages: this.growthStages,
                growTime: this.growTime,
                reward: this.reward
            },
            requirements: this.getRequirements(),
            usage: this.getUsageStats(),
            performance: this.getPerformance()
        };
    }

    /**
     * Get tool description
     */
    getDescription(): string {
        const requirements = this.getRequirements();
        const performance = this.getPerformance();

        let description = `${this.name} (${this.icon}) - ${this.action}`;

        if (this.cost > 0) {
            description += ` | Cost: ${this.cost} coins`;
        }

        if (this.category === ToolCategory.CROP && this.reward) {
            description += ` | Reward: ${this.reward} coins | Grow time: ${this.growTime}s`;
            description += ` | Profit: ${performance.profitability} coins`;
        }

        if (this.hotkey) {
            description += ` | Hotkey: ${this.hotkey}`;
        }

        description += ` | Use on: ${requirements.canUseOn.join(', ')}`;

        return description;
    }

    // === Comparison Methods ===

    /**
     * Compare with another tool by efficiency
     */
    compareByEfficiency(otherTool: Tool): number {
        return otherTool.getEfficiency() - this.getEfficiency();
    }

    /**
     * Compare with another tool by profitability
     */
    compareByProfitability(otherTool: Tool): number {
        return otherTool.getProfitability() - this.getProfitability();
    }

    /**
     * Compare with another tool by usage frequency
     */
    compareByUsage(otherTool: Tool): number {
        return otherTool.getUsageFrequency() - this.getUsageFrequency();
    }

    // === Serialization ===

    /**
     * Serialize tool data (mainly usage stats)
     */
    toJSON(): {
        id: ToolId;
        usageStats: ToolUsageStats;
    } {
        return {
            id: this.id,
            usageStats: { ...this._usageStats }
        };
    }

    /**
     * Update from serialized data
     */
    static updateFromJSON(tool: Tool, data: { usageStats: ToolUsageStats }): void {
        tool._usageStats = { ...data.usageStats };
    }

    // === Static Factory Methods ===

    /**
     * Create tool from tool data
     */
    static fromToolData(toolData: GameTool): Tool {
        return new Tool(toolData);
    }

    /**
     * Get tool by ID
     */
    static getById(id: string): Tool | null {
        const toolData = allTools.find(tool => tool.id === id);
        return toolData ? new Tool(toolData) : null;
    }

    /**
     * Get all tools
     */
    static getAllTools(): Tool[] {
        return allTools.map(toolData => new Tool(toolData));
    }

    /**
     * Get tools by category
     */
    static getByCategory(category: ToolCategory): Tool[] {
        let toolsData: GameTool[];

        switch (category) {
            case ToolCategory.TERRAIN:
                toolsData = terrainTools;
                break;
            case ToolCategory.CROP:
                toolsData = cropTools;
                break;
            case ToolCategory.ACTION:
                toolsData = actionTools;
                break;
            default:
                toolsData = [];
        }

        return toolsData.map(toolData => new Tool(toolData));
    }

    /**
     * Get tool by hotkey
     */
    static getByHotkey(hotkey: string): Tool | null {
        const toolData = allTools.find(tool =>
            tool.hotkey?.toLowerCase() === hotkey.toLowerCase()
        );
        return toolData ? new Tool(toolData) : null;
    }

    /**
     * Get best tools by criteria
     */
    static getBestTools(
        criteria: 'efficiency' | 'profitability' | 'usage',
        category?: ToolCategory,
        limit: number = 3
    ): Tool[] {
        let tools = Tool.getAllTools();

        if (category) {
            tools = tools.filter(tool => tool.category === category);
        }

        let compareFn: (a: Tool, b: Tool) => number;
        switch (criteria) {
            case 'efficiency':
                compareFn = (a, b) => a.compareByEfficiency(b);
                break;
            case 'profitability':
                compareFn = (a, b) => a.compareByProfitability(b);
                break;
            case 'usage':
                compareFn = (a, b) => a.compareByUsage(b);
                break;
        }

        return tools.sort(compareFn).slice(0, limit);
    }

    /**
     * Get affordable tools
     */
    static getAffordableTools(coins: number): Tool[] {
        return Tool.getAllTools().filter(tool => tool.canAfford(coins));
    }

    /**
     * Get recommended tools
     */
    static getRecommendedTools(maxRecommendations: number = 5): Tool[] {
        const tools = Tool.getAllTools();

        return tools
            .filter(tool => {
                const performance = tool.getPerformance();
                return performance.recommendation === 'highly-recommended' ||
                    performance.recommendation === 'recommended';
            })
            .sort((a, b) => {
                const perfA = a.getPerformance();
                const perfB = b.getPerformance();

                // Highly recommended tools first
                if (perfA.recommendation === 'highly-recommended' && perfB.recommendation !== 'highly-recommended') {
                    return -1;
                }
                if (perfB.recommendation === 'highly-recommended' && perfA.recommendation !== 'highly-recommended') {
                    return 1;
                }

                // Then sort by efficiency for crop tools, usage for others
                if (a.category === ToolCategory.CROP && b.category === ToolCategory.CROP) {
                    return perfB.efficiency - perfA.efficiency;
                }

                return perfB.usageFrequency - perfA.usageFrequency;
            })
            .slice(0, maxRecommendations);
    }
}
