'use client';

import { useRef, useState } from 'react';
import { parseValueFromString, parseValueType } from '../../../utils/parseValue.js';
import { htmlify } from '../../utils/htmlify.js';
import doneIcon from '../../icons/done.js';
import editIcon from '../../icons/edit.js';

interface PropsExplorerItemHeadlineProps {
    classPrefix: string;
    name: string;
    value: unknown;
    types: string[] | undefined;
    allow?: unknown[] | undefined;
    useClient?: boolean | undefined;
    onUpdate?: ((newValue: unknown) => void) | undefined;
};

export default function PropsExplorerItemHeadline({
    classPrefix,
    name,
    value,
    types,
    allow,
    useClient,
    onUpdate,
}: PropsExplorerItemHeadlineProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const colorRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);

    const { inline, details } = htmlify(value, classPrefix);
    const valueType = parseValueType(value);
    const valueIsEditable = typeof value !== 'function';

    function updateValue(newValue: unknown) {
        if (typeof onUpdate === 'function') {
            onUpdate(newValue);
        }
    }

    function handleEditStart() {
        setIsEditing(true);
    }

    function handleEditComplete() {
        let newValue;
        try {
            newValue = parseValueFromString(inputRef.current?.value || '');
        } catch {
            // The parse util will show a console warning for invalid inputs
            // We reject the change here and re-render the old value
            newValue = value;
        }
        updateValue(newValue);
        setIsEditing(false);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleEditComplete();
        }
    }

    function handleDropdownChange(event: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) {
        let newValue;
        try {
            newValue = parseValueFromString(event.target.value);
        } catch (err) {
            console.log('OOPS', err);
            throw err;
        }
        updateValue(newValue);
    }

    function handleColorSwatchClick() {
        if (colorRef.current) {
            colorRef.current.click();
        }
    }

    function handleColorPickerChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newValue = event.target.value;
        updateValue(newValue);
    }

    let valueContent;
    if (useClient) {
        if (Array.isArray(allow) && allow.length) {
            valueContent = <>
                <div className={`${classPrefix}-value-picker`}>
                    <select name={`${classPrefix}-value-select`} value={inline} onChange={handleDropdownChange}>
                        {allow.map((option) => {
                            const { inline: optionAsHtml } = htmlify(option, classPrefix);
                            return <option key={optionAsHtml} value={optionAsHtml}>{optionAsHtml}</option>
                        })}
                        {!allow.includes(value) &&
                            <option key={inline} value={inline}>{inline}</option>
                        }
                    </select>
                </div>
            </>;
        } else if (types && types.includes('color')) {
            const meetsInputReqs = typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);
            const valForInput = meetsInputReqs ? value : '#000000';
            valueContent = <>
                <input
                    ref={colorRef}
                    name={`${classPrefix}-color-picker`}
                    type="color"
                    value={valForInput}
                    style={{ width: 1, height: 1 }}
                    onChange={handleColorPickerChange}
                />
                <span
                    className={`${classPrefix}-color-swatch`}
                    style={{ backgroundColor: value as string, cursor: 'pointer' }}
                    onClick={handleColorSwatchClick}
                > </span>
                {inline}
            </>;
        } else {
            valueContent = <span className={`${classPrefix}-value-${valueType}`}>{inline}</span>;
        }
    } else {
        if (types && types.includes('color')) {
            valueContent = <>
                <span
                    className={`${classPrefix}-color-swatch`}
                    style={{ backgroundColor: value as string, cursor: 'default' }}
                > </span>
                {inline}
            </>;
        } else {
            valueContent = <span className={`${classPrefix}-value-${valueType}`}>{inline}</span>;
        }
    }

    let icon = null;
    if (useClient && valueIsEditable) {
        icon = isEditing ? {
            title: 'Save Value',
            content: doneIcon.icon,
            onClick: handleEditComplete,
        } : {
            title: 'Edit Value',
            content: editIcon.icon,
            onClick: handleEditStart,
        };
    }

    return <>
        <div className={`${classPrefix}-headline`}>
            <div className={`${classPrefix}-name`}>{name}:</div>
            {!isEditing &&
                <div className={`${classPrefix}-value`}>{valueContent}</div>
            }
            {icon &&
                <div className={`${classPrefix}-icon`} title={icon.title} onClick={icon.onClick}>
                    {icon.content}
                </div>
            }
        </div>
        {isEditing &&
            <div className={`${classPrefix}-editor`}>
                <textarea ref={inputRef} defaultValue={JSON.stringify(value)} onKeyDown={handleKeyDown} />
            </div>
        }
        <div className={`${classPrefix}-details`}>{details}</div>
    </>;
}
