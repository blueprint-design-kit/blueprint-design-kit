import { Blueprint } from './Blueprint/Blueprint';
import { getBlueprint } from './fileManager/getBlueprint';
import { getComponent } from './fileManager/getComponent';
import { getComponentMeta } from './fileManager/getComponentMeta';
import { listComponents } from './fileManager/listComponents';

interface BlueprintDesignKit {
    Blueprint: typeof Blueprint;
    getBlueprint: typeof getBlueprint;
    getComponent: typeof getComponent;
    getComponentMeta: typeof getComponentMeta;
    listComponents: typeof listComponents;
}

const bdk: BlueprintDesignKit = {
    Blueprint,
    getBlueprint,
    getComponent,
    getComponentMeta,
    listComponents,
};

export * from './types/index';
export default bdk;
export {
    Blueprint,
    getBlueprint,
    getComponent,
    getComponentMeta,
    listComponents,
};
