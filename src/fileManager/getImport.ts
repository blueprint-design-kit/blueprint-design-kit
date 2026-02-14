import { BLUEPRINT_IMPORTER_NAMES } from '../config/constants';
import BlueprintError from '../utils/BlueprintError';
import { getBlueprintImports } from '../_blueprint_imports';

import type  { Blueprint } from '../types';

export default async function getImport(componentName: string, importType: 'blueprint'|'component'): Promise<Blueprint | React.FunctionComponent | undefined> {
    let blueprintImports = getBlueprintImports();
    const componentMap = blueprintImports[componentName];
    if (!componentMap) {
        throw new BlueprintError(`Component ${componentName} not found`);
    }
    const importerKey = BLUEPRINT_IMPORTER_NAMES[importType] as keyof typeof componentMap;
    const importer = componentMap[importerKey];
    if (typeof importer !== 'function') {
        throw new BlueprintError(`Component ${componentName} does not have an importer`);
    }
    const imported = await importer();
    // @ts-expect-error -- support both default and named exports for compatibility with different module systems
    return imported && imported.default || imported; // normalize import types
}
