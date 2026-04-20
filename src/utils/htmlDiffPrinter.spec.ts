import { describe, test, expect } from 'vitest';
import {
    htmlEncode,
    htmlDecode,
    areEffectivelyEqual,
    printDiff,
} from './htmlDiffPrinter';

type HtmlDiffObject = {
    count: number;
    added: boolean;
    removed: boolean;
    value: string;
}

describe('htmlDiffPrinter', () => {

    describe('htmlEncode', () => {

        test('encodes ampersands, angle brackets, and preserves other text', () => {
            expect(htmlEncode('<div>Tom & Jerry</div>')).toBe('&lt;div&gt;Tom &amp; Jerry&lt;/div&gt;');
        });

        test('returns strings unchanged when there are no special html characters', () => {
            expect(htmlEncode('plain text')).toBe('plain text');
        });

    });

    describe('htmlDecode', () => {

        test('decodes ampersands and angle bracket entities', () => {
            expect(htmlDecode('&lt;div&gt;Tom &amp; Jerry&lt;/div&gt;')).toBe('<div>Tom & Jerry</div>');
        });

        test('returns strings unchanged when there are no html entities', () => {
            expect(htmlDecode('plain text')).toBe('plain text');
        });

    });

    describe('areEffectivelyEqual', () => {

        test('treats whitespace and semicolon differences as equal', () => {
            expect(areEffectivelyEqual('color: red;', 'color:red')).toBe(true);
            expect(areEffectivelyEqual('  margin: 0  ; ', 'margin:0')).toBe(true);
        });

        test('treats equivalent hex and rgb colors as equal', () => {
            expect(areEffectivelyEqual('#ff0000', 'rgb(255, 0, 0)')).toBe(true);
            expect(areEffectivelyEqual('rgba(255, 0, 0, 1)', '#ff0000ff')).toBe(true);
            expect(areEffectivelyEqual('#abc', 'rgb(170, 187, 204)')).toBe(true);
        });

        test('returns false for genuinely different values', () => {
            expect(areEffectivelyEqual('color: red;', 'color: blue;')).toBe(false);
            expect(areEffectivelyEqual('#ff0000', 'rgb(0, 0, 255)')).toBe(false);
            expect(areEffectivelyEqual('display:block', 'display:none')).toBe(false);
        });

    });

    describe('printDiff', () => {

        test('returns an empty string when there are no actual additions or removals', () => {
            const diff: HtmlDiffObject[] = [
                { count: 1, added: false, removed: false, value: '<div>same</div>' },
            ];

            expect(printDiff(diff)).toBe('');
        });

        test('wraps added and removed segments in ins and del tags', () => {
            const diff: HtmlDiffObject[] = [
                { count: 1, added: false, removed: false, value: '<div>' },
                { count: 1, added: true, removed: false, value: 'new' },
                { count: 1, added: false, removed: true, value: 'old' },
                { count: 1, added: false, removed: false, value: '</div>' },
            ];

            expect(printDiff(diff)).toBe('&lt;div&gt;<ins>new</ins><del>old</del>&lt;/div&gt;');
        });

        test('drops paired diffs when direct values are effectively equal', () => {
            const diff: HtmlDiffObject[] = [
                { count: 1, added: false, removed: true, value: '#ff0000' },
                { count: 1, added: true, removed: false, value: 'rgb(255, 0, 0)' },
            ];

            expect(printDiff(diff)).toBe('#ff0000');
        });

        test('trims trailing whitespace before encoding diff output', () => {
            const diff: HtmlDiffObject[] = [
                { count: 1, added: false, removed: false, value: '<span>ok</span>   ' },
                { count: 1, added: true, removed: false, value: ' next   ' },
            ];

            expect(printDiff(diff)).toBe('&lt;span&gt;ok&lt;/span&gt;<ins> next</ins>');
        });

        test('ignores empty diff chunks after trimming', () => {
            const diff: HtmlDiffObject[] = [
                { count: 1, added: false, removed: false, value: '   ' },
                { count: 1, added: true, removed: false, value: '  ' },
            ];

            expect(printDiff(diff)).toBe('');
        });

    });

});
