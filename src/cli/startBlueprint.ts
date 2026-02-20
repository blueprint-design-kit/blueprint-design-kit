import { watchBlueprintFiles } from './watchBlueprintFiles';
import { generateImports } from './generateImports';

function onUpdateNeeded() { // (evt, changedPath)
    generateImports();
}

export function startBlueprint(watch = false) {
    generateImports();
    if (watch) {
        watchBlueprintFiles(onUpdateNeeded);
    }
}
