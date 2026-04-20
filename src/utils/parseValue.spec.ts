import { describe, test, expect, vi, afterEach } from 'vitest';
import { parseValueFromString, parseValueType } from './parseValue';

describe('parseValue', () => {

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('parseValueFromString', () => {

        test('returns undefined for empty string and explicit undefined', () => {
            expect(parseValueFromString('')).toBeUndefined();
            expect(parseValueFromString('undefined')).toBeUndefined();
        });

        test('parses booleans', () => {
            expect(parseValueFromString('true')).toBe(true);
            expect(parseValueFromString('false')).toBe(false);
        });

        test('parses numbers', () => {
            expect(parseValueFromString('0')).toBe(0);
            expect(parseValueFromString('123')).toBe(123);
            expect(parseValueFromString('-45.67')).toBe(-45.67);
            expect(parseValueFromString('1e3')).toBe(1000);
        });

        test('parses json arrays and objects', () => {
            expect(parseValueFromString('[1,2,3]')).toEqual([1, 2, 3]);
            expect(parseValueFromString('{"a":1,"b":"two"}')).toEqual({ a: 1, b: 'two' });
        });

        test('parses json null and quoted strings', () => {
            expect(parseValueFromString('null')).toBeNull();
            expect(parseValueFromString('"hello"')).toBe('hello');
        });

        test('warns and throws for non-json strings that cannot be parsed', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            expect(() => parseValueFromString('hello world')).toThrow();
            expect(warnSpy).toHaveBeenCalledOnce();
            expect(warnSpy).toHaveBeenCalledWith('Input value cannot be parsed:', 'hello world');
        });

    });

    describe('parseValueType', () => {

        test('returns undefined for null and undefined', () => {
            expect(parseValueType(undefined)).toBe('undefined');
            expect(parseValueType(null)).toBe('undefined');
        });

        test('returns array for arrays', () => {
            expect(parseValueType([])).toBe('array');
            expect(parseValueType([1, 2, 3])).toBe('array');
        });

        test('returns color for recognized color strings', () => {
            expect(parseValueType('red')).toBe('color');
            expect(parseValueType('#ff0000')).toBe('color');
            expect(parseValueType('rgb(255, 0, 0)')).toBe('color');
        });

        test('returns string for non-color strings', () => {
            expect(parseValueType('hello')).toBe('string');
            expect(parseValueType('123abc')).toBe('string');
        });

        test('returns native typeof values for other primitives and objects', () => {
            expect(parseValueType(true)).toBe('boolean');
            expect(parseValueType(42)).toBe('number');
            expect(parseValueType({ a: 1 })).toBe('object');
            expect(parseValueType(() => undefined)).toBe('function');
        });

    });

});
