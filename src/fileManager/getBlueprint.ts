import BlueprintError from '../utils/BlueprintError';
import getImport from './getImport';

import type { BlueprintInstance, Blueprint } from '../types';

export async function getBlueprint(componentName: string): Promise<BlueprintInstance | undefined> {
    if (!componentName) {
        throw new BlueprintError(`blueprint.getBlueprint() > "componentName" is required`);
    }
    if (typeof componentName !== 'string') {
        throw new BlueprintError('blueprint.getBlueprint() > "componentName" must be a string');
    }
    const blueprint = await getImport(componentName, 'blueprint') as Blueprint | undefined;
    return blueprint && blueprint.make(componentName);
}
