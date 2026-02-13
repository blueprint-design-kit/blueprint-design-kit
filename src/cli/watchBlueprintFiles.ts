import watch, { type Watcher } from 'node-watch';
import { minimatch } from 'minimatch';
import { getOptions } from '../config/options';

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

export default function watchBlueprintFiles(onUpdateNeeded: (evt: string, changedPath: string) => void = () => {}) {
    const { files } = getOptions();
    const { componentsRoot, ignore, matchBlueprint, matchComponent } = files;

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
    watcher = watch(componentsRoot, watchConfig, onUpdateNeeded);
    
    // Register signal handlers only once
    registerSignalHandlers();
}
