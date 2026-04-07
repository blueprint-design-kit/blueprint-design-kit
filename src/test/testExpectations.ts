'use server';

import { chromium } from 'playwright';
import { getTestingOptions, type BlueprintSystemOptions } from '../config/options.js';
import BlueprintError from '../utils/BlueprintError.js';
// import { startLocalServer } from './localServer.js';

async function launchChromium() {
    try {
        return await chromium.launch({ headless: true });
    } catch (err) {
        if (String(err).includes('playwright install')) {
            throw new BlueprintError(`
==========
== Running blueprint tests requires installing Chromium for Playwright.
== This step is only required if you haven't already installed Playwright in this project.
== Please run: 
==   npx playwright install chromium
==========`);
        }
        throw err;
    }
}

async function testInPlaywright() {
    const browser = await launchChromium();
    const page = await browser.newPage();

    await page.goto('https://example.com', { waitUntil: 'networkidle' });

    const selector = 'h1';

    // Wait for the element to be visible (rendered)
    await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });

    // Very rudimentary comparison logic outside of Playwright
    const text = await page.textContent(selector);
    const normalized = text?.trim() ?? '';

    const expected = 'Example Domain';

    if (normalized === expected) {
        console.log('PASS: element text matched expected');
    } else {
        console.error('FAIL: element text did not match');
        console.error('Expected:', expected);
        console.error('Received:', normalized);
        process.exitCode = 1;
    }

    await browser.close();
}

function getValidOptions(runtimeOptions?: BlueprintSystemOptions['testingOptions']) {
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

export async function testExpectations(options?: BlueprintSystemOptions['testingOptions']) {
    const { serverCommand, serverUrl } = getValidOptions(options);
    console.log(serverCommand, serverUrl);
    try {
        // const server = startLocalServer('npm run dev');
        await testInPlaywright();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
