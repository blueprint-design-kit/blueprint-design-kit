import { describe, test, expect, vi } from 'vitest';
import { listComponents } from './listComponents';

vi.mock(import('../imports/getImportsMap.js'), () => {
    return {
        getImportsMap: async () => ({
            Badge: {
                b: async () => {},
                c: async () => {},
                m: async () => {},
            },
            'Atoms/Button': {
                b: async () => {},
                c: async () => {},
                m: async () => {},
            },
        }),
    };
});

describe('listComponents', () => {

    describe('listComponents', () => {

        test('returns the correct list of component names', async () => {
            const components = await listComponents();
            expect(components).toEqual([
                'Badge',
                'Atoms/Button',
            ]);
        });

    });

});
