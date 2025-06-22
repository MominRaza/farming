import { state, canAfford, spendCoins, earnCoins } from '../core/state';
import { plantCrop, removeCrop, hasSoil, hasCrop, setTileType, removeTile, getTileData, waterTile, fertilizeTile } from '../core/tile';
import type { ToolId } from '../types';
import { getTileCoords } from '../utils/helpers';
import { getToolById } from '../core/tools';

// Import the toolbar update function from HUD
let updateToolbarSelection: (() => void) | null = null;

export function setUpdateToolbarSelection(updateFn: () => void): void {
    updateToolbarSelection = updateFn;
}

export function initControls(
    canvas: HTMLCanvasElement,
    draw: () => void,
    updateCursorTile: (x: number, y: number) => void
): void {
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw();
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', (e) => {
        state.isDragging = true;
        state.lastMouseX = e.clientX;
        state.lastMouseY = e.clientY;
    });

    canvas.addEventListener('mousemove', (e) => {
        updateCursorTile(e.clientX, e.clientY);
        if (state.isDragging) {
            const dx = e.clientX - state.lastMouseX;
            const dy = e.clientY - state.lastMouseY;
            state.offsetX += dx;
            state.offsetY += dy;
            state.lastMouseX = e.clientX;
            state.lastMouseY = e.clientY;
            draw();
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (state.isDragging) {
            const dx = Math.abs(e.clientX - state.lastMouseX);
            const dy = Math.abs(e.clientY - state.lastMouseY); if (dx < 5 && dy < 5) {
                const { tileX, tileY } = getTileCoords(e.clientX, e.clientY, state.offsetX, state.offsetY, state.scale);

                // If no tool is selected, just return without doing anything
                if (state.selectedTool === null) {
                    console.log('No tool selected. Select a tool from the toolbar first.');
                    return;
                }

                const selectedTool = getToolById(state.selectedTool);

                if (!selectedTool) return;// Handle different tool actions
                switch (selectedTool.category) {
                    case 'terrain':
                        if ('tileType' in selectedTool) {
                            const tileData = getTileData(tileX, tileY);

                            // Check if trying to modify soil with crops
                            if (tileData && tileData.type === 'soil' && tileData.crop) {
                                console.log(`Cannot modify soil at (${tileX}, ${tileY}) - crop is planted! Harvest first.`);
                                break;
                            }

                            if (tileData && tileData.type === selectedTool.tileType) {
                                // Remove tile if clicking same type (only if no crop) - no cost
                                removeTile(tileX, tileY);
                                console.log(`Removed ${selectedTool.name} at (${tileX}, ${tileY})`);
                            } else {
                                // Check if player can afford the tool
                                if (selectedTool.cost && !canAfford(selectedTool.cost)) {
                                    console.log(`Not enough coins! Need ${selectedTool.cost} coins for ${selectedTool.name}.`);
                                    break;
                                }

                                // Set or update tile type and deduct cost
                                if (selectedTool.cost && !spendCoins(selectedTool.cost)) {
                                    console.log(`Failed to spend coins for ${selectedTool.name}`);
                                    break;
                                }

                                setTileType(tileX, tileY, selectedTool.tileType);
                                console.log(`Placed ${selectedTool.name} at (${tileX}, ${tileY}) for ${selectedTool.cost || 0} coins`);
                            }
                        }
                        break; case 'crop':
                        // Plant crop only on soil tiles
                        if (hasSoil(tileX, tileY)) {
                            if (hasCrop(tileX, tileY)) {
                                console.log(`Tile already has a crop at (${tileX}, ${tileY})`);
                            } else if ('growthStages' in selectedTool) {
                                // Check if player can afford the crop
                                if (selectedTool.cost && !canAfford(selectedTool.cost)) {
                                    console.log(`Not enough coins! Need ${selectedTool.cost} coins for ${selectedTool.name}.`);
                                    break;
                                }

                                // Spend coins and plant crop
                                if (selectedTool.cost && !spendCoins(selectedTool.cost)) {
                                    console.log(`Failed to spend coins for ${selectedTool.name}`);
                                    break;
                                }

                                const success = plantCrop(tileX, tileY, selectedTool.id as ToolId, selectedTool.growthStages);
                                if (success) {
                                    console.log(`Planted ${selectedTool.name} at (${tileX}, ${tileY}) for ${selectedTool.cost || 0} coins`);
                                } else {
                                    console.log(`Failed to plant ${selectedTool.name} at (${tileX}, ${tileY})`);
                                    // Refund coins if planting failed
                                    if (selectedTool.cost) {
                                        earnCoins(selectedTool.cost);
                                    }
                                }
                            }
                        } else {
                            console.log(`Cannot plant ${selectedTool.name} - no soil at (${tileX}, ${tileY})`);
                        }
                        break; case 'action':                        // Handle different action tools
                        if (selectedTool.id === 'harvest') {
                            if (hasCrop(tileX, tileY)) {
                                // Get the crop data before removing it to know what reward to give
                                const tileData = getTileData(tileX, tileY);
                                if (tileData?.crop) {
                                    const cropTool = getToolById(tileData.crop.cropType);
                                    const success = removeCrop(tileX, tileY);
                                    if (success && cropTool && 'reward' in cropTool && cropTool.reward) {
                                        earnCoins(cropTool.reward);
                                        console.log(`Harvested ${cropTool.name} at (${tileX}, ${tileY}) and earned ${cropTool.reward} coins!`);
                                    } else if (success) {
                                        console.log(`Harvested crop at (${tileX}, ${tileY})`);
                                    }
                                }
                            } else {
                                console.log(`No crop to harvest at (${tileX}, ${tileY})`);
                            }
                        } else if (selectedTool.id === 'water') {
                            // Water soil tiles
                            if (hasSoil(tileX, tileY)) {
                                // Check if player can afford watering
                                if (selectedTool.cost && !canAfford(selectedTool.cost)) {
                                    console.log(`Not enough coins! Need ${selectedTool.cost} coins to water.`);
                                    break;
                                }

                                // Spend coins and water
                                if (selectedTool.cost && !spendCoins(selectedTool.cost)) {
                                    console.log(`Failed to spend coins for watering`);
                                    break;
                                }

                                const success = waterTile(tileX, tileY);
                                if (success) {
                                    console.log(`Watered soil at (${tileX}, ${tileY}) for ${selectedTool.cost || 0} coins`);
                                } else {
                                    console.log(`Failed to water at (${tileX}, ${tileY})`);
                                    // Refund coins if watering failed
                                    if (selectedTool.cost) {
                                        earnCoins(selectedTool.cost);
                                    }
                                }
                            } else {
                                console.log(`Cannot water - no soil at (${tileX}, ${tileY})`);
                            }
                        } else if (selectedTool.id === 'fertilize') {
                            // Fertilize soil tiles
                            if (hasSoil(tileX, tileY)) {
                                // Check if player can afford fertilizing
                                if (selectedTool.cost && !canAfford(selectedTool.cost)) {
                                    console.log(`Not enough coins! Need ${selectedTool.cost} coins to fertilize.`);
                                    break;
                                }

                                // Spend coins and fertilize
                                if (selectedTool.cost && !spendCoins(selectedTool.cost)) {
                                    console.log(`Failed to spend coins for fertilizing`);
                                    break;
                                }

                                const success = fertilizeTile(tileX, tileY);
                                if (success) {
                                    console.log(`Fertilized soil at (${tileX}, ${tileY}) for ${selectedTool.cost || 0} coins`);
                                } else {
                                    console.log(`Failed to fertilize at (${tileX}, ${tileY})`);
                                    // Refund coins if fertilizing failed
                                    if (selectedTool.cost) {
                                        earnCoins(selectedTool.cost);
                                    }
                                }
                            } else {
                                console.log(`Cannot fertilize - no soil at (${tileX}, ${tileY})`);
                            }
                        }
                        break;
                }
                draw();
            }
        }
        state.isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        state.isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const zoom = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = state.scale * zoom;
        if (newScale < 0.25 || newScale > 3) return;
        const worldX = (mouseX - state.offsetX) / state.scale;
        const worldY = (mouseY - state.offsetY) / state.scale;
        state.scale = newScale;
        state.offsetX = mouseX - worldX * state.scale;
        state.offsetY = mouseY - worldY * state.scale;
        draw();
    }, { passive: false }); document.addEventListener('keydown', (e) => {
        // Allow Escape key to deselect all tools
        if (e.key === 'Escape') {
            state.selectedTool = null;
            if (updateToolbarSelection) {
                updateToolbarSelection();
            }
            return;
        }

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

        const newTool = toolMap[e.key.toLowerCase()];
        if (newTool) {
            // Toggle tool selection - if already selected, deselect it
            if (state.selectedTool === newTool) {
                state.selectedTool = null;
            } else {
                state.selectedTool = newTool;
            }
            // Update toolbar selection if available
            if (updateToolbarSelection) {
                updateToolbarSelection();
            }
        }
    });
}
