/**
 * Notifications Component - Handles toast notifications and messages
 */
export class Notifications {
    private container: HTMLElement | null = null;
    private isInitialized = false;
    private notificationQueue: NotificationConfig[] = [];
    private maxNotifications = 5;
    private defaultDuration = 3000;

    constructor() { }

    /**
     * Initialize the notifications system
     */
    public init(container?: HTMLElement): void {
        // Use provided container or create a default one
        if (container) {
            this.container = container;
        } else {
            this.container = this.createDefaultContainer();
        }

        this.isInitialized = true;
    }

    /**
     * Create default notifications container
     */
    private createDefaultContainer(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = 'notifications-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
            max-width: 300px;
        `;

        document.body.appendChild(container);
        return container;
    }

    /**
     * Show a notification
     */
    public show(
        message: string,
        type: NotificationType = 'info',
        duration?: number,
        actions?: NotificationAction[]
    ): string {
        if (!this.isInitialized || !this.container) {
            console.warn('Notifications not initialized');
            return '';
        }

        const config: NotificationConfig = {
            id: this.generateId(),
            message,
            type,
            duration: duration ?? this.defaultDuration,
            timestamp: Date.now(),
            actions
        };

        this.addNotification(config);
        return config.id;
    }

    /**
     * Show success notification
     */
    public success(message: string, duration?: number): string {
        return this.show(message, 'success', duration);
    }

    /**
     * Show error notification
     */
    public error(message: string, duration?: number): string {
        return this.show(message, 'error', duration);
    }

    /**
     * Show warning notification
     */
    public warning(message: string, duration?: number): string {
        return this.show(message, 'warning', duration);
    }

    /**
     * Show info notification
     */
    public info(message: string, duration?: number): string {
        return this.show(message, 'info', duration);
    }

    /**
     * Add notification to the display
     */
    private addNotification(config: NotificationConfig): void {
        if (!this.container) return;

        // Remove oldest notifications if we exceed the limit
        while (this.notificationQueue.length >= this.maxNotifications) {
            const oldest = this.notificationQueue.shift();
            if (oldest) {
                this.removeNotificationElement(oldest.id);
            }
        }

        this.notificationQueue.push(config);
        this.createNotificationElement(config);
    }

    /**
     * Create notification DOM element
     */
    private createNotificationElement(config: NotificationConfig): void {
        if (!this.container) return;

        const notification = document.createElement('div');
        notification.id = `notification-${config.id}`;
        notification.className = `notification notification-${config.type}`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(config.type)};
            color: white;
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
            pointer-events: auto;
            font-size: 14px;
            line-height: 1.4;
            position: relative;
            word-wrap: break-word;
            max-width: 100%;
        `;

        // Create content
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.textContent = config.message;

        notification.appendChild(content);

        // Add actions if provided
        if (config.actions && config.actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'notification-actions';
            actionsContainer.style.cssText = `
                margin-top: 8px;
                display: flex;
                gap: 8px;
            `;

            config.actions.forEach(action => {
                const button = document.createElement('button');
                button.textContent = action.label;
                button.className = 'notification-action';
                button.style.cssText = `
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                `;

                button.addEventListener('click', () => {
                    action.callback();
                    this.dismiss(config.id);
                });

                actionsContainer.appendChild(button);
            });

            notification.appendChild(actionsContainer);
        }

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.className = 'notification-close';
        closeButton.style.cssText = `
            position: absolute;
            top: 6px;
            right: 8px;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            font-size: 12px;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        closeButton.addEventListener('click', () => {
            this.dismiss(config.id);
        });

        notification.appendChild(closeButton);

        // Add to container
        this.container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto-remove after duration (if not persistent)
        if (config.duration > 0) {
            setTimeout(() => {
                this.dismiss(config.id);
            }, config.duration);
        }
    }

    /**
     * Get notification background color based on type
     */
    private getNotificationColor(type: NotificationType): string {
        const colors = {
            success: 'linear-gradient(135deg, #4CAF50, #45a049)',
            error: 'linear-gradient(135deg, #f44336, #d32f2f)',
            warning: 'linear-gradient(135deg, #ff9800, #f57c00)',
            info: 'linear-gradient(135deg, #2196F3, #1976D2)'
        };

        return colors[type] || colors.info;
    }

    /**
     * Dismiss a notification by ID
     */
    public dismiss(id: string): void {
        const notification = document.getElementById(`notification-${id}`);
        if (notification) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';

            setTimeout(() => {
                this.removeNotificationElement(id);
            }, 300);
        }

        // Remove from queue
        this.notificationQueue = this.notificationQueue.filter(n => n.id !== id);
    }

    /**
     * Remove notification DOM element
     */
    private removeNotificationElement(id: string): void {
        const notification = document.getElementById(`notification-${id}`);
        if (notification && notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }

    /**
     * Clear all notifications
     */
    public clear(): void {
        this.notificationQueue.forEach(notification => {
            this.removeNotificationElement(notification.id);
        });
        this.notificationQueue = [];
    }

    /**
     * Generate unique notification ID
     */
    private generateId(): string {
        return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Set maximum number of notifications
     */
    public setMaxNotifications(max: number): void {
        this.maxNotifications = Math.max(1, max);
    }

    /**
     * Set default notification duration
     */
    public setDefaultDuration(duration: number): void {
        this.defaultDuration = Math.max(0, duration);
    }

    /**
     * Get active notifications count
     */
    public getActiveCount(): number {
        return this.notificationQueue.length;
    }

    /**
     * Check if notifications are initialized
     */
    public isReady(): boolean {
        return this.isInitialized && this.container !== null;
    }

    /**
     * Destroy notifications and clean up
     */
    public destroy(): void {
        this.clear();

        if (this.container && this.container.id === 'notifications-container') {
            // Only remove if we created the default container
            document.body.removeChild(this.container);
        }

        this.container = null;
        this.isInitialized = false;
    }

    /**
     * Get notifications statistics
     */
    public getStats(): Record<string, string | number | boolean> {
        return {
            isReady: this.isReady(),
            activeCount: this.getActiveCount(),
            maxNotifications: this.maxNotifications,
            defaultDuration: this.defaultDuration,
            hasContainer: this.container !== null
        };
    }
}

// Type definitions
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationAction {
    label: string;
    callback: () => void;
}

export interface NotificationConfig {
    id: string;
    message: string;
    type: NotificationType;
    duration: number;
    timestamp: number;
    actions?: NotificationAction[];
}
