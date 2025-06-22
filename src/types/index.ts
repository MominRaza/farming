export type TileType = 'road' | 'soil';

// Base tool interface
export interface Tool {
    id: string;
    name: string;
    category: 'terrain' | 'crop' | 'action';
    icon: string;
    action: string;
    hotkey?: string;
    cost?: number;
}

// Terrain tools (soil, road)
export interface TerrainTool extends Tool {
    category: 'terrain';
    tileType: TileType;
}

// Crop tools (wheat, corn, tomato)
export interface CropTool extends Tool {
    category: 'crop';
    growthStages: number;
    growTime: number;
    reward?: number;
}

// Action tools (harvest, water, fertilize)
export interface ActionTool extends Tool {
    category: 'action';
}

// Union type for all tools
export type GameTool = TerrainTool | CropTool | ActionTool;

// Tool IDs for type safety
export type ToolId =
    // Terrain tools
    | 'soil' | 'road'
    // Crop tools  
    | 'wheat' | 'corn' | 'tomato' | 'potato' | 'carrot' | 'pepper'
    // Action tools
    | 'harvest' | 'water' | 'fertilize';
