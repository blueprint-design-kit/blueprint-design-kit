
export interface NestedComponents {
    [key: string]: NestedComponents | string[];
    __: string[]; // components directly under this level
}

function collapseSameNameDirectories(nested: NestedComponents) {
    const keys = Object.keys(nested).filter((key) => key !== '__');

    for (const key of keys) {
        const child = nested[key] as NestedComponents;
        const childComponents = child.__ || [];
        if (childComponents.length === 1 && childComponents[0] === key) {
            nested.__.push(`${key}/${key}`);
            nested.__.sort();
            delete nested[key];
        } else {
            collapseSameNameDirectories(child);
        }
    }
}

export function nestSubdirectories(componentList: string[]) {
    const result: NestedComponents = { __: [] };

    for (const component of componentList) {
        const parts = component.split('/');

        if (parts.length === 1) {
            // No subdirectory, add to root
            result.__.push(component);
        } else {
            // Has subdirectories
            let current = result;

            // Navigate through all parts except the last one
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i] as string;
                if (!current[part]) {
                    current[part] = { __: [] };
                }
                current = current[part] as NestedComponents;
            }

            // Add the component name to the __ array at this level
            const componentName = parts[parts.length - 1];
            if (componentName) {
                current.__.push(componentName);
            }
        }
    }

    // Flatten any directories that have the same name as their only component
    collapseSameNameDirectories(result);

    return result;
}
