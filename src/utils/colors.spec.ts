import { describe, test, expect } from 'vitest';
import {
    isColor,
    isNamedColor,
    isColorHex,
    isColorRGB,
    convertRgbaToHex,
    normalizeHex,
} from './colors';

describe('colors utils', () => {

    describe('isNamedColor', () => {

        test('returns true for standard CSS named colors', () => {
            expect(isNamedColor('red')).toBe(true);
            expect(isNamedColor('rebeccapurple')).toBe(true);
            expect(isNamedColor('transparent')).toBe(true);
        });

        test('is case-insensitive for named colors', () => {
            expect(isNamedColor('Red')).toBe(true);
            expect(isNamedColor('BLUE')).toBe(true);
        });

        test('returns false for non-color words and empty strings', () => {
            expect(isNamedColor('not-a-color')).toBe(false);
            expect(isNamedColor('')).toBe(false);
            expect(isNamedColor('   ')).toBe(false);
        });

    });

    describe('isColorHex', () => {

        test('returns true for valid 3, 4, 6, and 8 digit hex values', () => {
            expect(isColorHex('#abc')).toBe(true);
            expect(isColorHex('#abcd')).toBe(true);
            expect(isColorHex('#aabbcc')).toBe(true);
            expect(isColorHex('#aabbccdd')).toBe(true);
        });

        test('accepts optional semicolon and surrounding whitespace', () => {
            expect(isColorHex('  #abc  ')).toBe(true);
            expect(isColorHex('#aabbcc;')).toBe(true);
            expect(isColorHex('  #aabbccdd;  ')).toBe(true);
        });

        test('returns false for invalid hex tokens', () => {
            expect(isColorHex('abc')).toBe(false);
            expect(isColorHex('#ab')).toBe(false);
            expect(isColorHex('#abcde')).toBe(false);
            expect(isColorHex('#aabbccd')).toBe(false);
            expect(isColorHex('#ggg')).toBe(false);
            expect(isColorHex('#aabbccdd00')).toBe(false);
        });

    });

    describe('isColorRGB', () => {

        test('returns true for valid rgb and rgba strings', () => {
            expect(isColorRGB('rgb(255, 0, 0)')).toBe(true);
            expect(isColorRGB('rgba(255, 0, 0, 0.5)')).toBe(true);
            expect(isColorRGB(' rgb(0,0,0); ')).toBe(true);
            expect(isColorRGB('rgba(0, 0, 0, 1)')).toBe(true);
        });

        test('returns false for wrong function names or malformed syntax', () => {
            expect(isColorRGB('hsl(0, 100%, 50%)')).toBe(false);
            expect(isColorRGB('rgb 255,0,0')).toBe(false);
            expect(isColorRGB('rgba(255,0,0,)')).toBe(false);
            expect(isColorRGB('rgb()')).toBe(false);
        });

        test('does not enforce numeric ranges for channel and alpha values', () => {
            expect(isColorRGB('rgb(256, 0, 0)')).toBe(true);
            expect(isColorRGB('rgb(-1, 0, 0)')).toBe(true);
            expect(isColorRGB('rgba(255, 0, 0, 1.2)')).toBe(true);
            expect(isColorRGB('rgba(255, 0, 0, -0.1)')).toBe(true);
        });

    });

    describe('isColor', () => {

        test('returns true for named, hex, and rgb/rgba color formats', () => {
            expect(isColor('red')).toBe(true);
            expect(isColor('#ff0000')).toBe(true);
            expect(isColor('rgba(255, 0, 0, 0.5)')).toBe(true);
        });

        test('returns false for invalid strings', () => {
            expect(isColor('')).toBe(false);
            expect(isColor('hello world')).toBe(false);
            expect(isColor('not-a-color')).toBe(false);
        });

        test('returns false for non-string values', () => {
            expect(isColor(123 as any)).toBe(false); // eslint-disable-line
            expect(isColor(null as any)).toBe(false); // eslint-disable-line
            expect(isColor(undefined as any)).toBe(false); // eslint-disable-line
            expect(isColor({} as any)).toBe(false); // eslint-disable-line
        });

    });

    describe('convertRgbaToHex', () => {

        test('converts rgb to a 6-digit hex string', () => {
            expect(convertRgbaToHex('rgb(255, 0, 0)')).toBe('#ff0000');
            expect(convertRgbaToHex('rgb(0, 0, 0)')).toBe('#000000');
            expect(convertRgbaToHex('rgb(255, 255, 255)')).toBe('#ffffff');
        });

        test('converts rgba to an 8-digit hex string with alpha', () => {
            expect(convertRgbaToHex('rgba(255, 0, 0, 1)')).toBe('#ff0000ff');
            expect(convertRgbaToHex('rgba(255, 0, 0, 0.5)')).toBe('#ff000080');
            expect(convertRgbaToHex('rgba(0, 0, 0, 0)')).toBe('#00000000');
        });

        test('supports whitespace around values', () => {
            expect(convertRgbaToHex(' rgba( 12, 34, 56, 0.25 ) ')).toBe('#0c223840');
        });

        test('clamps out-of-range values to valid hex bounds', () => {
            expect(convertRgbaToHex('rgb(300, -1, 260)')).toBe('#ff00ff');
            expect(convertRgbaToHex('rgba(255, 0, 0, 2)')).toBe('#ff0000ff');
        });

    });

    describe('normalizeHex', () => {

        test('normalizes 3-digit shorthand to 6-digit format', () => {
            expect(normalizeHex('#abc')).toBe('#aabbcc');
            expect(normalizeHex('#ABC')).toBe('#AABBCC');
        });

        test('returns non-3-digit values unchanged', () => {
            expect(normalizeHex('#aabbcc')).toBe('#aabbcc');
            expect(normalizeHex('#abcd')).toBe('#abcd');
            expect(normalizeHex('red')).toBe('red');
        });

    });

});
