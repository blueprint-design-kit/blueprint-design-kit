import { describe, test, expect, vi, beforeEach } from 'vitest';
import getImport from './getImport';
import { getImportsMap } from '../imports/getImportsMap.js';

vi.mock(import('../imports/getImportsMap.js'), () => {
    return {
        getImportsMap: vi.fn(),
    };
});

describe('getImport', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('throws when component path is not found in imports map', async () => {
        const mockedGetImportsMap = vi.mocked(getImportsMap);
        mockedGetImportsMap.mockResolvedValue({});

        await expect(() => getImport('Atoms/Button', 'component')).rejects.toThrow(
            "component not found for 'Atoms/Button'",
        );
    });

    test('throws when importer key is missing', async () => {
        const mockedGetImportsMap = vi.mocked(getImportsMap);
        mockedGetImportsMap.mockResolvedValue({
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
        const mockedGetImportsMap = vi.mocked(getImportsMap);
        mockedGetImportsMap.mockResolvedValue({
            'Atoms/Button': {
                c: async () => ({ default: () => 'ButtonComponent' }),
            },
        } as any);

        const imported = await getImport('Atoms/Button', 'component');
        expect(typeof imported).toBe('function');
        expect((imported as any)({})).toBe('ButtonComponent');
    });

    test('returns value directly when importer does not resolve a module object', async () => {
        const mockedGetImportsMap = vi.mocked(getImportsMap);
        mockedGetImportsMap.mockResolvedValue({
            'Atoms/Button': {
                m: async () => ({ useClient: true }),
            },
        } as any);

        const imported = await getImport('Atoms/Button', 'meta');
        expect(imported).toEqual({ useClient: true });
    });

});
