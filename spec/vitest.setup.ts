import { vi } from 'vitest';

vi.mock(import('../src/_blueprint_config'), () => {
    return {
        getOptionsFromConfig: () => {
            return {};
        },
    };
});
