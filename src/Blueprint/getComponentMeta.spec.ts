import { describe, test, expect, vi } from 'vitest';
import { getComponentMeta } from './getComponentMeta';

type ImportType = 'blueprint' | 'component' | 'meta';

vi.mock(import('../imports/getImport'), () => {
    return {
        default: async (componentPath: string, importType: ImportType) => {
            if (importType === 'meta' && componentPath === 'Atoms/Button') {
                return { useClient: true };
            }
            return undefined;
        },
    };
});

describe('getComponentMeta', () => {

    describe('getComponentMeta', () => {

        test('handles invalid inputs', async () => {
            await expect(async () => getComponentMeta('')).rejects.toThrow('Component Path is required');
            // @ts-expect-error - testing invalid input
            await expect(async () => getComponentMeta(123)).rejects.toThrow('Component Path must be a string');
        });

        test('gets metadata from the imports map', async () => {
            const meta = await getComponentMeta('Atoms/Button');
            expect(meta).toEqual({ useClient: true });
        });

    });

});
