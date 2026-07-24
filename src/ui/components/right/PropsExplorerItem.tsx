'use client';

import PropsExplorerItemHeadline from './PropsExplorerItemHeadline.js';
import PropsExplorerItemSchema from './PropsExplorerItemSchema.js';

import type { BlueprintSchemaEntry } from '../../../blueprint/types.js';

interface PropsExplorerItemProps {
    classPrefix: string;
    name: string;
    value: unknown;
    schema?: BlueprintSchemaEntry;
    useClient?: boolean | undefined;
    onUpdate?: (newValue: unknown) => void;
}

export default function PropsExplorerItem({
    classPrefix,
    name,
    value,
    schema = {},
    useClient,
    onUpdate,
}: PropsExplorerItemProps) {
    const allow = schema.allow;

    let types: string[] | undefined = [];
    if (schema.type) {
        if (Array.isArray(schema.type)) {
            types = schema.type;
        } else if (typeof schema.type === 'string') {
            types = [schema.type];
        }
    }
    if (schema.optional) {
        types = types || [];
        types.push('undefined');
    }

    return <div className={`${classPrefix} ${typeof value === 'undefined' || value === null ? `${classPrefix}-undef` : `${classPrefix}-def`}`}>
        <PropsExplorerItemHeadline
            classPrefix={classPrefix}
            name={name}
            value={value}
            types={types}
            allow={allow}
            useClient={useClient}
            onUpdate={onUpdate}
        />
        <PropsExplorerItemSchema
            classPrefix={classPrefix}
            schema={schema}
            types={types}
        />
    </div>;
}
