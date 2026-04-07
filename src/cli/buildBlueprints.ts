import { generateImports } from "../imports/generateImports.js";
import { watchBlueprintFiles } from "./watchBlueprintFiles.js";

export async function buildBlueprints() {
    await generateImports();
}

export async function devBlueprints() {
    await buildBlueprints();
    watchBlueprintFiles(async () => { // (evt, changedPath)
        await buildBlueprints();
    });
}

