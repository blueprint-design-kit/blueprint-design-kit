import { watchBlueprintFiles } from './watchBlueprintFiles';
import { generateImports } from './generateImports';

function onUpdateNeeded() { // (evt, changedPath)
    generateImports();
}

export function startBlueprint() {
    generateImports();
    watchBlueprintFiles(onUpdateNeeded);
}
