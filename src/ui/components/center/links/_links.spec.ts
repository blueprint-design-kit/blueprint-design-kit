import { readdirSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import { linkTypes } from '../LinksMenuLinkTypes';

function getLinkModuleKeysFromDirectory() {
    const linksDirPath = dirname(fileURLToPath(import.meta.url));

    return readdirSync(linksDirPath)
        .filter((fileName) => fileName.endsWith('.tsx'))
        .filter((fileName) => !fileName.includes('.spec.'))
        .map((fileName) => basename(fileName, '.tsx'))
        .sort();
}

describe('center/links directory coverage', () => {
    test('every links file is registered in linkTypes', () => {
        const moduleKeysOnDisk = getLinkModuleKeysFromDirectory();
        const moduleKeysRegistered = Object.keys(linkTypes).sort();

        expect(moduleKeysRegistered).toEqual(moduleKeysOnDisk);
    });
});
