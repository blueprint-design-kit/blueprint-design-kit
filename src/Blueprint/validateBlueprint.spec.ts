import { describe, test, expect, vi } from 'vitest';
import { validateBlueprint } from './validateBlueprint';
import * as configModule from '../config/options.js';
import BlueprintError from '../utils/BlueprintError.js';
import type { BlueprintConfig, BlueprintLinks } from './types.js';

vi.mock(import('../config/options.js'), () => {
    return {
        getBlueprintOptions: vi.fn().mockReturnValue({ onInvalidBlueprint: 'error' }),
    };
});

describe('validateBlueprint', () => {

    describe('validateBlueprint', () => {

        test('throws error when schema is missing', () => {
            expect(() => validateBlueprint({} as BlueprintConfig, 'TestComponent')).toThrow(
                'Blueprint[TestComponent] must have a schema.',
            );
        });

        test('throws error when schema property lacks type or default', () => {
            expect(() =>
                validateBlueprint(
                    {
                        schema: {
                            propOne: { source: 'http://example.com' },
                        },
                    } as BlueprintConfig,
                    'TestComponent',
                ),
            ).toThrow('Blueprint[TestComponent] > schema.propOne must specify either a type or a default value.');
        });

        test('throws error when schema property is invalid', () => {
            expect(() =>
                validateBlueprint(
                    {
                        schema: {
                            propOne: null,
                        },
                    } as unknown as BlueprintConfig,
                    'TestComponent',
                ),
            ).toThrow('Blueprint[TestComponent] > schema.propOne does not have a valid configuration.');
        });

        test('throws error when links is not an array', () => {
            expect(() =>
                validateBlueprint(
                    {
                        schema: { propOne: { type: 'string' } },
                        links: 'not-an-array' as unknown as BlueprintLinks,
                    },
                    'TestComponent',
                ),
            ).toThrow('Blueprint[TestComponent] > links must be an array.');
        });

        test('accepts valid blueprint with schema and type', () => {
            expect(() =>
                validateBlueprint(
                    {
                        schema: {
                            propOne: { type: 'string' },
                        },
                    },
                    'TestComponent',
                ),
            ).not.toThrow();
        });

        test('accepts valid blueprint with schema and default value', () => {
            expect(() =>
                validateBlueprint(
                    {
                        schema: {
                            propOne: { default: 42 },
                        },
                    },
                    'TestComponent',
                ),
            ).not.toThrow();
        });

        test('accepts valid blueprint with links as string array', () => {
            expect(() =>
                validateBlueprint(
                    {
                        schema: { propOne: { type: 'string' } },
                        links: ['https://example.com', 'https://example.com/docs'],
                    },
                    'TestComponent',
                ),
            ).not.toThrow();
        });

        test('accepts valid blueprint with links as objects', () => {
            expect(() =>
                validateBlueprint(
                    {
                        schema: { propOne: { type: 'string' } },
                        links: [
                            'https://example.com',
                            { url: 'https://example.com/docs', type: 'Documentation' },
                        ],
                    },
                    'TestComponent',
                ),
            ).not.toThrow();
        });

        test('warns instead of throwing when onInvalidBlueprint is "warn"', () => {
            const mockedGetBlueprintOptions = vi.mocked(configModule.getBlueprintOptions);
            mockedGetBlueprintOptions.mockReturnValue({ onInvalidBlueprint: 'warn' });
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            expect(() =>
                validateBlueprint({} as BlueprintConfig, 'TestComponent'),
            ).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledOnce();
            expect(consoleSpy.mock.calls[0][0]).toBeInstanceOf(BlueprintError);

            consoleSpy.mockRestore();
        });

    });

});
