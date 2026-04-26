import { getImportsMap } from '../imports/getImportsMap.js';

export async function listComponents(): Promise<string[]> {
    const bpImports = await getImportsMap();
    return Object.keys(bpImports);
}
