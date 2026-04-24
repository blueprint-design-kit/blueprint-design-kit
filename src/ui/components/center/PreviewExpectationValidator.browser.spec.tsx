import { describe, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

vi.mock(import('../../../utils/htmlDiffFinder.js'), () => ({
    findDiff: vi.fn(async () => []),
}));

vi.mock(import('../../../utils/htmlDiffPrinter.js'), () => ({
    printDiff: vi.fn(() => '<ins>diff</ins>'),
}));

import { printDiff } from '../../../utils/htmlDiffPrinter.js';
import { PreviewExpectationValidator } from './PreviewExpectationValidator';

describe('PreviewExpectationValidator', () => {
    test('shows unmet message and reveals expected content when diff exists', async () => {
        vi.mocked(printDiff).mockReturnValue('<ins>diff</ins>');

        const actual = document.createElement('div');
        actual.id = 'actual_container';
        actual.innerHTML = '<div>Actual</div>';
        document.body.appendChild(actual);

        const expected = document.createElement('div');
        expected.id = 'expected_container';
        expected.innerHTML = '<div>Expected</div>';
        document.body.appendChild(expected);

        const expectationMessage = document.createElement('div');
        expectationMessage.id = 'expectation_message';
        expectationMessage.style.display = 'none';
        document.body.appendChild(expectationMessage);

        render(
            <PreviewExpectationValidator
                expectation={<div>Expected</div>}
                MAIN_CONTENT_ID="actual_container"
                EXPECTATION_CONTENT_ID="expected_container"
                EXPECTATION_MESSAGE_ID="expectation_message"
            />,
        );

        await expect.element(page.getByText('Rendered content is different from expected:')).toBeInTheDocument();
        expect(expectationMessage.style.display).toBe('block');
    });

    test('hides expected content when there is no printable diff', async () => {
        vi.mocked(printDiff).mockReturnValue('');

        const actual = document.createElement('div');
        actual.id = 'actual_container';
        actual.innerHTML = '<div>Actual</div>';
        document.body.appendChild(actual);

        const expected = document.createElement('div');
        expected.id = 'expected_container';
        expected.innerHTML = '<div>Expected</div>';
        document.body.appendChild(expected);

        const expectationMessage = document.createElement('div');
        expectationMessage.id = 'expectation_message';
        expectationMessage.style.display = 'block';
        document.body.appendChild(expectationMessage);

        render(
            <PreviewExpectationValidator
                expectation={<div>Expected</div>}
                MAIN_CONTENT_ID="actual_container"
                EXPECTATION_CONTENT_ID="expected_container"
                EXPECTATION_MESSAGE_ID="expectation_message"
            />,
        );

        await new Promise((resolve) => setTimeout(resolve, 700));
        expect(expectationMessage.style.display).toBe('none');
        expect(document.body.textContent?.includes('Rendered content is different from expected:')).toBe(false);
    });
});
