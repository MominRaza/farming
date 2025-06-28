import { state, canAfford } from '../../core/state';
import { terrainTools, cropTools, actionTools, getToolById } from '../../core/tools';
import type { ToolId, GameTool } from '../../types';
import { hideTooltip } from '../tooltip';
import { eventBus, GameEvents } from '../../events/GameEvents';

/**
 * Toolbar Component - Handles tool selection and display
 */
export class Toolbar {
    private container: HTMLElement | null = null;
    private isInitialized = false;

    constructor() {
        this.setupEventListeners();
    }

    /**
     * Initialize the toolbar UI
     */
    public init(container: HTMLElement): void {
        this.container = container;
        this.render();
        this.attachEvents();
        this.isInitialized = true;
    }

    /**
     * Render the toolbar HTML
     */
    private render(): void {
        if (!this.container) return;

        const toolbarHTML = `
            <div class="ui-panel bottom-center-panel">
                <div class="toolbar-section">
                    ${this.renderToolSection(terrainTools)}
                </div>
                <div class="separator"></div>
                <div class="toolbar-section">
                    ${this.renderToolSection(cropTools)}
                </div>
                <div class="separator"></div>
                <div class="toolbar-section">
                    ${this.renderToolSection(actionTools)}
                </div>
            </div>
        `;

        this.container.innerHTML = toolbarHTML;
    }

    /**
     * Render a section of tools
     */
    private renderToolSection(tools: GameTool[]): string {
        return tools.map(tool => `
            <button class="${this.getButtonClasses(tool)}" 
                    data-tool="${tool.id}" 
                    title="${this.getTooltipText(tool)}">
                ${tool.icon}
            </button>
        `).join('');
    }

    /**
     * Get CSS classes for a tool button
     */
    private getButtonClasses(tool: GameTool): string {
        let classes = 'tool-button';

        if (tool.id === state.selectedTool) {
            classes += ' active';
        }

        if (tool.cost && !canAfford(tool.cost)) {
            classes += ' disabled';
        }

        return classes;
    }

    /**
     * Get tooltip text for a tool
     */
    private getTooltipText(tool: GameTool): string {
        let tooltip = tool.name;

        if (tool.hotkey) {
            tooltip += ` (${tool.hotkey})`;
        }

        if (tool.cost !== undefined) {
            tooltip += ` • Cost: ${tool.cost}`;

            if (!canAfford(tool.cost)) {
                tooltip += ` • NEED ${tool.cost - state.coins} MORE COINS`;
            }
        }

        return tooltip;
    }

    /**
     * Attach event listeners to toolbar buttons
     */
    private attachEvents(): void {
        if (!this.container) return;

        const toolButtons = this.container.querySelectorAll('.tool-button[data-tool]');

        toolButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Don't allow clicking disabled buttons
                if (button.classList.contains('disabled')) {
                    return;
                }

                const toolId = button.getAttribute('data-tool') as ToolId;
                if (toolId) {
                    this.selectTool(toolId);
                }
            });
        });
    }

    /**
     * Select a tool
     */
    public selectTool(toolId: ToolId | null): void {
        const previousTool = state.selectedTool;

        // Hide tooltip when tool selection changes
        hideTooltip();

        // Toggle tool selection - if already selected, deselect it
        if (state.selectedTool === toolId) {
            state.selectedTool = null;
        } else {
            state.selectedTool = toolId;
        }

        // Emit tool selection event
        GameEvents.emitToolSelected(state.selectedTool, previousTool);
    }

    /**
     * Update toolbar selection and affordability
     */
    public updateSelection(): void {
        if (!this.container || !this.isInitialized) return;

        this.container.querySelectorAll('.tool-button[data-tool]').forEach(button => {
            const toolId = button.getAttribute('data-tool') as ToolId;

            // Remove all dynamic classes
            button.classList.remove('active', 'disabled');

            // Add active class if selected
            if (toolId === state.selectedTool) {
                button.classList.add('active');
            }

            // Add disabled class if can't afford
            const tool = this.getToolById(toolId);
            if (tool && tool.cost && !canAfford(tool.cost)) {
                button.classList.add('disabled');
            }

            // Update tooltip
            if (tool) {
                button.setAttribute('title', this.getTooltipText(tool));
            }
        });
    }

    /**
     * Get tool by ID from all tool categories
     */
    private getToolById(toolId: ToolId): GameTool | undefined {
        return getToolById(toolId);
    }

    /**
     * Handle keyboard shortcuts for tool selection
     */
    public handleKeydown(key: string): boolean {
        const toolMap: Record<string, ToolId> = {
            '1': 'soil',
            '2': 'road',
            '3': 'harvest',
            '4': 'water',
            '5': 'fertilize',
            'q': 'wheat',
            'w': 'corn',
            'e': 'tomato',
            'r': 'potato',
            't': 'carrot',
            'y': 'pepper',
        };

        const newTool = toolMap[key.toLowerCase()];
        if (newTool) {
            this.selectTool(newTool);
            return true; // Key was handled
        }

        return false; // Key not handled
    }

    /**
     * Setup event listeners for the toolbar
     */
    private setupEventListeners(): void {
        // Listen for tool selection events to update toolbar
        eventBus.on('tool:selected', () => {
            this.updateSelection();
        });

        // Listen for coin changes to update affordability
        eventBus.on('economy:coins-changed', () => {
            this.updateSelection();
        });

        // Listen for game state changes
        eventBus.on('game:initialized', () => {
            this.updateSelection();
        });

        eventBus.on('save:load', () => {
            this.updateSelection();
        });
    }

    /**
     * Destroy the toolbar and clean up
     */
    public destroy(): void {
        if (this.container) {
            this.container.innerHTML = '';
            this.container = null;
        }
        this.isInitialized = false;
    }

    /**
     * Get selected tool ID
     */
    public getSelectedTool(): ToolId | null {
        return state.selectedTool;
    }

    /**
     * Check if toolbar is initialized
     */
    public isReady(): boolean {
        return this.isInitialized && this.container !== null;
    }
}
