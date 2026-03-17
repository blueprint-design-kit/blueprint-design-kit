import BlueprintError from '../utils/BlueprintError';
import getImport from './getImport';

import type { Blueprint } from '../Blueprint/Blueprint';
import type { BlueprintInstance } from '../types';

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
