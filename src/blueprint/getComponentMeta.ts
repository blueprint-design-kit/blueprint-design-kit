import BlueprintError from '../utils/BlueprintError.js';
import getImport from '../imports/getImport.js';

import type { ComponentMeta } from './types.js';

export async function getComponentMeta(componentPath: string): Promise<ComponentMeta | undefined> {
    if (!componentPath) {
        throw new BlueprintError(`blueprint.getComponentMeta() > Component Path is required`);
    }
    if (typeof componentPath !== 'string') {
        throw new BlueprintError('blueprint.getComponentMeta() > Component Path must be a string');
    }
    return await getImport(componentPath, 'meta') as ComponentMeta | undefined;
}
