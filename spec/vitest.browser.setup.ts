import { afterEach, vi } from 'vitest';

vi.mock(import('../src/_blueprint_config'), () => {
    return {
        getOptionsFromConfig: () => {
            return {};
        },
    };
});

vi.mock(import('../src/_blueprint_imports.js'), () => {
    return {
        getBlueprintImports: vi.fn(),
    };
});

afterEach(() => {
    document.body.innerHTML = '';
});
