import './style.css'

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ui = document.getElementById('ui') as HTMLDivElement;

interface CanvasState {
  offsetX: number;
  offsetY: number;
  scale: number;
  isDragging: boolean;
  lastMouseX: number;
  lastMouseY: number;
  tileX: number;
  tileY: number;
  currentTileType: TileType;
}

// Tile types using const assertion for better TypeScript support
const TileType = {
  GRASS: 'grass',
  ROAD: 'road',
  DIRT: 'dirt'
} as const;

type TileType = typeof TileType[keyof typeof TileType];

interface TileCoordinate {
  x: number;
  y: number;
  type: TileType;
}

// Tile type colors
const TILE_COLORS: Record<TileType, string> = {
  [TileType.GRASS]: '#27ae60', // Green
  [TileType.ROAD]: '#7f8c8d',  // Gray
  [TileType.DIRT]: '#8b4513'   // Brown
};

// Store drawn tiles with proper coordinates
const drawnTiles = new Set<string>(); // We'll keep using Set with string keys for efficient lookup
const tileCoordinates = new Map<string, TileCoordinate>(); // Map for easy coordinate access

// Helper function to create tile key
function createTileKey(x: number, y: number): string {
  return `${x},${y}`;
}

// Helper function to add tile
function addTile(x: number, y: number, type: TileType = TileType.GRASS) {
  const key = createTileKey(x, y);
  drawnTiles.add(key);
  tileCoordinates.set(key, { x, y, type });
}

// Helper function to remove tile
function removeTile(x: number, y: number) {
  const key = createTileKey(x, y);
  drawnTiles.delete(key);
  tileCoordinates.delete(key);
}

// Helper function to check if tile exists
function hasTile(x: number, y: number): boolean {
  return drawnTiles.has(createTileKey(x, y));
}

// Add the existing example shapes as drawn tiles
function initializeExampleTiles() {
  // Red rectangle: 100,100 with size 200x100 (4x2 tiles) - make them grass
  for (let x = 2; x < 6; x++) { // tiles 2,3,4,5
    for (let y = 2; y < 4; y++) { // tiles 2,3
      addTile(x, y, TileType.GRASS);
    }
  }

  // Blue rectangle: 400,200 with size 150x150 (3x3 tiles) - make them road
  for (let x = 8; x < 11; x++) { // tiles 8,9,10
    for (let y = 4; y < 7; y++) { // tiles 4,5,6
      addTile(x, y, TileType.ROAD);
    }
  }

  // Green rectangle: 200,400 with size 300x50 (6x1 tiles) - make them dirt
  for (let x = 4; x < 10; x++) { // tiles 4,5,6,7,8,9
    for (let y = 8; y < 9; y++) { // tile 8
      addTile(x, y, TileType.DIRT);
    }
  }
}

// Initialize the example tiles
initializeExampleTiles();

const canvasState: CanvasState = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
  tileX: 0,
  tileY: 0,
  currentTileType: TileType.GRASS
};

if (canvas) {
  const ctx = canvas.getContext('2d')!;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvasState.offsetX, canvasState.offsetY);
    ctx.scale(canvasState.scale, canvasState.scale);

    drawGrid();

    drawContent();

    ctx.restore();
  }

  function drawGrid() {
    const gridSize = 50;
    const startX = Math.floor(-canvasState.offsetX / canvasState.scale / gridSize) * gridSize;
    const startY = Math.floor(-canvasState.offsetY / canvasState.scale / gridSize) * gridSize;
    const endX = startX + (canvas.width / canvasState.scale) + gridSize;
    const endY = startY + (canvas.height / canvasState.scale) + gridSize;

    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 1 / canvasState.scale;

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

  function drawContent() {
    const gridSize = 50;

    // Draw all tiles using their specific colors
    tileCoordinates.forEach(coord => {
      ctx.fillStyle = TILE_COLORS[coord.type];
      const worldX = coord.x * gridSize;
      const worldY = coord.y * gridSize;
      ctx.fillRect(worldX, worldY, gridSize, gridSize);
    });
  }

  function calculateTileCoordinates(screenX: number, screenY: number) {
    const worldX = (screenX - canvasState.offsetX) / canvasState.scale;
    const worldY = (screenY - canvasState.offsetY) / canvasState.scale;
    const gridSize = 50;
    const tileX = Math.floor(worldX / gridSize);
    const tileY = Math.floor(worldY / gridSize);
    return { tileX, tileY };
  }

  function updateCursorTile(screenX: number, screenY: number) {
    const { tileX, tileY } = calculateTileCoordinates(screenX, screenY);

    canvasState.tileX = tileX;
    canvasState.tileY = tileY;
  }

  canvas.addEventListener('mousedown', (e) => {
    canvasState.isDragging = true;
    canvasState.lastMouseX = e.clientX;
    canvasState.lastMouseY = e.clientY;
  });

  canvas.addEventListener('mousemove', (e) => {
    updateCursorTile(e.clientX, e.clientY);

    if (canvasState.isDragging) {
      const deltaX = e.clientX - canvasState.lastMouseX;
      const deltaY = e.clientY - canvasState.lastMouseY;

      canvasState.offsetX += deltaX;
      canvasState.offsetY += deltaY;

      canvasState.lastMouseX = e.clientX;
      canvasState.lastMouseY = e.clientY;

      draw();
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    if (canvasState.isDragging) {
      // Check if this was a click (not a drag)
      const deltaX = Math.abs(e.clientX - canvasState.lastMouseX);
      const deltaY = Math.abs(e.clientY - canvasState.lastMouseY);

      // If mouse didn't move much, treat it as a click
      if (deltaX < 5 && deltaY < 5) {
        const { tileX, tileY } = calculateTileCoordinates(e.clientX, e.clientY);

        // Toggle tile - remove if present, or add with current tile type
        if (hasTile(tileX, tileY)) {
          removeTile(tileX, tileY);
        } else {
          addTile(tileX, tileY, canvasState.currentTileType);
        }

        draw(); // Redraw canvas to show the new tile
      }
    }

    canvasState.isDragging = false;
  });

  canvas.addEventListener('mouseleave', () => {
    canvasState.isDragging = false;
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoom = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = canvasState.scale * zoom;

    if (newScale < 0.25 || newScale > 3) return;

    const worldX = (mouseX - canvasState.offsetX) / canvasState.scale;
    const worldY = (mouseY - canvasState.offsetY) / canvasState.scale;

    canvasState.scale = newScale;
    canvasState.offsetX = mouseX - worldX * canvasState.scale;
    canvasState.offsetY = mouseY - worldY * canvasState.scale;

    draw();
  });

  // Keyboard controls for switching tile types
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case '1':
        canvasState.currentTileType = TileType.GRASS;
        break;
      case '2':
        canvasState.currentTileType = TileType.ROAD;
        break;
      case '3':
        canvasState.currentTileType = TileType.DIRT;
        break;
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
      <p>• Touch: drag to pan, pinch to zoom</p>
      <p>• Press 1, 2, 3 to switch tile types</p>
      <p>• Click to place/remove tiles</p>
    </div>
    <div class="ui-panel top-right-panel">
      <h3>Info</h3>
      <p id="zoom-info">Zoom: 100%</p>
      <p id="position-info">Position: (0, 0)</p>
      <p id="tile-info">Tile Index: (0, 0)</p>
      <p id="current-tile-type">Current Tile: Grass</p>
    </div>
  `;

  function updateUI() {
    const zoomInfo = document.getElementById('zoom-info');
    const positionInfo = document.getElementById('position-info');
    const tileInfo = document.getElementById('tile-info');
    const currentTileTypeInfo = document.getElementById('current-tile-type');

    if (zoomInfo) {
      zoomInfo.textContent = `Zoom: ${Math.round(canvasState.scale * 100)}%`;
    }

    if (positionInfo) {
      positionInfo.textContent = `Position: (${Math.round(canvasState.offsetX)}, ${Math.round(canvasState.offsetY)})`;
    }

    if (tileInfo) {
      tileInfo.textContent = `Tile Index: (${canvasState.tileX}, ${canvasState.tileY})`;
    }

    if (currentTileTypeInfo) {
      const typeNames = {
        [TileType.GRASS]: 'Grass (1)',
        [TileType.ROAD]: 'Road (2)',
        [TileType.DIRT]: 'Dirt (3)'
      };
      currentTileTypeInfo.textContent = `Current Tile: ${typeNames[canvasState.currentTileType]}`;
      currentTileTypeInfo.style.color = TILE_COLORS[canvasState.currentTileType];
    }

    requestAnimationFrame(updateUI);
  }

  updateUI();
}
