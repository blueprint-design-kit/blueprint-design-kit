import BlueprintError from '../utils/BlueprintError';
import { validateBlueprint, validatePropsAgainstSchema } from './validate';

import type {
    BlueprintConfig,
    BlueprintInstance,
    BlueprintLinks,
    BlueprintProps,
    BlueprintSchema,
    BlueprintVariant,
} from '../types';

export class Blueprint {
    private config: BlueprintConfig;

    constructor(blueprintConfig: BlueprintConfig) {
        this.config = blueprintConfig;
    }

    make(blueprintName?: string): BlueprintInstance {
        if (!blueprintName) {
            const callerLine = new Error().stack?.split(/\n\s*at\s*/)[2];
            const callerName = callerLine?.split(' (')[0];
            blueprintName = callerName;
        }

        if (!this.config) {
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

        const getNotes = (locale?: string): React.ReactNode => {
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

        const getVariant = (variantName: string, locale?: string): BlueprintVariant | undefined => {
            let variant;
            let variants = bp.variants;
            if (locale && bp.locales) {
                variants = bp.locales[locale]?.variants || variants;
            }
            if (variantName) {
                variant = variants && variants[variantName];
                if (!variant) {
                    throw new BlueprintError(`${blueprintName || 'Blueprint'} variant "${variantName}" not found`);
                }
            } else {
                variant = variants && variants['DEFAULT'];
            }
            return variant;
        };

        const listVariants = (locale?: string): string[] => {
            let variants = bp.variants;
            if (locale && bp.locales) {
                variants = bp.locales[locale]?.variants || variants;
            }
            return variants ? Object.keys(variants) : [];
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

        const blueprintInstance = {
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
