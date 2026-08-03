import { describe, test, expect } from 'vitest';
import { printTextInBox } from './printTextInBox';

describe('printTextInBox', () => {

    test('renders a basic boxed string', () => {
        const output = printTextInBox('Hello');
        expect(output).toBe(
`
┌───────┐
│ Hello │
└───────┘
`);
    });

    test('renders multiple lines from a single string', () => {
        const output = printTextInBox('A\nB');
        expect(output).toBe(
`
┌───┐
│ A │
│ B │
└───┘
`);
    });

    test('uses first line as title when usesTitle is true', () => {
        const output = printTextInBox(['Title', 'Line 1', 'Line 2'], { usesTitle: true });
        expect(output).toBe(
`
┌────────┐
│ Title  │
├────────┤
│ Line 1 │
│ Line 2 │
└────────┘
`);
    });

});
