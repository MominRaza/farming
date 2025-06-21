import './style.css';
import { state } from './core/state';
import { drawGrid } from './render/grid';
import { drawTiles } from './render/tileRenderer';

import { getTileCoords } from './utils/helpers';
import { initControls } from './ui/controls';
import { initHUD } from './render/hud';

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
  const { tileX, tileY } = getTileCoords(screenX, screenY, state.offsetX, state.offsetY, state.scale, 50);
  state.tileX = tileX;
  state.tileY = tileY;
}

if (canvas) {
  initControls(canvas, draw, updateCursorTile);
  draw();
}

// TODO: Move HUD/UI logic to render/hud.ts
if (ui) {
  initHUD(ui);
}
