import watch from 'node-watch';
import { exec } from 'child_process';

const filters = [
    `--exclude '.***'`,
    `--exclude 'node_modules/'`,
];

function doFullSync() {
    exec(`rsync -a --delete ${filters.join(' ')} . ../blueprint-design-kit-ui/node_modules/blueprint-design-kit`);
    exec(`rsync -a --delete ${filters.join(' ')} . ../blueprint-test-es/node_modules/blueprint-design-kit`);
    exec(`rsync -a --delete ${filters.join(' ')} . ../blueprint-test-commonjs/node_modules/blueprint-design-kit`);
}

function watchDev() {
    const ignored = ['node_modules'];
    const watchConfig = {
        recursive: true,
        /**
         * @param {string} path 
         * @returns {boolean}
         */
        ignored: (path) => {
            const startsWithDot = path.match(/^\.\w/);
            const isIgnored = ignored.some((ignore) => path.includes(ignore));
            return !!startsWithDot || isIgnored;
        },
    };

    const watcher = watch('.', watchConfig, doFullSync);
    process.on('SIGINT', () => {
        watcher.close();
        process.exit(0);
    });
}

doFullSync();
watchDev();
