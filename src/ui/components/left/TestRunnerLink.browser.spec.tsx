import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { TEST_RUNNER_URL_PATH } from '../../../config/constants';
import TestRunnerLink from './TestRunnerLink';

describe('TestRunnerLink', () => {
    test('renders default test runner href and link text', async () => {
        render(<TestRunnerLink />);

        const link = page.getByRole('link', { name: /Run UI Tests/i });
        await expect.element(link).toHaveAttribute('href', `/blueprint/${TEST_RUNNER_URL_PATH}`);
    });

    test('renders custom baseUrl in href', async () => {
        render(<TestRunnerLink baseUrl="/design-system" />);

        const link = page.getByRole('link', { name: /Run UI Tests/i });
        await expect.element(link).toHaveAttribute('href', `/design-system/${TEST_RUNNER_URL_PATH}`);
    });
});
