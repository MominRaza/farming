import { state } from '../core/state';
import { terrainTools, cropTools, actionTools } from '../core/tools';
import type { ToolId } from '../types';

export function initHUD(ui: HTMLDivElement): void {
  ui.innerHTML = `
    <div class="ui-panel top-left-panel">
        <h3>Controls</h3>
        <p>• Drag to pan, scroll to zoom</p>
        <p>• Click toolbar or use hotkeys to select tools</p>
    </div>
    <div class="ui-panel top-right-panel">
        <h3>Info</h3>
        <p id="zoom-info">Zoom: 100%</p>
        <p id="position-info">Position: (0, 0)</p>
        <p id="tile-info">Tile Index: (0, 0)</p>
    </div>
    <div class="ui-panel bottom-center-panel">
        <div class="toolbar-section">
            ${terrainTools.map((tool) => `
                <button class="tool-button ${tool.id === state.selectedTool ? 'active' : ''}" 
                        data-tool="${tool.id}" 
                        title="${tool.name}${tool.hotkey ? ` (${tool.hotkey})` : ''}">
                    ${tool.icon}
                    ${tool.hotkey ? `<span class="hotkey">${tool.hotkey}</span>` : ''}
                </button>
            `).join('')}
        </div>
        <div class="separator"></div>
        <div class="toolbar-section">
            ${cropTools.map((tool) => `
                <button class="tool-button ${tool.id === state.selectedTool ? 'active' : ''}" 
                        data-tool="${tool.id}" 
                        title="${tool.name}${tool.hotkey ? ` (${tool.hotkey})` : ''}">
                    ${tool.icon}
                    ${tool.hotkey ? `<span class="hotkey">${tool.hotkey}</span>` : ''}
                </button>
            `).join('')}
        </div>
        <div class="separator"></div>
        <div class="toolbar-section">
            ${actionTools.map((tool) => `
                <button class="tool-button ${tool.id === state.selectedTool ? 'active' : ''}" 
                        data-tool="${tool.id}" 
                        title="${tool.name}${tool.hotkey ? ` (${tool.hotkey})` : ''}">
                    ${tool.icon}
                    ${tool.hotkey ? `<span class="hotkey">${tool.hotkey}</span>` : ''}
                </button>
            `).join('')}
        </div>
    </div>
    `;

  initToolbarEvents();
  updateHUD();
}

function initToolbarEvents(): void {
  const toolButtons = document.querySelectorAll('.tool-button[data-tool]');

  toolButtons.forEach(button => {
    button.addEventListener('click', () => {
      const toolId = button.getAttribute('data-tool') as ToolId;
      if (toolId) {
        state.selectedTool = toolId;
        updateToolbarSelection();
      }
    });
  });
}

function updateToolbarSelection(): void {
  document.querySelectorAll('.tool-button[data-tool]').forEach(button => {
    const toolId = button.getAttribute('data-tool');
    if (toolId === state.selectedTool) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

export { updateToolbarSelection };

export function updateHUD(): void {
  const zoomInfo = document.getElementById('zoom-info');
  const positionInfo = document.getElementById('position-info');
  const tileInfo = document.getElementById('tile-info');

  if (zoomInfo) zoomInfo.textContent = `Zoom: ${Math.round(state.scale * 100)}%`;
  if (positionInfo) positionInfo.textContent = `Position: (${Math.round(state.offsetX)}, ${Math.round(state.offsetY)})`;
  if (tileInfo) tileInfo.textContent = `Tile Index: (${state.tileX}, ${state.tileY})`;

  requestAnimationFrame(updateHUD);
}
