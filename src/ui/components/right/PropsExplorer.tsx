import { PropsExplorerClient, type PropsExplorerProps } from './PropsExplorerClient.js';

export default function PropsExplorer({ schema, useClient, useServer }: PropsExplorerProps) {

    // Flatten schema types into strings to avoid passing functions into client components
    //  and avoid mutating the original schema
    const copyOfSchema = Object.assign({}, schema); // avoid mutating original schema
    for (const [key, schemaObject] of Object.entries(copyOfSchema)) {
        const copyOfSchemaObject = Object.assign({}, schemaObject); // avoid mutating original schema
        if (typeof copyOfSchemaObject.type === 'function') {
            copyOfSchemaObject.type = 'function';
        }
        copyOfSchema[key] = copyOfSchemaObject;
    }

    return <PropsExplorerClient schema={copyOfSchema} useClient={useClient} useServer={useServer} />;
}
