'use client';

import { htmlify } from './htmlify.js';
import { parseValueFromString, parseValueType } from '../../utils/parseValue.js';

import type { MouseEvent, ReactNode } from 'react';
import type { BlueprintSchema } from '../../blueprint/types.js';

export interface ExplorerItem {
    key: string;
    value: unknown;
    classPrefix: string;
    schema?: BlueprintSchema[keyof BlueprintSchema];
    onUpdate: (newValue: unknown) => void;
}

export function formatExplorerItems(items: ExplorerItem[], useClient?: boolean) {
    const formatted: { key: string; node: ReactNode }[] = [];
    items.forEach(({ key, value, classPrefix, schema = {}, onUpdate }) => {
        const { inline, details } = htmlify(value, classPrefix);
        const valueType = parseValueType(value);

        let defaultValue;
        if (schema.default) {
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

        let types: string[] | undefined;
        if (schema.type) {
            if (Array.isArray(schema.type)) {
                types = schema.type;
            } else if (typeof schema.type === 'string') {
                types = [schema.type];
            }
        }
        const typesJoined = types ? types.join(' | ') : '';

        function showEditable(elem: HTMLElement) {
            if (elem.dataset['editing'] === 'true') { return; }
            elem.dataset['editing'] = 'true';
            elem.style.display = 'none';
            const parent = elem.parentElement;
            if (!parent) { return; }
            let editable: HTMLInputElement | HTMLTextAreaElement = document.createElement('input');
            const expectsLongFormat = types && (types.includes('object') || typesJoined.includes('['));
            const currentlyContainsLongFormat = valueType === 'object' || (typeof value === 'string' && value.length > 25);
            if (expectsLongFormat || currentlyContainsLongFormat) {
                editable = document.createElement('textarea');
                parent.style.width = '100%';
            }
            editable.value = JSON.stringify(value);
            editable.style.width = '100%';
            editable.style.marginLeft = '5px';
            parent.appendChild(editable);
            const handleUpdate = () => {
                try {
                    value = parseValueFromString(editable.value);
                } catch {
                    // If parsing fails, keep the old value
                }
                parent.removeChild(editable);
                parent.style.width = 'unset';
                onUpdate(value);
                elem.style.display = 'inline-block';
                elem.dataset['editing'] = 'false';
            };
            editable.onblur = handleUpdate;
            editable.onkeydown = (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    editable.blur();
                }
            };
            editable.focus();
        }

        function handleValueClicked(event: MouseEvent) {
            if (!useClient) { return; }
            const target = event.target as HTMLElement;
            const currentTarget = event.currentTarget as HTMLElement;
            if (target.className === `${classPrefix}-color-swatch`) {
                const colorPicker = document.createElement('input');
                colorPicker.className = `${classPrefix}-color-picker`;
                colorPicker.type = 'color';
                colorPicker.value = value as string;
                colorPicker.style.width = '1px';
                colorPicker.style.height = '1px';
                currentTarget.appendChild(colorPicker);
                colorPicker.onchange = () => {
                    const newColor = colorPicker.value;
                    value = newColor;
                    onUpdate(newColor);
                    target.style.backgroundColor = newColor;
                    currentTarget.removeChild(colorPicker);
                    const textValueNode = currentTarget.childNodes[1];
                    if (textValueNode) {
                        textValueNode.textContent = newColor;
                    }
                };
                setTimeout(() => {
                    colorPicker.click();
                }, 10);
            } else if (target.className === `${classPrefix}-color-picker`) {
                // do nothing, the color picker is active
            } else {
                showEditable(currentTarget);
            }
        }

        formatted.push({
            key,
            node: <div className={`${classPrefix} ${typeof value === 'undefined' || value === null ? `${classPrefix}-undef` : `${classPrefix}-def`}`}>
                <div>
                    <div className={`${classPrefix}-key`}>{key}:</div>
                    <div className={`${classPrefix}-value-holder`} style={{ display: 'inline-block', minWidth: 150 }}>
                        <div className={`${classPrefix}-value`} style={{ cursor: useClient ? 'alias' : 'default' }} onClick={handleValueClicked}>
                            {types && types.includes('color') &&
                            <span className={`${classPrefix}-color-swatch`} style={{ backgroundColor: value as string }}> </span>}
                            <span className={`${classPrefix}-value-${valueType}`}>{inline}</span>
                        </div>
                    </div>
                    <div className={`${classPrefix}-details`}>{details}</div>
                </div>
                <div className={`${classPrefix}-schema`}>
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
                        </tbody>
                    </table>
                </div>
            </div>,
        });
    });
    return formatted;
}
