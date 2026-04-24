import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import LinksMenu from './LinksMenu';

describe('LinksMenu', () => {
    test('renders known link with inferred label and href', async () => {
        render(<LinksMenu links={['https://github.com/blueprint-design-kit/blueprint-design-kit']} />);

        const link = page.getByRole('link');
        await expect.element(link).toHaveAttribute('href', 'https://github.com/blueprint-design-kit/blueprint-design-kit');
        await expect.element(link).toHaveAttribute('title', 'GitHub');
    });

});
