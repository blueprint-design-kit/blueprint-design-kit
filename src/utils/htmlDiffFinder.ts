'use server'

import { HtmlDiffer } from '@markedjs/html-differ';

const htmlDiffer = new HtmlDiffer({
    ignoreSelfClosingSlash: true,
});

export async function findDiff(str1: string, str2: string) {
    return await htmlDiffer.diffHtml(str1, str2);
}
