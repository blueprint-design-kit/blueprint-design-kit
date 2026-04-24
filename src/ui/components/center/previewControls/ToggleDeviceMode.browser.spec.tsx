import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

vi.mock(import('../../../utils/urlParam.js'), () => ({
    setUrlParam: vi.fn(),
}));

import { setUrlParam } from '../../../utils/urlParam.js';
import { ToggleDeviceMode } from './ToggleDeviceMode';

describe('ToggleDeviceMode', () => {
    test('cycles to next device and updates URL param on click', async () => {
        const mockedSetUrlParam = vi.mocked(setUrlParam);
        render(<ToggleDeviceMode currentValue="mobile" includeTablet={false} />);

        await page.getByRole('img', { name: 'Switch to desktop' }).click();
        expect(mockedSetUrlParam).toHaveBeenCalledWith('device', 'desktop');
    });
});
