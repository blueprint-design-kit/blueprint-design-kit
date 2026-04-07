import { isColorHex, isColorRGB, normalizeHex, convertRgbaToHex } from './colors.js';

function htmlEncode(str: string) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

export function printDiff(diff: HtmlDiffObject[]) {
    let hasTrueDiff = false;
    let acc = '';
    for (let i=0; i<diff.length; i+=1) {
        const current = diff[i] as HtmlDiffObject;
        const val = htmlEncode(current.value.trimEnd());
        if (val) {
            if (current.added || current.removed) {
                hasTrueDiff = true;
                const nextVal = diff[i+1]?.value || '';
                const spacesAndSemis = /\s*;?\s*/g;
                if (val.replace(spacesAndSemis, '') === nextVal.replace(spacesAndSemis, '')) {
                    acc += val;
                    i += 1;
                    continue;
                }
                if (isColorHex(val) && isColorRGB(nextVal) && normalizeHex(val) === convertRgbaToHex(nextVal)) {
                    acc += val;
                    i += 1;
                    continue;
                }
                if (isColorRGB(val) && isColorHex(nextVal) && convertRgbaToHex(val) === normalizeHex(nextVal)) {
                    acc += val;
                    i += 1;
                    continue;
                }
                acc += current.added ? `<ins>${val}</ins>` : `<del>${val}</del>`;
            } else {
                acc += val;
            }
        }
    }
    return hasTrueDiff ? acc : '';
}
