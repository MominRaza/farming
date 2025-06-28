import { saveGame, loadGame, hasSaveData, exportSaveData, importSaveData, getSaveInfo, deleteSaveData } from '../../core/saveSystem';
import { eventBus, GameEvents } from '../../events/GameEvents';
import { Notifications } from './Notifications';

/**
 * SaveLoadDialog Component - Handles save/load UI and operations
 */
export class SaveLoadDialog {
    private container: HTMLElement | null = null;
    private overlayElement: HTMLElement | null = null;
    private isVisible = false;
    private isInitialized = false;
    private notifications: Notifications;

    constructor(notifications: Notifications) {
        this.notifications = notifications;
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    /**
     * Initialize the save/load dialog UI
     */
    public init(container: HTMLElement): void {
        this.container = container;
        this.render();
        this.attachEvents();
        this.updateSaveInfo();
        this.isInitialized = true;
    }

    /**
     * Render the save/load dialog HTML
     */
    private render(): void {
        if (!this.container) return;

        const dialogHTML = `
            <div id="save-ui-overlay" class="save-ui-overlay" style="display: none;">
                <div class="save-ui-panel">
                    <div class="save-ui-header">
                        <h3>Game Menu</h3>
                        <button id="close-save-ui" class="close-button" title="Close (Esc)">✕</button>
                    </div>
                    <div class="save-load-section">
                        <button id="save-button" class="save-load-button" title="Save Game (Ctrl+S)">💾 Save</button>
                        <button id="load-button" class="save-load-button" title="Load Game (Ctrl+L)">📁 Load</button>
                        <button id="export-button" class="save-load-button" title="Export Save File">📤 Export</button>
                        <button id="import-button" class="save-load-button" title="Import Save File">📥 Import</button>
                        <button id="delete-button" class="save-load-button delete-button" title="Delete Save Data (Ctrl+D)">🗑️ Delete</button>
                        <input type="file" id="import-file" accept=".json" style="display: none;">
                    </div>
                    <p id="save-info">No save data</p>
                </div>
            </div>
        `;

        this.container.innerHTML = dialogHTML;
        this.overlayElement = this.container.querySelector('#save-ui-overlay');
    }

    /**
     * Attach event listeners to dialog buttons
     */
    private attachEvents(): void {
        if (!this.container) return;

        // Save button
        const saveButton = this.container.querySelector('#save-button');
        saveButton?.addEventListener('click', () => this.handleSave());

        // Load button
        const loadButton = this.container.querySelector('#load-button');
        loadButton?.addEventListener('click', () => this.handleLoad());

        // Export button
        const exportButton = this.container.querySelector('#export-button');
        exportButton?.addEventListener('click', () => this.handleExport());

        // Import button
        const importButton = this.container.querySelector('#import-button');
        importButton?.addEventListener('click', () => this.handleImportClick());

        // Delete button
        const deleteButton = this.container.querySelector('#delete-button');
        deleteButton?.addEventListener('click', () => this.handleDelete());

        // Close button
        const closeButton = this.container.querySelector('#close-save-ui');
        closeButton?.addEventListener('click', () => this.hide());

        // Import file input
        const importFile = this.container.querySelector('#import-file') as HTMLInputElement;
        importFile?.addEventListener('change', (e) => this.handleImportFile(e));

        // Click outside to close overlay
        this.overlayElement?.addEventListener('click', (e) => {
            // Only close if clicking the overlay itself, not the panel
            if (e.target === this.overlayElement) {
                this.hide();
            }
        });
    }

    /**
     * Handle save operation
     */
    private handleSave(): void {
        const success = saveGame();
        if (success) {
            this.notifications.show('Game saved successfully!', 'success');
        } else {
            this.notifications.show('Failed to save game!', 'error');
        }
        this.updateSaveInfo();
    }

    /**
     * Handle load operation
     */
    private handleLoad(): void {
        if (!hasSaveData()) {
            this.notifications.show('No save data found!', 'warning');
            return;
        }

        const success = loadGame();
        if (success) {
            this.notifications.show('Game loaded successfully!', 'success');
            GameEvents.emitLoadGame(true);
        } else {
            this.notifications.show('Failed to load game!', 'error');
            GameEvents.emitLoadGame(false);
        }
        this.updateSaveInfo();
        this.hide(); // Close dialog after loading
    }

    /**
     * Handle export operation
     */
    private handleExport(): void {
        exportSaveData();
        this.notifications.show('Save file exported!', 'success');
    }

    /**
     * Handle import button click
     */
    private handleImportClick(): void {
        const importFile = this.container?.querySelector('#import-file') as HTMLInputElement;
        importFile?.click();
    }

    /**
     * Handle import file selection
     */
    private async handleImportFile(event: Event): Promise<void> {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const success = await importSaveData(file);
            if (success) {
                this.notifications.show('Save file imported successfully!', 'success');
                GameEvents.emitViewRefresh('save imported');
            } else {
                this.notifications.show('Failed to import save file!', 'error');
            }
            this.updateSaveInfo();
            // Clear the file input
            const importFile = event.target as HTMLInputElement;
            importFile.value = '';
        }
    }

    /**
     * Handle delete operation
     */
    private handleDelete(): void {
        if (!hasSaveData()) {
            this.notifications.show('No save data to delete!', 'warning');
            return;
        }

        // Confirm deletion
        if (confirm('Are you sure you want to delete your saved game? This action cannot be undone.')) {
            const success = deleteSaveData();
            if (success) {
                this.notifications.show('Save data deleted successfully!', 'success');
                GameEvents.emitSaveDeleted(true);
            } else {
                this.notifications.show('Failed to delete save data!', 'error');
                GameEvents.emitSaveDeleted(false);
            }
            this.updateSaveInfo();
        }
    }

    /**
     * Update save info display
     */
    private updateSaveInfo(): void {
        const saveInfoElement = this.container?.querySelector('#save-info');
        if (!saveInfoElement) return;

        const saveInfo = getSaveInfo();
        if (saveInfo) {
            const date = new Date(saveInfo.timestamp);
            const now = new Date();
            const timeDiff = now.getTime() - date.getTime();
            const minutesAgo = Math.floor(timeDiff / (1000 * 60));

            if (minutesAgo < 1) {
                saveInfoElement.textContent = 'Saved just now';
            } else if (minutesAgo === 1) {
                saveInfoElement.textContent = 'Saved 1 minute ago';
            } else if (minutesAgo < 60) {
                saveInfoElement.textContent = `Saved ${minutesAgo} minutes ago`;
            } else {
                const hoursAgo = Math.floor(minutesAgo / 60);
                if (hoursAgo === 1) {
                    saveInfoElement.textContent = 'Saved 1 hour ago';
                } else {
                    saveInfoElement.textContent = `Saved ${hoursAgo} hours ago`;
                }
            }
        } else {
            saveInfoElement.textContent = 'No save data';
        }
    }

    /**
     * Show the save/load dialog
     */
    public show(): void {
        if (this.overlayElement) {
            this.overlayElement.style.display = 'flex';
            this.isVisible = true;
            this.updateSaveInfo();

            // Emit tool deselection when opening save UI
            GameEvents.emitToolSelected(null, null);
        }
    }

    /**
     * Hide the save/load dialog
     */
    public hide(): void {
        if (this.overlayElement) {
            this.overlayElement.style.display = 'none';
            this.isVisible = false;
        }
    }

    /**
     * Toggle the save/load dialog visibility
     */
    public toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Check if dialog is visible
     */
    public isOpen(): boolean {
        return this.isVisible;
    }

    /**
     * Setup keyboard shortcuts
     */
    private setupKeyboardShortcuts(): void {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    this.handleSave();
                } else if (e.key === 'l') {
                    e.preventDefault();
                    this.handleLoad();
                } else if (e.key === 'd') {
                    e.preventDefault();
                    this.handleDelete();
                }
            }
        });
    }

    /**
     * Setup event listeners
     */
    private setupEventListeners(): void {
        // Listen for save state changes
        eventBus.on('save:load', () => {
            this.updateSaveInfo();
        });

        eventBus.on('save:deleted', () => {
            this.updateSaveInfo();
        });
    }

    /**
     * Check if dialog is initialized
     */
    public isReady(): boolean {
        return this.isInitialized && this.container !== null;
    }

    /**
     * Destroy the dialog and clean up
     */
    public destroy(): void {
        if (this.container) {
            this.container.innerHTML = '';
            this.container = null;
        }
        this.overlayElement = null;
        this.isVisible = false;
        this.isInitialized = false;
    }

    /**
     * Get dialog statistics
     */
    public getStats(): Record<string, string | number | boolean> {
        return {
            isVisible: this.isVisible,
            isReady: this.isReady(),
            hasSaveData: hasSaveData(),
            hasContainer: this.container !== null
        };
    }
}
