import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { type ReactNode, useState } from 'react';

vi.mock(import('../../../blueprint/getComponent.js'), () => ({
    getComponent: vi.fn(async () => {
        return function MockComponent({ label }: { label?: string }) {
            return <div>Loaded Component {label || ''}</div>;
        };
    }),
}));

vi.mock(import('./PreviewMain.js'), () => ({
    default: ({ component }: { component: unknown }) => <div>{component as ReactNode}</div>,
}));

import { PropsContext } from '../../PropsProvider';
import { getComponent } from '../../../blueprint/getComponent.js';
import PreviewWrapperClient from './PreviewWrapperClient';

function RenderWithProps({ componentPath, props }: { componentPath: string; props: Record<string, unknown> }) {
    return (
        <PropsContext.Provider value={{ props, setProps: vi.fn() }}>
            <PreviewWrapperClient componentPath={componentPath} />
        </PropsContext.Provider>
    );
}

function PathSwitchHarness() {
    const [componentPath, setComponentPath] = useState('Cards/First');
    return (
        <>
            <button onClick={() => setComponentPath('Cards/Second')}>Switch Path</button>
            <RenderWithProps componentPath={componentPath} props={{}} />
        </>
    );
}

describe('PreviewWrapperClient', () => {
    test('loads and renders imported client component with context props', async () => {
        const mockedGetComponent = vi.mocked(getComponent);
        render(
            <PropsContext.Provider value={{ props: { label: 'OK' }, setProps: vi.fn() }}>
                <PreviewWrapperClient componentPath="Cards/ProductCard" />
            </PropsContext.Provider>,
        );

        await expect.element(page.getByText('Loaded Component OK')).toBeInTheDocument();
        expect(mockedGetComponent).toHaveBeenCalledWith('Cards/ProductCard');
    });

    test('shows loading UI while component import is pending', async () => {
        vi.mocked(getComponent).mockImplementationOnce(async () => {
            await new Promise((resolve) => setTimeout(resolve, 200));
            return function MockDelayed() {
                return <div>Delayed Component</div>;
            };
        });

        render(
            <PropsContext.Provider value={{ props: { label: 'Loading' }, setProps: vi.fn() }}>
                <PreviewWrapperClient componentPath="Cards/Delayed" />
            </PropsContext.Provider>,
        );

        await expect.element(page.getByText('...Loading client component...')).toBeInTheDocument();
    });

    test('renders one component per props entry when context props is an array', async () => {
        render(
            <PropsContext.Provider value={{ props: [{ label: 'A' }, { label: 'B' }], setProps: vi.fn() }}>
                <PreviewWrapperClient componentPath="Cards/ProductCard" />
            </PropsContext.Provider>,
        );

        await expect.element(page.getByText('Loaded Component A')).toBeInTheDocument();
        await expect.element(page.getByText('Loaded Component B')).toBeInTheDocument();
    });

    test('falls back to blank label when context props are empty', async () => {
        render(
            <PropsContext.Provider value={{ props: {}, setProps: vi.fn() }}>
                <PreviewWrapperClient componentPath="Cards/ProductCard" />
            </PropsContext.Provider>,
        );

        await expect.element(page.getByText('Loaded Component')).toBeInTheDocument();
    });

    test('re-imports component when componentPath changes', async () => {
        const mockedGetComponent = vi.mocked(getComponent);
        mockedGetComponent
            .mockImplementationOnce(async () => {
                return function FirstComponent() {
                    return <div>First Import</div>;
                };
            })
            .mockImplementationOnce(async () => {
                return function SecondComponent() {
                    return <div>Second Import</div>;
                };
            });

        render(<PathSwitchHarness />);
        await expect.element(page.getByText('First Import')).toBeInTheDocument();

        await page.getByRole('button', { name: 'Switch Path' }).click();
        await expect.element(page.getByText('Second Import')).toBeInTheDocument();

        expect(mockedGetComponent).toHaveBeenCalledWith('Cards/First');
        expect(mockedGetComponent).toHaveBeenCalledWith('Cards/Second');
    });
});
