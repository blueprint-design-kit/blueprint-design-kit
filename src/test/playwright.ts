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

type HandleErrorFn = (err: any, context?: string) => void;

export async function testInPlaywright(serverUrl: string, handleError: HandleErrorFn, filter?: string) {
    let resultsJson: ValidationOutput | null = null;

    const browser = await launchChromium();
    try {
        const page = await browser.newPage();

        page.on('pageerror', (error) => {
            handleError(error, 'PlaywrightPageError');
        });

        const onSiteTestRunnerUrl = `${serverUrl}/${TEST_RUNNER_URL_PATH}${filter ? `/${filter}` : '/*'}`;
        await page.goto(onSiteTestRunnerUrl, { waitUntil: 'networkidle' });

        const resultsData = await page.getByTestId(TEST_RUNNER_RESULTS_ID).getAttribute('data-results');
        if (resultsData) {
            try {
                resultsJson = JSON.parse(resultsData);
            } catch {
                handleError(`Failed to parse test results JSON:\n${resultsData}`, 'PlaywrightJSONParseError');
            }
        }
    } catch (err) {
        handleError(err, 'PlaywrightTestError');
    }
    await browser.close();

    return resultsJson;
}
