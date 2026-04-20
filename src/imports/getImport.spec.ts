import { describe, test, expect, vi, beforeEach } from 'vitest';
import getImport from './getImport';
import { getBlueprintImports } from '../_blueprint_imports.js';

vi.mock(import('../_blueprint_imports.js'), () => {
    return {
        getBlueprintImports: vi.fn(),
    };
});

describe('getImport', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('throws when component path is not found in imports map', async () => {
        const mockedGetBlueprintImports = vi.mocked(getBlueprintImports);
        mockedGetBlueprintImports.mockResolvedValue({});

        await expect(() => getImport('Atoms/Button', 'component')).rejects.toThrow(
            "component not found for 'Atoms/Button'",
        );
    });

    test('throws when importer key is missing', async () => {
        const mockedGetBlueprintImports = vi.mocked(getBlueprintImports);
        mockedGetBlueprintImports.mockResolvedValue({
            'Atoms/Button': {
                b: async () => ({ default: { make: () => ({}) } }),
                m: async () => ({ useClient: true }),
            },
        } as any);

        await expect(() => getImport('Atoms/Button', 'component')).rejects.toThrow(
            "'Atoms/Button' component does not have an importer",
        );
    });

    test('returns default export when importer resolves a module object', async () => {
        const mockedGetBlueprintImports = vi.mocked(getBlueprintImports);
        mockedGetBlueprintImports.mockResolvedValue({
            'Atoms/Button': {
                c: async () => ({ default: () => 'ButtonComponent' }),
            },
        } as any);

        const imported = await getImport('Atoms/Button', 'component');
        expect(typeof imported).toBe('function');
        expect((imported as any)({})).toBe('ButtonComponent');
    });

    test('returns value directly when importer does not resolve a module object', async () => {
        const mockedGetBlueprintImports = vi.mocked(getBlueprintImports);
        mockedGetBlueprintImports.mockResolvedValue({
            'Atoms/Button': {
                m: async () => ({ useClient: true }),
            },
        } as any);

        const imported = await getImport('Atoms/Button', 'meta');
        expect(imported).toEqual({ useClient: true });
    });

});
