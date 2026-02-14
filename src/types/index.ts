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

export interface BlueprintConfig {
    schema: BlueprintSchema;
    variants?: BlueprintVariants;
    links?: BlueprintLinks;
    notes?: ReactNode;
}

export interface BlueprintInstance {
    name?: string;
    getLinks: () => BlueprintLinks;
    getNotes: () => ReactNode;
    getSchema: () => BlueprintSchema | undefined;
    getVariant: (variantName: string) => BlueprintVariant | undefined;
    listVariants: () => string[];
    validateProps: (props: BlueprintProps | undefined) => string | undefined;
    withDefaultProps: (props: BlueprintProps) => BlueprintProps;
}

export interface Blueprint {
    make: (blueprintName?: string) => BlueprintInstance;
}

// type FunctionComponent = React.FunctionComponent<React.PropsWithChildren>;

// interface BlueprintConstructor {
//     new (blueprintConfig: BlueprintConfig): MakeBlueprint;
// }

// export interface BlueprintFileManager {
//     __blueprintFileManager: true;
//     getBlueprint: (componentName: string) => Promise<BlueprintInstance | undefined>;
//     getComponent: (componentName: string) => Promise<FunctionComponent | undefined>;
//     listComponents: () => string[];
// }
