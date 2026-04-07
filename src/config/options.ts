import deepExtend from 'deep-extend';
import { getOptionsFromConfig } from '../_blueprint_config.js';

/**
 * Set by the user in a blueprint.config.{ts|js} file in the root of their project.
 */
export interface BlueprintSystemOptions {

    fileOptions?: {
        /**
         * Path to the highest directory that contains all of your component and blueprint files
         *  (relative to the project root)
         */
        componentsRoot?: string;

        /**
         * Array of matchers for files to ignore
         * Passed to https://github.com/jergason/recursive-readdir
         */
        ignore?: string[];

        /**
         * The format of the file that will be generated to contain the imports.
         */
        importsFormat?: 'es6' | 'commonjs';
    };

    componentOptions?: {
        /**
         * RegEx used to identify "component" files
         *  1st capture group should return the key to use for this file in the component list
         */
        matchComponent?: string;

        /**
         * When true, Blueprint will open and look for a "use client" directive at the top of each component file.
         *   This enables the use of `getComponentMeta()` but can impact performance.
         */
        readComponentMeta?: boolean;

        /**
         * Controls how to handle components that are missing a blueprint.
         * "false" means no coverage warning will be given.
         */
        onMissingCoverage?: 'warn' | 'error' | false;

        /**
         * If true, a coverage report will be generated in the .blueprint folder.
         */
        saveCoverageReport?: boolean;
    },

    blueprintOptions?: {
        /**
         * RegEx used to identify "blueprint" files
         *  1st capture group should return the key to use for this file in the component list
         */
        matchBlueprint?: string;

        /**
         * Controls how to handle invalid blueprints.
         * "false" means no warning will be given.
         */
        onInvalidBlueprint?: 'warn' | 'error' | false;
    },

    testingOptions?: {
        serverCommand?: string;
        serverUrl?: string;
    },
    
}

/**
 * Blueprint's default options are set here.
 * These can be overridden by the user in a blueprint.config.{ts|js} file in the root of their project.
 */
const options: BlueprintSystemOptions = {
    fileOptions: {
        componentsRoot: './app/components',
        ignore: [
            '.**', // dot files
            '.**/**', // directories starting with dot (yes this has to be separate from dot files glob)
            'node_modules/**',
        ],
        importsFormat: 'es6',
    },
    componentOptions: {
        matchComponent: '^(.+?)(?:\\.component)?(?<!\\.(?:blueprint|specs?|tests?|mocks?|stories)|index)\\.(?:tsx|jsx)$',
        readComponentMeta: true,
        onMissingCoverage: 'warn',
        saveCoverageReport: true,
    },
    blueprintOptions: {
        matchBlueprint: '(.+)\\.blueprint\\.(tsx|ts|jsx|js)$',
        onInvalidBlueprint: 'error',
    },
    testingOptions: {
        serverCommand: 'npm run start',
        serverUrl: 'http://localhost:3000/blueprint',
    },
};


let userOptionsApplied = false;

export function setOptions(userOptions: BlueprintSystemOptions | undefined) {
    deepExtend(options, userOptions || {});
    userOptionsApplied = true;
}

function getOptions() {
    if (!userOptionsApplied) {
        const userOptions = getOptionsFromConfig();
        setOptions(userOptions);
    }
    return options;
}

export function getFileOptions() {
    return getOptions().fileOptions || {};
}

export function getComponentOptions() {
    return getOptions().componentOptions || {};
}

export function getBlueprintOptions() {
    return getOptions().blueprintOptions || {};
}

export function getTestingOptions() {
    return getOptions().testingOptions || {};
}