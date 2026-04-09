'use server';

import { testExpectations } from "../test/testExpectations.js";
import { parseArgs } from 'node:util';

export async function testBlueprints(args: string[] = []) {
    let testingOptions;
    let filter;
    try {
        const { values, positionals } = parseArgs({
            args,
            allowPositionals: true,
            options: {
                serverCommand: { type: 'string' },
                serverUrl: { type: 'string' }
            },
        });
        testingOptions = values;
        if (positionals.length > 0) {
            filter = positionals[0];
        }
    } catch (err) {
        console.error('Invalid argument for command "blueprint test":');
        console.error(err);
        return;
    }
    await testExpectations(testingOptions, filter);
}
