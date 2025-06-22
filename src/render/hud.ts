import { state, canAfford } from '../core/state';
import { terrainTools, cropTools, actionTools } from '../core/tools';
import { saveGame, loadGame, hasSaveData, exportSaveData, importSaveData, getSaveInfo, deleteSaveData } from '../core/saveSystem';
import type { ToolId } from '../types';
import { hideTooltip } from '../ui/tooltip';

// Store draw function for refresh after save/load
let refreshView: (() => void) | null = null;
let initializeGameFn: (() => void) | null = null;

export function setRefreshView(drawFn: () => void): void {
  refreshView = drawFn;
}

export function setInitializeGame(initFn: () => void): void {
  initializeGameFn = initFn;
}
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
        <h3>Game</h3>        <div class="save-load-section">
            <button id="save-button" class="save-load-button" title="Save Game (Ctrl+S)">💾 Save</button>
            <button id="load-button" class="save-load-button" title="Load Game (Ctrl+L)">📁 Load</button>
            <button id="export-button" class="save-load-button" title="Export Save File">📤 Export</button>
            <button id="import-button" class="save-load-button" title="Import Save File">📥 Import</button>
            <button id="delete-button" class="save-load-button delete-button" title="Delete Save Data (Ctrl+D)">🗑️ Delete</button>
            <input type="file" id="import-file" accept=".json" style="display: none;">
        </div>
        <div class="game-info">
            <p id="save-info">No save data</p>
            <p id="zoom-info">Zoom: 100%</p>
            <p id="position-info">Position: (0, 0)</p>
            <p id="tile-info">Tile Index: (0, 0)</p>
        </div>
    </div>
    <div class="ui-panel bottom-center-panel"><div class="toolbar-section">
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
  initSaveLoadEvents();
  updateHUD();
}

function initToolbarEvents(): void {
  const toolButtons = document.querySelectorAll('.tool-button[data-tool]');

  toolButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Don't allow clicking disabled buttons
      if (button.classList.contains('disabled')) {
        return;
      } const toolId = button.getAttribute('data-tool') as ToolId;
      if (toolId) {
        // Hide tooltip when tool selection changes
        hideTooltip();

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

  // Update save info (but only occasionally to avoid performance issues)
  if (Math.random() < 0.01) { // Update 1% of the time
    updateSaveInfo();
  }

  requestAnimationFrame(updateHUD);
}

function initSaveLoadEvents(): void {
  const saveButton = document.getElementById('save-button');
  const loadButton = document.getElementById('load-button');
  const exportButton = document.getElementById('export-button');
  const importButton = document.getElementById('import-button');
  const deleteButton = document.getElementById('delete-button');
  const importFile = document.getElementById('import-file') as HTMLInputElement;

  if (saveButton) {
    saveButton.addEventListener('click', () => {
      const success = saveGame();
      if (success) {
        showNotification('Game saved successfully!', 'success');
      } else {
        showNotification('Failed to save game!', 'error');
      }
      updateSaveInfo();
    });
  } if (loadButton) {
    loadButton.addEventListener('click', () => {
      if (!hasSaveData()) {
        showNotification('No save data found!', 'warning');
        return;
      }

      const success = loadGame();
      if (success) {
        showNotification('Game loaded successfully!', 'success');
        // Use centralized game initialization to ensure camera is properly set
        if (initializeGameFn) {
          initializeGameFn();
        } else if (refreshView) {
          refreshView();
        }
      } else {
        showNotification('Failed to load game!', 'error');
      }
      updateSaveInfo();
    });
  }

  if (exportButton) {
    exportButton.addEventListener('click', () => {
      exportSaveData();
      showNotification('Save file exported!', 'success');
    });
  }
  if (importButton) {
    importButton.addEventListener('click', () => {
      importFile.click();
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      if (!hasSaveData()) {
        showNotification('No save data to delete!', 'warning');
        return;
      }      // Confirm deletion
      if (confirm('Are you sure you want to delete your saved game? This action cannot be undone.')) {
        const success = deleteSaveData();
        if (success) {
          showNotification('Save data deleted successfully!', 'success');
          // Use centralized game initialization instead of just refreshing view
          if (initializeGameFn) {
            initializeGameFn();
          } else if (refreshView) {
            refreshView();
          }
        } else {
          showNotification('Failed to delete save data!', 'error');
        }
        updateSaveInfo();
      }
    });
  }

  if (importFile) {
    importFile.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const success = await importSaveData(file);
        if (success) {
          showNotification('Save file imported successfully!', 'success');
          if (refreshView) refreshView(); // Refresh the view after importing
        } else {
          showNotification('Failed to import save file!', 'error');
        }
        updateSaveInfo();
        // Clear the file input
        importFile.value = '';
      }
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        const success = saveGame();
        if (success) {
          showNotification('Game saved successfully!', 'success');
        } else {
          showNotification('Failed to save game!', 'error');
        }
        updateSaveInfo();
      } else if (e.key === 'l') {
        e.preventDefault();
        if (!hasSaveData()) {
          showNotification('No save data found!', 'warning');
          return;
        } const success = loadGame();
        if (success) {
          showNotification('Game loaded successfully!', 'success');
          // Use centralized game initialization to ensure camera is properly set
          if (initializeGameFn) {
            initializeGameFn();
          } else if (refreshView) {
            refreshView();
          }
        } else {
          showNotification('Failed to load game!', 'error');
        }
        updateSaveInfo();
      } else if (e.key === 'd') {
        e.preventDefault();
        if (!hasSaveData()) {
          showNotification('No save data to delete!', 'warning');
          return;
        }        // Confirm deletion with keyboard shortcut
        if (confirm('Are you sure you want to delete your saved game? This action cannot be undone.')) {
          const success = deleteSaveData();
          if (success) {
            showNotification('Save data deleted successfully!', 'success');
            // Use centralized game initialization instead of just refreshing view
            if (initializeGameFn) {
              initializeGameFn();
            } else if (refreshView) {
              refreshView();
            }
          } else {
            showNotification('Failed to delete save data!', 'error');
          }
          updateSaveInfo();
        }
      }
    }
  });
}

function showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
  // Remove any existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Add to page
  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

function updateSaveInfo(): void {
  const saveInfoElement = document.getElementById('save-info');
  if (saveInfoElement) {
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
}
