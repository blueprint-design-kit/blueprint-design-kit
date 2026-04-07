import { valueConformsToType } from '../utils/valueConformsToType.js';

import type {
    BlueprintProps,
    BlueprintSchema,
    BlueprintSchemaType,
} from './types.js';


function checkTypeMismatch(value: any, expectedTypes: BlueprintSchemaType): string | null {
    const doesNotConform = 'does not conform to the type:';

    if (typeof expectedTypes === 'function') {
        if (!expectedTypes(value)) {
            return `\`${value}\` ${doesNotConform} ${expectedTypes}`;
        }

    } else if (Array.isArray(expectedTypes)) {
        let matchAtLeastOne = false;
        for (const expectedType of expectedTypes) {
            if (valueConformsToType(value, expectedType)) {
                matchAtLeastOne = true;
                break;
            }
        };
        if (!matchAtLeastOne) {
            return `\`${value}\` ${doesNotConform} ${expectedTypes.join(' | ')}`;
        }

    } else if (expectedTypes) {
        if (!valueConformsToType(value, expectedTypes)) {
            return `\`${value}\` ${doesNotConform} ${expectedTypes}`;
        }
    }

    return null;
}

export function validatePropsAgainstSchema(
    props: BlueprintProps = {},
    schema: BlueprintSchema,
    blueprintName: string = '',
): string | undefined {
    const errPrefix = `Blueprint[${blueprintName}] > props`;
    for (const key in props) {
        const schemaForKey = schema[key];
        if (schemaForKey) {
            const value = props[key];
            const expectedType = schemaForKey.type || typeof schemaForKey.default;
            const mistmatch = checkTypeMismatch(value, expectedType);
            if (mistmatch) {
                return `${errPrefix}.${key} ${mistmatch}.`;
            }
            const allow = schemaForKey.allow;
            if (Array.isArray(allow) && !allow.includes(value)) {
                return `${errPrefix}.${key} "${value}" is not an allowed value [${allow.join(', ')}].`;
            }
            const max = schemaForKey.max;
            if (typeof max !== 'undefined' && value > max) {
                return `${errPrefix}.${key} "${value}" exceeds maximum ${max}.`;
            }
            const min = schemaForKey.min;
            if (typeof min !== 'undefined' && value < min) {
                return `${errPrefix}.${key} "${value}" is less than minimum ${min}.`;
            }
        } else if (key !== 'children' && key !== 'state') {
            return `${errPrefix}.${key} is not a valid prop.`;
        }
    }
    for (const key in schema) {
        if (typeof props[key] === 'undefined') {
            if (schema[key] && schema[key].type && checkTypeMismatch(undefined, schema[key].type)) {
                return `${errPrefix} missing props.${key}`;
            }
        }
    }
    return;
}
