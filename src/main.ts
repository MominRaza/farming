import './style.css';
import { state } from './core/state';
import { drawGrid } from './render/grid';
import { drawTiles } from './render/tileRenderer';
import { loadGame, hasSaveData, startAutoSave } from './core/saveSystem';

import { getTileCoords } from './utils/helpers';
import { initControls, setUpdateToolbarSelection } from './ui/controls';
import { initHUD, updateToolbarSelection, setRefreshView } from './render/hud';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ui = document.getElementById('ui') as HTMLDivElement;

function draw() {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(state.offsetX, state.offsetY);
  ctx.scale(state.scale, state.scale);
  drawGrid(ctx, canvas);
  drawTiles(ctx);
  ctx.restore();
}

function updateCursorTile(screenX: number, screenY: number) {
  const { tileX, tileY } = getTileCoords(screenX, screenY, state.offsetX, state.offsetY, state.scale);
  state.tileX = tileX;
  state.tileY = tileY;
}

if (canvas) {
  initControls(canvas, draw, updateCursorTile);
  draw();
}

if (ui) {
  initHUD(ui);
  setUpdateToolbarSelection(updateToolbarSelection);
  setRefreshView(draw); // Allow HUD to refresh the view after save/load
}

// Auto-load game if save data exists
if (hasSaveData()) {
  loadGame();
  draw(); // Refresh the view after loading
  console.log('Auto-loaded saved game');
}

// Start auto-save every 30 seconds
startAutoSave(30000);
console.log('Auto-save started (every 30 seconds)');
