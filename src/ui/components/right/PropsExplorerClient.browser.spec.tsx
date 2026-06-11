import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PropsContext } from '../../providers/PropsProvider';
import { StateContext } from '../../providers/StateProvider';
import { PropsExplorerClient } from './PropsExplorerClient';

describe('PropsExplorerClient', () => {
    test('renders props and state sections from context data', async () => {
        render(
            <PropsContext.Provider value={{ props: { title: 'Hello' }, updateProps: vi.fn() }}>
                <StateContext.Provider value={{ state: { open: true }, updateState: vi.fn() }}>
                    <PropsExplorerClient
                        useClient={false}
                        schema={{
                            title: { type: 'string' },
                        }}
                    />
                </StateContext.Provider>
            </PropsContext.Provider>,
        );

        await expect.element(page.getByText('Props Passed:')).toBeInTheDocument();
        await expect.element(page.getByText('State:')).toBeInTheDocument();
        await expect.element(page.getByText('title:')).toBeInTheDocument();
        await expect.element(page.getByText('open:')).toBeInTheDocument();
    });

    test('omits state section when state is not present', async () => {
        render(
            <PropsContext.Provider value={{ props: { title: 'Hello' }, updateProps: vi.fn() }}>
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
