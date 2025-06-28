import { EventBus } from '../events/EventBus';
import type {
    CoinsChangedEvent,
    PurchaseAttemptedEvent
} from '../events/EventTypes';
import { STARTING_COINS } from '../utils/constants';

/**
 * Transaction result interface
 */
export interface TransactionResult {
    success: boolean;
    newBalance: number;
    change: number;
    reason: string;
}

/**
 * Purchase validation result interface
 */
export interface PurchaseValidation {
    canAfford: boolean;
    currentBalance: number;
    cost: number;
    shortfall: number;
}

/**
 * EconomySystem manages the game's economic system
 * Handles coins, transactions, purchases, and economic statistics
 */
export class EconomySystem {
    private eventBus: EventBus;
    private coins: number = STARTING_COINS;
    private transactionHistory: Array<{
        timestamp: number;
        amount: number;
        reason: string;
        balanceBefore: number;
        balanceAfter: number;
    }> = [];

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
    }

    // === Balance Management ===

    /**
     * Get current coin balance
     */
    getCoins(): number {
        return this.coins;
    }

    /**
     * Set coin balance (for save/load)
     */
    setCoins(amount: number): void {
        const oldAmount = this.coins;
        this.coins = Math.max(0, amount);
        this.emitCoinsChanged(oldAmount, this.coins, this.coins - oldAmount, 'Balance set');
    }

    /**
     * Add coins to balance
     */
    addCoins(amount: number, reason: string = 'Coins added'): TransactionResult {
        if (amount <= 0) {
            return {
                success: false,
                newBalance: this.coins,
                change: 0,
                reason: 'Invalid amount: must be positive'
            };
        }

        const oldAmount = this.coins;
        this.coins += amount;

        this.recordTransaction(amount, reason, oldAmount, this.coins);
        this.emitCoinsChanged(oldAmount, this.coins, amount, reason);

        return {
            success: true,
            newBalance: this.coins,
            change: amount,
            reason
        };
    }

    /**
     * Subtract coins from balance
     */
    subtractCoins(amount: number, reason: string = 'Coins spent'): TransactionResult {
        if (amount <= 0) {
            return {
                success: false,
                newBalance: this.coins,
                change: 0,
                reason: 'Invalid amount: must be positive'
            };
        }

        if (this.coins < amount) {
            return {
                success: false,
                newBalance: this.coins,
                change: 0,
                reason: `Insufficient funds: need ${amount}, have ${this.coins}`
            };
        }

        const oldAmount = this.coins;
        this.coins -= amount;

        this.recordTransaction(-amount, reason, oldAmount, this.coins);
        this.emitCoinsChanged(oldAmount, this.coins, -amount, reason);

        return {
            success: true,
            newBalance: this.coins,
            change: -amount,
            reason
        };
    }

    // === Purchase System ===

    /**
     * Check if player can afford a purchase
     */
    canAfford(cost: number): PurchaseValidation {
        return {
            canAfford: this.coins >= cost,
            currentBalance: this.coins,
            cost,
            shortfall: Math.max(0, cost - this.coins)
        };
    }

    /**
     * Attempt to make a purchase
     */
    attemptPurchase(item: string, cost: number): TransactionResult {
        const validation = this.canAfford(cost);

        // Emit purchase attempt event
        const purchaseEvent: PurchaseAttemptedEvent = {
            type: 'economy:purchase-attempted',
            timestamp: Date.now(),
            item,
            cost,
            success: validation.canAfford
        };
        this.eventBus.emit(purchaseEvent);

        if (!validation.canAfford) {
            return {
                success: false,
                newBalance: this.coins,
                change: 0,
                reason: `Cannot afford ${item}: need ${cost}, have ${this.coins} (short ${validation.shortfall})`
            };
        }

        return this.subtractCoins(cost, `Purchased ${item}`);
    }

    /**
     * Process a sale (add coins from selling items)
     */
    processSale(item: string, price: number): TransactionResult {
        return this.addCoins(price, `Sold ${item}`);
    }

    // === Income and Expenses Tracking ===

    /**
     * Get total income from transaction history
     */
    getTotalIncome(): number {
        return this.transactionHistory
            .filter(transaction => transaction.amount > 0)
            .reduce((total, transaction) => total + transaction.amount, 0);
    }

    /**
     * Get total expenses from transaction history
     */
    getTotalExpenses(): number {
        return Math.abs(this.transactionHistory
            .filter(transaction => transaction.amount < 0)
            .reduce((total, transaction) => total + transaction.amount, 0));
    }

    /**
     * Get net profit (income - expenses, excluding starting balance)
     */
    getNetProfit(): number {
        return this.getTotalIncome() - this.getTotalExpenses();
    }

    /**
     * Get income by category
     */
    getIncomeByCategory(): Record<string, number> {
        const incomeByCategory: Record<string, number> = {};

        this.transactionHistory
            .filter(transaction => transaction.amount > 0)
            .forEach(transaction => {
                incomeByCategory[transaction.reason] =
                    (incomeByCategory[transaction.reason] || 0) + transaction.amount;
            });

        return incomeByCategory;
    }

    /**
     * Get expenses by category
     */
    getExpensesByCategory(): Record<string, number> {
        const expensesByCategory: Record<string, number> = {};

        this.transactionHistory
            .filter(transaction => transaction.amount < 0)
            .forEach(transaction => {
                expensesByCategory[transaction.reason] =
                    (expensesByCategory[transaction.reason] || 0) + Math.abs(transaction.amount);
            });

        return expensesByCategory;
    }

    // === Statistics ===

    /**
     * Get economic statistics
     */
    getStatistics(): {
        currentBalance: number;
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
        transactionCount: number;
        averageTransactionSize: number;
        biggestIncome: number;
        biggestExpense: number;
        incomeByCategory: Record<string, number>;
        expensesByCategory: Record<string, number>;
    } {
        const totalIncome = this.getTotalIncome();
        const totalExpenses = this.getTotalExpenses();
        const transactionCount = this.transactionHistory.length;

        const amounts = this.transactionHistory.map(t => Math.abs(t.amount));
        const averageTransactionSize = amounts.length > 0
            ? amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
            : 0;

        const biggestIncome = this.transactionHistory
            .filter(t => t.amount > 0)
            .reduce((max, t) => Math.max(max, t.amount), 0);

        const biggestExpense = this.transactionHistory
            .filter(t => t.amount < 0)
            .reduce((max, t) => Math.max(max, Math.abs(t.amount)), 0);

        return {
            currentBalance: this.coins,
            totalIncome,
            totalExpenses,
            netProfit: this.getNetProfit(),
            transactionCount,
            averageTransactionSize,
            biggestIncome,
            biggestExpense,
            incomeByCategory: this.getIncomeByCategory(),
            expensesByCategory: this.getExpensesByCategory()
        };
    }

    /**
     * Get recent transactions
     */
    getRecentTransactions(count: number = 10): Array<{
        timestamp: number;
        amount: number;
        reason: string;
        balanceBefore: number;
        balanceAfter: number;
        timeAgo: string;
    }> {
        const now = Date.now();

        return this.transactionHistory
            .slice(-count)
            .reverse()
            .map(transaction => ({
                ...transaction,
                timeAgo: this.formatTimeAgo(now - transaction.timestamp)
            }));
    }

    /**
     * Reset economy to starting state
     */
    reset(): void {
        const oldAmount = this.coins;
        this.coins = STARTING_COINS;
        this.transactionHistory = [];

        this.emitCoinsChanged(oldAmount, this.coins, this.coins - oldAmount, 'Game reset');
    }

    // === Utility Methods ===

    /**
     * Format time elapsed for display
     */
    private formatTimeAgo(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ago`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s ago`;
        } else {
            return `${seconds}s ago`;
        }
    }

    /**
     * Record a transaction in history
     */
    private recordTransaction(amount: number, reason: string, balanceBefore: number, balanceAfter: number): void {
        this.transactionHistory.push({
            timestamp: Date.now(),
            amount,
            reason,
            balanceBefore,
            balanceAfter
        });

        // Keep only last 1000 transactions to prevent memory growth
        if (this.transactionHistory.length > 1000) {
            this.transactionHistory = this.transactionHistory.slice(-1000);
        }
    }

    /**
     * Emit coins changed event
     */
    private emitCoinsChanged(oldAmount: number, newAmount: number, change: number, reason: string): void {
        const event: CoinsChangedEvent = {
            type: 'economy:coins-changed',
            timestamp: Date.now(),
            oldAmount,
            newAmount,
            change,
            reason
        };
        this.eventBus.emit(event);
    }

    // === Serialization ===

    /**
     * Get economy data for saving
     */
    getEconomyData(): {
        coins: number;
        transactionHistory: Array<{
            timestamp: number;
            amount: number;
            reason: string;
            balanceBefore: number;
            balanceAfter: number;
        }>;
    } {
        return {
            coins: this.coins,
            transactionHistory: [...this.transactionHistory]
        };
    }

    /**
     * Set economy data from save
     */
    setEconomyData(data: {
        coins: number;
        transactionHistory?: Array<{
            timestamp: number;
            amount: number;
            reason: string;
            balanceBefore: number;
            balanceAfter: number;
        }>;
    }): void {
        this.setCoins(data.coins);
        this.transactionHistory = data.transactionHistory || [];
    }
}
