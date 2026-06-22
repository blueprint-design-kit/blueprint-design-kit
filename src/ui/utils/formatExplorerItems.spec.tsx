import { describe, test, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { formatExplorerItems } from './formatExplorerItems';

function render(node: React.ReactNode): string {
    return renderToStaticMarkup(createElement('div', null, node));
}

const noop = vi.fn();
const classPrefix = 'bp-prop';

describe('formatExplorerItems', () => {

    test('returns one item per input item with matching key', () => {
        const result = formatExplorerItems([
            { key: 'color', value: 'red', classPrefix, onUpdate: noop },
            { key: 'size', value: 42, classPrefix, onUpdate: noop },
        ]);

        expect(result).toHaveLength(2);
        expect(result[0]?.key).toBe('color');
        expect(result[1]?.key).toBe('size');
    });

    test('renders the prop key in the output', () => {
        const [item] = formatExplorerItems([
            { key: 'label', value: 'hello', classPrefix, onUpdate: noop },
        ]);

        const html = render(item?.node);
        expect(html).toContain('label:');
    });

    test('renders the value inline', () => {
        const [item] = formatExplorerItems([
            { key: 'count', value: 7, classPrefix, onUpdate: noop },
        ]);

        const html = render(item?.node);
        expect(html).toContain('7');
    });

    test('adds undef class modifier when value is undefined', () => {
        const [item] = formatExplorerItems([
            { key: 'opt', value: undefined, classPrefix, onUpdate: noop },
        ]);

        const html = render(item?.node);
        expect(html).toContain('bp-prop-undef');
    });

    test('adds def class modifier when value is defined', () => {
        const [item] = formatExplorerItems([
            { key: 'opt', value: 'present', classPrefix, onUpdate: noop },
        ]);

        const html = render(item?.node);
        expect(html).toContain('bp-prop-def');
    });

    test('renders HTTP source as anchor with hostname as label', () => {
        const [item] = formatExplorerItems([{
            key: 'variant',
            value: 'primary',
            classPrefix,
            schema: { source: 'https://design.example.com/tokens' },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('href="https://design.example.com/tokens"');
        // label shows only the hostname, not the path
        expect(html).toContain('>design.example.com<');
    });

    test('renders relative source as anchor with truncated path label', () => {
        const [item] = formatExplorerItems([{
            key: 'size',
            value: 'md',
            classPrefix,
            schema: { source: './tokens' },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('href="./tokens"');
        expect(html).toContain('./tokens');
    });

    test('truncates long relative source paths in label', () => {
        const longPath = './design/tokens/color/palette/extended.md';
        const [item] = formatExplorerItems([{
            key: 'color',
            value: 'blue',
            classPrefix,
            schema: { source: longPath },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('...');
    });

    test('renders object source with url and tag', () => {
        const [item] = formatExplorerItems([{
            key: 'theme',
            value: 'dark',
            classPrefix,
            schema: { source: { url: 'https://figma.com/file/abc', tag: 'Figma' } },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('href="https://figma.com/file/abc"');
        expect(html).toContain('Figma');
    });

    test('renders type row when schema has a string type', () => {
        const [item] = formatExplorerItems([{
            key: 'size',
            value: 'md',
            classPrefix,
            schema: { type: 'string' },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('Type:');
        expect(html).toContain('{string}');
    });

    test('renders joined types when schema.type is an array', () => {
        const [item] = formatExplorerItems([{
            key: 'size',
            value: 'md',
            classPrefix,
            schema: { type: ['string', 'number'] },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('{string | number}');
    });

    test('does not render type row when schema has no type', () => {
        const [item] = formatExplorerItems([{
            key: 'label',
            value: 'text',
            classPrefix,
            schema: {},
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).not.toContain('Type:');
    });

    test('appends "undefined" to types when schema.optional is true', () => {
        const [item] = formatExplorerItems([{
            key: 'label',
            value: undefined,
            classPrefix,
            schema: { type: 'string', optional: true },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('Type:');
        expect(html).toContain('{string | undefined}');
    });

    test('renders only "undefined" type when optional is true and no type is set', () => {
        const [item] = formatExplorerItems([{
            key: 'label',
            value: undefined,
            classPrefix,
            schema: { optional: true },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('Type:');
        expect(html).toContain('{undefined}');
    });

    test('renders default value row when schema has a default', () => {
        const [item] = formatExplorerItems([{
            key: 'size',
            value: 'lg',
            classPrefix,
            schema: { default: 'md' },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('Default:');
        // htmlify wraps strings in double quotes which are HTML-escaped in the output
        expect(html).toContain('&quot;md&quot;');
    });

    test('renders allow row with multiple values', () => {
        const [item] = formatExplorerItems([{
            key: 'size',
            value: 'sm',
            classPrefix,
            schema: { allow: ['sm', 'md', 'lg'] },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('Allow:');
        // htmlify wraps strings in double quotes; HTML-escaped in rendered output
        expect(html).toContain('&quot;sm&quot;');
        expect(html).toContain('&quot;md&quot;');
        expect(html).toContain('&quot;lg&quot;');
    });

    test('renders allow row with a single value', () => {
        const [item] = formatExplorerItems([{
            key: 'flag',
            value: true,
            classPrefix,
            schema: { allow: [true] },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('Allow:');
    });

    test('renders min and max rows when present in schema', () => {
        const [item] = formatExplorerItems([{
            key: 'opacity',
            value: 0.5,
            classPrefix,
            schema: { min: 0, max: 1 },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('Min:');
        expect(html).toContain('Max:');
    });

    test('renders color swatch span when schema type includes "color"', () => {
        const [item] = formatExplorerItems([{
            key: 'bg',
            value: '#ff0000',
            classPrefix,
            schema: { type: ['color'] },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).toContain('bp-prop-color-swatch');
    });

    test('does not render color swatch when schema type does not include "color"', () => {
        const [item] = formatExplorerItems([{
            key: 'label',
            value: 'text',
            classPrefix,
            schema: { type: 'string' },
            onUpdate: noop,
        }]);

        const html = render(item?.node);
        expect(html).not.toContain('bp-prop-color-swatch');
    });

    test('sets cursor to alias when useClient is true', () => {
        const [item] = formatExplorerItems(
            [{ key: 'size', value: 'md', classPrefix, onUpdate: noop }],
            true,
        );

        const html = render(item?.node);
        expect(html).toContain('cursor:alias');
    });

    test('sets cursor to default when useClient is false', () => {
        const [item] = formatExplorerItems(
            [{ key: 'size', value: 'md', classPrefix, onUpdate: noop }],
            false,
        );

        const html = render(item?.node);
        expect(html).toContain('cursor:default');
    });

});
