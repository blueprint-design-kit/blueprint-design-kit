import { describe, test, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import { buildConfig } from './buildConfig';
import { readUserConfigFile } from '../_blueprint_config_builder.js';
import { setOptions, getFileOptions } from './options.js';
import { BLUEPRINT_PROJECT_DIRNAME } from '../_project_/dirname.js';

vi.mock(import('node:fs'), () => ({
    default: {
        promises: {
            writeFile: vi.fn(),
        },
    },
}));

vi.mock(import('../_blueprint_config_builder.js'), () => ({
    readUserConfigFile: vi.fn(),
}));

vi.mock(import('./options.js'), () => ({
    setOptions: vi.fn(),
    getFileOptions: vi.fn(),
}));

describe('buildConfig', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(readUserConfigFile).mockResolvedValue(undefined);
        vi.mocked(getFileOptions).mockReturnValue({ importsFormat: 'es6' });
        vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);
    });

    test('calls setOptions with the result of readUserConfigFile', async () => {
        const userConfig = { fileOptions: { componentsRoot: './src/ui' } };
        vi.mocked(readUserConfigFile).mockResolvedValue(userConfig);

        await buildConfig();

        expect(setOptions).toHaveBeenCalledWith(userConfig);
    });

    test('calls setOptions with empty object when no user config is found', async () => {
        vi.mocked(readUserConfigFile).mockResolvedValue(undefined);

        await buildConfig();

        expect(setOptions).toHaveBeenCalledWith({});
    });

    test('uses "export default" template for es6 importsFormat', async () => {
        vi.mocked(getFileOptions).mockReturnValue({ importsFormat: 'es6' });

        await buildConfig();

        const [, content] = vi.mocked(fs.promises.writeFile).mock.calls[0] || [];
        expect(String(content)).toContain('export default ');
    });

    test('uses "module.exports =" template for commonjs importsFormat', async () => {
        vi.mocked(getFileOptions).mockReturnValue({ importsFormat: 'commonjs' });

        await buildConfig();

        const [, content] = vi.mocked(fs.promises.writeFile).mock.calls[0] || [];
        expect(String(content)).toContain('module.exports = ');
    });

    test('defaults to es6 template when importsFormat is undefined', async () => {
        vi.mocked(getFileOptions).mockReturnValue({});

        await buildConfig();

        const [, content] = vi.mocked(fs.promises.writeFile).mock.calls[0] || [];
        expect(String(content)).toContain('export default ');
    });

    test('writes the config file to the correct path', async () => {
        await buildConfig();

        const [filePath] = vi.mocked(fs.promises.writeFile).mock.calls[0] || [];
        expect(String(filePath)).toContain(BLUEPRINT_PROJECT_DIRNAME);
        expect(String(filePath)).toContain('blueprint.config.js');
    });

    test('serializes the user config as JSON5 in the file content', async () => {
        const userConfig = { fileOptions: { componentsRoot: './app' } };
        vi.mocked(readUserConfigFile).mockResolvedValue(userConfig);

        await buildConfig();

        const [, content] = vi.mocked(fs.promises.writeFile).mock.calls[0] || [];
        expect(String(content)).toContain('./app');
    });

    test('logs an error and does not throw when writeFile fails', async () => {
        vi.mocked(fs.promises.writeFile).mockRejectedValue(new Error('disk full'));
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await expect(buildConfig()).resolves.toBeUndefined();
        expect(errorSpy).toHaveBeenCalled();
    });

});
