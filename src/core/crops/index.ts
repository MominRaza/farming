import type { CropConfig } from '../../types';

export const crops: CropConfig[] = [
    {
        id: 'wheat',
        name: 'Wheat',
        growthStages: 4,
        growTime: 60,
        sprite: 'wheat.png',
    },
    {
        id: 'corn',
        name: 'Corn',
        growthStages: 5,
        growTime: 90,
        sprite: 'corn.png',
    },
    {
        id: 'tomato',
        name: 'Tomato',
        growthStages: 4,
        growTime: 80,
        sprite: 'tomato.png',
    },
];
