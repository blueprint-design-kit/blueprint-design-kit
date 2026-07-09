import { describe, test, expect, vi } from 'vitest';
import { listComponents } from './listComponents';

vi.mock(import('../imports/getImportsMap.js'), () => {
    return {
        getImportsMap: async () => ({
            Badge: {
                b: async () => {},
                c: async () => {},
                m: async () => { return { hasBlueprint: true }; },
            },
            'Atoms/Button': {
                b: async () => {},
                c: async () => {},
                m: async () => { return { useClient: true }; },
            },
        }),
    };
});

describe('listComponents', () => {

    describe('listComponents', () => {

        test('returns the correct list of components', async () => {
            const components = await listComponents();
            expect(components).toEqual([
                { path: 'Atoms/Button', meta: { useClient: true } },
                { path: 'Badge', meta: { hasBlueprint: true } },
            ]);
        });

    });

});
