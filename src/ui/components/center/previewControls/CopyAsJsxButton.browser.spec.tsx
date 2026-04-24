import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { CopyAsJsxButton } from './CopyAsJsxButton';

describe('CopyAsJsxButton', () => {
    test('shows failure feedback when selector target is missing', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        render(<CopyAsJsxButton selectorId="missing_node" />);

        const icon = page.getByRole('img', { name: 'Copy JSX to clipboard' });
        await expect.element(icon).toBeInTheDocument();
        await icon.click();

        expect(consoleSpy).toHaveBeenCalledOnce();
        await expect.element(page.getByText('Failed to copy')).toBeInTheDocument();
    });

    test('copies JSX and shows success feedback when selector target exists', async () => {
        const writeText = async () => undefined;
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            configurable: true,
        });

        const source = document.createElement('div');
        source.id = 'copy_target';
        source.innerHTML = '<button>Click</button>';
        document.body.appendChild(source);

        render(<CopyAsJsxButton selectorId="copy_target" />);

        const icon = page.getByRole('img', { name: 'Copy JSX to clipboard' });
        await icon.click();

        await expect.element(page.getByText('JSX copied to clipboard')).toBeInTheDocument();
    });
});
