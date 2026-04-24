import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import TestRunnerLauncher from './TestRunnerLauncher';

describe('TestRunnerLauncher', () => {
    test('updates run button label when filter is entered', async () => {
        render(<TestRunnerLauncher />);

        await expect.element(page.getByRole('button', { name: 'Test all expectations »' })).toBeInTheDocument();
        await page.getByRole('textbox').fill('card');
        await expect.element(page.getByRole('button', { name: /Test matching expectations/i })).toBeInTheDocument();
    });
});
