'use client';

import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react';
import { findDiff } from '../../../utils/htmlDiffFinder.js';
import { printDiff } from '../../../utils/htmlDiffPrinter.js';
import { TEST_RUNNER_RESULTS_ID } from '../../../config/constants.js';

import type { ExpectationValidation } from '../../../blueprint/getTestValidations.js';

interface ValidationResult {
    componentName: string;
    passingVariants?: string[] | undefined;
    failingVariant?: string | undefined;
    errorMessage?: string | undefined;
}

export interface ValidationOutput {
    pass: ValidationResult[];
    fail: ValidationResult[];
    skip: ValidationResult[];
}

export type TestRunnerProps = {
    validations: ExpectationValidation[];
}

function setObserver(targetNode: HTMLElement): Promise<string> {
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver(() => {
            observer.disconnect();
            resolve(targetNode.innerHTML);
        });
        observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout waiting for DOM update ${targetNode.className}`));
        }, 10000);
    });
}

async function checkExpectations(validations: ExpectationValidation[], incrementProgress: (componentName: string) => void): Promise<ValidationOutput> {
    const output: ValidationOutput = {
        pass: [],
        fail: [],
        skip: [],
    };

    const actualContainer = document.createElement('div');
    actualContainer.className = 'blueprint-layout-test-runner-actual';
    actualContainer.style.display = 'none';
    document.body.appendChild(actualContainer);
    const actualRoot = createRoot(actualContainer);

    const expectationContainer = document.createElement('div');
    expectationContainer.className = 'blueprint-layout-test-runner-expected';
    expectationContainer.style.display = 'none';
    document.body.appendChild(expectationContainer);
    const expectationRoot = createRoot(expectationContainer);

    for (const validation of validations) {
        const { componentName, expectations = [] } = validation;
        if (expectations.length) {
            let resultIsPassing = true;
            const passingVariants: string[] = [];
            for (const { variantName, expectation, component, errorMessage } of expectations) {
                if (errorMessage) {
                    resultIsPassing = false;
                    output.fail.push({ componentName, failingVariant: variantName, errorMessage });
                    break;
                } else if (expectation) {
                    try {
                        const onExpectationUpdated = setObserver(expectationContainer);
                        const onActualUpdated = setObserver(actualContainer);

                        expectationRoot.render(expectation);
                        actualRoot.render(component);

                        const expectedHtml = await onExpectationUpdated;
                        const actualHtml = await onActualUpdated;

                        const diff = await findDiff(expectedHtml, actualHtml);
                        const diffHtml = printDiff(diff);

                        const onExpectationCleared = setObserver(expectationContainer);
                        const onActualCleared = setObserver(actualContainer);

                        expectationRoot.render(null);
                        actualRoot.render(null);
                        await onExpectationCleared;
                        await onActualCleared;

                        if (diffHtml) {
                            resultIsPassing = false;
                            output.fail.push({ componentName, failingVariant: variantName, errorMessage: `Rendered output does not match expectation.\n\n${diffHtml}` });
                            break;
                        } else {
                            passingVariants.push(variantName);
                        }
                    } catch (error) {
                        console.warn(componentName, error);
                        resultIsPassing = false;
                        output.fail.push({ componentName, failingVariant: variantName, errorMessage: String(error) });
                        break;
                    }
                }
            }
            if (resultIsPassing) {
                output.pass.push({ componentName, passingVariants });
            }
        } else {
            output.skip.push({ componentName });
        }
        incrementProgress(componentName);
    };

    setTimeout(() => { // Allow render cycle to complete before unmounting and removing containers
        expectationRoot.unmount();
        actualRoot.unmount();
        document.body.removeChild(actualContainer);
        document.body.removeChild(expectationContainer);
    }, 1);

    return output;
}

export function TestRunnerClient({ validations }: TestRunnerProps) {
    const [results, setResults] = useState<ValidationOutput | null>(null);
    const [progress, setProgress] = useState(0);
    const [lastCompleted, setLastCompleted] = useState<string>('');

    function incrementProgress(componentName: string) {
        setProgress((prev) => Math.min(prev + 1, validations.length));
        setLastCompleted(componentName);
    }

    useEffect(() => {
        const runTests = async () => {
            setProgress(0);
            const results = await checkExpectations(validations, incrementProgress);
            setTimeout(() => {
                setResults(results);
            }, 200);
        };
        runTests();
    }, [validations]);

    if (!results) {
        return <div className='blueprint-layout-test-runner blueprint-reset'>
            <div>Running UI Tests ...</div>
            <div className='blueprint-layout-test-runner-progress-bar-outer'>
                <div className='blueprint-layout-test-runner-progress-bar' style={{ width: `${(progress/validations.length)*100}%` }}></div>
                <div className='blueprint-layout-test-runner-progress-bar-label'>{progress} / {validations.length} {lastCompleted}</div>
            </div>
        </div>;
    }

    const { pass, fail, skip } = results;
    const printOutput = <div className='blueprint-layout-test-runner blueprint-reset'>
        <div>Total Components: {pass.length + fail.length + skip.length}</div>
        {fail.length > 0 && 
        <>
            <h3>Failed ({fail.length})</h3>
            {fail.map((result, index) => (
                <div key={index}>
                    <details style={{ color: 'red' }} open={index === 0}>
                        <summary>{result.componentName}</summary>
                        <div className='blueprint-layout-test-runner-error-box'>
                            <div>Variant: <a href={`../${result.componentName}?variant=${result.failingVariant}`}>{result.failingVariant}</a></div>
                        {result.errorMessage &&
                            <code dangerouslySetInnerHTML={{ __html: result.errorMessage }}></code>
                        }
                        </div>
                    </details>
                </div>
            ))}
        </>
        }
        <h3>Passed ({pass.length})</h3>
        {pass.map((result, index) => (
            <div key={index}>
                <details style={{ color: 'green' }}>
                    <summary>{result.componentName}</summary>
                    <div className='blueprint-layout-test-runner-passed-variants'>
                    {result.passingVariants?.map((variantName) => {
                        return <div key={variantName}>- {variantName} ✅</div>;
                    })}
                    </div>
                </details>
            </div>
        ))}
        <h3>Skipped ({skip.length})</h3>
        {skip.map((result, index) => (
            <div key={index}>
                <div className='blueprint-layout-test-runner-skipped'>
                    {result.componentName}
                </div>
            </div>
        ))}
        <div data-testid={TEST_RUNNER_RESULTS_ID} style={{ display: 'none' }} data-results={JSON.stringify(results)}></div>
    </div>;

    return printOutput;
}
