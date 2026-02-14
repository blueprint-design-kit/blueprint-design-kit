import { getBlueprint } from './getBlueprint';
import { getComponent } from './getComponent';
import { listComponents } from './listComponents';

const __blueprintFileManager: true = true;

interface BlueprintFileManager {
    __blueprintFileManager: true;
    getBlueprint: typeof getBlueprint;
    getComponent: typeof getComponent;
    listComponents: typeof listComponents;
}

const blueprintFileManager: BlueprintFileManager = {
    __blueprintFileManager: true,
    getBlueprint,
    getComponent,
    listComponents,
};

export default blueprintFileManager;
export {
    __blueprintFileManager,
    getBlueprint,
    getComponent,
    listComponents,
};
