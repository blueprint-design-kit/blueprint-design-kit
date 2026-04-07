/**
 * Do not move. This file "magically" imports the user's blueprint.config.{ts|js} file
 *   (this file should exist in the root of the user's project)
 * If a config file is found, a normalized config file will be generated in .blueprint/
 *   (this is the file that will actually be consumed by the rest of the system)
 */

import type { BlueprintSystemOptions } from './config/options.js';
// import { createRequire } from 'node:module';
// const require = createRequire(import.meta.url);

function handleImportError(extension: string, err: any) {
    if (!err) return;
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'MODULE_NOT_FOUND') {
        // These errors are expected, continue to check the next file type
        return;
    }
    console.log(`Error encountered while importing blueprint.config.${extension}`);
    console.error(err);
}

async function locate() {
    try {
        console.log('trying ts');
        // @ts-expect-error file may not exist
        return await import('../../../blueprint.config.ts');
    } catch (err) {
        handleImportError('ts', err);
    }
    try {
        console.log('trying js');
        // @ts-expect-error file may not exist
        return await import('../../../blueprint.config.js');
    } catch (err) {
        handleImportError('js', err);
    }
    try {
        console.log('trying cjs');
        // @ts-expect-error file may not exist
        return await import('../../../blueprint.config.cjs');
    } catch (err) {
        handleImportError('cjs', err);
    }
    try {
        console.log('trying mjs');
        // @ts-expect-error file may not exist
        return await import('../../../blueprint.config.mjs');
    } catch (err) {
        handleImportError('mjs', err);
    }
    return;
}

export async function readUserConfigFile(): Promise<BlueprintSystemOptions | undefined> {
    let config: BlueprintSystemOptions | undefined;
    const configModule = await locate();
    if (configModule) {
        config = configModule.default || configModule;
    }
    console.log('configModule', config);
    return config;
}
