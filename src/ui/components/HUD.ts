import { state } from '../../core/state';
import { eventBus } from '../../events/GameEvents';

/**
 * HUD Component - Displays game statistics like coins
 */
export class HUD {
    private container: HTMLElement | null = null;
    private coinAmountElement: HTMLElement | null = null;
    private isInitialized = false;

    constructor() {
        this.setupEventListeners();
    }

    /**
     * Initialize the HUD UI
     */
    public init(container: HTMLElement): void {
        this.container = container;
        this.render();
        this.cacheElements();
        this.updateDisplay();
        this.isInitialized = true;
    }

    /**
     * Render the HUD HTML
     */
    private render(): void {
        if (!this.container) return;

        const hudHTML = `
            <div class="ui-panel top-left-panel coins-panel">
                <div class="coins-display">
                    <span class="coin-icon">🪙</span>
                    <span class="coin-amount" id="coin-amount">0</span>
                </div>
            </div>
        `;

        this.container.innerHTML = hudHTML;
    }

    /**
     * Cache DOM elements for performance
     */
    private cacheElements(): void {
        if (!this.container) return;
        this.coinAmountElement = this.container.querySelector('#coin-amount');
    }

    /**
     * Update the HUD display
     */
    public updateDisplay(): void {
        if (!this.isInitialized) return;

        this.updateCoins();
    }

    /**
     * Update the coin display
     */
    private updateCoins(): void {
        if (this.coinAmountElement) {
            this.coinAmountElement.textContent = state.coins.toString();
        }
    }

    /**
     * Set coin amount (with animation support)
     */
    public setCoins(amount: number, animate: boolean = false): void {
        if (!this.coinAmountElement) return;

        if (animate) {
            // Add animation class for coin changes
            this.coinAmountElement.classList.add('coin-change');
            setTimeout(() => {
                this.coinAmountElement?.classList.remove('coin-change');
            }, 300);
        }

        this.coinAmountElement.textContent = amount.toString();
    }

    /**
     * Add additional stats to the HUD (extensible)
     */
    public addStat(key: string, label: string, value: string | number, icon?: string): void {
        if (!this.container) return;

        const statElement = document.createElement('div');
        statElement.className = 'stat-item';
        statElement.id = `stat-${key}`;
        statElement.innerHTML = `
            <span class="stat-icon">${icon || '📊'}</span>
            <span class="stat-label">${label}:</span>
            <span class="stat-value" id="stat-value-${key}">${value}</span>
        `;

        // Find the coins panel and add the stat after it
        const coinsPanel = this.container.querySelector('.coins-panel');
        if (coinsPanel && coinsPanel.parentNode) {
            coinsPanel.parentNode.insertBefore(statElement, coinsPanel.nextSibling);
        }
    }

    /**
     * Update a specific stat
     */
    public updateStat(key: string, value: string | number): void {
        const statValueElement = document.getElementById(`stat-value-${key}`);
        if (statValueElement) {
            statValueElement.textContent = value.toString();
        }
    }

    /**
     * Remove a stat from the HUD
     */
    public removeStat(key: string): void {
        const statElement = document.getElementById(`stat-${key}`);
        if (statElement && statElement.parentNode) {
            statElement.parentNode.removeChild(statElement);
        }
    }

    /**
     * Show a temporary status message
     */
    public showStatus(message: string, duration: number = 3000, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
        if (!this.container) return;

        const statusElement = document.createElement('div');
        statusElement.className = `hud-status status-${type}`;
        statusElement.textContent = message;

        this.container.appendChild(statusElement);

        // Animate in
        setTimeout(() => statusElement.classList.add('visible'), 10);

        // Remove after duration
        setTimeout(() => {
            statusElement.classList.remove('visible');
            setTimeout(() => {
                if (statusElement.parentNode) {
                    statusElement.parentNode.removeChild(statusElement);
                }
            }, 300);
        }, duration);
    }

    /**
     * Setup event listeners for the HUD
     */
    private setupEventListeners(): void {
        // Listen for coin changes to update HUD
        eventBus.on('economy:coins-changed', (event) => {
            this.setCoins(event.newAmount, true);
        });

        // Listen for game state changes
        eventBus.on('game:initialized', () => {
            this.updateDisplay();
        });

        eventBus.on('save:load', () => {
            this.updateDisplay();
        });

        // Listen for view refresh requests
        eventBus.on('view:refresh', () => {
            this.updateDisplay();
        });
    }

    /**
     * Get current coin amount
     */
    public getCoins(): number {
        return state.coins;
    }

    /**
     * Check if HUD is initialized
     */
    public isReady(): boolean {
        return this.isInitialized && this.container !== null;
    }

    /**
     * Destroy the HUD and clean up
     */
    public destroy(): void {
        if (this.container) {
            this.container.innerHTML = '';
            this.container = null;
        }
        this.coinAmountElement = null;
        this.isInitialized = false;
    }

    /**
     * Get HUD statistics for analysis
     */
    public getStats(): Record<string, string | number | boolean> {
        return {
            coins: state.coins,
            isReady: this.isReady(),
            hasContainer: this.container !== null,
            hasCoinElement: this.coinAmountElement !== null
        };
    }
}
