import type { ReactNode } from 'react';

import adobe from './links/adobe.js';
import atlassian from './links/atlassian.js';
import contentful from './links/contentful.js';
import figma from './links/figma.js';
import github from './links/github.js';
import google from './links/google.js';
import magento from './links/magento.js';
import npmjs from './links/npmjs.js';
import sketch from './links/sketch.js';
import shopify from './links/shopify.js';
import tableau from './links/tableau.js';

interface LinkType {
    label: string;
    icon: ReactNode;
}

export const genericIcon = <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="-6 -6 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
</svg>;

export const linkTypes: { [key: string]: LinkType } = {
    adobe,
    atlassian,
    contentful,
    figma,
    github,
    google,
    magento,
    npmjs,
    sketch,
    shopify,
    tableau,
};
