import BlueprintError from '../utils/BlueprintError.js';
import getImport from '../imports/getImport.js';

import type { FunctionComponent } from 'react';

export async function getComponent(componentPath: string): Promise<FunctionComponent | undefined> {
    if (!componentPath) {
        throw new BlueprintError(`blueprint.getComponent() > Component Path is required`);
    }
    if (typeof componentPath !== 'string') {
        throw new BlueprintError('blueprint.getComponent() > Component Path must be a string');
    }
    return await getImport(componentPath, 'component') as FunctionComponent | undefined;
}
