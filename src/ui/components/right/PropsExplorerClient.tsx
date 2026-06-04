'use client';

import { useContext } from 'react';
import { formatExplorerItems, type ExplorerItem } from '../../utils/formatExplorerItems.js';
import { PropsContext } from '../../PropsProvider.js';
import { StateContext } from '../../StateProvider.js';

import type { BlueprintSchema, BlueprintProps } from '../../../blueprint/types.js';

export type PropsExplorerProps = {
    schema: BlueprintSchema | null | undefined;
    useClient?: boolean | undefined;
}

export function PropsExplorerClient({ schema, useClient }: PropsExplorerProps) {
    // Store props in context so they can be updated interactively 
    let { props, updateProps } = useContext(PropsContext);

    // If props is an array (e.g. from a variant with multiple "props" entries), just show the first item in the PropsExplorer
    props = Array.isArray(props) ? props[0] : props;

    const { state, updateState } = useContext(StateContext);

    function formatProps(schema: BlueprintSchema, props?: BlueprintProps) {
        const items: ExplorerItem[] = [];
        for (const key of Object.keys(schema)) {
            items.push({
                key,
                value: props && props[key],
                classPrefix: 'blueprint-layout-props-viewer-item',
                schema: schema[key] as BlueprintSchema[keyof BlueprintSchema],
                onUpdate: (newValue: any) => {
                    updateProps({ key, value: newValue });
                },
            });
        }
        return formatExplorerItems(items, useClient);
    }

    function formatState(state: BlueprintProps) {
        const items: ExplorerItem[] = [];
        for (const key of Object.keys(state)) {
            items.push({
                key,
                value: state[key],
                classPrefix: 'blueprint-layout-props-viewer-item',
                onUpdate: (newValue: any) => {
                    updateState({ key, value: newValue });
                },
            });
        }
        return formatExplorerItems(items, useClient);
    }
    
    if (!schema || !Object.keys(schema).length) {
        return null;
    }

    return (<div className='blueprint-layout-props-viewer'>
        <div className="blueprint-layout-props-viewer-section">
            <div className="blueprint-layout-props-viewer-label">Props Passed:</div>
            <div>
                {formatProps(schema, props).map((prop) => (
                    <div key={prop.key}>{prop.node}</div>
                ))}
            </div>
        </div>
    {state && Object.keys(state).length > 0 &&
        <div className="blueprint-layout-props-viewer-section">
            <div className="blueprint-layout-props-viewer-label">State:</div>
            <div>
                {formatState(state).map((st) => (
                    <div key={st.key}>{st.node}</div>
                ))}
            </div>
        </div>
    }
    </div>);
}
