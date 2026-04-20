import colorNames from 'color-name';

export function isColor(val: string) {
    return typeof val === 'string' && (isNamedColor(val) || isColorHex(val) || isColorRGB(val));
}

export function isNamedColor(val: string) {
    const normalized = val.trim().toLowerCase();
    return normalized === 'transparent' || !!colorNames[normalized as keyof typeof colorNames];
}

export function isColorHex(val: string) {
    return !!val.match(/^\s*#(?:[\da-fA-F]{3}|[\da-fA-F]{4}|[\da-fA-F]{6}|[\da-fA-F]{8});?\s*$/);
}

export function isColorRGB(val: string) {
    const match = val.match(/^\s*(rgba?)\(([^)]+)\);?\s*$/);
    if (!match) {
        return false;
    }

    const fnName = match[1] || '';
    const values = (match[2] || '').split(',').map((part) => part.trim());
    const expectedLength = fnName === 'rgba' ? 4 : 3;
    if (values.length !== expectedLength) {
        return false;
    }

    return values.every((value) => /^-?(?:\d+|\d*\.\d+)$/.test(value));
}

export function convertRgbaToHex(colorStr: string) {
    return (
        '#' +
        colorStr
          .replace(/^\s*rgba?\(|\s+|\)|;/g, '') // Gets just the rgba / rgb string values
          .split(',') // splits them at ","
          .map(string => parseFloat(string)) // Converts them to numbers
          .map((number, index) => {
              if (!Number.isFinite(number)) { return 0; }
              const normalized = index === 3 ? Math.round(number * 255) : Math.round(number);
              return Math.min(255, Math.max(0, normalized));
          }) // Converts alpha to 255 number and clamps all channels
          .map(number => number.toString(16)) // Converts numbers to hex
          .map(string => (string.length === 1 ? '0' + string : string)) // Adds 0 when length of one number is 1
          .join('')
    );
}

export function normalizeHex(colorStr: string) {
    if (colorStr.charAt(0) === '#' && colorStr.length === 4) {
        return `#${colorStr[1]}${colorStr[1]}${colorStr[2]}${colorStr[2]}${colorStr[3]}${colorStr[3]}`
    }
    return colorStr;
}
