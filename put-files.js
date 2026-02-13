const { exec } = require('child_process');

const filters = [
    `--exclude '.***'`,
    `--exclude 'node_modules/'`,
];

function doFullSync() {
    exec(`rsync -a --delete ${filters.join(' ')} . ../blueprint-ui/node_modules/blueprint-design-kit`);
    exec(`rsync -a --delete ${filters.join(' ')} . ../blueprint-test-es/node_modules/blueprint-design-kit`);
    exec(`rsync -a --delete ${filters.join(' ')} . ../blueprint-test-commonjs/node_modules/blueprint-design-kit`);
    exec(`rsync -a --delete ${filters.join(' ')} . ../../Projects/lovevery-next/node_modules/blueprint-design-kit`);
}

doFullSync();
