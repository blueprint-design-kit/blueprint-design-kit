'use server';

import { testExpectations } from "../test/testExpectations.js";
import { parseArgs } from 'node:util';

export async function testBlueprints(args: string[] = []) {
    let testingOptions;
    try {
        testingOptions = parseArgs({
            args,
            options: {
                serverCommand: { type: 'string' },
                serverUrl: { type: 'string' }
            },
        }).values;
    } catch (err) {
        console.error('Invalid argument for command "blueprint test":');
        console.error(err);
        return;
    }
    await testExpectations(testingOptions);
}
