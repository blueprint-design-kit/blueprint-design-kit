import { getBlueprintOptions } from '../config/options.js';
import BlueprintError from '../utils/BlueprintError.js';

import type { BlueprintConfig } from './types.js';

function checkBlueprintForErrors(blueprintConfig: BlueprintConfig, blueprintName: string): string | undefined {
    if (!blueprintConfig.schema) {
        return `Blueprint[${blueprintName}] must have a schema.`;
    }
    for (const key in blueprintConfig.schema) {
        const prop = blueprintConfig.schema[key];
        if (!prop || typeof prop !== 'object') {
            return `Blueprint[${blueprintName}] > schema.${key} does not have a valid configuration.`;
        }
        if (!prop.type && !prop.default) {
            return `Blueprint[${blueprintName}] > schema.${key} must specify either a type or a default value.`;
        }
    }
    if (blueprintConfig.links) {
        if (!Array.isArray(blueprintConfig.links)) {
            return `Blueprint[${blueprintName}] > links must be an array.`;
        }
        blueprintConfig.links.forEach((link) => {
            if (typeof link !== 'string') {
                if (!link.url) {
                    return `Blueprint[${blueprintName}] > links must provide a url.`;
                }
            }
            return;
        });
    }
    return;
}

export function validateBlueprint(blueprintConfig: BlueprintConfig, blueprintName: string = '') {
    const { onInvalidBlueprint } = getBlueprintOptions();
    const invalidBlueprint = checkBlueprintForErrors(blueprintConfig, blueprintName);
    if (invalidBlueprint) {
        if (onInvalidBlueprint === 'error') {
            throw new BlueprintError(invalidBlueprint);
        } else if (onInvalidBlueprint === 'warn') {
            console.warn(new BlueprintError(invalidBlueprint));
        }
    }
}
