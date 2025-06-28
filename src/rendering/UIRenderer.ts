import type { GameState } from '../state/GameState';
import type { GameTool } from '../types';

/**
 * UIRenderer handles rendering all UI elements that are not affected by camera transform
 * This includes the HUD, toolbar, tooltips, and other overlay elements
 */
export class UIRenderer {
    private hudBackgroundColor: string = 'rgba(0, 0, 0, 0.8)';
    private hudTextColor: string = '#ffffff';
    private hudFont: string = '16px Arial';

    /**
     * Render all UI elements
     */
    public render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: GameState): void {
        // Render HUD
        this.renderHUD(ctx, canvas, state);

        // Render debug info if needed
        this.renderDebugInfo(ctx, canvas, state);
    }

    /**
     * Render the HUD (Heads-Up Display)
     */
    private renderHUD(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: GameState): void {
        // HUD background
        const hudHeight = 60;
        ctx.fillStyle = this.hudBackgroundColor;
        ctx.fillRect(0, 0, canvas.width, hudHeight);

        // Set text properties
        ctx.fillStyle = this.hudTextColor;
        ctx.font = this.hudFont;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // Coins display
        const coinsText = `Coins: ${state.economy.coins}`;
        ctx.fillText(coinsText, 20, hudHeight / 2);

        // Selected tool display
        const selectedTool = state.ui.selectedTool;
        const toolText = selectedTool ? `Tool: ${selectedTool}` : 'Tool: None';
        ctx.fillText(toolText, 200, hudHeight / 2);

        // Current tile coordinates
        const coordsText = `Tile: (${state.ui.tileX}, ${state.ui.tileY})`;
        ctx.fillText(coordsText, 400, hudHeight / 2);

        // Camera/view info
        const cameraText = `Zoom: ${(state.ui.scale * 100).toFixed(0)}%`;
        ctx.fillText(cameraText, 600, hudHeight / 2);
    }

    /**
     * Render debug information
     */
    private renderDebugInfo(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: GameState): void {
        // Only render debug info in development or when debug mode is enabled
        const isDebug = import.meta.env.DEV || (globalThis as { gameDebug?: boolean }).gameDebug;

        if (!isDebug) return;

        const debugHeight = 120;
        const debugY = canvas.height - debugHeight;

        // Debug background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, debugY, canvas.width, debugHeight);

        // Debug text properties
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const debugInfo = [
            `FPS: ${this.getFPS()}`,
            `Tiles: ${state.world.tiles.size}`,
            `Areas: ${state.world.areas.size}`,
            `Offset: (${state.ui.offsetX.toFixed(1)}, ${state.ui.offsetY.toFixed(1)})`,
            `Scale: ${state.ui.scale.toFixed(2)}`,
            `Mouse: (${state.ui.lastMouseX}, ${state.ui.lastMouseY})`,
            `Dragging: ${state.ui.isDragging}`,
            `Game Time: ${this.formatGameTime(Date.now() - state.meta.gameStartTime)}`
        ];

        debugInfo.forEach((line, index) => {
            ctx.fillText(line, 20, debugY + 15 + index * 15);
        });
    }

    /**
     * Render tooltip at specified position
     */
    public renderTooltip(ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void {
        if (!text) return;

        const padding = 8;
        const fontSize = 14;

        ctx.font = `${fontSize}px Arial`;
        const textWidth = ctx.measureText(text).width;
        const tooltipWidth = textWidth + padding * 2;
        const tooltipHeight = fontSize + padding * 2;

        // Adjust position if tooltip would go off screen
        const adjustedX = Math.min(x, window.innerWidth - tooltipWidth);
        const adjustedY = Math.max(y - tooltipHeight - 10, 0);

        // Tooltip background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(adjustedX, adjustedY, tooltipWidth, tooltipHeight);

        // Tooltip border
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(adjustedX, adjustedY, tooltipWidth, tooltipHeight);

        // Tooltip text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(text, adjustedX + padding, adjustedY + padding);
    }

    /**
     * Render notification message
     */
    public renderNotification(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
        const notificationHeight = 50;
        const notificationY = canvas.height - notificationHeight - 20;

        // Background color based on type
        const colors = {
            success: 'rgba(0, 255, 0, 0.8)',
            error: 'rgba(255, 0, 0, 0.8)',
            warning: 'rgba(255, 255, 0, 0.8)',
            info: 'rgba(0, 100, 255, 0.8)'
        };

        // Notification background
        ctx.fillStyle = colors[type];
        ctx.fillRect(50, notificationY, canvas.width - 100, notificationHeight);

        // Notification text
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, canvas.width / 2, notificationY + notificationHeight / 2);
    }

    /**
     * Render toolbar (if not using HTML-based toolbar)
     */
    public renderToolbar(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, tools: GameTool[], selectedTool: string | null): void {
        const toolbarHeight = 60;
        const toolbarY = canvas.height - toolbarHeight;
        const toolSize = 50;
        const toolPadding = 5;

        // Toolbar background
        ctx.fillStyle = this.hudBackgroundColor;
        ctx.fillRect(0, toolbarY, canvas.width, toolbarHeight);

        // Render tools
        tools.forEach((tool, index) => {
            const toolX = index * (toolSize + toolPadding) + toolPadding;
            const toolY = toolbarY + toolPadding;

            // Tool background
            ctx.fillStyle = tool.id === selectedTool ? '#444444' : '#222222';
            ctx.fillRect(toolX, toolY, toolSize, toolSize);

            // Tool border
            ctx.strokeStyle = tool.id === selectedTool ? '#ffff00' : '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(toolX, toolY, toolSize, toolSize);

            // Tool icon/name
            ctx.fillStyle = this.hudTextColor;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tool.name, toolX + toolSize / 2, toolY + toolSize / 2);

            // Tool hotkey
            if (tool.hotkey) {
                ctx.font = '10px Arial';
                ctx.fillText(tool.hotkey, toolX + toolSize / 2, toolY + toolSize - 8);
            }
        });
    }

    /**
     * Get current FPS (placeholder - would be provided by main renderer)
     */
    private getFPS(): number {
        // This would typically be provided by the main renderer
        return 60;
    }

    /**
     * Format game time duration
     */
    private formatGameTime(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000) % 60;
        const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Set HUD appearance
     */
    public setHUDAppearance(backgroundColor: string, textColor: string, font: string): void {
        this.hudBackgroundColor = backgroundColor;
        this.hudTextColor = textColor;
        this.hudFont = font;
    }

    /**
     * Get HUD appearance settings
     */
    public getHUDAppearance(): { backgroundColor: string; textColor: string; font: string } {
        return {
            backgroundColor: this.hudBackgroundColor,
            textColor: this.hudTextColor,
            font: this.hudFont
        };
    }
}
