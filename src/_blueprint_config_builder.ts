/**
 * Do not move. This file "magically" imports the user's blueprint.config.{ts|js} file
 *   (this file should exist in the root of the user's project)
 * If a config file is found, a normalized config file will be generated in .blueprint/
 *   (this is the file that will actually be consumed by the rest of the system)
 */

import type { BlueprintSystemOptions } from './config/options.js';
// import { createRequire } from 'node:module';
// const require = createRequire(import.meta.url);

function handleImportError(extension: string, err: unknown) {
    if (!err) return;
    if (err instanceof Error) {
        const errorWithCode = err as Error & { code: string };
        if (errorWithCode.code === 'ERR_MODULE_NOT_FOUND' || errorWithCode.code === 'MODULE_NOT_FOUND') {
            // These errors are expected, continue to check the next file type
            return;
        }
    }
    console.log(`Error encountered while importing blueprint.config.${extension}`);
    console.error(err);
}

async function locateSavedConfig() {
    try {
        // @ts-expect-error file may not exist
        return await import('../../../.blueprint/blueprint.config.js');
    } catch (err) {
        handleImportError('js', err);
    }
}

async function locateUserConfig() {
    try {
        // @ts-expect-error file may not exist
        return await import('../../../blueprint.config.ts');
    } catch (err) {
        handleImportError('ts', err);
    }
    try {
        // @ts-expect-error file may not exist
        return await import('../../../blueprint.config.js');
    } catch (err) {
        handleImportError('js', err);
    }
    try {
        // @ts-expect-error file may not exist
        return await import('../../../blueprint.config.cjs');
    } catch (err) {
        handleImportError('cjs', err);
    }
    try {
        // @ts-expect-error file may not exist
        return await import('../../../blueprint.config.mjs');
    } catch (err) {
        handleImportError('mjs', err);
    }
    return;
}

function normalizeDefaultExport(configModule: BlueprintSystemOptions | { default: BlueprintSystemOptions } | undefined): BlueprintSystemOptions | undefined {
    return configModule && 'default' in configModule ? configModule.default : configModule;
}

export async function readSavedConfigFile(): Promise<BlueprintSystemOptions | undefined> {
    const configModule = await locateSavedConfig();
    const config = normalizeDefaultExport(configModule);
    return config;
}

export async function readUserConfigFile(): Promise<BlueprintSystemOptions | undefined> {
    const configModule = await locateUserConfig();
    const config = normalizeDefaultExport(configModule);
    return config;
}
