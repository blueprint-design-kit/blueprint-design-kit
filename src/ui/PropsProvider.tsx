'use client';
 
import { createContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { BlueprintProps } from '../blueprint/types.js';

function propsUpdateFn(prev: BlueprintProps, action: { key: string; value: any }): BlueprintProps {
    const { key, value } = action;
    return Object.assign({}, prev, {
        [key]: value,
    });
}

export const PropsContext = createContext<BlueprintProps>(null as unknown as BlueprintProps);
 
export default function PropsProvider({
    children,
    value,
}: {
    children: ReactNode;
    value: BlueprintProps;
}) {
    const [ props, updateProps ] = useReducer(propsUpdateFn, value);
    return <PropsContext.Provider value={{ props, updateProps }}>{children}</PropsContext.Provider>;
}
