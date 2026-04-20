import { describe, test, expect } from 'vitest';
import { printTextInBox } from './printTextInBox';

describe('printTextInBox', () => {

    test('renders a basic boxed string', () => {
        const output = printTextInBox('Hello');
        expect(output).toContain('┌');
        expect(output).toContain('└');
        expect(output).toContain('Hello');
    });

    test('renders multiple lines from a single string', () => {
        const output = printTextInBox('A\nB');
        expect(output).toContain('A');
        expect(output).toContain('B');
    });

    test('uses first line as title when usesTitle is true', () => {
        const output = printTextInBox(['Title', 'Line 1', 'Line 2'], { usesTitle: true });
        expect(output).toContain('Title');
        expect(output).toContain('├');
        expect(output).toContain('Line 1');
    });

});
