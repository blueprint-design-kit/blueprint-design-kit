import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import PageTitle from './PageTitle';

describe('PageTitle', () => {
    test('renders default title and baseUrl link', async () => {
        render(<PageTitle />);

        const link = page.getByRole('link', { name: 'Component Library' });
        await expect.element(link).toHaveAttribute('href', '/blueprint');
    });

    test('renders custom title and baseUrl', async () => {
        render(<PageTitle title="My Kit" baseUrl="/design-system" />);

        const link = page.getByRole('link', { name: 'My Kit' });
        await expect.element(link).toHaveAttribute('href', '/design-system');
    });
});
