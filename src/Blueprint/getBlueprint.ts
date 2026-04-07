import BlueprintError from '../utils/BlueprintError.js';
import getImport from '../imports/getImport.js';

import type { Blueprint } from './Blueprint.js';
import type { BlueprintInstance } from './types.js';

export async function getBlueprint(componentPath: string): Promise<BlueprintInstance | undefined> {
    if (!componentPath) {
        throw new BlueprintError(`blueprint.getBlueprint() > Component Path is required`);
    }
    if (typeof componentPath !== 'string') {
        throw new BlueprintError('blueprint.getBlueprint() > Component Path must be a string');
    }
    const blueprint = await getImport(componentPath, 'blueprint') as Blueprint | undefined;
    return blueprint && blueprint.make(componentPath);
}
