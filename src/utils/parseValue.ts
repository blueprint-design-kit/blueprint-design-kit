import { isColor } from './colors.js';

export function parseValueFromString(val: string) {
    if (val === '' || val === 'undefined') {
        return undefined;
    }
    if (val === 'true') {
        return true;
    }
    if (val === 'false') {
        return false;
    }
    if (!isNaN(Number(val))) {
        return Number(val);
    }
    try {
        return JSON.parse(val);
    } catch (e) {
        console.warn('Input value cannot be parsed:', val);
        throw e;
    }
}

export function parseValueType(val: unknown) {
    if (val === null || typeof val === 'undefined') {
        return 'undefined';
    }
    if (Array.isArray(val)) {
        return 'array';
    }
    if (typeof val === 'string') {
        return isColor(val) ? 'color' : 'string';
    }
    return typeof val;
}
