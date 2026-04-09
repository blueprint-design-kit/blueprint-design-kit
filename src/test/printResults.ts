import { styleText } from 'node:util';
import type { ValidationOutput } from '../ui/components/center/TestRunnerClient.js';
import { printTextInBox } from '../utils/printTextInBox.js';
import { htmlDecode } from '../utils/htmlDiffPrinter.js';

function printHtmlWithDiff(str: string) {
    return htmlDecode(str)
        .replaceAll(/<ins>(.*?)<\/ins>/g, styleText(['cyan'], '$1'))
        .replaceAll(/<del>(.*?)<\/del>/g, styleText(['red', 'strikethrough'], '$1'));
}

export function printResults(results: ValidationOutput | null, componentsRoot: string = '') {
    if (!results) {
        throw new Error('No test results to print');
    }
    componentsRoot = componentsRoot ? `${componentsRoot}/` : '';

    const { pass, fail, skip } = results;
    const totalComponents = pass.length + fail.length + skip.length;
    const totalPassing = pass.length;
    const totalFailing = fail.length;
    const totalSkipped = skip.length;

    if (totalSkipped > 0) {
        console.log(styleText(['gray'], `\nBlueprint Tests Skipped: ${totalSkipped}`));
        skip.forEach(result => {
            console.log(styleText(['gray'], `  - ${componentsRoot}${result.componentName}`));
        });
        console.log('');
    }

    if (totalFailing > 0) {
        console.log(styleText(['red'], `\nBlueprint Tests Failed: ${totalFailing}`));
        fail.forEach(result => {
            console.log(styleText(['red'], `  ✗ ${componentsRoot}${result.componentName} (${result.failingVariant})`));
            if (result.errorMessage) {
                console.log(`      ${printHtmlWithDiff(result.errorMessage)}`);
                console.log('\n');
            }
        });
    }

    const overallResult = totalFailing > 0 ? 'FAIL' : (totalPassing > 0 ? 'PASS' : 'NONE');
    const summaryColor = totalFailing > 0 ? 'red' : (totalPassing > 0 ? 'green' : 'whiteBright');

    console.log(printTextInBox([
        styleText(['bold', summaryColor], `Blueprint Test Results: ${overallResult}`),
        `Passed: ${totalPassing}`,
        `Failed: ${totalFailing}`,
        `Skipped: ${totalSkipped}`,
        `Total Components: ${totalComponents}`,
    ], { usesTitle: true, boxColor: summaryColor }));
    console.log('');
}
