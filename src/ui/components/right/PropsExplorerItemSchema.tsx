import { htmlify } from '../../utils/htmlify.js';

import type { BlueprintSchemaEntry } from '../../../blueprint/types.js';

interface PropsExplorerItemSchemaProps {
    classPrefix: string;
    schema: BlueprintSchemaEntry;
    types: string[] | undefined;
};

export default function PropsExplorerItemSchema({
    classPrefix,
    schema,
    types,
}: PropsExplorerItemSchemaProps) {

    const typesJoined = types ? types.join(' | ') : '';

    let defaultValue;
    if (typeof schema.default !== 'undefined') {
        defaultValue = htmlify(schema.default, classPrefix);
    }

    let source;
    if (schema.source) {
        if (typeof schema.source === 'string') {
            const matchHyperlink = schema.source.match(/^https?:\/\/([\w.:-]+)/);
            if (matchHyperlink) {
                source = <a href={schema.source} target="_blank" rel="noreferrer">{matchHyperlink[1]}</a>;
            } else {
                source = <a href={schema.source} target="_blank" rel="noreferrer">
                    {schema.source.length > 30 ? `${schema.source.substring(0, 29)}...` : schema.source}
                </a>;
            }
        } else {
            source = <a href={schema.source.url} target="_blank" rel="noreferrer">{schema.source.tag}</a>;
        }
    }

    return <div className={`${classPrefix}-schema`}>
        <table>
            <tbody>
            {types && typesJoined && <tr>
                <td>Type:</td>
                <td className={`${classPrefix}-schema-type`}><code>{`{${typesJoined}}`}</code></td>
            </tr>}
            {defaultValue && <tr>
                <td>Default:</td>
                <td>
                    <code>{defaultValue.inline}</code>
                    {defaultValue.details}
                </td>
            </tr>}
            {source && <tr>
                <td>Source:</td>
                <td><code>{source}</code></td>
            </tr>}
            {schema.allow && <tr>
                <td>Allow:</td>
                <td>{
                    schema.allow.length > 1 ?
                    `[ ${schema.allow.map(h => htmlify(h, classPrefix).inline).join(', ')} ]`
                    : `[ ${schema.allow[0]} ]`}</td>
            </tr>}
            {typeof schema.min !== 'undefined' && <tr>
                <td>Min:</td>
                <td><code>{schema.min}</code></td>
            </tr>}
            {typeof schema.max !== 'undefined' && <tr>
                <td>Max:</td>
                <td><code>{schema.max}</code></td>
                </tr>}
            {schema.note && <tr>
                <td>Note:</td>
                <td><code>{schema.note}</code></td>
            </tr>}
            </tbody>
        </table>
    </div>;
}
