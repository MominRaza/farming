// Service Layer Exports
// This file provides a centralized export for all services

export { GameService, gameService } from './GameService';
export { RenderService, renderService } from './RenderService';
export { InputService, inputService } from './InputService';
export { SaveService, saveService } from './SaveService';
export { AreaService, areaService } from './AreaService';
export { CropService, cropService } from './CropService';

// Import services for internal use
import { gameService } from './GameService';
import { renderService } from './RenderService';
import { inputService } from './InputService';
import { saveService } from './SaveService';
import { areaService } from './AreaService';
import { cropService } from './CropService';

// Service initialization function for easy setup
export function initializeServices(canvas: HTMLCanvasElement) {
    console.log('Initializing all services...');

    // Initialize input service with canvas
    inputService.initialize(canvas);

    // Initialize render service with canvas
    renderService.initialize(canvas);

    // Initialize game service
    gameService.initialize(canvas.width, canvas.height);

    console.log('All services initialized successfully');
}

// Service cleanup function
export function destroyServices() {
    console.log('Destroying all services...');

    gameService.destroy();
    renderService.destroy();
    inputService.destroy();
    saveService.destroy();
    areaService.destroy();
    cropService.destroy();

    console.log('All services destroyed');
}

// Service status function for debugging
export function getServiceStatus() {
    return {
        game: {
            initialized: gameService.isGameInitialized(),
            stats: gameService.getGameStats()
        },
        render: {
            enabled: renderService.isRenderingActive(),
            stats: renderService.getRenderStats()
        },
        input: {
            enabled: inputService.isInputActive(),
            stats: inputService.getInputStats()
        },
        save: {
            autoSaveEnabled: saveService.isAutoSaveEnabled(),
            stats: saveService.getSaveStats()
        },
        area: {
            stats: areaService.getAreaStats(),
            validation: areaService.validateAreaState()
        },
        crop: {
            stats: cropService.getCropStats()
        }
    };
}
