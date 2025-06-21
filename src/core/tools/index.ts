export interface ToolConfig {
    id: string;
    name: string;
    action: string;
    icon: string;
}

export const tools: ToolConfig[] = [
    {
        id: 'hand',
        name: 'Hand',
        action: 'harvest',
        icon: 'hand.png',
    },
    {
        id: 'wateringCan',
        name: 'Watering Can',
        action: 'water',
        icon: 'watering_can.png',
    },
    {
        id: 'compost',
        name: 'Compost',
        action: 'fertilize',
        icon: 'compost.png',
    },
];
