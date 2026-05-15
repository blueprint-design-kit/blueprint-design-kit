import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { testExpectations } from './testExpectations';
import { getFileOptions, getTestingOptions } from '../config/options.js';
import { startLocalServer, stopLocalServer, waitForServer } from './localServer.js';
import { testInPlaywright } from './playwright.js';
import { printResults } from './printResults.js';

let processExitSpy: ReturnType<typeof vi.spyOn>;
let consoleLogSpy: ReturnType<typeof vi.spyOn>;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

vi.mock(import('../config/options.js'), () => {
    return {
        getFileOptions: vi.fn(),
        getTestingOptions: vi.fn(),
    };
});

vi.mock(import('./localServer.js'), () => {
    return {
        startLocalServer: vi.fn(),
        stopLocalServer: vi.fn(),
        waitForServer: vi.fn(),
    };
});

vi.mock(import('./playwright.js'), () => {
    return {
        testInPlaywright: vi.fn(),
    };
});

vi.mock(import('./printResults.js'), () => {
    return {
        printResults: vi.fn(),
    };
});

describe('testExpectations', () => {

    beforeEach(() => {
        vi.clearAllMocks();

        processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        vi.mocked(getTestingOptions).mockReturnValue({
            serverCommand: 'npm run start',
            serverUrl: 'http://localhost:3000/blueprint',
        });
        vi.mocked(getFileOptions).mockReturnValue({
            componentsRoot: './app/components',
        });
        vi.mocked(startLocalServer).mockReturnValue({ pid: 12345 } as any);
        vi.mocked(waitForServer).mockResolvedValue(true as any);
        vi.mocked(testInPlaywright).mockResolvedValue({
            pass: [{ componentName: 'Atoms/Button' }],
            fail: [],
            skip: [],
        } as any);
        vi.mocked(printResults).mockReturnValue(undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('starts server, runs tests, prints results, and exits passing', async () => {
        await testExpectations(undefined, 'atoms');

        expect(startLocalServer).toHaveBeenCalledOnce();
        expect(startLocalServer).toHaveBeenCalledWith('npm run start');
        expect(waitForServer).toHaveBeenCalledOnce();
        expect(waitForServer).toHaveBeenCalledWith('http://localhost:3000/blueprint');
        expect(testInPlaywright).toHaveBeenCalledOnce();
        expect(testInPlaywright).toHaveBeenCalledWith(
            'http://localhost:3000/blueprint',
            expect.any(Function),
            { filter: 'atoms', timeout: 0 },
        );
        expect(printResults).toHaveBeenCalledOnce();
        expect(printResults).toHaveBeenCalledWith(
            { pass: [{ componentName: 'Atoms/Button' }], fail: [], skip: [] },
            './app/components',
        );
        expect(stopLocalServer).toHaveBeenCalledOnce();
        expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    test('exits failing when results contain failures', async () => {
        vi.mocked(testInPlaywright).mockResolvedValue({
            pass: [],
            fail: [{ componentName: 'Atoms/Button', failingVariant: 'default' }],
            skip: [],
        } as any);

        await testExpectations();

        expect(printResults).toHaveBeenCalledOnce();
        expect(stopLocalServer).toHaveBeenCalledOnce();
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('uses runtime options over config options', async () => {
        await testExpectations(
            {
                serverCommand: 'pnpm run dev',
                serverUrl: 'http://localhost:4000/blueprint',
            },
            undefined,
        );

        expect(startLocalServer).toHaveBeenCalledWith('pnpm run dev');
        expect(waitForServer).toHaveBeenCalledWith('http://localhost:4000/blueprint');
        expect(testInPlaywright).toHaveBeenCalledWith(
            'http://localhost:4000/blueprint',
            expect.any(Function),
            { filter: undefined, timeout: 0 },
        );
        expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    test('fails early when testing options are invalid', async () => {
        vi.mocked(getTestingOptions).mockReturnValue({
            serverCommand: '',
            serverUrl: '',
        });

        await expect(() => testExpectations()).rejects.toThrow('Valid testing options are required to run tests');
        expect(startLocalServer).not.toHaveBeenCalled();
    });

    test('handles local server start/wait failures and exits failing', async () => {
        vi.mocked(waitForServer).mockRejectedValue(new Error('server timeout'));

        await testExpectations();

        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(stopLocalServer).toHaveBeenCalledOnce();
        expect(processExitSpy).toHaveBeenCalledWith(1);
        expect(testInPlaywright).not.toHaveBeenCalled();
    });

    test('handles printResults errors and exits failing', async () => {
        vi.mocked(printResults).mockImplementation(() => {
            throw new Error('unable to print');
        });

        await testExpectations();

        expect(testInPlaywright).toHaveBeenCalledOnce();
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(stopLocalServer).toHaveBeenCalledOnce();
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });

});
