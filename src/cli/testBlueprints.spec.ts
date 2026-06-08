import { describe, test, expect, vi, beforeEach } from 'vitest';
import { testBlueprints } from './testBlueprints';
import { testExpectations } from '../test/testExpectations.js';

vi.mock(import('../test/testExpectations.js'), () => ({
    testExpectations: vi.fn(),
}));

describe('testBlueprints', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(testExpectations).mockResolvedValue(undefined);
    });

    test('calls testExpectations with empty options when no args are passed', async () => {
        await testBlueprints([]);

        expect(testExpectations).toHaveBeenCalledOnce();
        expect(testExpectations).toHaveBeenCalledWith({}, undefined);
    });

    test('passes serverCommand and serverUrl options to testExpectations', async () => {
        await testBlueprints(['--serverCommand', 'npm run start', '--serverUrl', 'http://localhost:3000']);

        expect(testExpectations).toHaveBeenCalledWith(
            { serverCommand: 'npm run start', serverUrl: 'http://localhost:3000' },
            undefined,
        );
    });

    test('passes the first positional argument as the filter', async () => {
        await testBlueprints(['Atoms']);

        expect(testExpectations).toHaveBeenCalledWith({}, 'Atoms');
    });

    test('passes both options and filter together', async () => {
        await testBlueprints(['--serverUrl', 'http://localhost:4000', 'Molecules']);

        expect(testExpectations).toHaveBeenCalledWith(
            { serverUrl: 'http://localhost:4000' },
            'Molecules',
        );
    });

    test('logs an error and does not call testExpectations for unrecognized flags', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        // Node's parseArgs throws for unrecognized options
        await testBlueprints(['--unknownFlag', 'value']);

        expect(errorSpy).toHaveBeenCalled();
        expect(testExpectations).not.toHaveBeenCalled();
    });

    test('uses empty array as default args value', async () => {
        await testBlueprints();

        expect(testExpectations).toHaveBeenCalledWith({}, undefined);
    });

});
