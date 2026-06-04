'use client';

import type { ReactNode } from 'react';

function buildDetailsItem(key: string | number, val: unknown, classPrefix: string): ReactNode {
    const { inline, details } = htmlify(val, classPrefix);
    return <div key={key} className={`${classPrefix}-details-item`}>{details ?
            <details className={`${classPrefix}-details-expandable`}>
                <summary>{key}: {inline}</summary>
                {details}
            </details>
            : <div className={`${classPrefix}-details-inline`}>
                {key}: {inline}
            </div>}
        </div>;
}

export function htmlify(val: unknown, classPrefix: string): { inline: string; details?: ReactNode } {
    if (!val) { return { inline: String(val) }; }

    if (typeof val === 'function') {
        return { inline: 'function' };

    } else if (typeof val === 'string') {
        return {
            inline: `"${val}"`,
        };

    } else if (typeof val === 'object') {
        if (Array.isArray(val)) {
            return {
                inline: `[${val.length}]`,
                details: <div>{val.map((v, i) => {
                    return buildDetailsItem(i, v, classPrefix);
                })}</div>,
            };

        } else if ((val as { $$typeof: unknown }).$$typeof) {
            const reactVal = val as { type: unknown, key: unknown };
            const reactElemType = reactVal.type ? `<${reactVal.type}${reactVal.key ? `#${reactVal.key}` : ''}>` : '';
            return {
                inline: `React${reactElemType}`,
            };

        } else if (val === (val as typeof window).self) {
            return {
                inline: 'window',
            };

        } else if ((val as typeof document).nodeType === 9) {
            return {
                inline: 'document',
            };

        } else if ((val as HTMLDivElement).nodeType === 1) { // typed as HTMLDivElement but could be any
            const elemVal = val as HTMLDivElement;
            const tagName = (elemVal.tagName || '').toLowerCase();
            const className = elemVal.className && typeof elemVal.className === 'string' && `.${elemVal.className.trim().replace(/ +/g, '.')}` || '';
            return {
                inline: `${tagName}${elemVal.id ? `#${elemVal.id}` : ''}${className}`,
            };

        } else {
            return {
                inline: `{ ... }`,
                details: <div>{Object.entries(val).map(([k, v]) => {
                    return buildDetailsItem(k, v, classPrefix);
                })}</div>,
            };
        }
    }

    return {
        inline: String(val),
    };
}
