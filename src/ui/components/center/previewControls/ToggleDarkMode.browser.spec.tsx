import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

vi.mock(import('../../../utils/urlParam.js'), () => ({
    setUrlParam: vi.fn(),
    removeUrlParam: vi.fn(),
}));

import { setUrlParam } from '../../../utils/urlParam.js';
import { ToggleDarkMode } from './ToggleDarkMode';

describe('ToggleDarkMode', () => {
    test('switches data-theme immediately and sets URL param after click', async () => {
        const mockedSetUrlParam = vi.mocked(setUrlParam);
        render(<ToggleDarkMode currentValue={undefined} customClassName="night" />);

        const icon = page.getByRole('img', { name: 'Switch to dark mode' });
        await expect.element(icon).toBeInTheDocument();
        await icon.click();

        const toggle = document.querySelector('.blueprint-layout-preview-control-dark-mode') as HTMLDivElement | null;
        expect(toggle?.getAttribute('data-theme')).toBe('dark');

        await new Promise((resolve) => setTimeout(resolve, 450));
        expect(mockedSetUrlParam).toHaveBeenCalledWith('dark', 'night');
    });
});
