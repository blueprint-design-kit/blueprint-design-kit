'use server';

import { chromium } from 'playwright';
import { TEST_RUNNER_RESULTS_ID, TEST_RUNNER_URL_PATH } from '../config/constants.js';
import BlueprintError from '../utils/BlueprintError.js';

import type { ValidationOutput } from '../ui/components/center/TestRunnerClient.js';
import { printTextInBox } from '../utils/printTextInBox.js';

async function launchChromium() {
    try {
        return await chromium.launch({ headless: true });
    } catch (err) {
        if (String(err).includes('playwright install')) {
            throw new BlueprintError(printTextInBox([
                'Running blueprint tests requires installing Chromium for Playwright.',
                'This step is only required if you haven\'t already installed Playwright in this project.',
                'Please run: ',
                '  npx playwright install chromium',
            ]));
        }
        throw err;
    }
}

function print(msg: string) {
    console.log('');
    console.log(msg);
}

type HandleErrorFn = (err: any, context?: string) => void;

export async function testInPlaywright(serverUrl: string, handleError: HandleErrorFn, filter?: string) {
    let resultsJson: ValidationOutput | undefined;

    const browser = await launchChromium();
    try {
        const page = await browser.newPage();

        page.on('pageerror', (error) => {
            handleError(error, 'PlaywrightPageError');
        });

        const onSiteTestRunnerUrl = `${serverUrl}/${TEST_RUNNER_URL_PATH}${filter ? `/${filter}` : '/*'}`;
        print(`[Blueprint] Navigating to test runner page at '${onSiteTestRunnerUrl}'...`);
        const response = await page.goto(onSiteTestRunnerUrl, { waitUntil: 'networkidle' });
        if(response && response.status() < 400) {
            print(`[Blueprint] Locating page element '#${TEST_RUNNER_RESULTS_ID}'...`);
            const resultsData = await page.getByTestId(TEST_RUNNER_RESULTS_ID).getAttribute('data-results');
            print(`[Blueprint] Gathering results...`);
            if (resultsData) {
                try {
                    resultsJson = JSON.parse(resultsData);
                } catch {
                    handleError(`Failed to parse test results JSON:\n${resultsData}`, 'PlaywrightJSONParseError');
                }
            }
        } else {
            const error = new Error(`Failed to load test runner page at '${onSiteTestRunnerUrl}'. Received status: ${response ? response.status() : 'No Response'}`);
            handleError(error, 'PlaywrightNavigationError');
        }
    } catch (err) {
        handleError(err, 'PlaywrightTestError');
    }
    await browser.close();

    return resultsJson;
}
