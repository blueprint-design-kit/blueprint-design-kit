import { getBlueprintImports } from '../_blueprint_imports.js';

export async function listComponents(): Promise<string[]> {
    const bpImports = await getBlueprintImports();
    return Object.keys(bpImports);
}
