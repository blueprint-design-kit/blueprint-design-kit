import { isColor } from './colors.js';

function singleValueConformsToType(value: unknown, expectedType: string): boolean {
    if (expectedType === 'any') {
        return true;
    }
    if (expectedType === 'integer' || expectedType === 'int') {
        return Number.isInteger(value);
    }
    if (expectedType === 'color') {
        if (typeof value !== 'string') { return false; }
        return isColor(value);
    }
    if (expectedType === 'null') {
        return value === null;
    }
    if (expectedType === 'array') {
        return Array.isArray(value);
    }
    return typeof value === expectedType;
}

export function valueConformsToType(value: unknown, expectedType: string): boolean {
    if (expectedType.endsWith('[]')) {
        if (Array.isArray(value)) {
            const itemType = expectedType.slice(0, -2);
            for (const item of value) {
                if (!singleValueConformsToType(item, itemType)) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }
    return singleValueConformsToType(value, expectedType);
}
