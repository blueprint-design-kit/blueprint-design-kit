import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

vi.mock(import('../../utils/urlParam.js'), () => ({
    getUrlParam: vi.fn(() => ''),
    setUrlParam: vi.fn(),
    removeUrlParam: vi.fn(),
}));

import { removeUrlParam, setUrlParam } from '../../utils/urlParam.js';
import { ComponentMenuClient } from './ComponentMenuClient';

describe('ComponentMenuClient', () => {
    test('renders component link with expected href', async () => {
        render(
            <ComponentMenuClient
                componentList={['Cards/ProductCard']}
                documentationList={['Welcome/Intro']}
                baseUrl="/design-system"
                componentPath="Cards/ProductCard"
                searchBar={false}
                activeState={{ filter: 'card' }}
            />,
        );

        const componentLink = page.getByRole('link', { name: 'ProductCard' });
        await expect.element(componentLink).toHaveAttribute('href', expect.stringContaining('/design-system/Cards/ProductCard'));
    });

    test('renders empty state when no components exist', async () => {
        render(<ComponentMenuClient componentList={[]} searchBar={false} />);
        await expect.element(page.getByText('No components found')).toBeInTheDocument();
    });

    test('updates filter URL param when typing in search input', async () => {
        const mockedSetUrlParam = vi.mocked(setUrlParam);
        render(
            <ComponentMenuClient
                componentList={['Cards/ProductCard', 'Buttons/PrimaryButton']}
                searchBar
            />,
        );

        await page.getByRole('searchbox').fill('card');
        expect(mockedSetUrlParam).toHaveBeenCalled();
        expect(mockedSetUrlParam.mock.calls.at(-1)).toEqual(['filter', 'card', true]);
    });

    test('removes filter URL param when search is cleared', async () => {
        const mockedRemoveUrlParam = vi.mocked(removeUrlParam);
        render(
            <ComponentMenuClient
                componentList={['Cards/ProductCard']}
                searchBar
            />,
        );

        await page.getByRole('searchbox').fill('x');
        await page.getByRole('searchbox').fill('');

        expect(mockedRemoveUrlParam).toHaveBeenCalledWith('filter', true);
    });
});
