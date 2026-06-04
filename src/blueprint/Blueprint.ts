import BlueprintError from '../utils/BlueprintError.js';
import { validateBlueprint } from './validateBlueprint.js';
import { validatePropsAgainstSchema } from './validateProps.js';

import type { ReactNode } from 'react';
import type {
    BlueprintConfig,
    BlueprintInstance,
    BlueprintLinks,
    BlueprintProps,
    BlueprintSchema,
    BlueprintVariant,
    BlueprintVariants,
} from './types.js';

export class Blueprint {
    private config: BlueprintConfig;

    constructor(blueprintConfig: BlueprintConfig) {
        this.config = blueprintConfig;
    }

    make(blueprintName?: string): BlueprintInstance {
        if (!blueprintName) {
            const callerLine = new Error().stack?.split(/\n\s*at\s*/)[2];
            const callerName = callerLine?.split(/\s*[(/]/)[0];
            blueprintName = callerName;
        }

        if (!this || !this.config) {
            throw new BlueprintError(`${blueprintName || ''} Constructing a new Blueprint() requires a blueprintConfig`);
        }
        validateBlueprint(this.config, blueprintName);

        const bp: BlueprintConfig = Object.assign({ schema: {}, locales: {} }, this.config);

        const getLinks = (locale?: string): BlueprintLinks => {
            if (locale && bp.locales) {
                return bp.locales[locale]?.links || bp.links || [];
            }
            return bp.links || [];
        };

        const getNotes = (locale?: string): ReactNode => {
            if (locale && bp.locales) {
                return bp.locales[locale]?.notes || bp.notes;
            }
            return bp.notes;
        };

        const getSchema = (locale?: string): BlueprintSchema | undefined => {
            if (locale && bp.locales) {
                return bp.locales[locale]?.schema || bp.schema;
            }
            return bp.schema;
        };

        function getConfiguredVariants(locale?: string): { variants: BlueprintVariants; names: string[] } {
            let variants = bp.variants || {};
            if (locale && bp.locales) {
                variants = bp.locales[locale]?.variants || variants;
            }
            const names = Object.keys(variants);
            return { variants, names };
        }

        const getVariant = (variantName?: string, locale?: string): BlueprintVariant | undefined => {
            let variant;
            const { variants, names } = getConfiguredVariants(locale);
            if (variantName) {
                variant = variants[variantName];
                if (!variant) {
                    throw new BlueprintError(`${blueprintName || 'Blueprint'} variant "${variantName}" not found`);
                }
            } else {
                const firstVariantName = names[0];
                if (firstVariantName) {
                    variant = variants[firstVariantName];
                }
            }
            return variant;
        };

        const listVariants = (locale?: string): string[] => {
            const { names } = getConfiguredVariants(locale);
            return names;
        };

        const validateProps = (props: BlueprintProps = {}, locale?: string): string | undefined => {
            return validatePropsAgainstSchema(props, getSchema(locale) || {}, blueprintName);
        };

        const withDefaultProps = (props: BlueprintProps = {}, locale?: string): BlueprintProps => {
            const defaultValues: BlueprintProps = {};
            const schema = getSchema(locale);
            if (schema) {
                for (const key in schema) {
                    defaultValues[key] = schema[key] && schema[key].default;
                }
            }
            return Object.assign({}, defaultValues, props);
        };

        const blueprintInstance: BlueprintInstance = {
            getLinks,
            getNotes,
            getSchema,
            getVariant,
            listVariants,
            validateProps,
            withDefaultProps,
        };

        return blueprintInstance;
    }
}
