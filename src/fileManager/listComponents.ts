import { getBlueprintImports } from '../_blueprint_imports';

export function listComponents(): string[] {
    const bpImports = getBlueprintImports();
    return Object.keys(bpImports);
}
