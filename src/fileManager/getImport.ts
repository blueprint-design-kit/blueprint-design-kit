import { BLUEPRINT_IMPORTER_NAMES } from '../config/constants';
import BlueprintError from '../utils/BlueprintError';
import { getBlueprintImports } from '../_blueprint_imports';

import type { Blueprint } from '../Blueprint/Blueprint';
import { ComponentMeta } from '../types';

type ImportType = 'blueprint' | 'component' | 'meta';

export default async function getImport(
    componentPath: string,
    importType: ImportType,
): Promise<Blueprint | React.FunctionComponent | ComponentMeta | undefined> {
    let blueprintImports = getBlueprintImports();
    const componentMap = blueprintImports[componentPath];
    if (!componentMap) {
        throw new BlueprintError(`Component ${componentPath} not found`);
    }
    const importerKey = BLUEPRINT_IMPORTER_NAMES[importType] as keyof typeof componentMap;
    const importer = componentMap[importerKey];
    if (typeof importer !== 'function') {
        throw new BlueprintError(`Component ${componentPath} does not have an importer`);
    }
    const imported = await importer();
    // @ts-expect-error -- support both default and named exports for compatibility with different module systems
    return imported && imported.default || imported; // normalize import types
}
