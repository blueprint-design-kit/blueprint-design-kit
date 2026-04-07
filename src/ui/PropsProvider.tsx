'use client';
 
import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { BlueprintProps } from '../blueprint/types.js';
  
export const PropsContext = createContext<BlueprintProps>({});
 
export default function PropsProvider({
    children,
    value,
}: {
    children: ReactNode;
    value: BlueprintProps;
}) {
    const [ props, setProps ] = useState<BlueprintProps>(value);
    return <PropsContext.Provider value={{ props, setProps }}>{children}</PropsContext.Provider>;
}
