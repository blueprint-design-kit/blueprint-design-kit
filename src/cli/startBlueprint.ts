import { watchBlueprintFiles } from './watchBlueprintFiles';
import { generateImports } from './generateImports';

function onUpdateNeeded() { // (evt, changedPath)
    generateImports();
}

export async function startBlueprint(watch = false) {
    await generateImports();
    if (watch) {
        watchBlueprintFiles(onUpdateNeeded);
    }
}
