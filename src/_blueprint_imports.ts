/**
 * Do not move. This file "magically" imports the blueprint.imports.{ts|js} file
 *   (this file will be generated in the root of the user's project)
 * We do this because the blueprint.imports file needs to be generated with dynamic imports,
 *   and these are relative to the user's root directory.
 * Assuming this file will always be at project root keeps the user from needing to pass the path
 *   for the blueprint.imports file when they use the getComponent.render function.
 */

import type { BlueprintImportsMap } from './imports/generateImports.js';

export async function getBlueprintImports(): Promise<BlueprintImportsMap> {
    let bpImports;
    try {
        // This must use import() instead of require() because the native require will fail to import JSX files.
        // @ts-expect-error file will be generated at this path, but may not exist yet
        bpImports = await import('../../../.blueprint/blueprint.imports');
    } catch (err) {
        throw new Error(`Error loading blueprint.imports: ${err}`, { cause: err });
    }
    if (bpImports && bpImports.default) {
        bpImports = bpImports.default;
    }
    return bpImports;
}
