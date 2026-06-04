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

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function print(msg: string) {
    console.log('');
    console.log(msg);
}

export async function testExpectations(options?: BlueprintSystemOptions['testingOptions'], filter?: string) {
    const { serverCommand = '', serverUrl = '', timeout = 0 } = extendOptions(options);
    const { componentsRoot } = getFileOptions();
    let server: ChildProcess | undefined;

    function handleError(err: unknown, context: string = '') {
        const contextMsg = context ? ` [${context}]` : '';
        print(`\n\n[Blueprint] Test Runner Error${contextMsg}:`);
        console.error(err);
        exitFailing();
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
        print(`[Blueprint] Starting local server with '${serverCommand}' and waiting for 200 status from '${serverUrl}'...`);
        server = startLocalServer(serverCommand);
        if (!server) { throw new Error('Failed to start local server'); }
        await waitForServer(serverUrl);
    } catch (err) {
        handleError(err, `StartLocalServerError (${serverCommand})`);
        return;
    }

    await sleep(100); // Let the logs flush and server stabilize before running tests

    let results: ValidationOutput | undefined;
    try {
        print(`[Blueprint] Launching Playwright test suite...`);
        results = await testInPlaywright(serverUrl, handleError, { filter, timeout });
    } catch (err) {
        handleError(err, 'PlaywrightTestError');
        return;
    }

    try {
        printResults(results, componentsRoot);
    } catch (err) {
        handleError(err, 'PrintResultsError');
        return;
    }

    if (!results || results.fail.length > 0) {
        exitFailing();
    } else {
        exitPassing();
    }
}
