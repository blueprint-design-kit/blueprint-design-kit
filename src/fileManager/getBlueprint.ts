import BlueprintError from "../utils/BlueprintError";
import getImport from './getImport';

import type { BlueprintInstance, MakeBlueprint } from "../types";

export async function getBlueprint(componentName: string): Promise<BlueprintInstance | undefined> {
    if (!componentName) {
        throw new BlueprintError(`blueprint.getBlueprint() > "componentName" is required`);
    }
    if (typeof componentName !== 'string') {
        throw new BlueprintError('blueprint.getBlueprint() > "componentName" must be a string');
    }
    const makeBlueprint = await getImport(componentName, 'blueprint') as MakeBlueprint | undefined;
    return makeBlueprint && makeBlueprint(componentName);
}
