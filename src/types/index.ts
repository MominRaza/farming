export type TileType = 'road' | 'soil';
export interface CropConfig {
    id: string;
    name: string;
    growthStages: number;
    growTime: number;
    sprite: string;
}
export interface ToolConfig {
    id: string;
    name: string;
    action: string;
    icon: string;
}
