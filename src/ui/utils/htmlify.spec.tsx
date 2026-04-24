import { describe, test, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { htmlify } from './htmlify';

const prefix = 'bp';

function markup(node: React.ReactNode): string {
    return renderToStaticMarkup(createElement('div', null, node));
}

describe('htmlify', () => {

    describe('falsy primitives', () => {
        test('null', () => {
            expect(htmlify(null, prefix)).toEqual({ inline: 'null' });
        });

        test('undefined', () => {
            expect(htmlify(undefined, prefix)).toEqual({ inline: 'undefined' });
        });

        test('false', () => {
            expect(htmlify(false, prefix)).toEqual({ inline: 'false' });
        });

        test('0', () => {
            expect(htmlify(0, prefix)).toEqual({ inline: '0' });
        });

        test('empty string', () => {
            expect(htmlify('', prefix)).toEqual({ inline: '' });
        });
    });

    describe('functions', () => {
        test('returns "function" inline', () => {
            expect(htmlify(() => {}, prefix)).toEqual({ inline: 'function' });
        });

        test('named function', () => {
            function myFn() {}
            expect(htmlify(myFn, prefix)).toEqual({ inline: 'function' });
        });
    });

    describe('strings', () => {
        test('wraps value in double quotes', () => {
            expect(htmlify('hello', prefix)).toEqual({ inline: '"hello"' });
        });

        test('empty string is treated as falsy', () => {
            expect(htmlify('', prefix)).toEqual({ inline: '' });
        });
    });

    describe('numbers', () => {
        test('positive number', () => {
            expect(htmlify(42, prefix)).toEqual({ inline: '42' });
        });

        test('negative number', () => {
            expect(htmlify(-7, prefix)).toEqual({ inline: '-7' });
        });

        test('float', () => {
            expect(htmlify(3.14, prefix)).toEqual({ inline: '3.14' });
        });
    });

    describe('booleans', () => {
        test('true', () => {
            expect(htmlify(true, prefix)).toEqual({ inline: 'true' });
        });
    });

    describe('arrays', () => {
        test('inline shows length', () => {
            const result = htmlify([1, 2, 3], prefix);
            expect(result.inline).toBe('[3]');
        });

        test('empty array', () => {
            const result = htmlify([], prefix);
            expect(result.inline).toBe('[0]');
            expect(result.details).toBeDefined();
        });

        test('details renders a div with one item per element', () => {
            const result = htmlify(['a', 'b'], prefix);
            expect(result.details).toBeDefined();
            const html = markup(result.details);
            expect(html).toContain('bp-details-item');
            expect(html).toContain('&quot;a&quot;');
            expect(html).toContain('&quot;b&quot;');
        });

        test('details uses index as key label', () => {
            const result = htmlify(['x'], prefix);
            const html = markup(result.details);
            expect(html).toContain('0:');
        });

        test('nested array creates expandable details', () => {
            const result = htmlify([[1, 2]], prefix);
            const html = markup(result.details);
            expect(html).toContain('bp-details-expandable');
            expect(html).toContain('[2]');
        });
    });

    describe('React elements', () => {
        test('identifies a React element with a string type', () => {
            const elem = createElement('span', null, 'hi');
            const result = htmlify(elem, prefix);
            expect(result.inline).toBe('React<span>');
            expect(result.details).toBeUndefined();
        });

        test('includes key in inline when present', () => {
            const elem = createElement('div', { key: 'myKey' });
            const result = htmlify(elem, prefix);
            expect(result.inline).toBe('React<div#myKey>');
        });

        test('element without a type', () => {
            // Simulate an object with $$typeof but no type
            const fakeElem = { $$typeof: Symbol.for('react.element'), type: null };
            const result = htmlify(fakeElem, prefix);
            expect(result.inline).toBe('React');
        });
    });

    describe('DOM nodes', () => {
        test('document (nodeType 9)', () => {
            const fakeDoc = { nodeType: 9 };
            expect(htmlify(fakeDoc, prefix)).toEqual({ inline: 'document' });
        });

        test('element with tag, id, and class (nodeType 1)', () => {
            const fakeEl = { nodeType: 1, tagName: 'DIV', id: 'root', className: 'foo bar' };
            expect(htmlify(fakeEl, prefix)).toEqual({ inline: 'div#root.foo.bar' });
        });

        test('element without id or class', () => {
            const fakeEl = { nodeType: 1, tagName: 'P', id: '', className: '' };
            expect(htmlify(fakeEl, prefix)).toEqual({ inline: 'p' });
        });

        test('element with id but no class', () => {
            const fakeEl = { nodeType: 1, tagName: 'SECTION', id: 'main', className: '' };
            expect(htmlify(fakeEl, prefix)).toEqual({ inline: 'section#main' });
        });

        test('element with multiple classes', () => {
            const fakeEl = { nodeType: 1, tagName: 'SPAN', id: '', className: 'a  b  c' };
            const result = htmlify(fakeEl, prefix);
            expect(result.inline).toBe('span.a.b.c');
        });
    });

    describe('window', () => {
        test('object where val === val.self is treated as window', () => {
            const fakeWindow: Record<string, unknown> = {};
            fakeWindow['self'] = fakeWindow;
            expect(htmlify(fakeWindow, prefix)).toEqual({ inline: 'window' });
        });
    });

    describe('plain objects', () => {
        test('inline is "{ ... }"', () => {
            const result = htmlify({ a: 1 }, prefix);
            expect(result.inline).toBe('{ ... }');
        });

        test('details renders one item per key', () => {
            const result = htmlify({ x: 'hello', y: 42 }, prefix);
            expect(result.details).toBeDefined();
            const html = markup(result.details);
            expect(html).toContain('x:');
            expect(html).toContain('&quot;hello&quot;');
            expect(html).toContain('y:');
            expect(html).toContain('42');
        });

        test('empty object has details', () => {
            const result = htmlify({}, prefix);
            expect(result.inline).toBe('{ ... }');
            expect(result.details).toBeDefined();
        });

        test('nested object creates expandable details', () => {
            const result = htmlify({ nested: { a: 1 } }, prefix);
            const html = markup(result.details);
            expect(html).toContain('bp-details-expandable');
        });

        test('uses classPrefix in css classes', () => {
            const result = htmlify({ k: 'v' }, 'myprefix');
            const html = markup(result.details);
            expect(html).toContain('myprefix-details-item');
            expect(html).toContain('myprefix-details-inline');
        });
    });

});
