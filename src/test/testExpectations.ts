'use server';

import { getFileOptions, getTestingOptions, type BlueprintSystemOptions } from '../config/options.js';
import BlueprintError from '../utils/BlueprintError.js';
import { startLocalServer, stopLocalServer, waitForServer } from './localServer.js';
import { testInPlaywright } from './playwright.js';
import { printResults } from './printResults.js';

import type { ChildProcess } from 'node:child_process';
import type { ValidationOutput } from '../ui/components/center/TestRunnerClient.js';

function extendOptions(runtimeOptions?: BlueprintSystemOptions['testingOptions']) {
    const configOptions = getTestingOptions();
    const options = Object.assign({}, configOptions, runtimeOptions);
    if (!options.serverCommand || !options.serverUrl) {
        throw new BlueprintError(`Valid testing options are required to run tests. For example:
testingOptions: {
    serverCommand: 'npm run start',
    serverUrl: 'http://localhost:3000/blueprint',
}`);
}
    return options;
}

export async function testExpectations(options?: BlueprintSystemOptions['testingOptions'], filter?: string) {
    const { serverCommand = '', serverUrl = '' } = extendOptions(options);
    const { componentsRoot } = getFileOptions();
    let server: ChildProcess | undefined;

    function handleError(err: any, context: string = '') {
        const contextMsg = context ? ` [${context}]` : '';
        console.log(`\n\nBlueprint Test Runner Error${contextMsg}:`);
        stopLocalServer(server);
        console.error(err);
        process.exit(1);
    }

    function exitFailing() {
        stopLocalServer(server);
        process.exit(1);
    }

    function exitPassing() {
        stopLocalServer(server);
        process.exit(0);
    }
    
    try {
        server = startLocalServer(serverCommand);
        if (!server) { throw new Error('Failed to start local server'); }
        await waitForServer(serverUrl);
    } catch (err) {
        handleError(err, `StartLocalServerError (${serverCommand})`);
    }

    let results: ValidationOutput | null = null;
    try {
        results = await testInPlaywright(serverUrl, handleError, filter);
    } catch (err) {
        handleError(err, 'PlaywrightTestError');
    }

    try {
        printResults(results, componentsRoot);
    } catch (err) {
        handleError(err, 'PrintResultsError');
    }

    if (!results || results.fail.length > 0) {
        exitFailing();        
    } else {
        exitPassing();
    }
}
