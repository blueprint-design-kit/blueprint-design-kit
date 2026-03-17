import BlueprintError from '../utils/BlueprintError';
import getImport from './getImport';

export async function getComponent(componentPath: string): Promise<React.FunctionComponent | undefined> {
    if (!componentPath) {
        throw new BlueprintError(`blueprint.getComponent() > Component Path is required`);
    }
    if (typeof componentPath !== 'string') {
        throw new BlueprintError('blueprint.getComponent() > Component Path must be a string');
    }
    return await getImport(componentPath, 'component') as React.FunctionComponent | undefined;
}
