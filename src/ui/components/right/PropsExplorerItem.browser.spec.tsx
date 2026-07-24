import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import PropsExplorerItem from './PropsExplorerItem';

describe('PropsExplorerItem', () => {

    test('adds def class when value is defined', async () => {
        render(<PropsExplorerItem classPrefix="bp" name="size" value="large" />);
        await expect.element(page.getByText('size:')).toBeInTheDocument();
        expect(document.querySelector('.bp')?.classList.contains('bp-def')).toBe(true);
    });

    test('adds undef class when value is undefined', async () => {
        render(<PropsExplorerItem classPrefix="bp" name="size" value={undefined} />);
        await expect.element(page.getByText('size:')).toBeInTheDocument();
        expect(document.querySelector('.bp')?.classList.contains('bp-undef')).toBe(true);
    });

    test('adds undef class when value is null', async () => {
        render(<PropsExplorerItem classPrefix="bp" name="size" value={null} />);
        await expect.element(page.getByText('size:')).toBeInTheDocument();
        expect(document.querySelector('.bp')?.classList.contains('bp-undef')).toBe(true);
    });

    test('derives types from a string schema.type', async () => {
        render(<PropsExplorerItem classPrefix="bp" name="count" value={1} schema={{ type: 'number' }} />);
        await expect.element(page.getByText('{number}')).toBeInTheDocument();
    });

    test('derives types from an array schema.type', async () => {
        render(<PropsExplorerItem classPrefix="bp" name="label" value="hi" schema={{ type: ['string', 'number'] }} />);
        await expect.element(page.getByText('{string | number}')).toBeInTheDocument();
    });

    test('appends undefined to types when schema.optional is true', async () => {
        render(<PropsExplorerItem classPrefix="bp" name="label" value="hi" schema={{ type: 'string', optional: true }} />);
        await expect.element(page.getByText('{string | undefined}')).toBeInTheDocument();
    });

});
