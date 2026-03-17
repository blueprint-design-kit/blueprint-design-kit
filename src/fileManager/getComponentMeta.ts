import BlueprintError from '../utils/BlueprintError';
import getImport from './getImport';

import type { ComponentMeta } from '../types';

export async function getComponentMeta(componentPath: string): Promise<ComponentMeta | undefined> {
    if (!componentPath) {
        throw new BlueprintError(`blueprint.getComponentMeta() > Component Path is required`);
    }
    if (typeof componentPath !== 'string') {
        throw new BlueprintError('blueprint.getComponentMeta() > Component Path must be a string');
    }
    return await getImport(componentPath, 'meta') as ComponentMeta | undefined;
}
