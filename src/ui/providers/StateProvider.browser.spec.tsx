import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { useContext } from 'react';

import StateProvider, { StateContext, useBlueprintState, useState, useReducer } from './StateProvider';

// ─── useBlueprintState ───────────────────────────────────────────────────────

describe('useBlueprintState', () => {
    test('returns state and updateState from context', async () => {
        const updateState = vi.fn();
        function Harness() {
            const { state, updateState: fn } = useBlueprintState();
            return (
                <div>
                    <span data-testid="value">{JSON.stringify(state?.count)}</span>
                    <button onClick={() => fn({ key: 'count', value: 99 })}>Update</button>
                </div>
            );
        }

        render(
            <StateContext.Provider value={{ state: { count: 1 }, updateState }}>
                <Harness />
            </StateContext.Provider>,
        );

        await expect.element(page.getByTestId('value')).toHaveTextContent('1');

        await page.getByRole('button', { name: 'Update' }).click();
        expect(updateState).toHaveBeenCalledWith({ key: 'count', value: 99 });
    });

    test('returns undefined state and updateState outside a provider', async () => {
        function Harness() {
            const { state, updateState } = useBlueprintState();
            return (
                <div>
                    <span data-testid="state">{String(state)}</span>
                    <span data-testid="updater">{String(updateState)}</span>
                </div>
            );
        }

        render(<Harness />);

        await expect.element(page.getByTestId('state')).toHaveTextContent('undefined');
        await expect.element(page.getByTestId('updater')).toHaveTextContent('undefined');
    });

    test('supports bulk state merge via { state } action', async () => {
        function Harness() {
            const { state, updateState } = useBlueprintState();
            return (
                <div>
                    <span data-testid="a">{String(state?.a)}</span>
                    <span data-testid="b">{String(state?.b)}</span>
                    <button onClick={() => updateState({ state: { a: 'x', b: 'y' } })}>Merge</button>
                </div>
            );
        }

        render(
            <StateProvider value={{ a: 'initial', b: 'initial' }}>
                <Harness />
            </StateProvider>,
        );

        await expect.element(page.getByTestId('a')).toHaveTextContent('initial');

        await page.getByRole('button', { name: 'Merge' }).click();

        await expect.element(page.getByTestId('a')).toHaveTextContent('x');
        await expect.element(page.getByTestId('b')).toHaveTextContent('y');
    });
});

// ─── useState ────────────────────────────────────────────────────────────────

function UseStateHarness({ stateKey, initial }: { stateKey: string; initial?: unknown }) {
    const [value, setValue] = useState<unknown>(stateKey, initial);
    return (
        <div>
            <span data-testid="value">{JSON.stringify(value)}</span>
            <button onClick={() => setValue('updated')}>Set String</button>
            <button onClick={() => setValue((prev: unknown) => `${prev}!`)}>Append Bang</button>
        </div>
    );
}

describe('useState', () => {
    test('works outside a StateProvider using local React state', async () => {
        render(<UseStateHarness stateKey="count" initial={42} />);

        await expect.element(page.getByTestId('value')).toHaveTextContent('42');

        await page.getByRole('button', { name: 'Set String' }).click();
        await expect.element(page.getByTestId('value')).toHaveTextContent('"updated"');
    });

    test('accepts a function updater form', async () => {
        render(<UseStateHarness stateKey="msg" initial="hello" />);

        await expect.element(page.getByTestId('value')).toHaveTextContent('"hello"');

        await page.getByRole('button', { name: 'Append Bang' }).click();
        await expect.element(page.getByTestId('value')).toHaveTextContent('"hello!"');
    });

    test('reads initial value from StateProvider context', async () => {
        render(
            <StateContext.Provider value={{ state: { open: true }, updateState: vi.fn() }}>
                <UseStateHarness stateKey="open" initial={false} />
            </StateContext.Provider>,
        );

        // context value (true) takes precedence over initialState (false)
        await expect.element(page.getByTestId('value')).toHaveTextContent('true');
    });

    test('syncs updates back to StateProvider context', async () => {
        const updateState = vi.fn();
        render(
            <StateContext.Provider value={{ state: { count: 0 }, updateState }}>
                <UseStateHarness stateKey="count" initial={0} />
            </StateContext.Provider>,
        );

        await page.getByRole('button', { name: 'Set String' }).click();
        expect(updateState).toHaveBeenCalledWith({ key: 'count', value: 'updated' });
    });

    test('inside a real StateProvider both component and context see the update', async () => {
        function Readback() {
            const { state } = useContext(StateContext);
            return <span data-testid="ctx">{JSON.stringify(state?.msg)}</span>;
        }

        render(
            <StateProvider value={{ msg: 'initial' }}>
                <UseStateHarness stateKey="msg" initial="initial" />
                <Readback />
            </StateProvider>,
        );

        await expect.element(page.getByTestId('value')).toHaveTextContent('"initial"');

        await page.getByRole('button', { name: 'Set String' }).click();

        await expect.element(page.getByTestId('value')).toHaveTextContent('"updated"');
        await expect.element(page.getByTestId('ctx')).toHaveTextContent('"updated"');
    });

    test('throws when key argument is missing', () => {
        expect(() => {
            // @ts-expect-error intentionally passing no key
            useState();
        }).toThrow(`Blueprint's useState must be called with "key" as the first argument`);
    });
});

// ─── useReducer ──────────────────────────────────────────────────────────────

type CountAction = { type: 'increment' } | { type: 'add'; amount: number };

function countReducer(prev: number, action: CountAction): number {
    if (action.type === 'increment') { return prev + 1; }
    if (action.type === 'add') { return prev + action.amount; }
    return prev;
}

function UseReducerHarness({ stateKey, initial }: { stateKey: string; initial?: number }) {
    const [value, dispatch] = useReducer<number, CountAction>(stateKey, countReducer, initial ?? 0);
    return (
        <div>
            <span data-testid="value">{value}</span>
            <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
            <button onClick={() => dispatch({ type: 'add', amount: 5 })}>Add 5</button>
        </div>
    );
}

describe('useReducer', () => {
    test('works outside a StateProvider using local React state', async () => {
        render(<UseReducerHarness stateKey="count" initial={10} />);

        await expect.element(page.getByTestId('value')).toHaveTextContent('10');

        await page.getByRole('button', { name: 'Increment' }).click();
        await expect.element(page.getByTestId('value')).toHaveTextContent('11');

        await page.getByRole('button', { name: 'Add 5' }).click();
        await expect.element(page.getByTestId('value')).toHaveTextContent('16');
    });

    test('reads initial value from StateProvider context', async () => {
        render(
            <StateContext.Provider value={{ state: { count: 99 }, updateState: vi.fn() }}>
                <UseReducerHarness stateKey="count" initial={0} />
            </StateContext.Provider>,
        );

        // context value (99) takes precedence over initialState (0)
        await expect.element(page.getByTestId('value')).toHaveTextContent('99');
    });

    test('syncs updates back to StateProvider context', async () => {
        const updateState = vi.fn();
        render(
            <StateContext.Provider value={{ state: { count: 10 }, updateState }}>
                <UseReducerHarness stateKey="count" initial={10} />
            </StateContext.Provider>,
        );

        await page.getByRole('button', { name: 'Increment' }).click();
        expect(updateState).toHaveBeenCalledWith({ key: 'count', value: 11 });
    });

    test('inside a real StateProvider both component and context see the update', async () => {
        function Readback() {
            const { state } = useContext(StateContext);
            return <span data-testid="ctx">{state?.count}</span>;
        }

        render(
            <StateProvider value={{ count: 0 }}>
                <UseReducerHarness stateKey="count" initial={0} />
                <Readback />
            </StateProvider>,
        );

        await expect.element(page.getByTestId('value')).toHaveTextContent('0');

        await page.getByRole('button', { name: 'Add 5' }).click();

        await expect.element(page.getByTestId('value')).toHaveTextContent('5');
        await expect.element(page.getByTestId('ctx')).toHaveTextContent('5');
    });

    test('throws when key argument is missing', () => {
        expect(() => {
            // @ts-expect-error intentionally passing no key
            useReducer();
        }).toThrow(`Blueprint's useReducer must be called with "key" as the first argument`);
    });
});
