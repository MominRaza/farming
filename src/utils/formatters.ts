/**
 * Formatter Utilities
 * Functions for formatting data for display in the user interface
 */

/**
 * Number formatting options
 */
export interface NumberFormatOptions {
    decimals?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;
    prefix?: string;
    suffix?: string;
    showPositiveSign?: boolean;
}

/**
 * Time formatting options
 */
export interface TimeFormatOptions {
    showMilliseconds?: boolean;
    showHours?: boolean;
    compact?: boolean;
    longForm?: boolean;
}

/**
 * Basic number formatting
 */

/**
 * Format number with specified decimal places
 */
export function formatNumber(
    value: number,
    options: NumberFormatOptions = {}
): string {
    const {
        decimals = 0,
        thousandsSeparator = ',',
        decimalSeparator = '.',
        prefix = '',
        suffix = '',
        showPositiveSign = false
    } = options;

    // Handle special cases
    if (!isFinite(value)) return 'Invalid';
    if (isNaN(value)) return 'NaN';

    // Format to decimal places
    const formatted = Math.abs(value).toFixed(decimals);
    const [integerPart, decimalPart] = formatted.split('.');

    // Add thousands separators
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

    // Combine parts
    let result = formattedInteger;
    if (decimals > 0 && decimalPart) {
        result += decimalSeparator + decimalPart;
    }

    // Add sign
    if (value < 0) {
        result = '-' + result;
    } else if (value > 0 && showPositiveSign) {
        result = '+' + result;
    }

    // Add prefix and suffix
    return prefix + result + suffix;
}

/**
 * Format currency (coins)
 */
export function formatCurrency(value: number, symbol = '💰'): string {
    if (value >= 1000000) {
        return `${symbol}${formatNumber(value / 1000000, { decimals: 1 })}M`;
    } else if (value >= 1000) {
        return `${symbol}${formatNumber(value / 1000, { decimals: 1 })}K`;
    } else {
        return `${symbol}${formatNumber(value)}`;
    }
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
    return formatNumber(value, { decimals, suffix: '%' });
}

/**
 * Format large numbers with units (K, M, B, T)
 */
export function formatLargeNumber(value: number, decimals = 1): string {
    const units = [
        { value: 1e12, symbol: 'T' },
        { value: 1e9, symbol: 'B' },
        { value: 1e6, symbol: 'M' },
        { value: 1e3, symbol: 'K' }
    ];

    for (const unit of units) {
        if (Math.abs(value) >= unit.value) {
            return formatNumber(value / unit.value, { decimals }) + unit.symbol;
        }
    }

    return formatNumber(value, { decimals });
}

/**
 * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(value: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = value % 100;
    return value + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Time formatting
 */

/**
 * Format milliseconds to human-readable time
 */
export function formatDuration(
    milliseconds: number,
    options: TimeFormatOptions = {}
): string {
    const {
        showMilliseconds = false,
        showHours = true,
        compact = false,
        longForm = false
    } = options;

    if (milliseconds < 0) return '0s';

    const ms = milliseconds % 1000;
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));

    const parts: string[] = [];

    if (showHours && hours > 0) {
        if (longForm) {
            parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        } else {
            parts.push(`${hours}${compact ? 'h' : ':'}`);
        }
    }

    if (minutes > 0 || (hours > 0 && !compact)) {
        if (longForm) {
            parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
        } else {
            parts.push(`${compact ? '' : hours > 0 ? minutes.toString().padStart(2, '0') : minutes}${compact ? 'm' : hours > 0 ? ':' : 'm'}`);
        }
    }

    if (seconds > 0 || parts.length === 0 || (!compact && minutes > 0)) {
        if (longForm) {
            parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
        } else {
            parts.push(`${compact ? '' : parts.length > 0 ? seconds.toString().padStart(2, '0') : seconds}${compact ? 's' : 's'}`);
        }
    }

    if (showMilliseconds && ms > 0) {
        if (longForm) {
            parts.push(`${ms} millisecond${ms !== 1 ? 's' : ''}`);
        } else {
            parts.push(`${ms}ms`);
        }
    }

    if (longForm) {
        if (parts.length > 1) {
            const lastPart = parts.pop();
            return parts.join(', ') + ' and ' + lastPart;
        } else {
            return parts[0] || '0 seconds';
        }
    }

    return parts.join(compact ? ' ' : '') || '0s';
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(milliseconds: number): string {
    if (milliseconds <= 0) return 'Ready!';

    if (milliseconds < 1000) {
        return 'Almost ready...';
    }

    return formatDuration(milliseconds, { compact: true, showHours: false });
}

/**
 * Format timestamp to date string
 */
export function formatDate(timestamp: number, includeTime = false): string {
    const date = new Date(timestamp);

    if (includeTime) {
        return date.toLocaleString();
    } else {
        return date.toLocaleDateString();
    }
}

/**
 * Format relative time (ago/from now)
 */
export function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const absDiff = Math.abs(diff);

    const units = [
        { value: 31536000000, label: 'year' },
        { value: 2592000000, label: 'month' },
        { value: 604800000, label: 'week' },
        { value: 86400000, label: 'day' },
        { value: 3600000, label: 'hour' },
        { value: 60000, label: 'minute' },
        { value: 1000, label: 'second' }
    ];

    for (const unit of units) {
        if (absDiff >= unit.value) {
            const count = Math.floor(absDiff / unit.value);
            const label = count === 1 ? unit.label : unit.label + 's';
            return diff > 0 ? `${count} ${label} ago` : `in ${count} ${label}`;
        }
    }

    return 'just now';
}

/**
 * Game-specific formatters
 */

/**
 * Format experience points
 */
export function formatExperience(value: number): string {
    return formatLargeNumber(value) + ' XP';
}

/**
 * Format level with title
 */
export function formatLevel(level: number, title?: string): string {
    const levelText = `Level ${level}`;
    return title ? `${levelText} - ${title}` : levelText;
}

/**
 * Format crop growth stage
 */
export function formatGrowthStage(stage: number, totalStages: number): string {
    if (stage >= totalStages) return 'Mature';
    return `Stage ${stage + 1}/${totalStages}`;
}

/**
 * Format growth progress as percentage
 */
export function formatGrowthProgress(progress: number): string {
    const percentage = Math.min(100, Math.max(0, progress * 100));
    return formatPercentage(percentage, 0);
}

/**
 * Format coordinates
 */
export function formatCoordinate(x: number, y: number): string {
    return `(${x}, ${y})`;
}

/**
 * Format area ID
 */
export function formatAreaId(areaId: string): string {
    const [x, y] = areaId.split(',');
    return `Area ${x}, ${y}`;
}

/**
 * Format tool usage count
 */
export function formatToolUsage(uses: number, maxUses?: number): string {
    if (maxUses) {
        return `${formatNumber(uses)}/${formatNumber(maxUses)}`;
    } else {
        return formatLargeNumber(uses);
    }
}

/**
 * Format efficiency rating
 */
export function formatEfficiency(rating: number): string {
    const percentage = Math.round(rating * 100);

    if (percentage >= 90) return `${percentage}% (Excellent)`;
    if (percentage >= 75) return `${percentage}% (Good)`;
    if (percentage >= 50) return `${percentage}% (Average)`;
    if (percentage >= 25) return `${percentage}% (Poor)`;
    return `${percentage}% (Very Poor)`;
}

/**
 * Format rarity
 */
export function formatRarity(rarity: string): string {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

/**
 * Format achievement progress
 */
export function formatAchievementProgress(current: number, required: number): string {
    const percentage = Math.min(100, (current / required) * 100);
    return `${formatLargeNumber(current)}/${formatLargeNumber(required)} (${formatPercentage(percentage, 0)})`;
}

/**
 * Format statistics summary
 */
export function formatStatsSummary(stats: {
    label: string;
    value: number;
    format?: 'number' | 'currency' | 'percentage' | 'duration' | 'experience';
}[]): string {
    return stats.map(stat => {
        let formattedValue: string;

        switch (stat.format) {
            case 'currency':
                formattedValue = formatCurrency(stat.value);
                break;
            case 'percentage':
                formattedValue = formatPercentage(stat.value);
                break;
            case 'duration':
                formattedValue = formatDuration(stat.value);
                break;
            case 'experience':
                formattedValue = formatExperience(stat.value);
                break;
            default:
                formattedValue = formatLargeNumber(stat.value);
        }

        return `${stat.label}: ${formattedValue}`;
    }).join('\n');
}

/**
 * Color and styling formatters
 */

/**
 * Get color for rarity
 */
export function getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
        common: '#9E9E9E',
        uncommon: '#4CAF50',
        rare: '#2196F3',
        epic: '#9C27B0',
        legendary: '#FF9800'
    };

    return colors[rarity.toLowerCase()] || colors.common;
}

/**
 * Get color for efficiency rating
 */
export function getEfficiencyColor(rating: number): string {
    if (rating >= 0.9) return '#4CAF50'; // Green
    if (rating >= 0.75) return '#8BC34A'; // Light Green
    if (rating >= 0.5) return '#FF9800'; // Orange
    if (rating >= 0.25) return '#FF5722'; // Red Orange
    return '#F44336'; // Red
}

/**
 * Get color for growth stage
 */
export function getGrowthStageColor(progress: number): string {
    if (progress >= 1) return '#4CAF50'; // Mature - Green
    if (progress >= 0.75) return '#8BC34A'; // Almost mature - Light Green
    if (progress >= 0.5) return '#FFEB3B'; // Growing - Yellow
    if (progress >= 0.25) return '#FF9800'; // Young - Orange
    return '#795548'; // Planted - Brown
}

/**
 * Utility formatters
 */

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(text: string): string {
    return text
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(text: string): string {
    return text
        .split('_')
        .map(word => capitalize(word))
        .join(' ');
}

/**
 * Format list with proper conjunction
 */
export function formatList(items: string[], conjunction = 'and'): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

    const lastItem = items[items.length - 1];
    const otherItems = items.slice(0, -1);
    return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
}

/**
 * Format key-value pairs for display
 */
export function formatKeyValuePairs(
    pairs: Record<string, string | number>,
    separator = ': ',
    lineBreak = '\n'
): string {
    return Object.entries(pairs)
        .map(([key, value]) => `${snakeToTitle(key)}${separator}${value}`)
        .join(lineBreak);
}
