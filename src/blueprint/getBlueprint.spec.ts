import { describe, test, expect, vi } from 'vitest';
import { getBlueprint } from './getBlueprint';

type ImportType = 'blueprint' | 'component' | 'meta';

// @ts-expect-error - simplified mock for testing
vi.mock(import('../imports/getImport'), () => {
    return {
        default: async (componentPath: string, importType: ImportType) => {
            if (importType === 'blueprint' && componentPath === 'Atoms/Button') {
                return {
                    make: () => componentPath,
                };
            }
            return undefined;
        },
    };
});

describe('getBlueprint', () => {

    describe('getBlueprint', () => {

        test('handles invalid inputs', async () => {
            await expect(async () => getBlueprint('')).rejects.toThrow('Component Path is required');
            // @ts-expect-error - testing invalid input
            await expect(async () => getBlueprint(123)).rejects.toThrow('Component Path must be a string');
        });

        test('gets a blueprint from the imports map', async () => {
            const blueprint = await getBlueprint('Atoms/Button');
            expect(blueprint).toBe('Atoms/Button');
        });

    });

});
