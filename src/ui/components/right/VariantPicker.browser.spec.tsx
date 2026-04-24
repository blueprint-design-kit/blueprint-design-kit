import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import VariantPicker from './VariantPicker';

describe('VariantPicker', () => {
    test('renders unique variants and respects selected variant', async () => {
        render(<VariantPicker variants={['Primary', 'Secondary', 'Primary']} selectedVariant="Secondary" />);

        await expect.element(page.getByRole('combobox')).toBeInTheDocument();

        const select = document.querySelector('select') as HTMLSelectElement | null;
        expect(select).toBeTruthy();
        expect(select?.value).toBe('Secondary');
        expect(select?.querySelectorAll('option').length).toBe(2);
    });
});
