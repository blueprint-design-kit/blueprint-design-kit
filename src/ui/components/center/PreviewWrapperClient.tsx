'use client';

import { useEffect, useState } from 'react';
import { getComponent } from '../../../blueprint/getComponent.js';
import { deserializeProps } from '../../utils/serializeProps.js';
import { useProps } from '../../providers/PropsProvider.js';
import PreviewMain from './PreviewMain.js';

import type { ComponentType, CSSProperties, ReactElement, ReactNode } from 'react';

const loadingComponentStyle: CSSProperties = {
    fontSize: 12,
    fontFamily: 'Monospace',
    color: 'gray',
    textAlign: 'center',
};

export interface PreviewWrapperProps {
    componentPath: string;
    expectation?: ReactNode | undefined;
}

export default function PreviewWrapperClient({ componentPath, expectation }: PreviewWrapperProps) {
    // Store props in context so they can be updated interactively
    let { props } = useProps();
    props = deserializeProps(props);
    const [FunctionComponent, setFunctionComponent] = useState<ComponentType<unknown> | null>(null);

    async function importComponent(selectedComponent: string) {
        const importedComponent = await getComponent(selectedComponent);
        if (!importedComponent) {
            throw new Error(`Component "${selectedComponent}" not found.`);
        }
        // Important: importedComponent is itself a Function, so we must wrap in a "setState" function here
        setFunctionComponent(() => importedComponent as ComponentType<unknown>);
    }

    useEffect(() => {
        importComponent(componentPath);
    }, [componentPath]);

    if (!FunctionComponent) {
        return <div className='blueprint-reset' style={loadingComponentStyle}>...loading...</div>;
    }

    let component: ReactElement;
    if (Array.isArray(props)) {
        component = <>
            {props.map((p = {}, i) => {
            return <FunctionComponent key={i} {...p} />;
        })}
        </>;
    } else {
        component = <FunctionComponent {...props} />;
    }

    return <PreviewMain component={component} expectation={expectation} />;
}
