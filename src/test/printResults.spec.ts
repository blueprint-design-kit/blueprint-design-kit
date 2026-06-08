import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { printResults } from './printResults';

// Strip ANSI escape codes so assertions don't depend on terminal color support
function stripAnsi(str: string) {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1B\[[0-9;]*m/g, '');
}

function getLoggedLines(consoleSpy: ReturnType<typeof vi.spyOn>): string[] {
    return consoleSpy.mock.calls
        .flat()
        .map(arg => stripAnsi(String(arg)));
}

const passing = { componentName: 'Atoms/Button', passingVariants: ['default'] };
const failing = { componentName: 'Atoms/Card', failingVariant: 'dark', errorMessage: undefined };
const failingWithMsg = { componentName: 'Atoms/Link', failingVariant: 'hover', errorMessage: 'Expected <a> but got <span>' };
const skipped = { componentName: 'Atoms/Icon' };

describe('printResults', () => {

    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('throws when results is undefined', () => {
        expect(() => printResults(undefined)).toThrow('No test results to print');
    });

    test('logs PASS and correct counts when all components pass', () => {
        printResults({ pass: [passing], fail: [], skip: [] });

        const lines = getLoggedLines(consoleSpy);
        const allOutput = lines.join('\n');

        expect(allOutput).toContain('PASS');
        expect(allOutput).toContain('Passed: 1');
        expect(allOutput).toContain('Failed: 0');
        expect(allOutput).toContain('Skipped: 0');
        expect(allOutput).toContain('Total Components: 1');
    });

    test('logs FAIL and correct counts when components fail', () => {
        printResults({ pass: [], fail: [failing], skip: [] });

        const lines = getLoggedLines(consoleSpy);
        const allOutput = lines.join('\n');

        expect(allOutput).toContain('FAIL');
        expect(allOutput).toContain('Passed: 0');
        expect(allOutput).toContain('Failed: 1');
        expect(allOutput).toContain('Total Components: 1');
    });

    test('logs NONE when all arrays are empty', () => {
        printResults({ pass: [], fail: [], skip: [] });

        const lines = getLoggedLines(consoleSpy);
        expect(lines.join('\n')).toContain('NONE');
    });

    test('includes failing component name and variant in output', () => {
        printResults({ pass: [], fail: [failing], skip: [] });

        const lines = getLoggedLines(consoleSpy);
        const allOutput = lines.join('\n');

        expect(allOutput).toContain('Atoms/Card');
        expect(allOutput).toContain('dark');
    });

    test('logs error message when failing result has errorMessage', () => {
        printResults({ pass: [], fail: [failingWithMsg], skip: [] });

        const lines = getLoggedLines(consoleSpy);
        expect(lines.join('\n')).toContain('Expected <a> but got <span>');
    });

    test('logs skipped section when there are skipped components', () => {
        printResults({ pass: [passing], fail: [], skip: [skipped] });

        const lines = getLoggedLines(consoleSpy);
        const allOutput = lines.join('\n');

        expect(allOutput).toContain('Skipped: 1');
        expect(allOutput).toContain('Atoms/Icon');
    });

    test('does not log skipped section when there are no skipped components', () => {
        printResults({ pass: [passing], fail: [], skip: [] });

        const lines = getLoggedLines(consoleSpy);
        expect(lines.join('\n')).not.toContain('Blueprint Tests Skipped');
    });

    test('prepends componentsRoot to component names', () => {
        printResults({ pass: [], fail: [failing], skip: [] }, './src/components');

        const lines = getLoggedLines(consoleSpy);
        expect(lines.join('\n')).toContain('./src/components/Atoms/Card');
    });

    test('handles multiple pass, fail, and skip items with correct totals', () => {
        printResults({
            pass: [passing, { componentName: 'Atoms/Input', passingVariants: [] }],
            fail: [failing, failingWithMsg],
            skip: [skipped],
        });

        const lines = getLoggedLines(consoleSpy);
        const allOutput = lines.join('\n');

        expect(allOutput).toContain('Passed: 2');
        expect(allOutput).toContain('Failed: 2');
        expect(allOutput).toContain('Skipped: 1');
        expect(allOutput).toContain('Total Components: 5');
    });

});
