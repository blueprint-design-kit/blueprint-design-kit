import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

vi.mock(import('../../utils/urlParam.js'), () => ({
    setUrlParam: vi.fn(),
}));

import { VariantPickerClient } from './VariantPickerClient';

describe('VariantPickerClient', () => {
    test('renders unique options and selected variant', async () => {
        render(<VariantPickerClient variants={['Primary', 'Secondary', 'Primary']} selectedVariant="Secondary" />);

        await expect.element(page.getByRole('combobox')).toBeInTheDocument();

        const select = document.querySelector('select') as HTMLSelectElement | null;
        expect(select).toBeTruthy();
        expect(select?.value).toBe('Secondary');
        expect(select?.querySelectorAll('option').length).toBe(2);
    });

});
