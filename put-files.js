import { exec } from 'child_process';

const filters = [
    `--exclude '.***'`,
    `--exclude 'node_modules/'`,
];

function doFullSync() {
    exec(`rsync -a --delete ${filters.join(' ')} . ../blueprint-design-kit-demo/node_modules/blueprint-design-kit`);
    exec(`rsync -a --delete ${filters.join(' ')} . ../blueprint-test-es/node_modules/blueprint-design-kit`);
    exec(`rsync -a --delete ${filters.join(' ')} . ../blueprint-test-commonjs/node_modules/blueprint-design-kit`);
}

doFullSync();
