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

    describe('array of props', () => {
        test('serializes each props object in the array', () => {
            const props = [{ label: 'a', onClick: () => {} }, { label: 'b', onClick: () => {} }];
            const serialized = serializePropsForPassing(props) as ReturnType<typeof serializePropsForPassing>[];
            expect(Array.isArray(serialized)).toBe(true);
            expect(serialized).toHaveLength(2);
        });

        test('serializes functions within each array entry', () => {
            const fn = () => 'hi';
            const props = [{ handler: fn }, { label: 'no-fn' }];
            const serialized = serializePropsForPassing(props) as ReturnType<typeof serializePropsForPassing>[];
            const serializedHandler = (serialized[0] as { handler: SerializedFunction }).handler;
            expect(serializedHandler.__is_serialized_function__).toBe(true);
            expect(serializedHandler.asString).toBe(fn.toString());
        });

        test('leaves non-function props in array entries unchanged', () => {
            const props = [{ label: 'hello', count: 3 }];
            const serialized = serializePropsForPassing(props) as ReturnType<typeof serializePropsForPassing>[];
            expect((serialized[0] as { label: string; count: number }).label).toBe('hello');
            expect((serialized[0] as { label: string; count: number }).count).toBe(3);
        });

        test('handles an empty array', () => {
            const serialized = serializePropsForPassing([]);
            expect(serialized).toEqual([]);
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

    describe('array of props', () => {
        test('deserializes each props object in the array', () => {
            const fn = () => 'value';
            const props = [
                { __contains_serialized_functions__: true, handler: { __is_serialized_function__: true, asString: fn.toString() } },
                { label: 'plain' },
            ];
            const deserialized = deserializeProps(props) as ReturnType<typeof deserializeProps>[];
            expect(Array.isArray(deserialized)).toBe(true);
            expect(deserialized).toHaveLength(2);
        });

        test('reconstructs functions within each array entry', () => {
            const fn = () => 99;
            const props = [
                { __contains_serialized_functions__: true, handler: { __is_serialized_function__: true, asString: fn.toString() } },
            ];
            const deserialized = deserializeProps(props) as ReturnType<typeof deserializeProps>[];
            const handler = (deserialized[0] as { handler: () => number }).handler;
            expect(typeof handler).toBe('function');
            expect(handler()).toBe(99);
        });

        test('leaves non-serialized entries unchanged', () => {
            const props = [{ label: 'no-fn', count: 5 }];
            const deserialized = deserializeProps(props) as ReturnType<typeof deserializeProps>[];
            expect((deserialized[0] as { label: string; count: number }).label).toBe('no-fn');
            expect((deserialized[0] as { label: string; count: number }).count).toBe(5);
        });

        test('handles an empty array', () => {
            const deserialized = deserializeProps([]);
            expect(deserialized).toEqual([]);
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

        test('serialize then deserialize an array preserves function behavior in each entry', () => {
            const fn1 = () => 'first';
            const fn2 = () => 'second';
            const props = [{ handler: fn1 }, { handler: fn2, label: 'keep' }];
            const serialized = serializePropsForPassing(props) as ReturnType<typeof serializePropsForPassing>[];
            const deserialized = deserializeProps(serialized) as ReturnType<typeof deserializeProps>[];
            const h1 = (deserialized[0] as { handler: () => string }).handler;
            const h2 = (deserialized[1] as { handler: () => string; label: string });
            expect(h1()).toBe('first');
            expect(h2.handler()).toBe('second');
            expect(h2.label).toBe('keep');
        });
    });

});
