import { state } from '../core/state';
import { eventBus, GameEvents } from '../events/GameEvents';
import { Toolbar } from './components/Toolbar';
import { HUD } from './components/HUD';
import { SaveLoadDialog } from './components/SaveLoadDialog';
import { Notifications } from './components/Notifications';
import { Tooltip } from './components/Tooltip';

/**
 * UIManager - Coordinates all UI components and handles user interactions
 */
export class UIManager {
    private container: HTMLElement | null = null;
    private toolbar: Toolbar;
    private hud: HUD;
    private saveLoadDialog: SaveLoadDialog;
    private notifications: Notifications;
    private tooltip: Tooltip;
    private isInitialized = false;

    constructor() {
        // Initialize all UI components
        this.notifications = new Notifications();
        this.tooltip = new Tooltip();
        this.toolbar = new Toolbar();
        this.hud = new HUD();
        this.saveLoadDialog = new SaveLoadDialog(this.notifications);

        this.setupEventListeners();
        this.setupKeyboardHandlers();
    }

    /**
     * Initialize the UI manager with the main UI container
     */
    public init(container: HTMLElement): void {
        this.container = container;

        // Initialize all components
        this.initializeComponents();

        this.isInitialized = true;
        console.log('UIManager initialized successfully');
    }

    /**
     * Initialize all UI components
     */
    private initializeComponents(): void {
        if (!this.container) return;

        // Clear container
        this.container.innerHTML = '';

        // Create separate containers for each component
        const hudContainer = document.createElement('div');
        hudContainer.className = 'hud-container';

        const toolbarContainer = document.createElement('div');
        toolbarContainer.className = 'toolbar-container';

        const dialogContainer = document.createElement('div');
        dialogContainer.className = 'dialog-container';

        // Add containers to main container
        this.container.appendChild(hudContainer);
        this.container.appendChild(toolbarContainer);
        this.container.appendChild(dialogContainer);

        // Initialize components
        this.notifications.init(); // Creates its own container
        this.tooltip.init();
        this.hud.init(hudContainer);
        this.toolbar.init(toolbarContainer);
        this.saveLoadDialog.init(dialogContainer);

        console.log('All UI components initialized');
    }

    /**
     * Handle keyboard input for UI interactions
     */
    public handleKeydown(event: KeyboardEvent): boolean {
        // Handle Escape key for save UI or tool deselection
        if (event.key === 'Escape') {
            if (this.saveLoadDialog.isOpen()) {
                this.saveLoadDialog.hide();
            } else if (state.selectedTool !== null) {
                this.toolbar.selectTool(null);
            } else {
                this.saveLoadDialog.show();
            }
            return true; // Key handled
        }

        // Let toolbar handle tool shortcuts
        if (this.toolbar.handleKeydown(event.key)) {
            return true; // Key handled by toolbar
        }

        return false; // Key not handled
    }

    /**
     * Show tooltip for a tile position
     */
    public showTooltip(tileX: number, tileY: number, screenX: number, screenY: number): void {
        this.tooltip.showForTile(tileX, tileY, screenX, screenY);
    }

    /**
     * Hide tooltip
     */
    public hideTooltip(): void {
        this.tooltip.hide();
    }

    /**
     * Show a notification
     */
    public showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number): void {
        this.notifications.show(message, type, duration);
    }

    /**
     * Toggle save/load dialog
     */
    public toggleSaveDialog(): void {
        this.saveLoadDialog.toggle();
    }

    /**
     * Check if save dialog is open
     */
    public isSaveDialogOpen(): boolean {
        return this.saveLoadDialog.isOpen();
    }

    /**
     * Get selected tool from toolbar
     */
    public getSelectedTool(): string | null {
        return this.toolbar.getSelectedTool();
    }

    /**
     * Update all UI components
     */
    public update(): void {
        if (!this.isInitialized) return;

        // Components update themselves via events, but we can force updates here if needed
        this.hud.updateDisplay();
        this.toolbar.updateSelection();
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners(): void {
        // Listen for game events and coordinate UI responses
        eventBus.on('game:initialized', () => {
            this.update();
        });

        eventBus.on('save:load', () => {
            this.update();
        });

        eventBus.on('view:refresh', () => {
            this.update();
        });

        // Listen for tool selection changes
        eventBus.on('tool:selected', (event) => {
            // Could add visual feedback or other UI coordination here
            if (event.toolId) {
                console.log(`Tool selected: ${event.toolId}`);
            } else {
                console.log('Tool deselected');
            }
        });

        // Listen for economy changes
        eventBus.on('economy:coins-changed', (event) => {
            // Show coin change notification for significant amounts
            if (Math.abs(event.change) >= 10) {
                const message = event.change > 0
                    ? `+${event.change} coins earned!`
                    : `${event.change} coins spent`;
                const type = event.change > 0 ? 'success' : 'info';
                this.notifications.show(message, type, 2000);
            }
        });
    }

    /**
     * Setup global keyboard handlers
     */
    private setupKeyboardHandlers(): void {
        document.addEventListener('keydown', (event) => {
            // Only handle keys if no input elements are focused
            const activeElement = document.activeElement;
            if (activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.tagName === 'SELECT'
            )) {
                return; // Don't handle keyboard shortcuts when typing
            }

            this.handleKeydown(event);
        });
    }

    /**
     * Check if UI is ready
     */
    public isReady(): boolean {
        return this.isInitialized &&
            this.toolbar.isReady() &&
            this.hud.isReady() &&
            this.saveLoadDialog.isReady() &&
            this.notifications.isReady() &&
            this.tooltip.isReady();
    }

    /**
     * Get UI statistics for debugging
     */
    public getStats(): Record<string, unknown> {
        return {
            isReady: this.isReady(),
            isInitialized: this.isInitialized,
            hasContainer: this.container !== null,
            components: {
                toolbar: this.toolbar.isReady(),
                hud: this.hud.isReady(),
                saveDialog: this.saveLoadDialog.isReady(),
                notifications: this.notifications.isReady(),
                tooltip: this.tooltip.isReady()
            },
            selectedTool: this.getSelectedTool(),
            saveDialogOpen: this.isSaveDialogOpen(),
            activeNotifications: this.notifications.getActiveCount()
        };
    }

    /**
     * Refresh all UI components
     */
    public refresh(): void {
        this.update();
        GameEvents.emitViewRefresh('UI refresh requested');
    }

    /**
     * Show custom tooltip
     */
    public showCustomTooltip(content: string, screenX: number, screenY: number, duration?: number): void {
        this.tooltip.showCustom(content, screenX, screenY, duration);
    }

    /**
     * Set tooltip delay
     */
    public setTooltipDelay(delay: number): void {
        this.tooltip.setDelay(delay);
    }

    /**
     * Clear all notifications
     */
    public clearNotifications(): void {
        this.notifications.clear();
    }

    /**
     * Show success notification shorthand
     */
    public success(message: string, duration?: number): void {
        this.notifications.success(message, duration);
    }

    /**
     * Show error notification shorthand
     */
    public error(message: string, duration?: number): void {
        this.notifications.error(message, duration);
    }

    /**
     * Show warning notification shorthand
     */
    public warning(message: string, duration?: number): void {
        this.notifications.warning(message, duration);
    }

    /**
     * Show info notification shorthand
     */
    public info(message: string, duration?: number): void {
        this.notifications.info(message, duration);
    }

    /**
     * Force update of specific component
     */
    public updateComponent(component: 'toolbar' | 'hud' | 'saveDialog'): void {
        switch (component) {
            case 'toolbar':
                this.toolbar.updateSelection();
                break;
            case 'hud':
                this.hud.updateDisplay();
                break;
            case 'saveDialog':
                // SaveDialog updates itself via events
                break;
        }
    }

    /**
     * Destroy UI manager and clean up all components
     */
    public destroy(): void {
        // Destroy all components
        this.notifications.destroy();
        this.tooltip.destroy();
        this.toolbar.destroy();
        this.hud.destroy();
        this.saveLoadDialog.destroy();

        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
            this.container = null;
        }

        this.isInitialized = false;
        console.log('UIManager destroyed');
    }
}
