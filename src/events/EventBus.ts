// Central event bus for decoupled communication throughout the game

import type { EventListener, AllGameEvents } from './EventTypes';

/**
 * EventBus - Central event dispatcher for the farming game
 * 
 * Provides a decoupled way for different parts of the application to communicate
 * without direct dependencies. Components can emit events and listen for events
 * without knowing about each other.
 */
export class EventBus {
    private listeners: Map<string, Set<EventListener>> = new Map();
    private isDebugMode: boolean = false;

    /**
     * Enable/disable debug logging for events
     */
    setDebugMode(enabled: boolean): void {
        this.isDebugMode = enabled;
    }

    /**
     * Subscribe to an event type
     * @param eventType - The type of event to listen for
     * @param listener - The callback function to execute when the event occurs
     * @returns Unsubscribe function
     */
    on<T extends AllGameEvents['type']>(
        eventType: T,
        listener: EventListener<Extract<AllGameEvents, { type: T }>>
    ): () => void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }

        const listenersSet = this.listeners.get(eventType)!;
        listenersSet.add(listener as EventListener);

        if (this.isDebugMode) {
            console.log(`[EventBus] Subscribed to '${eventType}'. Total listeners: ${listenersSet.size}`);
        }

        // Return unsubscribe function
        return () => this.off(eventType, listener);
    }

    /**
     * Unsubscribe from an event type
     * @param eventType - The type of event to stop listening for
     * @param listener - The specific listener to remove
     */
    off<T extends AllGameEvents['type']>(
        eventType: T,
        listener: EventListener<Extract<AllGameEvents, { type: T }>>
    ): void {
        const listenersSet = this.listeners.get(eventType);
        if (listenersSet) {
            listenersSet.delete(listener as EventListener);

            if (this.isDebugMode) {
                console.log(`[EventBus] Unsubscribed from '${eventType}'. Remaining listeners: ${listenersSet.size}`);
            }

            // Clean up empty listener sets
            if (listenersSet.size === 0) {
                this.listeners.delete(eventType);
            }
        }
    }

    /**
     * Subscribe to an event type for one-time execution
     * @param eventType - The type of event to listen for
     * @param listener - The callback function to execute once when the event occurs
     */
    once<T extends AllGameEvents['type']>(
        eventType: T,
        listener: EventListener<Extract<AllGameEvents, { type: T }>>
    ): void {
        const onceWrapper = (event: Extract<AllGameEvents, { type: T }>) => {
            listener(event);
            this.off(eventType, onceWrapper);
        };

        this.on(eventType, onceWrapper);
    }

    /**
     * Emit an event to all subscribers
     * @param event - The event to emit
     */
    emit<T extends AllGameEvents>(event: T): void {
        const listeners = this.listeners.get(event.type);

        if (this.isDebugMode) {
            console.log(`[EventBus] Emitting '${event.type}'`, event);
        }

        if (listeners && listeners.size > 0) {
            // Create a copy of listeners to avoid issues if listeners are modified during emission
            const listenersCopy = Array.from(listeners);

            for (const listener of listenersCopy) {
                try {
                    listener(event);
                } catch (error) {
                    console.error(`[EventBus] Error in listener for '${event.type}':`, error);
                }
            }

            if (this.isDebugMode) {
                console.log(`[EventBus] Event '${event.type}' delivered to ${listenersCopy.length} listeners`);
            }
        } else if (this.isDebugMode) {
            console.log(`[EventBus] No listeners for event '${event.type}'`);
        }
    }

    /**
     * Remove all listeners for a specific event type
     * @param eventType - The event type to clear
     */
    removeAllListeners(eventType?: string): void {
        if (eventType) {
            this.listeners.delete(eventType);
            if (this.isDebugMode) {
                console.log(`[EventBus] Removed all listeners for '${eventType}'`);
            }
        } else {
            this.listeners.clear();
            if (this.isDebugMode) {
                console.log(`[EventBus] Removed all listeners for all events`);
            }
        }
    }

    /**
     * Get the number of listeners for an event type
     * @param eventType - The event type to count listeners for
     * @returns Number of listeners
     */
    getListenerCount(eventType: string): number {
        return this.listeners.get(eventType)?.size || 0;
    }

    /**
     * Get all registered event types
     * @returns Array of event types
     */
    getEventTypes(): string[] {
        return Array.from(this.listeners.keys());
    }

    /**
     * Check if there are any listeners for an event type
     * @param eventType - The event type to check
     * @returns True if there are listeners
     */
    hasListeners(eventType: string): boolean {
        return this.getListenerCount(eventType) > 0;
    }
}

// Global event bus instance
export const eventBus = new EventBus();

// Enable debug mode in development
if (import.meta.env.DEV) {
    eventBus.setDebugMode(true);
}
