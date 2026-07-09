import { getImportsMap } from '../imports/getImportsMap.js';
import type { ComponentMeta } from './types.js';

export interface ComponentListItem {
    path: string;
    meta: ComponentMeta;
}

export async function listComponents(): Promise<ComponentListItem[]> {
    const components: ComponentListItem[] = [];
    const bpImports = await getImportsMap();
    for (const [path, obj] of Object.entries(bpImports)) {
        let meta = {};
        if (obj && typeof obj.m === 'function') {
            meta = await obj.m() || {};
        }
        components.push({ path, meta });
    }
    return components.sort((a, b) => a.path.localeCompare(b.path));
}
