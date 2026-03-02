import type { ReactNode } from 'react';

export type ProjectFiles = {
    blueprints: Record<string, string>;
    components: Record<string, string>;
};

// As passed in by the user
export interface BlueprintSystemOptions {
    files?: {
        componentsRoot?: string;
        ignore?: string[];
        matchBlueprint?: string;
        matchComponent?: string;
    };
    importsFormat?: 'es6' | 'commonjs';
    saveCoverageReport?: boolean;
    onMissingCoverage?: 'warn' | 'error' | false;
    onInvalidBlueprint?: 'warn' | 'error' | false;
    strictDefaults?: boolean;
}

export interface BlueprintOptionsWithDefaults {
    files: {
        componentsRoot: string;
        ignore: string[];
        matchBlueprint: string;
        matchComponent: string;
    };
    importsFormat: 'es6' | 'commonjs';
    saveCoverageReport: boolean;
    onMissingCoverage: 'warn' | 'error' | false;
    onInvalidBlueprint: 'warn' | 'error' | false;
    strictDefaults: boolean;
}

export type BlueprintSchemaType = string | string[] | ((propValue: any) => Boolean);

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
    state?: BlueprintState | BlueprintState[];
    expectation?: ReactNode;
}
interface BlueprintVariants {
    [key: string]: BlueprintVariant | undefined;
}

interface BlueprintLink {
    url: string;
    type?: string;
    icon?: ReactNode;
}
export type BlueprintLinks = (string | BlueprintLink)[];

interface BlueprintConfigBase {
    schema: BlueprintSchema;
    variants?: BlueprintVariants;
    links?: BlueprintLinks;
    notes?: ReactNode;
}
export interface BlueprintConfig extends BlueprintConfigBase {
    locales?: Record<string, BlueprintConfigBase>;
}

export interface BlueprintInstance {
    getLinks: (locale?: string) => BlueprintLinks;
    getNotes: (locale?: string) => ReactNode;
    getSchema: (locale?: string) => BlueprintSchema | undefined;
    getVariant: (variantName: string, locale?: string) => BlueprintVariant | undefined;
    listVariants: (locale?: string) => string[];
    validateProps: (props: BlueprintProps | undefined, locale?: string) => string | undefined;
    withDefaultProps: (props: BlueprintProps, locale?: string) => BlueprintProps;
}

export interface Blueprint {
    make: (blueprintName?: string) => BlueprintInstance;
}
