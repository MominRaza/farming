/**
 * Validation Utilities
 * Functions for validating user input, game state, and data integrity
 */

import type { Coordinate } from './coordinates';

/**
 * Validation result interface
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings?: string[];
}

/**
 * Create a successful validation result
 */
export function createValidResult(warnings?: string[]): ValidationResult {
    return { valid: true, errors: [], warnings };
}

/**
 * Create a failed validation result
 */
export function createInvalidResult(errors: string[], warnings?: string[]): ValidationResult {
    return { valid: false, errors, warnings };
}

/**
 * Basic type validators
 */

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
    return isValidNumber(value) && value > 0;
}

/**
 * Check if value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
    return isValidNumber(value) && value >= 0;
}

/**
 * Check if value is an integer
 */
export function isInteger(value: unknown): value is number {
    return isValidNumber(value) && Number.isInteger(value);
}

/**
 * Check if value is a positive integer
 */
export function isPositiveInteger(value: unknown): value is number {
    return isInteger(value) && value > 0;
}

/**
 * Check if value is a non-negative integer
 */
export function isNonNegativeInteger(value: unknown): value is number {
    return isInteger(value) && value >= 0;
}

/**
 * Check if value is a valid string
 */
export function isValidString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

/**
 * Check if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if value is a valid boolean
 */
export function isValidBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

/**
 * Check if value is a valid array
 */
export function isValidArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

/**
 * Check if value is a valid object
 */
export function isValidObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Range and bounds validators
 */

/**
 * Check if number is within range (inclusive)
 */
export function isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

/**
 * Validate number is within range
 */
export function validateRange(
    value: unknown,
    min: number,
    max: number,
    fieldName = 'Value'
): ValidationResult {
    const errors: string[] = [];

    if (!isValidNumber(value)) {
        errors.push(`${fieldName} must be a valid number`);
    } else if (!isInRange(value, min, max)) {
        errors.push(`${fieldName} must be between ${min} and ${max}`);
    }

    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}

/**
 * Game-specific validators
 */

/**
 * Validate coordinate
 */
export function validateCoordinate(coord: unknown): ValidationResult {
    const errors: string[] = [];

    if (!isValidObject(coord)) {
        errors.push('Coordinate must be an object');
        return createInvalidResult(errors);
    }

    const obj = coord as Record<string, unknown>;

    if (!isInteger(obj.x)) {
        errors.push('Coordinate x must be an integer');
    }

    if (!isInteger(obj.y)) {
        errors.push('Coordinate y must be an integer');
    }

    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}

/**
 * Validate coordinate is within grid bounds
 */
export function validateCoordinateInGrid(
    coord: Coordinate,
    gridSize: number
): ValidationResult {
    const errors: string[] = [];

    if (coord.x < 0 || coord.x >= gridSize) {
        errors.push(`X coordinate ${coord.x} is outside grid bounds (0-${gridSize - 1})`);
    }

    if (coord.y < 0 || coord.y >= gridSize) {
        errors.push(`Y coordinate ${coord.y} is outside grid bounds (0-${gridSize - 1})`);
    }

    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}

/**
 * Validate player has enough coins
 */
export function validateAffordability(
    playerCoins: number,
    cost: number,
    itemName = 'item'
): ValidationResult {
    const errors: string[] = [];

    if (!isNonNegativeNumber(playerCoins)) {
        errors.push('Player coins must be a non-negative number');
    }

    if (!isNonNegativeNumber(cost)) {
        errors.push('Cost must be a non-negative number');
    }

    if (playerCoins < cost) {
        errors.push(`Insufficient coins to purchase ${itemName}. Need ${cost}, have ${playerCoins}`);
    }

    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}

/**
 * Validate tool ID exists
 */
export function validateToolId(toolId: string, availableTools: string[]): ValidationResult {
    const errors: string[] = [];

    if (!isNonEmptyString(toolId)) {
        errors.push('Tool ID must be a non-empty string');
    } else if (!availableTools.includes(toolId)) {
        errors.push(`Invalid tool ID: ${toolId}`);
    }

    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}

/**
 * Validate crop ID exists
 */
export function validateCropId(cropId: string, availableCrops: string[]): ValidationResult {
    const errors: string[] = [];

    if (!isNonEmptyString(cropId)) {
        errors.push('Crop ID must be a non-empty string');
    } else if (!availableCrops.includes(cropId)) {
        errors.push(`Invalid crop ID: ${cropId}`);
    }

    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}

/**
 * Validate tile is empty for planting
 */
export function validateTileEmpty(tileOccupied: boolean): ValidationResult {
    const errors: string[] = [];

    if (tileOccupied) {
        errors.push('Tile is already occupied');
    }

    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}

/**
 * Validate crop is mature for harvesting
 */
export function validateCropMature(growthProgress: number): ValidationResult {
    const errors: string[] = [];

    if (!isValidNumber(growthProgress)) {
        errors.push('Growth progress must be a valid number');
    } else if (growthProgress < 1) {
        errors.push('Crop is not yet mature for harvesting');
    }

    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}

/**
 * Validate area is unlocked
 */
export function validateAreaUnlocked(
    areaId: string,
    unlockedAreas: string[]
): ValidationResult {
    const errors: string[] = [];

    if (!isNonEmptyString(areaId)) {
        errors.push('Area ID must be a non-empty string');
    } else if (!unlockedAreas.includes(areaId)) {
        errors.push(`Area ${areaId} is not unlocked`);
    }

    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}

/**
 * Validate player level meets requirement
 */
export function validateLevelRequirement(
    playerLevel: number,
    requiredLevel: number
): ValidationResult {
    const errors: string[] = [];

    if (!isPositiveInteger(playerLevel)) {
        errors.push('Player level must be a positive integer');
    }

    if (!isPositiveInteger(requiredLevel)) {
        errors.push('Required level must be a positive integer');
    }

    if (playerLevel < requiredLevel) {
        errors.push(`Requires level ${requiredLevel}, current level is ${playerLevel}`);
    }

    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}

/**
 * Input sanitization and validation
 */

/**
 * Sanitize and validate player name
 */
export function validatePlayerName(name: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isValidString(name)) {
        errors.push('Player name must be a non-empty string');
        return createInvalidResult(errors);
    }

    const trimmed = name.trim();

    if (trimmed.length < 2) {
        errors.push('Player name must be at least 2 characters long');
    }

    if (trimmed.length > 20) {
        errors.push('Player name must be no more than 20 characters long');
    }

    if (!/^[a-zA-Z0-9_\-\s]+$/.test(trimmed)) {
        errors.push('Player name can only contain letters, numbers, spaces, hyphens, and underscores');
    }

    if (/^\s|\s$/.test(name)) {
        warnings.push('Player name had leading/trailing spaces that were removed');
    }

    return errors.length > 0 ? createInvalidResult(errors, warnings) : createValidResult(warnings);
}

/**
 * Validate save data structure
 */
export function validateSaveData(data: unknown): ValidationResult {
    const errors: string[] = [];

    if (!isValidObject(data)) {
        errors.push('Save data must be an object');
        return createInvalidResult(errors);
    }

    const saveData = data as Record<string, unknown>;

    // Check required fields
    const requiredFields = ['version', 'timestamp', 'gameState'];
    for (const field of requiredFields) {
        if (!(field in saveData)) {
            errors.push(`Save data missing required field: ${field}`);
        }
    }

    // Validate version
    if ('version' in saveData && !isNonEmptyString(saveData.version)) {
        errors.push('Save data version must be a non-empty string');
    }

    // Validate timestamp
    if ('timestamp' in saveData && !isValidNumber(saveData.timestamp)) {
        errors.push('Save data timestamp must be a valid number');
    }

    // Validate game state
    if ('gameState' in saveData && !isValidObject(saveData.gameState)) {
        errors.push('Save data gameState must be an object');
    }

    return errors.length > 0 ? createInvalidResult(errors) : createValidResult();
}

/**
 * Validate configuration object
 */
export function validateConfig(config: unknown): ValidationResult {
    const errors: string[] = [];

    if (!isValidObject(config)) {
        errors.push('Configuration must be an object');
        return createInvalidResult(errors);
    }

    // Add specific configuration validation as needed
    // This is a basic structure validator

    return createValidResult();
}

/**
 * Batch validation utilities
 */

/**
 * Combine multiple validation results
 */
export function combineValidationResults(results: ValidationResult[]): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (const result of results) {
        allErrors.push(...result.errors);
        if (result.warnings) {
            allWarnings.push(...result.warnings);
        }
    }

    return {
        valid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings.length > 0 ? allWarnings : undefined
    };
}

/**
 * Validate multiple fields with custom validators
 */
export function validateFields(
    data: Record<string, unknown>,
    validators: Record<string, (value: unknown) => ValidationResult>
): ValidationResult {
    const results: ValidationResult[] = [];

    for (const [field, validator] of Object.entries(validators)) {
        const value = data[field];
        const result = validator(value);

        // Add field context to errors
        if (!result.valid) {
            result.errors = result.errors.map(error => `${field}: ${error}`);
        }

        results.push(result);
    }

    return combineValidationResults(results);
}

/**
 * Performance validation
 */

/**
 * Validate performance metrics are within acceptable ranges
 */
export function validatePerformanceMetrics(metrics: {
    fps?: number;
    renderTime?: number;
    memoryUsage?: number;
}): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (metrics.fps !== undefined) {
        if (metrics.fps < 30) {
            warnings.push(`Low FPS detected: ${metrics.fps}`);
        }
        if (metrics.fps < 15) {
            errors.push(`Critical FPS: ${metrics.fps}`);
        }
    }

    if (metrics.renderTime !== undefined) {
        if (metrics.renderTime > 16.67) { // > 60fps
            warnings.push(`High render time: ${metrics.renderTime}ms`);
        }
        if (metrics.renderTime > 33.33) { // > 30fps
            errors.push(`Critical render time: ${metrics.renderTime}ms`);
        }
    }

    if (metrics.memoryUsage !== undefined) {
        if (metrics.memoryUsage > 100) { // > 100MB
            warnings.push(`High memory usage: ${metrics.memoryUsage}MB`);
        }
        if (metrics.memoryUsage > 500) { // > 500MB
            errors.push(`Critical memory usage: ${metrics.memoryUsage}MB`);
        }
    }

    return errors.length > 0 ? createInvalidResult(errors, warnings) : createValidResult(warnings);
}

/**
 * Utility functions for common validation patterns
 */

/**
 * Create a validator for required string fields
 */
export function createRequiredStringValidator(fieldName: string) {
    return (value: unknown): ValidationResult => {
        if (!isNonEmptyString(value)) {
            return createInvalidResult([`${fieldName} is required and must be a non-empty string`]);
        }
        return createValidResult();
    };
}

/**
 * Create a validator for required number fields with range
 */
export function createRequiredNumberValidator(
    fieldName: string,
    min?: number,
    max?: number
) {
    return (value: unknown): ValidationResult => {
        if (!isValidNumber(value)) {
            return createInvalidResult([`${fieldName} must be a valid number`]);
        }

        if (min !== undefined && value < min) {
            return createInvalidResult([`${fieldName} must be at least ${min}`]);
        }

        if (max !== undefined && value > max) {
            return createInvalidResult([`${fieldName} must be at most ${max}`]);
        }

        return createValidResult();
    };
}

/**
 * Create a validator for enum values
 */
export function createEnumValidator<T extends string>(
    fieldName: string,
    allowedValues: readonly T[]
) {
    return (value: unknown): ValidationResult => {
        if (!isValidString(value)) {
            return createInvalidResult([`${fieldName} must be a string`]);
        }

        if (!allowedValues.includes(value as T)) {
            return createInvalidResult([
                `${fieldName} must be one of: ${allowedValues.join(', ')}`
            ]);
        }

        return createValidResult();
    };
}
