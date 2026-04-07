import { BLUEPRINT_IMPORTER_NAMES } from '../config/constants.js';
import BlueprintError from '../utils/BlueprintError.js';
import { getBlueprintImports } from '../_blueprint_imports.js';

import type { FunctionComponent } from 'react';
import type { Blueprint } from '../blueprint/Blueprint.js';
import type { ComponentMeta } from '../blueprint/types.js';

type ImportType = 'blueprint' | 'component' | 'meta';

export default async function getImport(
    componentPath: string,
    importType: ImportType,
): Promise<Blueprint | FunctionComponent | ComponentMeta | undefined> {
    let blueprintImports = await getBlueprintImports();
    const componentMap = blueprintImports[componentPath];
    if (!componentMap) {
        throw new BlueprintError(`${importType} not found for '${componentPath}'`);
    }
    const importerKey = BLUEPRINT_IMPORTER_NAMES[importType] as keyof typeof componentMap;
    const importer = componentMap[importerKey];
    if (typeof importer !== 'function') {
        throw new BlueprintError(`'${componentPath}' ${importType} does not have an importer`);
    }
    const imported = await importer();
    return imported && 'default' in imported ? imported.default : imported;
}
