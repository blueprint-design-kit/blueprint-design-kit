'use client';

import { useContext } from 'react';
import { deserializeProps } from '../../utils/serializeProps.js';
import { useProps } from '../../providers/PropsProvider.js';
import { StateContext } from '../../providers/StateProvider.js';
import PropsExplorerItem from './PropsExplorerItem.js';

import type { BlueprintSchema, BlueprintProps } from '../../../blueprint/types.js';

const classPrefix = 'blueprint-layout-props-viewer-item';

export type PropsExplorerProps = {
    schema: BlueprintSchema | null | undefined;
    useClient?: boolean | undefined;
    useServer?: boolean | undefined;
}

export function PropsExplorerClient({ schema, useClient, useServer }: PropsExplorerProps) {
    // Store props in context so they can be updated interactively
    const { props: propsFromContext, updateProps } = useProps();
    let props: BlueprintProps = propsFromContext;

    // If props is an array (e.g. from a variant with multiple "props" entries), just show the first item in the PropsExplorer
    props = Array.isArray(props) ? props[0] : props;
    props = deserializeProps(props);

    const contextForState = useContext(StateContext);
    const { state, updateState } = contextForState || { updateState: () => {} };

    function schemaToArray(schema: BlueprintSchema, props?: BlueprintProps) {
        const items = [];
        for (const key of Object.keys(schema)) {
            items.push({
                key,
                value: props && props[key],
                schema: schema[key] as BlueprintSchema[keyof BlueprintSchema],
                onUpdate: (newValue: unknown) => {
                    updateProps({ key, value: newValue });
                },
            });
        }
        return items;
    }

    function stateToArray(state: BlueprintProps) {
        const items = [];
        for (const key of Object.keys(state)) {
            items.push({
                key,
                value: state[key],
                onUpdate: (newValue: unknown) => {
                    updateState({ key, value: newValue });
                },
            });
        }
        return items;
    }

    const hasSchema = schema && Object.keys(schema).length > 0;
    const hasState = state && Object.keys(state).length > 0;
    if (hasSchema || hasState) {
        return (<div className='blueprint-layout-props-viewer'>
            {hasSchema &&
                <div className="blueprint-layout-props-viewer-section">
                    <div className="blueprint-layout-props-viewer-label">Props Passed:</div>
                    <div>
                        {schemaToArray(schema, props).map((prop) => (
                            <div key={prop.key}>
                                <PropsExplorerItem
                                    classPrefix={classPrefix}
                                    name={prop.key}
                                    value={prop.value}
                                    schema={prop.schema}
                                    useClient={useClient}
                                    onUpdate={prop.onUpdate}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            }
            {hasState &&
                <div className="blueprint-layout-props-viewer-section">
                    <div className="blueprint-layout-props-viewer-label">State:</div>
                    <div>
                        {stateToArray(state).map((st) => (
                            <div key={st.key}>
                                <PropsExplorerItem
                                    classPrefix={classPrefix}
                                    name={st.key}
                                    value={st.value}
                                    onUpdate={st.onUpdate}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            }
        </div>);
    }

    return useClient || useServer ? ' ' : null;
}
