import BlueprintError from '../../../utils/BlueprintError.js';
import { linkTypes, genericIcon } from './LinksMenuLinkTypes.js';

import type { BlueprintLinks } from '../../../blueprint/types.js';

const className = 'blueprint-layout-links-menu';

export type LinksMenuProps = {
    links: BlueprintLinks;
    reversed?: boolean;
}

export default function LinksMenu({ links, reversed }: LinksMenuProps) {
    if (!links) {
        throw new BlueprintError('Please provide a list of links');
    }
    if (links.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            {(reversed ? links.toReversed() : links).map((bpLink, i) => {
                if (typeof bpLink === 'string') {
                    bpLink = { url: bpLink };
                }

                const linkUrl = bpLink.url;
                if (typeof linkUrl !== 'string') { return null; }

                if (!linkUrl) {
                    return <div key={i} className={`${className}-item`}>
                        <div className={`${className}-empty`}></div>
                    </div>
                }

                let key = bpLink.type;
                if (!key) {
                    try {
                        const url = new URL(linkUrl);
                        const linkHostnameParts = url.hostname.split('.');
                        key = linkHostnameParts[linkHostnameParts.length - 2] || '';
                    } catch {
                        throw new BlueprintError(`Invalid Blueprint link[${i}] url: ${linkUrl}`);
                    }
                }

                const link = linkTypes[key] || {
                    label: key,
                    icon: genericIcon,
                };

                return <div key={i} className={`${className}-item`}>
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer" title={link.label}>
                        <div className={`${className}-icon`}>{bpLink.icon || link.icon}</div>
                    </a>
                </div>;
            })}
        </div>
    );
}
