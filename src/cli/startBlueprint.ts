import watchBlueprintFiles from './watchBlueprintFiles';
import generateImports from './generateImports';

function onUpdateNeeded() { // (evt, changedPath)
    generateImports();
}

export default function startBlueprint() {
    generateImports();
    watchBlueprintFiles(onUpdateNeeded);
}
