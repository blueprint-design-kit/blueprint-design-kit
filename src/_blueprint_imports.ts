/**
 * This file "magically" imports the blueprint.imports.{ts|js} file
 *   (this file will be generated in the root of the user's project)
 * We do this because the blueprint.imports file needs to be generated with dynamic imports,
 *   and these are relative to the user's root directory.
 * Assuming this file will always be at project root keeps the user from needing to pass the path
 *   for the blueprint.imports file when they use the getComponent.render function.
 * @returns {function} a function that returns the component map
 */

import type { BlueprintInstance } from './types';

export interface BlueprintImportsMap {
    [key: string]: {
        b: () => Promise<React.ComponentType<any>> | Promise<{ default: React.ComponentType<any> }>;
        c: () => Promise<BlueprintInstance> | Promise<{ default: BlueprintInstance }>;
    };
}

export function getBlueprintImports(): BlueprintImportsMap {
    let bpImports;
    try {
        bpImports = require(`../../../.blueprint/blueprint.imports`);
    } catch (err) {
        throw new Error(`Error loading blueprint.imports: ${err}`);
    }
    if (bpImports && bpImports.default) {
        bpImports = bpImports.default;
    }
    return bpImports;
}
