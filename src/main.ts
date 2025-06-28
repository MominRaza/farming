import './style.css';
import { state, initializeCameraPosition } from './core/state';
import { drawGrid } from './render/grid';
import { drawTiles, drawLockedAreas, drawAreaBoundaries } from './render/tileRenderer';
import { loadGame, hasSaveData, startAutoSave } from './core/saveSystem';
import { growthSystem } from './core/growthSystem';
import { initTooltip } from './ui/tooltip';
import { initializeAreaSystem, areaMap } from './core/area';
import { getTileCoords } from './utils/helpers';
import { initControls } from './ui/controls';
import { initHUD } from './render/hud';

// Event system imports
import { eventBus, GameEvents } from './events/GameEvents';

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
    drawAreaBoundaries(ctx, canvas);
    drawLockedAreas(ctx, canvas);
    ctx.restore();
}

// Game loop function
function gameLoop() {
    // Update crop growth
    if (growthSystem.shouldUpdate()) {
        growthSystem.updateAllCrops();
        draw(); // Redraw to show updated progress bars
    }

    requestAnimationFrame(gameLoop);
}

function updateCursorTile(screenX: number, screenY: number) {
    const { tileX, tileY } = getTileCoords(screenX, screenY, state.offsetX, state.offsetY, state.scale);
    state.tileX = tileX; state.tileY = tileY;

    // Emit mouse move event
    GameEvents.emitMouseMove(screenX, screenY, tileX, tileY);
}

// Centralized game initialization function
export function initializeGame() {
    console.log('Initializing game state...');

    // Only initialize area system if no areas exist (for delete save scenario)
    if (areaMap.size === 0) {
        console.log('No areas found, initializing default area system');
        initializeAreaSystem();
    }

    // Always initialize camera position after everything is set up
    if (canvas) {
        initializeCameraPosition(canvas.width, canvas.height);
    }

    // Always redraw after initialization
    draw();

    // Emit game initialized event
    GameEvents.emitGameInitialized();

    console.log('Game state initialized successfully');
}

// Initial game setup function (only for first load)
function setupInitialGame() {
    console.log('Setting up initial game...');

    // Check if there's save data to load
    if (hasSaveData()) {
        console.log('Loading saved game...');
        loadGame();
    } else {
        console.log('Starting new game...');
        // Only initialize area system if no save data exists
        initializeAreaSystem();
    }

    // Always initialize camera position after everything is set up
    if (canvas) {
        initializeCameraPosition(canvas.width, canvas.height);
    }

    // Always redraw after initialization
    draw();

    console.log('Initial game setup completed');
}

// Setup event listeners
function setupEventListeners() {
    // Listen for view refresh requests
    eventBus.on('view:refresh', () => {
        draw();
    });

    // Listen for save/load events to refresh the view
    eventBus.on('save:load', (event) => {
        if (event.success) {
            initializeGame();
        }
    });

    // Listen for save deletion to reset the game
    eventBus.on('save:deleted', (event) => {
        if (event.success) {
            initializeGame();
        }
    });
}

// Initialize area system BEFORE any drawing
// (This will be handled by initializeGame now)

if (canvas) {
    initControls(canvas, draw, updateCursorTile, () => {
        // Use the initial setup for first load
        setupInitialGame();
    });
}

if (ui) {
    initHUD(ui);
    // No more callback passing - components will use events
}

// Setup event listeners
setupEventListeners();

// Initialize tooltip system
initTooltip();

// Start auto-save every 30 seconds
startAutoSave(30000);
console.log('Auto-save started (every 30 seconds)');

// Start the game loop
gameLoop();
console.log('Game loop started');

// Note: Initial game setup is handled by setupInitialGame() in the canvas ready callback
