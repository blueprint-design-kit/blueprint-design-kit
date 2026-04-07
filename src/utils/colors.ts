import colorNames from 'color-name';

export function isColor(val: string) {
    return typeof val === 'string' && (isNamedColor(val) || isColorHex(val) || isColorRGB(val));
}

export function isNamedColor(val: string) {
    return !!colorNames[val as keyof typeof colorNames];
}

export function isColorHex(val: string) {
    return !!val.match(/^\s*#[\da-zA-Z]{3,8};?\s*$/);
}

export function isColorRGB(val: string) {
    return !!val.match(/^\s*rgba?\([\d,.\s]+\);?\s*$/);
}

export function convertRgbaToHex(colorStr: string) {
    return (
        '#' +
        colorStr
          .replace(/^\s*rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
          .split(',') // splits them at ","
          .map(string => parseFloat(string)) // Converts them to numbers
          .map((number, index) => (index === 3 ? Math.round(number * 255) : number)) // Converts alpha to 255 number
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
