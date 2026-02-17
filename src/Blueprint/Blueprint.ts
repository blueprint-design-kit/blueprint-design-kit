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

export * from '../types/index';

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

        const bp: BlueprintConfig = Object.assign({ schema: {} }, this.config);

        const getLinks = (): BlueprintLinks => {
            return bp.links || [];
        };

        const getNotes = (): React.ReactNode => {
            return bp.notes;
        };

        const getSchema = (): BlueprintSchema | undefined => {
            return bp.schema;
        };

        const getVariant = (variantName: string): BlueprintVariant | undefined => {
            let variant;
            if (variantName) {
                variant = bp.variants && bp.variants[variantName];
                if (!variant) {
                    throw new BlueprintError(`${blueprintName || 'Blueprint'} variant "${variantName}" not found`);
                }
            } else {
                variant = bp.variants && bp.variants['DEFAULT'];
            }
            return variant;
        };

        const listVariants = (): string[] => {
            return bp.variants ? Object.keys(bp.variants) : [];
        };

        const validateProps = (props: BlueprintProps = {}): string | undefined => {
            return validatePropsAgainstSchema(props, bp.schema, blueprintName);
        };

        const withDefaultProps = (props: BlueprintProps = {}): BlueprintProps => {
            const defaultValues: BlueprintProps = {};
            if (bp.schema) {
                for (const key in bp.schema) {
                    defaultValues[key] = bp.schema[key] && bp.schema[key].default;
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
