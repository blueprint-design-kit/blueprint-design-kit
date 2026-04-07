'use server';

import fs from 'node:fs';
import { BLUEPRINT_FOLDER, BLUEPRINT_COVERAGE_FILE } from '../config/constants.js';
import { getComponentOptions } from '../config/options.js';
import BlueprintError from '../utils/BlueprintError.js';

import type { ProjectFiles } from './generateImports.js';

export async function coverageReport(
    componentsRoot: string,
    totalFiles: number,
    projectFiles: ProjectFiles,
) {
    const { blueprints, components } = projectFiles;
    const { onMissingCoverage, saveCoverageReport } = getComponentOptions();
    if (onMissingCoverage || saveCoverageReport) {
        let componentsWithBlueprints = 0;
        const componentFiles = Object.entries(components);
        const totalComponents = componentFiles.length;
        const missing: string[] = [];
        for (const [key, comp] of componentFiles) {
            if (blueprints[key]) {
                componentsWithBlueprints += 1;
            } else {
                missing.push(comp.path);
            }
        }
        const coverage = {
            percent: componentsWithBlueprints / totalComponents,
            totalComponents,
            componentsWithBlueprints,
            missing,
        };

        console.log(`\n[Blueprint] ${totalComponents} components found out of ${totalFiles} total files at ${componentsRoot}`);

        if (missing.length > 0) {
            const missingBlueprints = `
Warning: Missing blueprints for ${missing.length} out of ${totalComponents} components:
${missing.join('\n')}\n`;
            if (onMissingCoverage === 'warn') {
                console.warn(missingBlueprints);
            } else if (onMissingCoverage === 'error') {
                console.error(missingBlueprints);
                throw new BlueprintError(missingBlueprints);
            }
        }

        if (saveCoverageReport) {
            const coverageReportPath = `${BLUEPRINT_FOLDER}/${BLUEPRINT_COVERAGE_FILE}`;
            fs.writeFile(coverageReportPath, JSON.stringify(coverage, null, 2), (error) => {
                if (error) {
                    console.error(`Error writing ${coverageReportPath}`, error);
                }
            });
        }
    }
}
