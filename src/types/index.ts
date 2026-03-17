import type { ReactNode } from 'react';

export interface ComponentMeta {
    useClient?: boolean;
    useServer?: boolean;
}

export type ProjectFiles = {
    blueprints: Record<string, string>;
    components: Record<string, {
        path: string;
        meta: ComponentMeta;
    }>;
};

// As passed in by the user
export interface BlueprintSystemOptions {
    files?: {
        componentsRoot?: string;
        ignore?: string[];
        matchBlueprint?: string;
        matchComponent?: string;
        readComponentMeta?: boolean;
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
        readComponentMeta: boolean;
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

export interface BlueprintConfig {
    schema: BlueprintSchema;
    variants?: BlueprintVariants;
    links?: BlueprintLinks;
    notes?: ReactNode;
    locales?: Record<string, {
        schema?: BlueprintSchema;
        variants?: BlueprintVariants;
        links?: BlueprintLinks;
        notes?: ReactNode;
    }>;
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

export interface BlueprintImportsMap {
    [key: string]: {
        b: () => Promise<BlueprintInstance> | Promise<{ default: BlueprintInstance }> | Promise<undefined>;
        c: () => Promise<React.FunctionComponent> | Promise<{ default: React.FunctionComponent }> | Promise<undefined>;
        m: () => Promise<ComponentMeta> | Promise<undefined>;
    };
}
