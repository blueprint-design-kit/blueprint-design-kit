import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { vi } from 'vitest';
import { TEST_RUNNER_RESULTS_ID } from '../../../config/constants.js';

vi.mock(import('../../../utils/htmlDiffFinder.js'), () => ({
    findDiff: vi.fn(async () => []),
}));

vi.mock(import('../../../utils/htmlDiffPrinter.js'), () => ({
    printDiff: vi.fn(() => ''),
}));

import { TestRunnerClient } from './TestRunnerClient';
import type { ExpectationValidation } from '../../../blueprint/getTestValidations.js';

describe('TestRunnerClient', () => {
    test('prints zero totals when there are no validations', async () => {
        render(<TestRunnerClient validations={[]} />);

        await expect.element(page.getByText('Total Components: 0')).toBeInTheDocument();
        await expect.element(page.getByText('Passed (0)')).toBeInTheDocument();
        await expect.element(page.getByText('Skipped (0)')).toBeInTheDocument();
    });

    test('shows running state before final output', async () => {
        const validations: ExpectationValidation[] = [
            {
                componentName: 'ComponentSkip',
            },
        ];

        render(<TestRunnerClient validations={validations} />);

        await expect.element(page.getByText('Running UI Tests ...')).toBeInTheDocument();
        await expect.element(page.getByText('Total Components: 1')).toBeInTheDocument();
    });

    test('renders pass, fail, and skip groups from validation output', async () => {
        const validations: ExpectationValidation[] = [
            {
                componentName: 'ComponentPass',
                expectations: [
                    { variantName: 'default' },
                ],
            },
            {
                componentName: 'ComponentFail',
                expectations: [
                    { variantName: 'invalid', errorMessage: 'Invalid props supplied' },
                ],
            },
            {
                componentName: 'ComponentSkip',
            },
        ];

        render(<TestRunnerClient validations={validations} />);

        await expect.element(page.getByText('Total Components: 3')).toBeInTheDocument();
        await expect.element(page.getByText('Passed (1)')).toBeInTheDocument();
        await expect.element(page.getByText('Failed (1)')).toBeInTheDocument();
        await expect.element(page.getByText('Skipped (1)')).toBeInTheDocument();
        await expect.element(page.getByText('ComponentFail')).toBeInTheDocument();
        await expect.element(page.getByText('Invalid props supplied')).toBeInTheDocument();
        await expect.element(page.getByText('ComponentSkip')).toBeInTheDocument();

        const variantLink = page.getByRole('link', { name: 'invalid' });
        await expect.element(variantLink).toHaveAttribute('href', '../ComponentFail?variant=invalid');
    });

    test('writes hidden JSON payload for external result consumers', async () => {
        const validations: ExpectationValidation[] = [
            { componentName: 'ComponentPass', expectations: [{ variantName: 'default' }] },
            { componentName: 'ComponentSkip' },
        ];

        render(<TestRunnerClient validations={validations} />);

        await expect.element(page.getByText('Total Components: 2')).toBeInTheDocument();

        const resultsElement = document.querySelector(`[data-testid="${TEST_RUNNER_RESULTS_ID}"]`) as HTMLDivElement | null;
        expect(resultsElement).toBeTruthy();
        expect(resultsElement?.getAttribute('style')).toContain('display: none');

        const payload = resultsElement?.getAttribute('data-results');
        expect(payload).toBeTruthy();
        const parsed = JSON.parse(payload || '{}');
        expect(parsed.pass?.length).toBe(1);
        expect(parsed.skip?.length).toBe(1);
        expect(parsed.fail?.length).toBe(0);
    });
});
