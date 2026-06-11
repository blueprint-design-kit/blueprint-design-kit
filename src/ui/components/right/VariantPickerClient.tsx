'use client';

import { setUrlParam } from '../../utils/urlParam.js';

const paramName = 'variant';

function onVariantSelect(selectElement: EventTarget & HTMLSelectElement, selectedVariant?: string) {
    const variantName = selectElement.value;
    selectElement.value = selectedVariant || '';
    setUrlParam(paramName, variantName);
}

export type VariantPickerProps = {
    variants: string[];
    selectedVariant?: string | undefined;
}

export function VariantPickerClient({ variants, selectedVariant }: VariantPickerProps) {
    if (!variants || variants.length < 1) {
        return null;
    }

    const uniqueArray = [...new Set(variants)];
    return (
        <div className="blueprint-layout-variant-picker-section">
            <select
                name="variant"
                className="blueprint-layout-variant-picker"
                defaultValue={selectedVariant}
                onChange={e => onVariantSelect(e.target, selectedVariant)}
            >
                {uniqueArray.map(variant => (
                    <option key={variant} value={variant}>{variant}</option>
                ))}
            </select>
        </div>
    );
}
