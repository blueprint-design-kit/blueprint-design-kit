import { describe, test, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import { coverageReport } from './coverageReport';
import { getComponentOptions } from '../config/options.js';

// @ts-expect-error - simplified mock for testing
vi.mock(import('node:fs'), () => {
    return {
        default: {
            writeFile: vi.fn((_path: string, _content: string, callback: (error: Error | null) => void) => {
                callback(null);
            }),
            mkdirSync: vi.fn(),
        },
    };
});

vi.mock(import('../config/options.js'), () => {
    return {
        getComponentOptions: vi.fn(),
    };
});

describe('coverageReport', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('does nothing when both coverage settings are disabled', async () => {
        const mockedGetComponentOptions = vi.mocked(getComponentOptions);
        mockedGetComponentOptions.mockReturnValue({
            onMissingCoverage: false,
            saveCoverageReport: false,
        });

        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        await coverageReport('./app/components', 2, {
            blueprints: {},
            components: {
                'Atoms/Button': { path: './app/components/Atoms/Button.component.tsx', meta: {} },
            },
        });

        expect(logSpy).not.toHaveBeenCalled();
        expect(vi.mocked(fs.writeFile)).not.toHaveBeenCalled();
    });

    test('warns for missing coverage and saves report when enabled', async () => {
        const mockedGetComponentOptions = vi.mocked(getComponentOptions);
        mockedGetComponentOptions.mockReturnValue({
            onMissingCoverage: 'warn',
            saveCoverageReport: true,
        });

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

        await coverageReport('./app/components', 4, {
            blueprints: {
                'Atoms/Button': './app/components/Atoms/Button.blueprint.tsx',
            },
            components: {
                'Atoms/Button': { path: './app/components/Atoms/Button.component.tsx', meta: {} },
                'Atoms/Card': { path: './app/components/Atoms/Card.component.tsx', meta: {} },
            },
        });

        expect(logSpy).toHaveBeenCalledOnce();
        expect(warnSpy).toHaveBeenCalledOnce();
        expect(vi.mocked(fs.writeFile)).toHaveBeenCalledOnce();
        const [path, content] = vi.mocked(fs.writeFile).mock.calls[0] || [];
        expect(path).toBe('.blueprint/blueprint.coverage.json');
        expect(String(content)).toContain('"totalComponents": 2');
        expect(String(content)).toContain('"componentsWithBlueprints": 1');
    });

    test('throws when missing coverage mode is set to error', async () => {
        const mockedGetComponentOptions = vi.mocked(getComponentOptions);
        mockedGetComponentOptions.mockReturnValue({
            onMissingCoverage: 'error',
            saveCoverageReport: false,
        });

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await expect(() =>
            coverageReport('./app/components', 2, {
                blueprints: {},
                components: {
                    'Atoms/Card': { path: './app/components/Atoms/Card.component.tsx', meta: {} },
                },
            }),
        ).rejects.toThrow('Missing blueprints for 1 out of 1 components');

        expect(errorSpy).toHaveBeenCalledOnce();
    });

    test('logs write errors when saving coverage report fails', async () => {
        const mockedGetComponentOptions = vi.mocked(getComponentOptions);
        mockedGetComponentOptions.mockReturnValue({
            onMissingCoverage: false,
            saveCoverageReport: true,
        });
        vi.mocked(fs.writeFile).mockImplementationOnce((_path, _content, callback: (error: Error | null) => void) => {
            callback(new Error('disk full'));
        });

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await coverageReport('./app/components', 1, {
            blueprints: {
                'Atoms/Button': './app/components/Atoms/Button.blueprint.tsx',
            },
            components: {
                'Atoms/Button': { path: './app/components/Atoms/Button.component.tsx', meta: {} },
            },
        });

        expect(errorSpy).toHaveBeenCalledOnce();
        expect(errorSpy.mock.calls[0]?.[0]).toContain('Error writing .blueprint/blueprint.coverage.json');
    });

});
