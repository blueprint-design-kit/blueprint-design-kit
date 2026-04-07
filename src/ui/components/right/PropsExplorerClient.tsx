'use client';

import { useContext } from 'react';
import { formatExplorerItems, type ExplorerItem } from '../../utils/formatExplorerItems.js';
import { PropsContext } from '../../PropsProvider.js';

import type { BlueprintSchema, BlueprintProps } from '../../../blueprint/types.js';

export type PropsExplorerProps = {
    schema: BlueprintSchema | null | undefined;
    useClient?: boolean | undefined;
}

export function PropsExplorerClient({ schema, useClient }: PropsExplorerProps) {
    // Store props in context so they can be updated interactively 
    let { props, setProps } = useContext(PropsContext);

    // If props is an array (e.g. from a variant with multiple "props" entries), just show the first item in the PropsExplorer
    props = Array.isArray(props) ? props[0] : props;

    function formatProps(schema: BlueprintSchema, props?: BlueprintProps) {
        const items: ExplorerItem[] = [];
        for (const key of Object.keys(schema)) {
            items.push({
                key,
                value: props && props[key],
                classPrefix: 'blueprint-layout-props-viewer-item',
                schema: schema[key] as BlueprintSchema[keyof BlueprintSchema],
                onUpdate: (newValue: any) => {
                    setProps(Object.assign({}, props, {
                        [key]: newValue,
                    }));
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
                    setProps(Object.assign({}, props, {
                        state: Object.assign({}, props?.state, {
                            [key]: newValue,
                        }),
                    }));
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
    {props && props['state'] &&
        <div className="blueprint-layout-props-viewer-section">
            <div className="blueprint-layout-props-viewer-label">State Passed:</div>
            <div>
                {formatState(props['state']).map((state) => (
                    <div key={state.key}>{state.node}</div>
                ))}
            </div>
        </div>
    }
    </div>);
}
