function singleValueConformsToType(value: any, expectedType: string): boolean {
    if (expectedType === 'any') {
        return true;
    }
    if (expectedType === 'integer' || expectedType === 'int') {
        return Number.isInteger(value);
    }
    if (expectedType === 'color') {
        if (typeof value !== 'string') { return false; }
        const isHex = value.match(/^\s*#[\da-zA-Z]{3,8};?\s*$/); // #11aaCC
        const isRgb = value.match(/^\s*rgba?\([\d,.\s]+\);?\s*$/); // rgb(10, 20, 30)
        const isNamed = value.match(/^[a-z]+$/); // green (must assume is valid color name)
        return !!(isHex || isRgb || isNamed);
    }
    if (expectedType === 'null') {
        return value === null;
    }
    if (expectedType === 'array') {
        return Array.isArray(value);
    }
    return typeof value === expectedType;
}

export function valueConformsToType(value: any, expectedType: string): boolean {
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
