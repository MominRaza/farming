import { state, canAfford } from '../core/state';
import { terrainTools, cropTools, actionTools } from '../core/tools';
import type { ToolId } from '../types';

// Helper function to get button classes based on affordability
function getButtonClasses(tool: any): string {
  let classes = 'tool-button';

  if (tool.id === state.selectedTool) {
    classes += ' active';
  }

  if (tool.cost && !canAfford(tool.cost)) {
    classes += ' disabled';
  }

  return classes;
}

// Helper function to get tooltip text based on affordability
function getTooltipText(tool: any): string {
  let tooltip = tool.name;

  if (tool.hotkey) {
    tooltip += ` (${tool.hotkey})`;
  }

  if (tool.cost !== undefined) {
    tooltip += ` • Cost: ${tool.cost}`;

    if (!canAfford(tool.cost)) {
      tooltip += ` • NEED ${tool.cost - state.coins} MORE COINS`;
    }
  }

  return tooltip;
}

export function initHUD(ui: HTMLDivElement): void {
  ui.innerHTML = `
    <div class="ui-panel top-left-panel coins-panel">
        <div class="coins-display">
            <span class="coin-icon">🪙</span>
            <span class="coin-amount" id="coin-amount">0</span>
        </div>
    </div>
    <div class="ui-panel top-right-panel">
        <h3>Info</h3>
        <p id="zoom-info">Zoom: 100%</p>
        <p id="position-info">Position: (0, 0)</p>
        <p id="tile-info">Tile Index: (0, 0)</p>
    </div>
    <div class="ui-panel bottom-center-panel">        <div class="toolbar-section">
            ${terrainTools.map((tool) => `
                <button class="${getButtonClasses(tool)}" 
                        data-tool="${tool.id}" 
                        title="${getTooltipText(tool)}">
                    ${tool.icon}
                    ${tool.hotkey ? `<span class="hotkey">${tool.hotkey}</span>` : ''}
                    ${tool.cost !== undefined ? `<span class="cost">${tool.cost}</span>` : ''}
                </button>
            `).join('')}
        </div>
        <div class="separator"></div>
        <div class="toolbar-section">
            ${cropTools.map((tool) => `
                <button class="${getButtonClasses(tool)}" 
                        data-tool="${tool.id}" 
                        title="${getTooltipText(tool)}">
                    ${tool.icon}
                    ${tool.hotkey ? `<span class="hotkey">${tool.hotkey}</span>` : ''}
                    ${tool.cost !== undefined ? `<span class="cost">${tool.cost}</span>` : ''}
                </button>
            `).join('')}
        </div>
        <div class="separator"></div>
        <div class="toolbar-section">
            ${actionTools.map((tool) => `
                <button class="${getButtonClasses(tool)}" 
                        data-tool="${tool.id}" 
                        title="${getTooltipText(tool)}">
                    ${tool.icon}
                    ${tool.hotkey ? `<span class="hotkey">${tool.hotkey}</span>` : ''}
                    ${tool.cost !== undefined ? `<span class="cost">${tool.cost}</span>` : ''}
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
      // Don't allow clicking disabled buttons
      if (button.classList.contains('disabled')) {
        return;
      }

      const toolId = button.getAttribute('data-tool') as ToolId;
      if (toolId) {
        // Toggle tool selection - if already selected, deselect it
        if (state.selectedTool === toolId) {
          state.selectedTool = null;
        } else {
          state.selectedTool = toolId;
        }
        updateToolbarSelection();
      }
    });
  });
}

function updateToolbarSelection(): void {
  document.querySelectorAll('.tool-button[data-tool]').forEach(button => {
    const toolId = button.getAttribute('data-tool') as ToolId;

    // Remove all dynamic classes
    button.classList.remove('active', 'disabled');

    // Add active class if selected
    if (toolId === state.selectedTool) {
      button.classList.add('active');
    }

    // Add disabled class if can't afford
    const tool = [...terrainTools, ...cropTools, ...actionTools].find(t => t.id === toolId);
    if (tool && tool.cost && !canAfford(tool.cost)) {
      button.classList.add('disabled');
    }
  });
}

export { updateToolbarSelection };

export function updateHUD(): void {
  const zoomInfo = document.getElementById('zoom-info');
  const positionInfo = document.getElementById('position-info');
  const tileInfo = document.getElementById('tile-info');
  const coinAmount = document.getElementById('coin-amount');

  if (zoomInfo) zoomInfo.textContent = `Zoom: ${Math.round(state.scale * 100)}%`;
  if (positionInfo) positionInfo.textContent = `Position: (${Math.round(state.offsetX)}, ${Math.round(state.offsetY)})`;
  if (tileInfo) tileInfo.textContent = `Tile Index: (${state.tileX}, ${state.tileY})`;
  if (coinAmount) coinAmount.textContent = state.coins.toString();

  // Update toolbar affordability
  updateToolbarSelection();

  requestAnimationFrame(updateHUD);
}
