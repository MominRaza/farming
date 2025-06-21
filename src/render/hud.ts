
import { state } from '../core/state';
import { TileTypes, TILE_COLORS } from '../core/tile';

let updateUIFrame: number | null = null;

export function initHUD(ui: HTMLDivElement) {
    ui.innerHTML = `
    <div class="ui-panel top-left-panel">
      <h3>Controls</h3>
      <p>• Drag to pan</p>
      <p>• Scroll to zoom</p>
      <p>• Press 1 for Soil, 2 for Road</p>
      <p>• Click to place/remove tiles</p>
    </div>
    <div class="ui-panel top-right-panel">
      <h3>Info</h3>
      <p id="zoom-info">Zoom: 100%</p>
      <p id="position-info">Position: (0, 0)</p>
      <p id="tile-info">Tile Index: (0, 0)</p>
      <p id="current-tile-type">Current Tile: Soil</p>
    </div>
  `;
    updateHUD();
}

export function updateHUD() {
    const zoomInfo = document.getElementById('zoom-info');
    const positionInfo = document.getElementById('position-info');
    const tileInfo = document.getElementById('tile-info');
    const currentTileTypeInfo = document.getElementById('current-tile-type');
    if (zoomInfo) zoomInfo.textContent = `Zoom: ${Math.round(state.scale * 100)}%`;
    if (positionInfo) positionInfo.textContent = `Position: (${Math.round(state.offsetX)}, ${Math.round(state.offsetY)})`;
    if (tileInfo) tileInfo.textContent = `Tile Index: (${state.tileX}, ${state.tileY})`;
    if (currentTileTypeInfo) {
        const typeNames = {
            [TileTypes.SOIL]: 'Soil (1)',
            [TileTypes.ROAD]: 'Road (2)',
        };
        currentTileTypeInfo.textContent = `Current Tile: ${typeNames[state.currentTileType as import('../types').TileType]}`;
        currentTileTypeInfo.style.color = TILE_COLORS[state.currentTileType as import('../types').TileType];
    }

    updateUIFrame = requestAnimationFrame(updateHUD);
}
