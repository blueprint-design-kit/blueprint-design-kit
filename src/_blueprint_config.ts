/**
 * Do not move. This file "magically" imports the blueprint.config.{ts|js} file
 *   (this file should exist in .blueprint/ in the root of the user's project)
 */

import type { BlueprintSystemOptions } from './config/options.js';

export function getOptionsFromConfig(): BlueprintSystemOptions | undefined {
    let bpConfig;
    try {
        bpConfig = require('../../../.blueprint/blueprint.config');
    } catch (err) {
        throw new Error(`Error loading blueprint.config: ${err}`, { cause: err });
    }
    if (bpConfig && bpConfig.default) {
        bpConfig = bpConfig.default;
    }
    return bpConfig;
}
