import { vi } from 'vitest';

vi.mock(import('../src/imports/getImportsMap'), () => {
    return {
        getImportsMap: vi.fn(),
    };
});
