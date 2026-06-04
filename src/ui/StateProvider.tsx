'use client';
 
import {
    createContext,
    useContext,
    useEffect,
    useReducer as useReactReducer,
    useState as useReactState,
} from 'react';
import type { ReactNode } from 'react';
import type { BlueprintState } from '../blueprint/types.js';

function updateFn(prev: BlueprintState, action: { key: string; value: any }): BlueprintState {
    const { key, value } = action;
    return Object.assign({}, prev, {
        [key]: value,
    });
}

export const StateContext = createContext<BlueprintState>(null as unknown as BlueprintState);
 
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


type SetStateAction<S> = S | ((prevState: S) => S);

export function useState<S>(key: string, initialState?: S | (() => S)): [S, (value: SetStateAction<S>) => void] {
    if (!key || typeof key !== 'string') {
        throw new Error(`Blueprint's useState must be called with "key" as the first argument`);
    }
    const { state, updateState } = useContext(StateContext) || { state: null, updateState: null };
    const inStateProvider = state !== null;
    const initialValue = inStateProvider && typeof state[key] !== 'undefined' ? state[key] : initialState;

    useEffect(() => {
        if (inStateProvider && typeof state[key] === 'undefined') {
            // ensure that the initial value is set in state for use in PropsExplorer and other components
            state[key] = initialValue;
            updateState({ key, value: initialValue });
        }
    }, []);

    const [stateValue, setStateValue] = useReactState<S>(initialValue);

    const currentValue = inStateProvider ? state[key] : stateValue;
    const setValue = (value: SetStateAction<S>) => {
        const newValue = typeof value === 'function' ? (value as (prev: S) => S)(currentValue) : value;
        if (inStateProvider) {
            updateState({ key, value: newValue });
        }
        setStateValue(newValue); // this queues up a re-render of the component with the new state value
    }

    return [currentValue as S, setValue];
}


type AnyAction = any;

export function useReducer<S, A extends AnyAction>(
    key: string,
    reducer: (prevState: S, ...args: [] | [A]) => S,
    initialState?: S,
): [S, (action: A) => void] {
    if (!key || typeof key !== 'string') {
        throw new Error(`Blueprint's useReducer must be called with "key" as the first argument`);
    }
    const { state, updateState } = useContext(StateContext) || { state: null, updateState: null };
    const inStateProvider = state !== null;
    const initialValue = inStateProvider && typeof state[key] !== 'undefined' ? state[key] : initialState;

    useEffect(() => {
        if (inStateProvider && typeof state[key] === 'undefined') {
            // ensure that the initial value is set in state for use in PropsExplorer and other components
            state[key] = initialValue;
            updateState({ key, value: initialValue });
        }
    }, []);

    const [stateValue, dispatchStateChange] = useReactReducer<S, [A]>(
        reducer as (prevState: S, ...args: [] | [AnyAction]) => S,
        initialValue as S,
    );

    const currentValue = inStateProvider ? state[key] : stateValue;
    const updateValue = (action: A) => {
        const newValue = reducer(currentValue as S, action);
        if (inStateProvider) {
            updateState({ key, value: newValue });
        }
        dispatchStateChange(action); // this queues up a re-render of the component with the new state value
    }

    return [currentValue as S, updateValue];
}
