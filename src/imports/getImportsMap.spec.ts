import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { BlueprintImportsMap } from './getImportsMap';

// Un-mock getImportsMap so we test the real implementation, not the global stub
// from spec/vitest.setup.ts
vi.unmock('./getImportsMap');

describe('getImportsMap', () => {

    beforeEach(() => {
        vi.resetModules();
    });

    test('returns the default export from blueprint.imports as the imports map', async () => {
        // The real blueprint.imports.ts ships an empty map as its default export
        const { getImportsMap } = await import('./getImportsMap');
        const result = await getImportsMap();

        expect(result).toEqual({});
    });

    test('unwraps the default export from the blueprint imports module', async () => {
        vi.doMock('../_project_/blueprint.imports.js', () => ({
            default: { 'Atoms/Button': {} as BlueprintImportsMap[string] },
        }));

        const { getImportsMap } = await import('./getImportsMap');
        const result = await getImportsMap();

        expect(result).toHaveProperty('Atoms/Button');

        vi.doUnmock('../_project_/blueprint.imports.js');
    });

    test('throws with a descriptive message when the imports module fails to load', async () => {
        vi.doMock('../_project_/blueprint.imports.js', () => {
            throw new Error('Cannot find module');
        });

        const { getImportsMap } = await import('./getImportsMap');
        await expect(getImportsMap()).rejects.toThrow('Error loading blueprint.imports');

        vi.doUnmock('../_project_/blueprint.imports.js');
    });

});
