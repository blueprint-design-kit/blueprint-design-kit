import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PropsContext } from '../../PropsProvider';
import { PropsExplorerClient } from './PropsExplorerClient';

describe('PropsExplorerClient', () => {
    test('renders props and state sections from context data', async () => {
        const setProps = vi.fn();

        render(
            <PropsContext.Provider value={{ props: { title: 'Hello', state: { open: true } }, setProps } as any}>
                <PropsExplorerClient
                    useClient={false}
                    schema={{
                        title: { type: 'string' },
                    }}
                />
            </PropsContext.Provider>,
        );

        await expect.element(page.getByText('Props Passed:')).toBeInTheDocument();
        await expect.element(page.getByText('State:')).toBeInTheDocument();
        await expect.element(page.getByText('title:')).toBeInTheDocument();
        await expect.element(page.getByText('open:')).toBeInTheDocument();
    });

    test('omits state section when state is not present', async () => {
        render(
            <PropsContext.Provider value={{ props: { title: 'Hello' }, setProps: vi.fn() } as any}>
                <PropsExplorerClient
                    useClient={false}
                    schema={{
                        title: { type: 'string' },
                    }}
                />
            </PropsContext.Provider>,
        );

        await expect.element(page.getByText('Props Passed:')).toBeInTheDocument();
        expect(document.body.textContent?.includes('State:')).toBe(false);
    });
});
