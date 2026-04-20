import { describe, test, expect, vi } from 'vitest';
import { getComponent } from './getComponent';

type ImportType = 'blueprint' | 'component' | 'meta';

vi.mock(import('../imports/getImport'), () => {
    return {
        default: async (componentPath: string, importType: ImportType) => {
            if (importType === 'component' && componentPath === 'Atoms/Button') {
                return () => componentPath;
            }
            return undefined;
        },
    };
});

describe('getComponent', () => {

    describe('getComponent', () => {

        test('handles invalid inputs', async () => {
            await expect(async () => getComponent('')).rejects.toThrow('Component Path is required');
            // @ts-expect-error - testing invalid input
            await expect(async () => getComponent(123)).rejects.toThrow('Component Path must be a string');
        });

        test('gets a component from the imports map', async () => {
            const FnComponent = await getComponent('Atoms/Button');
            expect(FnComponent && FnComponent({})).toBe('Atoms/Button');
        });

    });

});
