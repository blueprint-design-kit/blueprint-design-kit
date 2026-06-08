import { describe, test, expect, vi, beforeEach } from 'vitest';
import { execBlueprintCli } from './execBlueprintCli';
import { buildConfig } from '../config/buildConfig.js';
import { buildBlueprints, devBlueprints } from './buildBlueprints.js';
import { testBlueprints } from './testBlueprints.js';

vi.mock(import('../config/buildConfig.js'), () => ({
    buildConfig: vi.fn(),
}));

vi.mock(import('./buildBlueprints.js'), () => ({
    buildBlueprints: vi.fn(),
    devBlueprints: vi.fn(),
}));

vi.mock(import('./testBlueprints.js'), () => ({
    testBlueprints: vi.fn(),
}));

describe('execBlueprintCli', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(buildConfig).mockResolvedValue(undefined);
        vi.mocked(buildBlueprints).mockResolvedValue(undefined);
        vi.mocked(devBlueprints).mockResolvedValue(undefined);
        vi.mocked(testBlueprints).mockResolvedValue(undefined);
    });

    test('always calls buildConfig regardless of command', async () => {
        await execBlueprintCli('build');
        expect(buildConfig).toHaveBeenCalledOnce();
    });

    test('"build" command calls buildBlueprints', async () => {
        await execBlueprintCli('build');

        expect(buildBlueprints).toHaveBeenCalledOnce();
        expect(devBlueprints).not.toHaveBeenCalled();
        expect(testBlueprints).not.toHaveBeenCalled();
    });

    test('"dev" command calls devBlueprints', async () => {
        await execBlueprintCli('dev');

        expect(devBlueprints).toHaveBeenCalledOnce();
        expect(buildBlueprints).not.toHaveBeenCalled();
        expect(testBlueprints).not.toHaveBeenCalled();
    });

    test('"test" command calls testBlueprints with the provided args', async () => {
        const args = ['--serverUrl', 'http://localhost:3000', 'Atoms'];
        await execBlueprintCli('test', args);

        expect(testBlueprints).toHaveBeenCalledOnce();
        expect(testBlueprints).toHaveBeenCalledWith(args);
        expect(buildBlueprints).not.toHaveBeenCalled();
    });

    test('"test" command passes an empty args array by default', async () => {
        await execBlueprintCli('test');

        expect(testBlueprints).toHaveBeenCalledWith([]);
    });

    test('unknown command logs a warning and does not call any action', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        await execBlueprintCli('unknown-cmd');

        expect(warnSpy).toHaveBeenCalledOnce();
        expect(warnSpy.mock.calls[0]?.[0]).toContain('unknown-cmd');
        expect(buildBlueprints).not.toHaveBeenCalled();
        expect(devBlueprints).not.toHaveBeenCalled();
        expect(testBlueprints).not.toHaveBeenCalled();
    });

    test('undefined command logs a warning', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        await execBlueprintCli(undefined);

        expect(warnSpy).toHaveBeenCalledOnce();
    });

    test('still calls buildConfig even for unknown commands', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        await execBlueprintCli('nope');

        expect(buildConfig).toHaveBeenCalledOnce();
    });

});
