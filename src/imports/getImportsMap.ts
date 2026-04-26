import type { FunctionComponent } from 'react';
import type { Blueprint } from '../blueprint/Blueprint.js';
import type { ComponentMeta } from "../blueprint/types.js";

export interface BlueprintImportsMap {
    [key: string]: {
        b: () => Promise<Blueprint> | Promise<{ default: Blueprint }> | Promise<undefined>;
        c: () => Promise<FunctionComponent> | Promise<{ default: FunctionComponent }> | Promise<undefined>;
        m: () => Promise<ComponentMeta> | Promise<undefined>;
    };
}

export async function getImportsMap(): Promise<BlueprintImportsMap> {
    let bpImports: BlueprintImportsMap | { default: BlueprintImportsMap };
    try {
        const imported = await import('../_project_/blueprint.imports.js');
        bpImports = imported.default || imported;
    } catch (err) {
        throw new Error(`Error loading blueprint.imports: ${err}`, { cause: err });
    }
    return bpImports || Promise.resolve({} as BlueprintImportsMap);
}
