/**
 * Coordinate Utilities
 * Functions for handling coordinate transformations, grid operations, and spatial calculations
 */

/**
 * Coordinate interface
 */
export interface Coordinate {
    x: number;
    y: number;
}

/**
 * Bounds interface for rectangular areas
 */
export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Direction enumeration
 */
export const Direction = {
    NORTH: { x: 0, y: -1 },
    SOUTH: { x: 0, y: 1 },
    EAST: { x: 1, y: 0 },
    WEST: { x: -1, y: 0 },
    NORTHEAST: { x: 1, y: -1 },
    NORTHWEST: { x: -1, y: -1 },
    SOUTHEAST: { x: 1, y: 1 },
    SOUTHWEST: { x: -1, y: 1 }
} as const;

/**
 * Cardinal directions only
 */
export const CARDINAL_DIRECTIONS = [
    Direction.NORTH,
    Direction.SOUTH,
    Direction.EAST,
    Direction.WEST
];

/**
 * All 8 directions including diagonals
 */
export const ALL_DIRECTIONS = [
    Direction.NORTH,
    Direction.NORTHEAST,
    Direction.EAST,
    Direction.SOUTHEAST,
    Direction.SOUTH,
    Direction.SOUTHWEST,
    Direction.WEST,
    Direction.NORTHWEST
];

/**
 * Create a coordinate object
 */
export function createCoordinate(x: number, y: number): Coordinate {
    return { x, y };
}

/**
 * Check if two coordinates are equal
 */
export function coordinatesEqual(a: Coordinate, b: Coordinate): boolean {
    return a.x === b.x && a.y === b.y;
}

/**
 * Add two coordinates
 */
export function addCoordinates(a: Coordinate, b: Coordinate): Coordinate {
    return { x: a.x + b.x, y: a.y + b.y };
}

/**
 * Subtract two coordinates
 */
export function subtractCoordinates(a: Coordinate, b: Coordinate): Coordinate {
    return { x: a.x - b.x, y: a.y - b.y };
}

/**
 * Multiply coordinate by a scalar
 */
export function multiplyCoordinate(coord: Coordinate, scalar: number): Coordinate {
    return { x: coord.x * scalar, y: coord.y * scalar };
}

/**
 * Calculate distance between two coordinates
 */
export function coordinateDistance(a: Coordinate, b: Coordinate): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate Manhattan distance between two coordinates
 */
export function manhattanDistance(a: Coordinate, b: Coordinate): number {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

/**
 * Calculate Chebyshev distance (max of x and y differences)
 */
export function chebyshevDistance(a: Coordinate, b: Coordinate): number {
    return Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(
    worldCoord: Coordinate,
    camera: { x: number; y: number; zoom: number },
    viewport: { width: number; height: number }
): Coordinate {
    return {
        x: (worldCoord.x - camera.x) * camera.zoom + viewport.width / 2,
        y: (worldCoord.y - camera.y) * camera.zoom + viewport.height / 2
    };
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(
    screenCoord: Coordinate,
    camera: { x: number; y: number; zoom: number },
    viewport: { width: number; height: number }
): Coordinate {
    return {
        x: (screenCoord.x - viewport.width / 2) / camera.zoom + camera.x,
        y: (screenCoord.y - viewport.height / 2) / camera.zoom + camera.y
    };
}

/**
 * Convert grid coordinates to pixel coordinates
 */
export function gridToPixel(gridCoord: Coordinate, tileSize: number): Coordinate {
    return {
        x: gridCoord.x * tileSize,
        y: gridCoord.y * tileSize
    };
}

/**
 * Convert pixel coordinates to grid coordinates
 */
export function pixelToGrid(pixelCoord: Coordinate, tileSize: number): Coordinate {
    return {
        x: Math.floor(pixelCoord.x / tileSize),
        y: Math.floor(pixelCoord.y / tileSize)
    };
}

/**
 * Get neighboring coordinates (4-directional)
 */
export function getNeighbors(coord: Coordinate): Coordinate[] {
    return CARDINAL_DIRECTIONS.map(dir => addCoordinates(coord, dir));
}

/**
 * Get all adjacent coordinates (8-directional)
 */
export function getAdjacent(coord: Coordinate): Coordinate[] {
    return ALL_DIRECTIONS.map(dir => addCoordinates(coord, dir));
}

/**
 * Get coordinates within a given radius
 */
export function getCoordinatesInRadius(
    center: Coordinate,
    radius: number,
    includeCenter = false
): Coordinate[] {
    const coordinates: Coordinate[] = [];

    for (let x = center.x - radius; x <= center.x + radius; x++) {
        for (let y = center.y - radius; y <= center.y + radius; y++) {
            const coord = { x, y };
            const distance = coordinateDistance(center, coord);

            if (distance <= radius && (includeCenter || !coordinatesEqual(center, coord))) {
                coordinates.push(coord);
            }
        }
    }

    return coordinates;
}

/**
 * Get coordinates within Manhattan distance
 */
export function getCoordinatesInManhattanRadius(
    center: Coordinate,
    radius: number,
    includeCenter = false
): Coordinate[] {
    const coordinates: Coordinate[] = [];

    for (let x = center.x - radius; x <= center.x + radius; x++) {
        for (let y = center.y - radius; y <= center.y + radius; y++) {
            const coord = { x, y };
            const distance = manhattanDistance(center, coord);

            if (distance <= radius && (includeCenter || !coordinatesEqual(center, coord))) {
                coordinates.push(coord);
            }
        }
    }

    return coordinates;
}

/**
 * Check if coordinate is within bounds
 */
export function isWithinBounds(coord: Coordinate, bounds: Bounds): boolean {
    return (
        coord.x >= bounds.x &&
        coord.x < bounds.x + bounds.width &&
        coord.y >= bounds.y &&
        coord.y < bounds.y + bounds.height
    );
}

/**
 * Check if coordinate is within grid bounds
 */
export function isWithinGrid(coord: Coordinate, gridSize: number): boolean {
    return coord.x >= 0 && coord.x < gridSize && coord.y >= 0 && coord.y < gridSize;
}

/**
 * Clamp coordinate to bounds
 */
export function clampToBounds(coord: Coordinate, bounds: Bounds): Coordinate {
    return {
        x: Math.max(bounds.x, Math.min(coord.x, bounds.x + bounds.width - 1)),
        y: Math.max(bounds.y, Math.min(coord.y, bounds.y + bounds.height - 1))
    };
}

/**
 * Get center of bounds
 */
export function getBoundsCenter(bounds: Bounds): Coordinate {
    return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2
    };
}

/**
 * Create bounds from coordinates
 */
export function createBounds(x: number, y: number, width: number, height: number): Bounds {
    return { x, y, width, height };
}

/**
 * Check if bounds intersect
 */
export function boundsIntersect(a: Bounds, b: Bounds): boolean {
    return !(
        a.x + a.width <= b.x ||
        b.x + b.width <= a.x ||
        a.y + a.height <= b.y ||
        b.y + b.height <= a.y
    );
}

/**
 * Get intersection of two bounds
 */
export function boundsIntersection(a: Bounds, b: Bounds): Bounds | null {
    if (!boundsIntersect(a, b)) return null;

    const x = Math.max(a.x, b.x);
    const y = Math.max(a.y, b.y);
    const width = Math.min(a.x + a.width, b.x + b.width) - x;
    const height = Math.min(a.y + a.height, b.y + b.height) - y;

    return { x, y, width, height };
}

/**
 * Expand bounds by a margin
 */
export function expandBounds(bounds: Bounds, margin: number): Bounds {
    return {
        x: bounds.x - margin,
        y: bounds.y - margin,
        width: bounds.width + margin * 2,
        height: bounds.height + margin * 2
    };
}

/**
 * Get all coordinates within bounds
 */
export function getCoordinatesInBounds(bounds: Bounds): Coordinate[] {
    const coordinates: Coordinate[] = [];

    for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
        for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
            coordinates.push({ x, y });
        }
    }

    return coordinates;
}

/**
 * Sort coordinates by distance from a point
 */
export function sortByDistance(
    coordinates: Coordinate[],
    center: Coordinate,
    ascending = true
): Coordinate[] {
    return coordinates.sort((a, b) => {
        const distA = coordinateDistance(center, a);
        const distB = coordinateDistance(center, b);
        return ascending ? distA - distB : distB - distA;
    });
}

/**
 * Find closest coordinate to a point
 */
export function findClosest(coordinates: Coordinate[], target: Coordinate): Coordinate | null {
    if (coordinates.length === 0) return null;

    let closest = coordinates[0];
    let minDistance = coordinateDistance(target, closest);

    for (let i = 1; i < coordinates.length; i++) {
        const distance = coordinateDistance(target, coordinates[i]);
        if (distance < minDistance) {
            minDistance = distance;
            closest = coordinates[i];
        }
    }

    return closest;
}

/**
 * Get path between two coordinates (simple line)
 */
export function getLinePath(from: Coordinate, to: Coordinate): Coordinate[] {
    const path: Coordinate[] = [];
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const sx = from.x < to.x ? 1 : -1;
    const sy = from.y < to.y ? 1 : -1;
    let err = dx - dy;

    let x = from.x;
    let y = from.y;

    while (true) {
        path.push({ x, y });

        if (x === to.x && y === to.y) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }

    return path;
}

/**
 * Game-specific coordinate functions
 */

/**
 * Check if coordinate is a valid farm tile
 */
export function isValidFarmTile(coord: Coordinate, gridSize: number): boolean {
    return isWithinGrid(coord, gridSize);
}

/**
 * Get area ID from coordinates
 */
export function getAreaId(coord: Coordinate, areaSize = 10): string {
    const areaX = Math.floor(coord.x / areaSize);
    const areaY = Math.floor(coord.y / areaSize);
    return `${areaX},${areaY}`;
}

/**
 * Get area bounds from area ID
 */
export function getAreaBounds(areaId: string, areaSize = 10): Bounds {
    const [areaX, areaY] = areaId.split(',').map(Number);
    return {
        x: areaX * areaSize,
        y: areaY * areaSize,
        width: areaSize,
        height: areaSize
    };
}

/**
 * Get all coordinates in an area
 */
export function getAreaCoordinates(areaId: string, areaSize = 10): Coordinate[] {
    const bounds = getAreaBounds(areaId, areaSize);
    return getCoordinatesInBounds(bounds);
}

/**
 * Calculate area cost based on distance from origin
 */
export function calculateAreaDistance(areaId: string): number {
    const [areaX, areaY] = areaId.split(',').map(Number);
    return manhattanDistance({ x: 0, y: 0 }, { x: areaX, y: areaY });
}

/**
 * Get adjacent areas
 */
export function getAdjacentAreas(areaId: string): string[] {
    const [areaX, areaY] = areaId.split(',').map(Number);
    return CARDINAL_DIRECTIONS.map(dir =>
        `${areaX + dir.x},${areaY + dir.y}`
    );
}

/**
 * Check if two areas are adjacent
 */
export function areAreasAdjacent(areaId1: string, areaId2: string): boolean {
    const adjacentAreas = getAdjacentAreas(areaId1);
    return adjacentAreas.includes(areaId2);
}

/**
 * Generate spiral pattern of coordinates
 */
export function generateSpiralPattern(center: Coordinate, maxRadius: number): Coordinate[] {
    const coordinates: Coordinate[] = [center];

    for (let radius = 1; radius <= maxRadius; radius++) {
        // Start from top-right and go clockwise
        let x = center.x + radius;
        let y = center.y - radius;

        // Right to bottom
        for (let i = 0; i < radius * 2; i++) {
            coordinates.push({ x, y: y + i });
        }
        y += radius * 2;

        // Bottom to left
        for (let i = 0; i < radius * 2; i++) {
            coordinates.push({ x: x - i, y });
        }
        x -= radius * 2;

        // Left to top
        for (let i = 0; i < radius * 2; i++) {
            coordinates.push({ x, y: y - i });
        }
        y -= radius * 2;

        // Top to right (partial)
        for (let i = 0; i < radius * 2 - 1; i++) {
            coordinates.push({ x: x + i, y });
        }
    }

    return coordinates;
}

/**
 * Check if coordinate is on the edge of a bounds
 */
export function isOnBoundsEdge(coord: Coordinate, bounds: Bounds): boolean {
    return (
        (coord.x === bounds.x || coord.x === bounds.x + bounds.width - 1) ||
        (coord.y === bounds.y || coord.y === bounds.y + bounds.height - 1)
    ) && isWithinBounds(coord, bounds);
}

/**
 * Get coordinates on the perimeter of bounds
 */
export function getBoundsPerimeter(bounds: Bounds): Coordinate[] {
    const perimeter: Coordinate[] = [];

    // Top and bottom edges
    for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
        perimeter.push({ x, y: bounds.y });
        if (bounds.height > 1) {
            perimeter.push({ x, y: bounds.y + bounds.height - 1 });
        }
    }

    // Left and right edges (excluding corners already added)
    for (let y = bounds.y + 1; y < bounds.y + bounds.height - 1; y++) {
        perimeter.push({ x: bounds.x, y });
        if (bounds.width > 1) {
            perimeter.push({ x: bounds.x + bounds.width - 1, y });
        }
    }

    return perimeter;
}

/**
 * Convert coordinate to string key
 */
export function coordinateToKey(coord: Coordinate): string {
    return `${coord.x},${coord.y}`;
}

/**
 * Convert string key to coordinate
 */
export function keyToCoordinate(key: string): Coordinate {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
}
