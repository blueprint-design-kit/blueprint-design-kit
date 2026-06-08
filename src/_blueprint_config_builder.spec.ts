import { describe, test, expect } from 'vitest';
import { readUserConfigFile, readSavedConfigFile } from './_blueprint_config_builder';

/**
 * _blueprint_config_builder.ts discovers config files via dynamic imports at relative paths
 * that would only exist in a fully set-up user project (../../blueprint.config.{ts|js|cjs|mjs})
 * and .blueprint/blueprint.config.js. None of those paths exist in this test environment, so the
 * ERR_MODULE_NOT_FOUND errors they throw are silently suppressed and both functions fall through
 * to return undefined. This tests that graceful-degradation behaviour.
 */
describe('_blueprint_config_builder', () => {

    describe('readUserConfigFile', () => {

        test('returns undefined when no user config file is found', async () => {
            const result = await readUserConfigFile();
            expect(result).toBeUndefined();
        });

        test('does not throw when no config files exist at any extension', async () => {
            await expect(readUserConfigFile()).resolves.not.toThrow();
        });

    });

    describe('readSavedConfigFile', () => {

        test('returns undefined when no saved config file exists', async () => {
            const result = await readSavedConfigFile();
            expect(result).toBeUndefined();
        });

        test('does not throw when no saved config file exists', async () => {
            await expect(readSavedConfigFile()).resolves.not.toThrow();
        });

    });

});
