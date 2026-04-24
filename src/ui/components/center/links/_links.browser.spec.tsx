import { describe, expect, test } from 'vitest';

import adobe from './adobe';
import atlassian from './atlassian';
import contentful from './contentful';
import figma from './figma';
import github from './github';
import google from './google';
import magento from './magento';
import npmjs from './npmjs';
import sketch from './sketch';
import shopify from './shopify';
import tableau from './tableau';
import { linkTypes } from '../LinksMenuLinkTypes';

type LinkModule = {
    label: string;
    icon: unknown;
};

const linkModules: Array<{ key: string; expectedLabel: string; value: LinkModule }> = [
    { key: 'adobe', expectedLabel: 'Adobe', value: adobe },
    { key: 'atlassian', expectedLabel: 'Atlassian', value: atlassian },
    { key: 'contentful', expectedLabel: 'Contentful', value: contentful },
    { key: 'figma', expectedLabel: 'Figma', value: figma },
    { key: 'github', expectedLabel: 'GitHub', value: github },
    { key: 'google', expectedLabel: 'Google', value: google },
    { key: 'magento', expectedLabel: 'Magento', value: magento },
    { key: 'npmjs', expectedLabel: 'npm', value: npmjs },
    { key: 'sketch', expectedLabel: 'Sketch', value: sketch },
    { key: 'shopify', expectedLabel: 'Shopify', value: shopify },
    { key: 'tableau', expectedLabel: 'Tableau', value: tableau },
];

describe('center/links module exports', () => {
    test('registers all link modules in linkTypes', () => {
        expect(Object.keys(linkTypes).sort()).toEqual(linkModules.map(({ key }) => key).sort());
    });

    test.each(linkModules)('exports correct properties for $key', ({ key, expectedLabel, value }) => {
        expect(value).toBeTruthy();
        expect(value.label).toBe(expectedLabel);
        expect(typeof value.label).toBe('string');
        expect(value.icon).toBeTruthy();
        expect(linkTypes[key]).toBe(value);
        expect((value.icon as { type?: unknown }).type).toBe('svg');
    });
});
