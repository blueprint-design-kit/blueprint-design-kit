'use client';

import {
    createContext,
    useEffect,
    useContext,
    useReducer as useReactReducer,
    useState as useReactState,
} from 'react';
import type { ActionDispatch, ReactNode } from 'react';
import type { BlueprintState } from '../../blueprint/types.js';

type SetStateAction<S> = S | ((prevState: S) => S);
type UpdateAction = { key: string; value: unknown; } | { state: unknown };
type BlueprintStateProvider = {
    state: BlueprintState,
    updateState: ActionDispatch<[action: UpdateAction]>;
};

function updateFn(prev: BlueprintState, action: UpdateAction): BlueprintState {
    const newState = (action as { state: unknown }).state;
    if (newState) {
        return Object.assign({}, prev, newState);
    }
    const { key, value } = action as { key: string; value: unknown; };
    return Object.assign({}, prev, {
        [key]: value,
    });
}

export const StateContext = createContext<BlueprintStateProvider>(null as unknown as BlueprintStateProvider);

export default function StateProvider({
    children,
    value,
}: {
    children: ReactNode;
    value: BlueprintState;
}) {
    const [ state, updateState ] = useReactReducer(updateFn, value);
    return <StateContext.Provider value={{ state, updateState }}>{children}</StateContext.Provider>;
}

export function useBlueprintState() {
    const { state, updateState } = useContext(StateContext) || {};
    return {
        state,
        updateState,
    };
}

type UseStateReturn<S> = [S, (value: SetStateAction<S>) => void];

export function useState<S>(key: string, initialState?: S | (() => S)): UseStateReturn<S> {
    if (!key || typeof key !== 'string') {
        throw new Error(`Blueprint's useState must be called with "key" as the first argument`);
    }
    const { state, updateState } = useBlueprintState();
    const initialValue = state && typeof state[key] !== 'undefined' ? state[key] : initialState;

    useEffect(() => {
        if (state && typeof state[key] === 'undefined') {
            // ensure that the initial value is set in state for use in PropsExplorer and other components
            state[key] = initialValue;
            updateState({ key, value: initialValue });
        }
    }, []);

    const [stateValue, setStateValue] = useReactState<S>(initialValue);

    const currentValue = state ? state[key] : stateValue;
    const setValue = (value: SetStateAction<S>) => {
        const newValue = typeof value === 'function' ? (value as (prev: S) => S)(currentValue) : value;
        if (state) {
            updateState({ key, value: newValue });
        }
        setStateValue(newValue); // this queues up a re-render of the component with the new state value
    }

    return [currentValue as S, setValue];
}


type AnyAction = any; // eslint-disable-line

export function useReducer<S, A extends AnyAction>(
    key: string,
    reducer: (prevState: S, action: A) => S,
    initialState?: S,
): [S, (action: A) => void] {
    if (!key || typeof key !== 'string') {
        throw new Error(`Blueprint's useReducer must be called with "key" as the first argument`);
    }
    const { state, updateState } = useBlueprintState();
    const initialValue = state && typeof state[key] !== 'undefined' ? state[key] : initialState;

    useEffect(() => {
        if (state && typeof state[key] === 'undefined') {
            // ensure that the initial value is set in state for use in PropsExplorer and other components
            state[key] = initialValue;
            updateState({ key, value: initialValue });
        }
    }, []);

    const [stateValue, dispatchStateChange] = useReactReducer<S, [A]>(
        reducer as (prevState: S, action: A) => S,
        initialValue as S,
    );

    const currentValue = state ? state[key] : stateValue;
    const updateValue = (action: A) => {
        const newValue = reducer(currentValue as S, action);
        if (state) {
            updateState({ key, value: newValue });
        }
        dispatchStateChange(action); // this queues up a re-render of the component with the new state value
    }

    return [currentValue as S, updateValue];
}
