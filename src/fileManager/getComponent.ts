import BlueprintError from '../utils/BlueprintError';
import getImport from './getImport';

export async function getComponent(componentName: string): Promise<React.FunctionComponent | undefined> {
    if (!componentName) {
        throw new BlueprintError(`blueprint.getComponent() > "componentName" is required`);
    }
    if (typeof componentName !== 'string') {
        throw new BlueprintError('blueprint.getComponent() > "componentName" must be a string');
    }
    return await getImport(componentName, 'component') as React.FunctionComponent | undefined;
}
