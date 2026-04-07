'use client';

import type { ReactNode } from 'react';

function buildDetailsItem(key: string | number, val: any, classPrefix: string): ReactNode {
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

export function htmlify(val: any, classPrefix: string): { inline: string; details?: ReactNode } {
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

        } else if (val.$$typeof) {
            const reactElemType = val.type ? `<${val.type}${val.key ? `#${val.key}` : ''}>` : '';
            return {
                inline: `React${reactElemType}`,
            };

        } else if (val === val.self) {
            return {
                inline: 'window',
            };

        } else if (val.nodeType === 9) {
            return {
                inline: 'document',
            };

        } else if (val.nodeType === 1) {
            const tagName = (val.tagName || '').toLowerCase();
            const className = val.className && typeof val.className === 'string' && `.${val.className.trim().replace(/ +/g, '.')}` || '';
            return {
                inline: `${tagName}${val.id ? `#${val.id}` : ''}${className}`,
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
