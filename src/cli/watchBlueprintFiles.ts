import { existsSync } from 'node:fs';
import watch from 'node-watch';
import { minimatch } from 'minimatch';
import { getBlueprintOptions, getComponentOptions, getFileOptions } from '../config/options.js';

import type { Watcher } from 'node-watch';

let watcher: Watcher | null = null;
let signalHandlersRegistered = false;

function cleanup() {
    if (watcher) {
        watcher.close();
        watcher = null;
    }
}

function registerSignalHandlers() {
    if (signalHandlersRegistered) return;
    signalHandlersRegistered = true;

    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
        process.once(signal, () => {
            cleanup();            
        });
    });
    
    process.on('beforeExit', cleanup);
}

export function watchBlueprintFiles(onUpdateNeeded: (evt: string, changedPath: string) => void = () => {}) {
    const { componentsRoot = '.', ignore = [] } = getFileOptions();
    const { matchComponent = '' } = getComponentOptions();
    const { matchBlueprint = '' } = getBlueprintOptions();

    if (!existsSync(componentsRoot)) {
        console.error(`[Blueprint] Unable to watch components root path: '${componentsRoot}'`);
        return;
    }

    const watchConfig = {
        recursive: true,
        filter: (path: string, skip: symbol) => {
            for (const i in ignore) {
                if (ignore[i] && minimatch(path, ignore[i])) {
                    return skip;
                }
            }
            if (new RegExp(matchBlueprint).exec(path) || new RegExp(matchComponent).exec(path)) {
                return true;
            }
            return false;
        },
    };

    cleanup(); // Close existing watcher if any
    // @ts-expect-error - node-watch types are outdated and don't reflect the actual API
    watcher = watch(componentsRoot, watchConfig, onUpdateNeeded);
    
    // Register signal handlers only once
    registerSignalHandlers();
}
