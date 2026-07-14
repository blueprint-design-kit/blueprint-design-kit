import { describe, test, expect } from 'vitest';
import { serializePropsForPassing, deserializeProps, type SerializedFunction } from './serializeProps';

describe('serializePropsForPassing', () => {

    describe('non-function props', () => {
        test('leaves string values unchanged', () => {
            const props = { label: 'hello' };
            const serialized = serializePropsForPassing(props);
            expect(serialized.label).toBe('hello');
        });

        test('leaves number values unchanged', () => {
            const props = { count: 42 };
            const serialized = serializePropsForPassing(props);
            expect(serialized.count).toBe(42);
        });

        test('leaves boolean values unchanged', () => {
            const props = { disabled: true };
            const serialized = serializePropsForPassing(props);
            expect(serialized.disabled).toBe(true);
        });

        test('leaves null values unchanged', () => {
            const props = { value: null };
            const serialized = serializePropsForPassing(props);
            expect(serialized.value).toBeNull();
        });

        test('leaves object values unchanged', () => {
            const obj = { x: 1 };
            const props = { config: obj };
            const serialized = serializePropsForPassing(props);
            expect(serialized.config).toBe(obj);
        });

        test('leaves empty props object unchanged', () => {
            const props = {};
            const serialized = serializePropsForPassing(props);
            expect(serialized).toEqual({});
        });
    });

    describe('function props', () => {
        test('replaces a function with a serialized object', () => {
            const props = { onClick: () => {} };
            const serialized = serializePropsForPassing(props);
            expect(typeof serialized.onClick).toBe('object');
        });

        test('serialized object has __is_serialized_function__ flag', () => {
            const props = { onClick: () => {} };
            const serialized = serializePropsForPassing(props);
            const serializedOnClick = serialized.onClick as unknown as SerializedFunction;
            expect(serializedOnClick.__is_serialized_function__).toBe(true);
        });

        test('serialized object includes asString from the function', () => {
            const fn = () => 'result';
            const props = { handler: fn };
            const serialized = serializePropsForPassing(props);
            const serializedHandler = serialized.handler as unknown as SerializedFunction;
            expect(serializedHandler.asString).toBe(fn.toString());
        });

        test('works with named functions', () => {
            function myHandler() { return 1; }
            const props = { handler: myHandler };
            const serialized = serializePropsForPassing(props);
            const serializedHandler = serialized.handler as unknown as SerializedFunction;
            expect(serializedHandler.__is_serialized_function__).toBe(true);
            expect(serializedHandler.asString).toBe(myHandler.toString());
        });

        test('only serializes function props, leaving others intact', () => {
            const props = { label: 'btn', onClick: () => {} };
            const serialized = serializePropsForPassing(props);
            expect(serialized.label).toBe('btn');
            const serializedOnClick = serialized.onClick as unknown as SerializedFunction;
            expect(serializedOnClick.__is_serialized_function__).toBe(true);
        });

        test('serializes multiple function props independently', () => {
            const fn1 = () => 'a';
            const fn2 = () => 'b';
            const props = { onFoo: fn1, onBar: fn2 };
            const serialized = serializePropsForPassing(props);
            const serializedOnFoo = serialized.onFoo as unknown as SerializedFunction;
            const serializedOnBar = serialized.onBar as unknown as SerializedFunction;
            expect(serializedOnFoo.asString).toBe(fn1.toString());
            expect(serializedOnBar.asString).toBe(fn2.toString());
        });
    });

});

describe('deserializeProps', () => {

    describe('non-serialized props', () => {
        test('leaves string values unchanged', () => {
            const props = { label: 'hello' };
            const deserialized = deserializeProps(props);
            expect(deserialized.label).toBe('hello');
        });

        test('leaves number values unchanged', () => {
            const props = { count: 7 };
            const deserialized = deserializeProps(props);
            expect(deserialized.count).toBe(7);
        });

        test('leaves null values unchanged', () => {
            const props = { value: null };
            const deserialized = deserializeProps(props);
            expect(deserialized.value).toBeNull();
        });

        test('leaves plain objects without the flag unchanged', () => {
            const obj = { nested: true };
            const props = { config: obj };
            const deserialized = deserializeProps(props);
            expect(deserialized.config).toBe(obj);
        });

        test('leaves empty props object unchanged', () => {
            const props = {};
            const deserialized = deserializeProps(props);
            expect(deserialized).toEqual({});
        });
    });

    describe('serialized function props', () => {
        test('reconstructs a function from a serialized prop', () => {
            const fn = () => 42;
            const props = {
                __contains_serialized_functions__: true,
                handler: { __is_serialized_function__: true, asString: fn.toString() }
            };
            const deserialized = deserializeProps(props);
            const deserializedHandler = deserialized.handler as unknown as () => number;
            expect(typeof deserializedHandler).toBe('function');
        });

        test('reconstructed function returns the correct value', () => {
            const fn = () => 'expected';
            const props = {
                __contains_serialized_functions__: true,
                handler: { __is_serialized_function__: true, asString: fn.toString() }
            };
            const deserialized = deserializeProps(props);
            const deserializedHandler = deserialized.handler as unknown as () => string;
            expect(deserializedHandler()).toBe('expected');
        });

        test('only deserializes flagged props, leaving others intact', () => {
            const fn = () => true;
            const props = {
                __contains_serialized_functions__: true,
                label: 'btn',
                handler: { __is_serialized_function__: true, asString: fn.toString() }
            };
            const deserialized = deserializeProps(props);
            expect(deserialized.label).toBe('btn');
            expect(typeof deserialized.handler).toBe('function');
        });

        test('deserializes multiple serialized function props independently', () => {
            const fn1 = () => 1;
            const fn2 = () => 2;
            const props = {
                __contains_serialized_functions__: true,
                onFoo: { __is_serialized_function__: true, asString: fn1.toString() },
                onBar: { __is_serialized_function__: true, asString: fn2.toString() },
            };
            const deserialized = deserializeProps(props);
            const deserializedOnFoo = deserialized.onFoo as unknown as () => number;
            const deserializedOnBar = deserialized.onBar as unknown as () => number;
            expect(deserializedOnFoo()).toBe(1);
            expect(deserializedOnBar()).toBe(2);
        });
    });

    describe('round-trip', () => {
        test('serialize then deserialize preserves function behavior', () => {
            const original = () => 'round-trip';
            const props = { fn: original };
            const serialized = serializePropsForPassing(props);
            const deserialized = deserializeProps(serialized);
            expect(typeof deserialized.fn).toBe('function');
            expect(deserialized.fn()).toBe('round-trip');
            expect(props.fn()).toBe('round-trip');
        });
    });

});
