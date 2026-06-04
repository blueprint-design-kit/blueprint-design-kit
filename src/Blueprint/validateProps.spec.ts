import { describe, test, expect, vi } from 'vitest';
import { validatePropsAgainstSchema } from './validateProps';

vi.mock(import('../utils/valueConformsToType.js'), () => {
    return {
        valueConformsToType: vi.fn((value: any, type: any) => {
            if (typeof type === 'string') {
                return typeof value === type;
            }
            if (typeof type === 'function') {
                return type(value);
            }
            return false;
        }),
    };
});

describe('validateProps', () => {

    describe('validatePropsAgainstSchema', () => {

        test('accepts valid props matching schema types', () => {
            const schema = {
                name: { type: 'string' },
                count: { type: 'number' },
            };
            const props = { name: 'Test', count: 42 };
            expect(validatePropsAgainstSchema(props, schema, 'Button')).toBeUndefined();
        });

        test('returns error when prop type does not match schema', () => {
            const schema = {
                name: { type: 'string' },
            };
            const props = { name: 123 };
            const error = validatePropsAgainstSchema(props, schema, 'Button');
            expect(error).toContain('Blueprint[Button] > props.name');
            expect(error).toContain('does not conform to the type: string');
        });

        test('accepts props conforming to union types', () => {
            const schema = {
                value: { type: ['string', 'number', 'undefined'] },
            };
            expect(validatePropsAgainstSchema({ value: 'test' }, schema)).toBeUndefined();
            expect(validatePropsAgainstSchema({ value: 42 }, schema)).toBeUndefined();
            expect(validatePropsAgainstSchema({ value: undefined }, schema)).toBeUndefined();
        });

        test('returns error when prop does not match any union type', () => {
            const schema = {
                value: { type: ['string', 'number'] },
            };
            const error = validatePropsAgainstSchema({ value: true }, schema, 'Button');
            expect(error).toContain('Blueprint[Button] > props.value');
            expect(error).toContain('string | number');
        });

        test('accepts props conforming to function validator', () => {
            const isPositive = (val: any) => typeof val === 'number' && val > 0;
            const schema = {
                value: { type: isPositive },
            };
            expect(validatePropsAgainstSchema({ value: 42 }, schema)).toBeUndefined();
        });

        test('returns error when prop fails function validator', () => {
            const isPositive = (val: any) => typeof val === 'number' && val > 0;
            const schema = {
                value: { type: isPositive },
            };
            const error = validatePropsAgainstSchema({ value: -5 }, schema, 'Button');
            expect(error).toContain('Blueprint[Button] > props.value');
        });

        test('validates against allow list', () => {
            const schema = {
                size: { type: 'string', allow: ['small', 'medium', 'large'] },
            };
            expect(validatePropsAgainstSchema({ size: 'small' }, schema)).toBeUndefined();
            const error = validatePropsAgainstSchema({ size: 'xlarge' }, schema, 'Button');
            expect(error).toContain('Blueprint[Button] > props.size "xlarge" is not an allowed value');
            expect(error).toContain('small, medium, large');
        });

        test('validates against max constraint', () => {
            const schema = {
                count: { type: 'number', max: 100 },
            };
            expect(validatePropsAgainstSchema({ count: 50 }, schema)).toBeUndefined();
            const error = validatePropsAgainstSchema({ count: 150 }, schema, 'Button');
            expect(error).toContain('Blueprint[Button] > props.count "150" exceeds maximum 100');
        });

        test('validates against min constraint', () => {
            const schema = {
                count: { type: 'number', min: 0 },
            };
            expect(validatePropsAgainstSchema({ count: 10 }, schema)).toBeUndefined();
            const error = validatePropsAgainstSchema({ count: -5 }, schema, 'Button');
            expect(error).toContain('Blueprint[Button] > props.count "-5" is less than minimum 0');
        });

        test('rejects unknown props', () => {
            const schema = {
                name: { type: 'string' },
            };
            const error = validatePropsAgainstSchema({ name: 'Test', unknown: 'prop' }, schema, 'Button');
            expect(error).toContain('Blueprint[Button] > props.unknown is not a valid prop');
        });

        test('allows special props "children" without schema entry', () => {
            const schema = {
                name: { type: 'string' },
            };
            expect(
                validatePropsAgainstSchema(
                    { name: 'Test', children: { type: 'div' } },
                    schema,
                ),
            ).toBeUndefined();
        });

        test('detects missing required props (with type but no default)', () => {
            const schema = {
                name: { type: 'string' },
                required: { type: 'number' },
            };
            const error = validatePropsAgainstSchema({ name: 'Test' }, schema, 'Button');
            expect(error).toContain('Blueprint[Button] > props missing props.required');
        });

        test('allows missing optional props (with default)', () => {
            const schema = {
                name: { type: 'string' },
                fallback: { default: 'N/A' },
            };
            expect(validatePropsAgainstSchema({ name: 'Test' }, schema)).toBeUndefined();
        });

        test('handles empty props and schema', () => {
            expect(validatePropsAgainstSchema({}, {})).toBeUndefined();
            expect(validatePropsAgainstSchema(undefined, {})).toBeUndefined();
        });

        test('handles complex schema with multiple constraints', () => {
            const schema = {
                name: { type: 'string' },
                size: { type: ['string', 'undefined'], allow: ['small', 'large'], default: 'small' },
                priority: { type: 'number', min: 1, max: 10, default: 5 },
            };
            expect(
                validatePropsAgainstSchema({ name: 'Test', size: 'small', priority: 7 }, schema),
            ).toBeUndefined();
        });

    });

});
