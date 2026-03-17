import deepExtend from 'deep-extend';
import { getOptionsFromConfig } from '../_blueprint_config';

import type { BlueprintSystemOptions, BlueprintOptionsWithDefaults } from '../types';

let userOptionsApplied = false;

/**
 * Blueprint's default options are set here.
 * These can be overridden by the user by passing options to the `withBlueprint` function.
 */
const options: BlueprintOptionsWithDefaults = {

    files: {
        /**
         * Path to the highest directory that contains all of your component and blueprint files
         *  (relative to the project root)
         */
        componentsRoot: './app/components',
        // componentsRoot: '.',

        /**
         * Array of matchers for files to ignore
         * Passed to https://github.com/jergason/recursive-readdir
         */
        ignore: [
            '.**', // dot files
            '.**/**', // directories starting with dot (yes this has to be separate from dot files glob)
            'node_modules/**',
        ],

        /**
         * RegEx to use for identifying "blueprint" files
         *  1st capture group should return the key to use for this file in the component list
         */
        matchBlueprint: '(.+)\\.blueprint\\.(tsx|ts|jsx|js)$',

        /**
         * RegEx to use for identifying "component" files
         *  1st capture group should return the key to use for this file in the component list
         */
        // matchComponent: '(.+)\\.component\\.(tsx|ts|jsx|js)$',
        matchComponent: '^(.+?)(?:\\.component)?(?<!\\.(?:blueprint|specs?|tests?|mocks?|stories)|index)\\.(?:tsx|jsx)$',

        /**
         * When true, Blueprint will open and look for a "use client" directive at the top of each component file.
         *   This enables the use of `getComponentMeta()` but can impact performance.
         */
        readComponentMeta: true,
    },

    /**
     * The format of the file that will be generated to contain the imports.
     */
    importsFormat: 'es6',

    /**
     * If true, a coverage report will be generated in the .blueprint folder.
     */
    saveCoverageReport: true,

    /**
     * Controls how to handle components that are missing a blueprint.
     * "false" means no coverage warning will be given.
     */
    onMissingCoverage: 'warn',

    /**
     * Controls how to handle invalid blueprints.
     * "false" means no warning will be given.
     */
    onInvalidBlueprint: 'error',

    /**
     * When true, forbids passing props or state to the default variant.
     */
    strictDefaults: true,

};

export function extendOptions(userOptions: BlueprintSystemOptions | undefined) {
    deepExtend(options, userOptions || {});
}

export function getOptions(): BlueprintOptionsWithDefaults {
    if (!userOptionsApplied) {
        const userOptions = getOptionsFromConfig();
        extendOptions(userOptions);
        userOptionsApplied = true;
    }
    return options;
}
