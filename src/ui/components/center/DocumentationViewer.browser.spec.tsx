import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import DocumentationViewer from './DocumentationViewer';

describe('DocumentationViewer', () => {
    test('renders provided content', async () => {
        render(<DocumentationViewer content={<h2>Welcome Docs</h2>} />);

        await expect.element(page.getByRole('heading', { name: 'Welcome Docs' })).toBeInTheDocument();
    });

    test('applies reset class when styleReset is enabled', async () => {
        render(<DocumentationViewer content={<div>Body</div>} styleReset />);
        await expect.element(page.getByText('Body')).toBeInTheDocument();

        const root = document.querySelector('.blueprint-layout-documentation');
        expect(root).toBeTruthy();
        expect((root as HTMLElement).className).toContain('blueprint-reset');
    });
});
