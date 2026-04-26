// Do not move. Assumes this file is located in blueprint-design-kit/dist/_project_

export const BLUEPRINT_PROJECT_DIRNAME = import.meta.dirname;

export function getRelativePathToComponentsRoot(cwd: string) {
    const currentDir = import.meta.dirname;
    const pathToHereFromCwd = currentDir.replace(cwd, '');
    const numLevelsUp = pathToHereFromCwd.split(/[\\/]/).length - 1;
    return '../'.repeat(numLevelsUp);
}
