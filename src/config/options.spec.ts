import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getOptionsFromConfig } from '../_blueprint_config.js';
import {
    getBlueprintOptions,
    getComponentOptions,
    getFileOptions,
    getTestingOptions,
    setOptions,
} from './options';

vi.mock(import('../_blueprint_config.js'), () => {
    return {
        getOptionsFromConfig: vi.fn(),
    };
});

describe('options', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('applies user config lazily and only once on first access', () => {
        const mockedGetOptionsFromConfig = vi.mocked(getOptionsFromConfig);
        mockedGetOptionsFromConfig.mockReturnValue({
            fileOptions: {
                componentsRoot: './custom/components',
            },
            blueprintOptions: {
                onInvalidBlueprint: 'warn',
            },
        });

        expect(getFileOptions().componentsRoot).toBe('./custom/components');
        expect(getBlueprintOptions().onInvalidBlueprint).toBe('warn');

        getComponentOptions();
        getTestingOptions();

        expect(mockedGetOptionsFromConfig).toHaveBeenCalledOnce();
    });

    test('setOptions deep-merges user options with defaults', () => {
        setOptions({
            fileOptions: {
                componentsRoot: './src/components',
            },
            componentOptions: {
                readComponentMeta: false,
            },
        });

        expect(getFileOptions()).toMatchObject({
            componentsRoot: './src/components',
            importsFormat: 'es6',
        });
        expect(getComponentOptions()).toMatchObject({
            readComponentMeta: false,
            onMissingCoverage: 'warn',
        });
    });

    test('setOptions handles undefined without changing values', () => {
        const before = getFileOptions().componentsRoot;
        setOptions(undefined);
        const after = getFileOptions().componentsRoot;

        expect(after).toBe(before);
    });

    test('returns all option groups', () => {
        expect(getFileOptions()).toBeTruthy();
        expect(getComponentOptions()).toBeTruthy();
        expect(getBlueprintOptions()).toBeTruthy();
        expect(getTestingOptions()).toBeTruthy();
    });

});
