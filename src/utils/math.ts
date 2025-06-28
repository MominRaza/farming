/**
 * Math Utilities
 * Mathematical functions and calculations for the farming game
 */

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
}

/**
 * Map a value from one range to another
 */
export function mapRange(
    value: number,
    fromMin: number,
    fromMax: number,
    toMin: number,
    toMax: number
): number {
    const normalizedValue = (value - fromMin) / (fromMax - fromMin);
    return toMin + normalizedValue * (toMax - toMin);
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate Manhattan distance between two points
 */
export function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

/**
 * Round number to specified decimal places
 */
export function roundTo(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

/**
 * Generate random number between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max
 */
export function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Check if a number is within a range (inclusive)
 */
export function inRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

/**
 * Calculate percentage of a value
 */
export function percentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
}

/**
 * Calculate percentage increase/decrease between two values
 */
export function percentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate average of an array of numbers
 */
export function average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Calculate median of an array of numbers
 */
export function median(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
        return sorted[middle];
    }
}

/**
 * Calculate standard deviation of an array of numbers
 */
export function standardDeviation(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const avg = average(numbers);
    const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
    const avgSquaredDiff = average(squaredDiffs);

    return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate compound interest
 */
export function compoundInterest(
    principal: number,
    rate: number,
    time: number,
    compoundFrequency = 1
): number {
    return principal * Math.pow(1 + rate / compoundFrequency, compoundFrequency * time);
}

/**
 * Calculate exponential growth
 */
export function exponentialGrowth(initial: number, rate: number, time: number): number {
    return initial * Math.pow(1 + rate, time);
}

/**
 * Calculate exponential decay
 */
export function exponentialDecay(initial: number, rate: number, time: number): number {
    return initial * Math.pow(1 - rate, time);
}

/**
 * Ease-in function for smooth animations
 */
export function easeIn(t: number): number {
    return t * t;
}

/**
 * Ease-out function for smooth animations
 */
export function easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 2);
}

/**
 * Ease-in-out function for smooth animations
 */
export function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Calculate factorial of a number
 */
export function factorial(n: number): number {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

/**
 * Calculate greatest common divisor
 */
export function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

/**
 * Calculate least common multiple
 */
export function lcm(a: number, b: number): number {
    return Math.abs(a * b) / gcd(a, b);
}

/**
 * Check if a number is prime
 */
export function isPrime(n: number): boolean {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }

    return true;
}

/**
 * Calculate Fibonacci number at position n
 */
export function fibonacci(n: number): number {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

/**
 * Calculate area of a circle
 */
export function circleArea(radius: number): number {
    return Math.PI * radius * radius;
}

/**
 * Calculate area of a rectangle
 */
export function rectangleArea(width: number, height: number): number {
    return width * height;
}

/**
 * Calculate area of a triangle
 */
export function triangleArea(base: number, height: number): number {
    return (base * height) / 2;
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
}

/**
 * Normalize an angle to 0-360 degrees
 */
export function normalizeAngle(angle: number): number {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
}

/**
 * Calculate the shortest angle between two angles
 */
export function angleDifference(angle1: number, angle2: number): number {
    const diff = normalizeAngle(angle2 - angle1);
    return diff > 180 ? diff - 360 : diff;
}

/**
 * Game-specific mathematical functions
 */

/**
 * Calculate crop growth progress (0-1)
 */
export function calculateGrowthProgress(
    currentTime: number,
    plantedTime: number,
    growthDuration: number
): number {
    const elapsed = currentTime - plantedTime;
    return clamp(elapsed / growthDuration, 0, 1);
}

/**
 * Calculate area purchase cost based on distance from center
 */
export function calculateAreaCost(
    baseX: number,
    baseY: number,
    targetX: number,
    targetY: number,
    baseCost: number,
    multiplier: number
): number {
    const dist = manhattanDistance(baseX, baseY, targetX, targetY);
    return Math.floor(baseCost * Math.pow(multiplier, dist));
}

/**
 * Calculate enhancement bonus
 */
export function calculateEnhancementBonus(
    baseValue: number,
    waterBonus: number,
    fertilizerBonus: number,
    hasWater = false,
    hasFertilizer = false
): number {
    let bonus = 1;
    if (hasWater) bonus *= waterBonus;
    if (hasFertilizer) bonus *= fertilizerBonus;
    return baseValue * bonus;
}

/**
 * Calculate experience points with diminishing returns
 */
export function calculateExperience(
    baseExp: number,
    level: number,
    difficulty = 1
): number {
    const levelPenalty = Math.max(0.1, 1 - (level - 1) * 0.05);
    return Math.floor(baseExp * difficulty * levelPenalty);
}

/**
 * Calculate tool efficiency based on usage
 */
export function calculateToolEfficiency(
    uses: number,
    maxUses: number,
    degradationRate = 0.1
): number {
    if (maxUses === 0) return 1;
    const usageRatio = uses / maxUses;
    return Math.max(0.1, 1 - usageRatio * degradationRate);
}

/**
 * Calculate score or rating based on multiple factors
 */
export function calculateScore(factors: Record<string, { value: number; weight: number; }>): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const factor of Object.values(factors)) {
        totalScore += factor.value * factor.weight;
        totalWeight += factor.weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Calculate profit margin percentage
 */
export function calculateProfitMargin(revenue: number, cost: number): number {
    if (revenue === 0) return 0;
    return ((revenue - cost) / revenue) * 100;
}

/**
 * Calculate return on investment (ROI) percentage
 */
export function calculateROI(gain: number, cost: number): number {
    if (cost === 0) return 0;
    return ((gain - cost) / cost) * 100;
}
