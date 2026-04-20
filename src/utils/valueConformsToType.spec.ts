import { describe, test, expect } from 'vitest';
import { valueConformsToType } from './valueConformsToType';

describe('valueConformsToType', () => {

    test('supports any for all values', () => {
        expect(valueConformsToType(undefined, 'any')).toBe(true);
        expect(valueConformsToType(null, 'any')).toBe(true);
        expect(valueConformsToType('text', 'any')).toBe(true);
        expect(valueConformsToType(123, 'any')).toBe(true);
        expect(valueConformsToType([], 'any')).toBe(true);
    });

    test('supports integer and int aliases', () => {
        expect(valueConformsToType(3, 'integer')).toBe(true);
        expect(valueConformsToType(3, 'int')).toBe(true);
        expect(valueConformsToType(3.5, 'integer')).toBe(false);
        expect(valueConformsToType('3', 'int')).toBe(false);
    });

    test('supports null and array types', () => {
        expect(valueConformsToType(null, 'null')).toBe(true);
        expect(valueConformsToType(undefined, 'null')).toBe(false);
        expect(valueConformsToType([], 'array')).toBe(true);
        expect(valueConformsToType([1, 2], 'array')).toBe(true);
        expect(valueConformsToType({}, 'array')).toBe(false);
    });

    test('supports native typeof checks for primitives and objects', () => {
        expect(valueConformsToType('hello', 'string')).toBe(true);
        expect(valueConformsToType(42, 'number')).toBe(true);
        expect(valueConformsToType(true, 'boolean')).toBe(true);
        expect(valueConformsToType(() => undefined, 'function')).toBe(true);
        expect(valueConformsToType({ foo: 'bar' }, 'object')).toBe(true);

        expect(valueConformsToType(42, 'string')).toBe(false);
        expect(valueConformsToType('hello', 'number')).toBe(false);
    });

    test('supports color values as hex, rgb(a), and plain lowercase names', () => {
        expect(valueConformsToType('#abc', 'color')).toBe(true);
        expect(valueConformsToType('#aabbccdd', 'color')).toBe(true);
        expect(valueConformsToType('rgb(255, 0, 0)', 'color')).toBe(true);
        expect(valueConformsToType('rgba(255, 0, 0, 0.5)', 'color')).toBe(true);
        expect(valueConformsToType('red', 'color')).toBe(true);
    });

    test('rejects non-string values for color', () => {
        expect(valueConformsToType(123, 'color')).toBe(false);
        expect(valueConformsToType(null, 'color')).toBe(false);
        expect(valueConformsToType([], 'color')).toBe(false);
    });

    test('rejects clearly invalid color strings', () => {
        expect(valueConformsToType('', 'color')).toBe(false);
        expect(valueConformsToType('hello world', 'color')).toBe(false);
        expect(valueConformsToType('rgb()', 'color')).toBe(false);
    });

    test('supports array suffix types when every item matches', () => {
        expect(valueConformsToType(['a', 'b'], 'string[]')).toBe(true);
        expect(valueConformsToType([1, 2, 3], 'number[]')).toBe(true);
        expect(valueConformsToType([1, 2, 3], 'integer[]')).toBe(true);
        expect(valueConformsToType([null, null], 'null[]')).toBe(true);
        expect(valueConformsToType(['red', '#fff'], 'color[]')).toBe(true);
    });

    test('rejects array suffix types when value is not an array', () => {
        expect(valueConformsToType('abc', 'string[]')).toBe(false);
        expect(valueConformsToType(123, 'number[]')).toBe(false);
        expect(valueConformsToType({}, 'object[]')).toBe(false);
    });

    test('rejects array suffix types when one or more items do not match', () => {
        expect(valueConformsToType(['a', 2], 'string[]')).toBe(false);
        expect(valueConformsToType([1, 2.5], 'integer[]')).toBe(false);
        expect(valueConformsToType(['red', 123], 'color[]')).toBe(false);
    });

    test('accepts empty arrays for array suffix types', () => {
        expect(valueConformsToType([], 'string[]')).toBe(true);
        expect(valueConformsToType([], 'color[]')).toBe(true);
    });

});
