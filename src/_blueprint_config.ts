import type { BlueprintSystemOptions } from './types';

function locate() {
    try {
        return require('../../../blueprint.config.ts');
    } catch {
        // not found, try next format
    }
    try {
        return require('../../../blueprint.config.js');
    } catch {
        // not found, try next format
    }
    try {
        return require('../../../blueprint.config.cjs');
    } catch {
        // not found, try next format
    }
    try {
        return require('../../../blueprint.config.mjs');
    } catch {
        // not found, return undefined
    }
    return;
}

/**
 * This file "magically" imports the blueprint.config.{ts|js} file
 *   (this file should exist in the root of the user's project)
 */
export function getOptionsFromConfig(): BlueprintSystemOptions | undefined {
    let config: BlueprintSystemOptions | undefined;
    const configModule = locate();
    if (configModule) {
        config = configModule.default || configModule;
    }
    return config;
}
