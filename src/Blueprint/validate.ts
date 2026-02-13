import { getOptions } from '../config/options';
import BlueprintError from '../utils/BlueprintError';

import type {
    BlueprintConfig,
    BlueprintProps,
    BlueprintSchema,
    BlueprintSchemaType,
} from '../types';

function conformsToType(value: any, expectedType: string): boolean {
    if (expectedType === 'any') {
        return true;
    }
    if (expectedType === 'integer' || expectedType === 'int') {
        return Number.isInteger(value);
    }
    if (expectedType === 'color') {
        if (typeof value !== 'string') { return false; }
        const isHex = value.match(/^\s*#[\da-zA-Z]{3,8};?\s*$/); // #11aaCC
        const isRgb = value.match(/^\s*rgba?\([\d,.\s]+\);?\s*$/); // rgb(10, 20, 30)
        const isNamed = value.match(/^[a-z]+$/); // green (must assume is valid color name)
        return !!(isHex || isRgb || isNamed);
    }
    if (expectedType === 'null') {
        return value === null;
    }
    if (expectedType === 'array') {
        return Array.isArray(value);
    }
    return typeof value === expectedType;
}

function matchOne(value: any, expectedType: string): boolean {
    if (expectedType.endsWith('[]')) {
        if (Array.isArray(value)) {
            const itemType = expectedType.slice(0, -2);
            for (const item of value) {
                if (!conformsToType(item, itemType)) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }
    return conformsToType(value, expectedType);
}

function checkTypeMismatch(value: any, expectedTypes: BlueprintSchemaType): string | null {
    const doesNotConform = 'does not conform to the type:';

    if (typeof expectedTypes === 'function') {
        if (!expectedTypes(value)) {
            return `\`${value}\` ${doesNotConform} ${expectedTypes}`;
        }

    } else if (Array.isArray(expectedTypes)) {
        let matchAtLeastOne = false;
        for (const expectedType of expectedTypes) {
            if (matchOne(value, expectedType)) {
                matchAtLeastOne = true;
                break;
            }
        };
        if (!matchAtLeastOne) {
            return `\`${value}\` ${doesNotConform} ${expectedTypes.join(' | ')}`;
        }

    } else if (expectedTypes) {
        if (!matchOne(value, expectedTypes)) {
            return `\`${value}\` ${doesNotConform} ${expectedTypes}`;
        }
    }

    return null;
}

function checkBlueprintForErrors(blueprintConfig: BlueprintConfig, blueprintName: string, strictDefaults: boolean): string | undefined {
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
    if (strictDefaults && blueprintConfig.variants) {
        const defaultVariant = blueprintConfig.variants['DEFAULT'];
        if (defaultVariant && (defaultVariant.props || defaultVariant.state) ) {
            return `Blueprint[${blueprintName}] > variants.DEFAULT should not specify any props or state. That's what makes it the default.`;
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

export function validateBlueprint(blueprintConfig: BlueprintConfig, blueprintName: string = '') {
    const { onInvalidBlueprint, strictDefaults } = getOptions();
    const invalidBlueprint = checkBlueprintForErrors(blueprintConfig, blueprintName, strictDefaults);
    if (invalidBlueprint) {
        if (onInvalidBlueprint === 'error') {
            throw new BlueprintError(invalidBlueprint);
        } else if (onInvalidBlueprint === 'warn') {
            console.warn(new BlueprintError(invalidBlueprint));
        }
    }
}
