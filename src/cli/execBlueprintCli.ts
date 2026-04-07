'use server';

import { buildConfig } from "../config/buildConfig.js";
import { buildBlueprints, devBlueprints } from "./buildBlueprints.js";
import { testBlueprints } from "./testBlueprints.js";

const validCommands = ['build', 'dev', 'test'];

export type BlueprintCliCommand = typeof validCommands[number];

export async function execBlueprintCli(
    command: BlueprintCliCommand | string | undefined,
    args: string[] = [],
) {
    await buildConfig();
    switch (command) {
        case 'build':
            await buildBlueprints();
            break;
        case 'dev':
            await devBlueprints();
            break;
        case 'test':
            await testBlueprints(args);
            break;
        default:
            console.warn(`Warning: Unrecognized blueprint command "${command}". Valid commands are: ${validCommands.join(', ')}\n`);
    }
}
