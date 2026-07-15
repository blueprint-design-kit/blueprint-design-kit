import { isColorHex, isColorRGB, normalizeHex, convertRgbaToHex } from './colors.js';

export function htmlEncode(str: string) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

export function htmlDecode(str: string) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

export function areEffectivelyEqual(val: string, nextVal: string) {
    const spacesAndSemis = /\s*;?\s*/g;
    if (val.replace(spacesAndSemis, '') === nextVal.replace(spacesAndSemis, '')) {
        return true;
    }
    if (isColorHex(val) && isColorRGB(nextVal) && normalizeHex(val) === convertRgbaToHex(nextVal)) {
        return true;
    }
    if (isColorRGB(val) && isColorHex(nextVal) && convertRgbaToHex(val) === normalizeHex(nextVal)) {
        return true;
    }
    if ((val.startsWith('none') && nextVal === 'initial') || (val === 'initial' && nextVal.startsWith('none'))) {
        return true; // handles cases like "border: none" vs "border: initial"
    }
    return false;
}

export function printDiff(diff: HtmlDiffObject[]) {
    let hasTrueDiff = false;
    let acc = '';
    for (let i = 0; i < diff.length; i += 1) {
        const current = diff[i] as HtmlDiffObject;
        const val = htmlEncode(current.value.trimEnd());
        if (val) {
            if (current.added || current.removed) {
                const next = diff[i + 1] as HtmlDiffObject | undefined;
                const nextVal = htmlEncode((next?.value || '').trimEnd());
                if (areEffectivelyEqual(val, nextVal)) {
                    acc += val;
                    i += 1;
                    continue;
                }
                hasTrueDiff = true;
                acc += current.added ? `<ins>${val}</ins>` : `<del>${val}</del>`;
            } else {
                acc += val;
            }
        }
    }
    return hasTrueDiff ? acc : '';
}
