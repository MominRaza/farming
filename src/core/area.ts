export interface Area {
    x: number;
    y: number;
    unlocked: boolean;
}

export const areaMap = new Map<string, Area>();
export function getAreaKey(x: number, y: number) {
    return `${x},${y}`;
}
