import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import PropsExplorerItemSchema from './PropsExplorerItemSchema';

describe('PropsExplorerItemSchema', () => {

    test('renders type row when types are provided', async () => {
        render(<PropsExplorerItemSchema classPrefix="bp" schema={{}} types={['string', 'number']} />);
        await expect.element(page.getByText('{string | number}')).toBeInTheDocument();
    });

    test('does not render type row when types is undefined', async () => {
        render(<PropsExplorerItemSchema classPrefix="bp" schema={{}} types={undefined} />);
        await expect.element(page.getByRole('table')).toBeInTheDocument();
        expect(document.querySelector('table')?.textContent ?? '').not.toContain('Type:');
    });

    test('renders default value row when schema.default is set', async () => {
        render(<PropsExplorerItemSchema classPrefix="bp" schema={{ default: 'hello' }} types={undefined} />);
        await expect.element(page.getByText('Default:')).toBeInTheDocument();
    });

    test('renders source as hyperlink with hostname when source is a URL', async () => {
        render(<PropsExplorerItemSchema classPrefix="bp" schema={{ source: 'https://example.com/docs' }} types={undefined} />);
        await expect.element(page.getByRole('link')).toBeInTheDocument();
        const link = document.querySelector('a');
        expect(link?.getAttribute('href')).toBe('https://example.com/docs');
        expect(link?.textContent).toBe('example.com');
    });

    test('renders source as truncated text when source is a long non-URL string', async () => {
        const longSource = 'this-is-a-long-source-string-that-exceeds-thirty-chars';
        render(<PropsExplorerItemSchema classPrefix="bp" schema={{ source: longSource }} types={undefined} />);
        await expect.element(page.getByRole('link')).toBeInTheDocument();
        const link = document.querySelector('a');
        expect(link?.textContent).toContain('...');
        expect(link?.textContent?.length).toBeLessThan(longSource.length);
    });

    test('renders source tag when source is an object with tag and url', async () => {
        render(<PropsExplorerItemSchema classPrefix="bp" schema={{ source: { tag: 'MDN', url: 'https://developer.mozilla.org' } }} types={undefined} />);
        await expect.element(page.getByText('MDN')).toBeInTheDocument();
        expect(document.querySelector('a')?.getAttribute('href')).toBe('https://developer.mozilla.org');
    });

    test('renders allow row with values', async () => {
        render(<PropsExplorerItemSchema classPrefix="bp" schema={{ allow: ['sm', 'md', 'lg'] }} types={undefined} />);
        await expect.element(page.getByText('Allow:')).toBeInTheDocument();
    });

    test('renders min row when schema.min is set', async () => {
        render(<PropsExplorerItemSchema classPrefix="bp" schema={{ min: 0 }} types={undefined} />);
        await expect.element(page.getByText('Min:')).toBeInTheDocument();
        await expect.element(page.getByText('0')).toBeInTheDocument();
    });

    test('renders max row when schema.max is set', async () => {
        render(<PropsExplorerItemSchema classPrefix="bp" schema={{ max: 100 }} types={undefined} />);
        await expect.element(page.getByText('Max:')).toBeInTheDocument();
        await expect.element(page.getByText('100')).toBeInTheDocument();
    });

    test('renders note row when schema.note is set', async () => {
        render(<PropsExplorerItemSchema classPrefix="bp" schema={{ note: 'must be a positive integer' }} types={undefined} />);
        await expect.element(page.getByText('Note:')).toBeInTheDocument();
        await expect.element(page.getByText('must be a positive integer')).toBeInTheDocument();
    });

    test('renders no table rows for an empty schema', async () => {
        render(<PropsExplorerItemSchema classPrefix="bp" schema={{}} types={undefined} />);
        await expect.element(page.getByRole('table')).toBeInTheDocument();
        expect(document.querySelectorAll('tr').length).toBe(0);
    });

});
