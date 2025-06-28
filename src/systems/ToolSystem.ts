import { EventBus } from '../events/EventBus';
import type { ToolSelectedEvent, ToolUsedEvent } from '../events/EventTypes';
import type { GameTool, TerrainTool, CropTool, ActionTool, ToolId } from '../types';
import { terrainTools, cropTools, actionTools, allTools } from '../core/tools';

/**
 * Tool usage statistics interface
 */
export interface ToolUsageStats {
    toolId: ToolId;
    usageCount: number;
    successCount: number;
    failureCount: number;
    lastUsed: number;
    totalCostSpent: number;
}

/**
 * Tool validation result interface
 */
export interface ToolValidationResult {
    isValid: boolean;
    canUse: boolean;
    reason: string;
    cost: number;
    tool: GameTool | null;
}

/**
 * ToolSystem manages tool selection, validation, and usage tracking
 * Provides tool configuration, hotkey handling, and usage statistics
 */
export class ToolSystem {
    private eventBus: EventBus;
    private selectedTool: ToolId | null = null;
    private usageStats = new Map<ToolId, ToolUsageStats>();

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
        this.initializeUsageStats();
    }

    // === Tool Management ===

    /**
     * Initialize usage statistics for all tools
     */
    private initializeUsageStats(): void {
        for (const tool of allTools) {
            this.usageStats.set(tool.id as ToolId, {
                toolId: tool.id as ToolId,
                usageCount: 0,
                successCount: 0,
                failureCount: 0,
                lastUsed: 0,
                totalCostSpent: 0
            });
        }
    }

    /**
     * Get currently selected tool
     */
    getSelectedTool(): ToolId | null {
        return this.selectedTool;
    }

    /**
     * Select a tool
     */
    selectTool(toolId: ToolId | null): boolean {
        const previousTool = this.selectedTool;

        // Validate tool exists if not null
        if (toolId !== null && !this.getToolById(toolId)) {
            return false;
        }

        this.selectedTool = toolId;

        // Emit tool selection event
        const event: ToolSelectedEvent = {
            type: 'tool:selected',
            timestamp: Date.now(),
            toolId,
            previousTool
        };
        this.eventBus.emit(event);

        return true;
    }

    /**
     * Deselect current tool
     */
    deselectTool(): void {
        this.selectTool(null);
    }

    // === Tool Queries ===

    /**
     * Get tool by ID
     */
    getToolById(id: string): GameTool | null {
        return allTools.find(tool => tool.id === id) || null;
    }

    /**
     * Get tools by category
     */
    getToolsByCategory(category: 'terrain' | 'crop' | 'action'): GameTool[] {
        switch (category) {
            case 'terrain':
                return [...terrainTools];
            case 'crop':
                return [...cropTools];
            case 'action':
                return [...actionTools];
            default:
                return [];
        }
    }

    /**
     * Get all available tools
     */
    getAllTools(): GameTool[] {
        return [...allTools];
    }

    /**
     * Get tool by hotkey
     */
    getToolByHotkey(key: string): GameTool | null {
        return allTools.find(tool => tool.hotkey?.toLowerCase() === key.toLowerCase()) || null;
    }

    // === Tool Validation ===

    /**
     * Validate if a tool can be used (generic validation)
     */
    validateToolUsage(toolId: ToolId): ToolValidationResult {
        const tool = this.getToolById(toolId);

        if (!tool) {
            return {
                isValid: false,
                canUse: false,
                reason: `Tool '${toolId}' not found`,
                cost: 0,
                tool: null
            };
        }

        // All tools are valid by default, specific usage validation
        // should be handled by the respective systems (TileSystem, CropSystem, etc.)
        return {
            isValid: true,
            canUse: true,
            reason: 'Tool is valid',
            cost: tool.cost || 0,
            tool
        };
    }

    /**
     * Get tool requirements and constraints
     */
    getToolRequirements(toolId: ToolId): {
        requiresSoil: boolean;
        requiresCrop: boolean;
        requiresMatureCrop: boolean;
        requiresUnlockedArea: boolean;
        cost: number;
    } | null {
        const tool = this.getToolById(toolId);

        if (!tool) {
            return null;
        }

        let requiresSoil = false;
        let requiresCrop = false;
        let requiresMatureCrop = false;
        const requiresUnlockedArea = true; // All tools require unlocked areas

        // Determine requirements based on tool type and action
        if (tool.category === 'crop') {
            requiresSoil = true; // Crops need soil
        } else if (tool.category === 'action') {
            const actionTool = tool as ActionTool;
            switch (actionTool.action) {
                case 'harvest_crop':
                    requiresCrop = true;
                    requiresMatureCrop = true;
                    break;
                case 'water_crop':
                case 'fertilize_crop':
                    requiresSoil = true; // Can water/fertilize soil with or without crops
                    break;
            }
        }

        return {
            requiresSoil,
            requiresCrop,
            requiresMatureCrop,
            requiresUnlockedArea,
            cost: tool.cost || 0
        };
    }

    // === Tool Usage Tracking ===

    /**
     * Record tool usage
     */
    recordToolUsage(toolId: ToolId, tileX: number, tileY: number, success: boolean, costSpent: number = 0): void {
        const stats = this.usageStats.get(toolId);

        if (stats) {
            stats.usageCount++;
            stats.lastUsed = Date.now();
            stats.totalCostSpent += costSpent;

            if (success) {
                stats.successCount++;
            } else {
                stats.failureCount++;
            }
        }

        // Emit tool used event
        const event: ToolUsedEvent = {
            type: 'tool:used',
            timestamp: Date.now(),
            toolId,
            tileX,
            tileY,
            success
        };
        this.eventBus.emit(event);
    }

    /**
     * Get tool usage statistics
     */
    getToolUsageStats(toolId: ToolId): ToolUsageStats | null {
        return this.usageStats.get(toolId) || null;
    }

    /**
     * Get all tool usage statistics
     */
    getAllUsageStats(): ToolUsageStats[] {
        return Array.from(this.usageStats.values());
    }

    /**
     * Get most used tools
     */
    getMostUsedTools(limit: number = 5): ToolUsageStats[] {
        return this.getAllUsageStats()
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, limit);
    }

    /**
     * Get tool success rates
     */
    getToolSuccessRates(): Array<{
        toolId: ToolId;
        successRate: number;
        usageCount: number;
    }> {
        return this.getAllUsageStats()
            .filter(stats => stats.usageCount > 0)
            .map(stats => ({
                toolId: stats.toolId,
                successRate: stats.successCount / stats.usageCount,
                usageCount: stats.usageCount
            }))
            .sort((a, b) => b.successRate - a.successRate);
    }

    // === Hotkey System ===

    /**
     * Handle hotkey press
     */
    handleHotkey(key: string): boolean {
        const tool = this.getToolByHotkey(key);

        if (tool) {
            return this.selectTool(tool.id as ToolId);
        }

        // Special hotkeys
        switch (key.toLowerCase()) {
            case 'escape':
            case ' ': // Spacebar
                this.deselectTool();
                return true;
            default:
                return false;
        }
    }

    /**
     * Get hotkey mapping
     */
    getHotkeyMapping(): Record<string, ToolId> {
        const mapping: Record<string, ToolId> = {};

        for (const tool of allTools) {
            if (tool.hotkey) {
                mapping[tool.hotkey.toLowerCase()] = tool.id as ToolId;
            }
        }

        return mapping;
    }

    // === Tool Categories and Organization ===

    /**
     * Get tools organized by category
     */
    getToolsGrouped(): {
        terrain: TerrainTool[];
        crops: CropTool[];
        actions: ActionTool[];
    } {
        return {
            terrain: this.getToolsByCategory('terrain') as TerrainTool[],
            crops: this.getToolsByCategory('crop') as CropTool[],
            actions: this.getToolsByCategory('action') as ActionTool[]
        };
    }

    /**
     * Get tools sorted by cost
     */
    getToolsByCost(ascending: boolean = true): GameTool[] {
        const tools = [...allTools];
        return tools.sort((a, b) => {
            const costA = a.cost || 0;
            const costB = b.cost || 0;
            return ascending ? costA - costB : costB - costA;
        });
    }

    /**
     * Get available tools (tools that can be afforded)
     */
    getAvailableTools(currentCoins: number): GameTool[] {
        return allTools.filter(tool => (tool.cost || 0) <= currentCoins);
    }

    // === Statistics ===

    /**
     * Get comprehensive tool statistics
     */
    getStatistics(): {
        totalToolUsage: number;
        totalToolsUsed: number;
        totalSuccessfulActions: number;
        totalFailedActions: number;
        totalMoneySpent: number;
        averageSuccessRate: number;
        mostUsedTool: ToolId | null;
        mostExpensiveTool: ToolId | null;
        leastUsedTools: ToolId[];
        categoryUsage: Record<string, number>;
    } {
        const stats = this.getAllUsageStats();

        let totalUsage = 0;
        let totalSuccess = 0;
        let totalFailed = 0;
        let totalSpent = 0;
        let toolsUsed = 0;

        const categoryUsage: Record<string, number> = {
            terrain: 0,
            crop: 0,
            action: 0
        };

        let mostUsedTool: ToolId | null = null;
        let highestUsage = 0;

        for (const stat of stats) {
            if (stat.usageCount > 0) {
                toolsUsed++;
                totalUsage += stat.usageCount;
                totalSuccess += stat.successCount;
                totalFailed += stat.failureCount;
                totalSpent += stat.totalCostSpent;

                if (stat.usageCount > highestUsage) {
                    highestUsage = stat.usageCount;
                    mostUsedTool = stat.toolId;
                }

                // Category usage
                const tool = this.getToolById(stat.toolId);
                if (tool) {
                    categoryUsage[tool.category] += stat.usageCount;
                }
            }
        }

        const averageSuccessRate = totalUsage > 0 ? totalSuccess / totalUsage : 0;

        // Find most expensive tool
        const expensiveTools = this.getToolsByCost(false);
        const mostExpensiveTool = expensiveTools.length > 0
            ? expensiveTools[0].id as ToolId
            : null;

        // Find least used tools (0 usage)
        const leastUsedTools = stats
            .filter(stat => stat.usageCount === 0)
            .map(stat => stat.toolId);

        return {
            totalToolUsage: totalUsage,
            totalToolsUsed: toolsUsed,
            totalSuccessfulActions: totalSuccess,
            totalFailedActions: totalFailed,
            totalMoneySpent: totalSpent,
            averageSuccessRate,
            mostUsedTool,
            mostExpensiveTool,
            leastUsedTools,
            categoryUsage
        };
    }

    // === Reset and Serialization ===

    /**
     * Reset tool system to initial state
     */
    reset(): void {
        this.selectedTool = null;
        this.initializeUsageStats();
    }

    /**
     * Get tool data for saving
     */
    getToolData(): {
        selectedTool: ToolId | null;
        usageStats: Record<string, ToolUsageStats>;
    } {
        const usageStatsObj: Record<string, ToolUsageStats> = {};
        this.usageStats.forEach((stats, toolId) => {
            usageStatsObj[toolId] = { ...stats };
        });

        return {
            selectedTool: this.selectedTool,
            usageStats: usageStatsObj
        };
    }

    /**
     * Set tool data from save
     */
    setToolData(data: {
        selectedTool?: ToolId | null;
        usageStats?: Record<string, ToolUsageStats>;
    }): void {
        this.selectedTool = data.selectedTool || null;

        if (data.usageStats) {
            this.usageStats.clear();
            Object.entries(data.usageStats).forEach(([toolId, stats]) => {
                this.usageStats.set(toolId as ToolId, { ...stats });
            });
        } else {
            this.initializeUsageStats();
        }
    }
}
