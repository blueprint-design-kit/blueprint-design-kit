import type { ReactNode } from 'react';

export interface ComponentMeta {
    useClient?: boolean;
    useServer?: boolean;
}

export type BlueprintSchemaType = string | string[] | ((propValue: any) => boolean);

export interface BlueprintSchema {
    [key: string]: {
        default?: any;
        type?: BlueprintSchemaType;
        source?: string | { tag: string; url: string; };
        allow?: any[];
        min?: number;
        max?: number;
    };
}

export type BlueprintProps = { [key: string]: any; };
export type BlueprintState = { [key: string]: any; };

export interface BlueprintVariant {
    props?: BlueprintProps | BlueprintProps[];
    state?: BlueprintState;
    expectation?: ReactNode;
}
export interface BlueprintVariants {
    [key: string]: BlueprintVariant | undefined;
}

interface BlueprintLink {
    url: string;
    type?: string;
    icon?: ReactNode;
}
export type BlueprintLinks = (string | BlueprintLink)[];

export interface BlueprintConfig {
    /**
     * The schema defines the expected props for this component, along with their types, default values, and other validation rules.
     */
    schema: BlueprintSchema;

    /**
     * Defines all of the different permutations of this component, each with its own set of props, state, and expected rendered output.
     * This controls what options appear in the dropdown on the component preview and is used for testing rendered output against the expectation.
     */
    variants?: BlueprintVariants;

    /**
     * Controls what external links appear alongside the preview for this component.
     * Link out to designs, source code, or anything else relevant to the implementation of this component.
     */
    links?: BlueprintLinks;

    /**
     * A string or ReactNode containing notes about this component.
     * This is the best place to provide any special context or instructions for use.
     */
    notes?: ReactNode;

    /**
     * An optional object defining locale-specific overrides for any of the above configuration options.
     * The keys of this object should be locale identifiers (e.g. 'en-US', 'fr-FR', etc.).
     */
    locales?: Record<string, {
        schema?: BlueprintSchema;
        variants?: BlueprintVariants;
        links?: BlueprintLinks;
        notes?: ReactNode;
    }>;
}

export interface BlueprintInstance {
    /**
     * Returns an Array of links for this blueprint
     */
    getLinks: (locale?: string) => BlueprintLinks;

    /**
     * Returns the notes for this blueprint (can be a string or ReactNode)
     */
    getNotes: (locale?: string) => ReactNode;

    /**
     * Returns the schema object for this blueprint
     */
    getSchema: (locale?: string) => BlueprintSchema | undefined;

    /**
     * When variantName is passed, returns the matching variant configuration or throws an error if not found.
     * When variantName is NOT passed, simply returns the first variant in the configuration or undefined.
     */
    getVariant: (variantName?: string, locale?: string) => BlueprintVariant | undefined;

    /**
     * Returns an Array of variant names for this blueprint
     */
    listVariants: (locale?: string) => string[];

    /**
     * A hook to validate that the props match the schema for this blueprint. 
     * Returns a string describing the validation error, or undefined if there are no errors.
     */
    validateProps: (props: BlueprintProps | undefined, locale?: string) => string | undefined;

    /**
     * A hook to apply the default props from the schema to a given props object. Only applies when the passed value is undefined.
     * Returns a shallow copy of the props object with default values applied.
     */
    withDefaultProps: (props: BlueprintProps, locale?: string) => BlueprintProps;
}
