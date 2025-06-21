import './style.css';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ui = document.getElementById('ui') as HTMLDivElement;

// Tile types

type TileType = 'road' | 'soil';
const TileType = {
  ROAD: 'road' as TileType,
  SOIL: 'soil' as TileType,
};

// Tile colors
const TILE_COLORS: Record<TileType, string> = {
  road: '#7f8c8d',
  soil: '#8b4513',
};

// Store placed tiles
const tileMap = new Map<string, TileType>();

// Canvas state
const state = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
  tileX: 0,
  tileY: 0,
  currentTileType: TileType.SOIL,
};

function getTileKey(x: number, y: number) {
  return `${x},${y}`;
}

function draw() {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(state.offsetX, state.offsetY);
  ctx.scale(state.scale, state.scale);
  drawGrid(ctx);
  drawTiles(ctx);
  ctx.restore();
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  const gridSize = 50;
  const startX = Math.floor(-state.offsetX / state.scale / gridSize) * gridSize;
  const startY = Math.floor(-state.offsetY / state.scale / gridSize) * gridSize;
  const endX = startX + (canvas.width / state.scale) + gridSize;
  const endY = startY + (canvas.height / state.scale) + gridSize;
  ctx.strokeStyle = '#34495e';
  ctx.lineWidth = 1 / state.scale;
  for (let x = startX; x <= endX; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }
  for (let y = startY; y <= endY; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }
}

function drawTiles(ctx: CanvasRenderingContext2D) {
  const gridSize = 50;
  tileMap.forEach((type, key) => {
    const [x, y] = key.split(',').map(Number);
    ctx.fillStyle = TILE_COLORS[type];
    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
  });
}

function getTileCoords(screenX: number, screenY: number) {
  const worldX = (screenX - state.offsetX) / state.scale;
  const worldY = (screenY - state.offsetY) / state.scale;
  const gridSize = 50;
  return {
    tileX: Math.floor(worldX / gridSize),
    tileY: Math.floor(worldY / gridSize),
  };
}

function updateCursorTile(screenX: number, screenY: number) {
  const { tileX, tileY } = getTileCoords(screenX, screenY);
  state.tileX = tileX;
  state.tileY = tileY;
}

if (canvas) {
  // (no need to declare ctx here)
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
      const dy = Math.abs(e.clientY - state.lastMouseY);
      if (dx < 5 && dy < 5) {
        const { tileX, tileY } = getTileCoords(e.clientX, e.clientY);
        const key = getTileKey(tileX, tileY);
        const existingType = tileMap.get(key);
        if (existingType === state.currentTileType) {
          tileMap.delete(key);
        } else {
          tileMap.set(key, state.currentTileType);
        }
        draw();
      }
    } 1
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
  });
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case '1': state.currentTileType = TileType.SOIL; break;
      case '2': state.currentTileType = TileType.ROAD; break;
    }
  });
  draw();
}

if (ui) {
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
  function updateUI() {
    const zoomInfo = document.getElementById('zoom-info');
    const positionInfo = document.getElementById('position-info');
    const tileInfo = document.getElementById('tile-info');
    const currentTileTypeInfo = document.getElementById('current-tile-type');
    if (zoomInfo) zoomInfo.textContent = `Zoom: ${Math.round(state.scale * 100)}%`;
    if (positionInfo) positionInfo.textContent = `Position: (${Math.round(state.offsetX)}, ${Math.round(state.offsetY)})`;
    if (tileInfo) tileInfo.textContent = `Tile Index: (${state.tileX}, ${state.tileY})`;
    if (currentTileTypeInfo) {
      const typeNames = {
        [TileType.SOIL]: 'Soil (1)',
        [TileType.ROAD]: 'Road (2)',
      };
      currentTileTypeInfo.textContent = `Current Tile: ${typeNames[state.currentTileType]}`;
      currentTileTypeInfo.style.color = TILE_COLORS[state.currentTileType];
    }
    requestAnimationFrame(updateUI);
  }
  updateUI();
}
