'use client';

import { useEffect, useState } from 'react';
import { findDiff } from '../../../utils/htmlDiffFinder.js';
import { printDiff } from '../../../utils/htmlDiffPrinter.js';

import type { ReactNode } from 'react';

export type ExpectationValidatorProps = {
    expectation: ReactNode;
    MAIN_CONTENT_ID: string;
    EXPECTATION_CONTENT_ID: string;
    EXPECTATION_MESSAGE_ID: string;
}

export function PreviewExpectationValidator({ expectation, MAIN_CONTENT_ID, EXPECTATION_CONTENT_ID, EXPECTATION_MESSAGE_ID }: ExpectationValidatorProps) {
    const [unmet, setUnmet] = useState<ReactNode>();

    function showExpectedContent() {
        const expectationElement = document.getElementById(EXPECTATION_MESSAGE_ID);
        if (expectationElement) {
            expectationElement.style.display = 'block';
        }
    }

    function hideExpectedContent() {
        const expectationElement = document.getElementById(EXPECTATION_MESSAGE_ID);
        if (expectationElement) {
            expectationElement.style.display = 'none';
        }
    }

    async function doValidate() {
        const expected = document.querySelector(`#${EXPECTATION_CONTENT_ID}`)?.innerHTML;
        const actual = document.querySelector(`#${MAIN_CONTENT_ID}`)?.innerHTML;

        if (expected && actual && expected !== actual) {
            const diff = await findDiff(expected, actual);
            const diffHtml = printDiff(diff);
            if (diffHtml) {
                setUnmet(
                    <div className="blueprint-layout-preview-expectation-unmet blueprint-reset">
                        <div>⚠️ Rendered content is different from expected:</div>
                        <pre><code dangerouslySetInnerHTML={{ __html: diffHtml }}></code></pre>
                    </div>
                );
                showExpectedContent();
            } else {
                setUnmet(undefined);
                hideExpectedContent();
            }
        } else {
            setUnmet(undefined);
            hideExpectedContent();
        }
    }

    useEffect(() => {
        setTimeout(doValidate, 500); // Delay to allow DOM to update with rendered content
    }, [expectation]);

    return unmet;
}
