import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';
import { fsReadFirstLine } from './fsReadFirstLine';

class MockFileStream extends EventEmitter {
    destroy = vi.fn();
}

class MockReadline extends EventEmitter {
    close = vi.fn();
}

vi.mock('node:fs', () => ({
    createReadStream: vi.fn(),
}));

vi.mock('node:readline', () => ({
    createInterface: vi.fn(),
}));

describe('fsReadFirstLine', () => {

    let mockFileStream: MockFileStream;
    let mockReadline: MockReadline;
    let createReadStream: ReturnType<typeof vi.fn>;
    let createInterface: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        vi.clearAllMocks();

        mockFileStream = new MockFileStream();
        mockReadline = new MockReadline();

        const fs = await import('node:fs');
        createReadStream = vi.mocked(fs.createReadStream as ReturnType<typeof vi.fn>);
        createReadStream.mockReturnValue(mockFileStream);

        const readline = await import('node:readline');
        createInterface = vi.mocked(readline.createInterface as ReturnType<typeof vi.fn>);
        createInterface.mockReturnValue(mockReadline);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('resolves with the first line when a line event fires', async () => {
        const promise = fsReadFirstLine('some/file.ts');

        mockReadline.emit('line', '"use client"');

        const result = await promise;
        expect(result).toBe('"use client"');
    });

    test('calls close() and destroy() after resolving the first line', async () => {
        const promise = fsReadFirstLine('some/file.ts');
        mockReadline.emit('line', 'first');
        await promise;

        expect(mockReadline.close).toHaveBeenCalledOnce();
        expect(mockFileStream.destroy).toHaveBeenCalledOnce();
    });

    test('resolves with undefined for an empty file (close fires without a line)', async () => {
        const promise = fsReadFirstLine('empty.ts');

        mockReadline.emit('close');

        const result = await promise;
        expect(result).toBeUndefined();
    });

    test('rejects with the error when an error event fires', async () => {
        const promise = fsReadFirstLine('bad.ts');
        const err = new Error('ENOENT: no such file or directory');

        mockReadline.emit('error', err);

        await expect(promise).rejects.toThrow('ENOENT: no such file or directory');
        expect(mockFileStream.destroy).toHaveBeenCalledOnce();
    });

    test('passes the file path prefixed with "./" to createReadStream', async () => {
        const promise = fsReadFirstLine('components/Button.tsx');
        mockReadline.emit('close');
        await promise;

        expect(createReadStream).toHaveBeenCalledWith('./components/Button.tsx', expect.objectContaining({ start: 0, end: 20 }));
    });

    test('passes the file stream to createInterface', async () => {
        const promise = fsReadFirstLine('components/Button.tsx');
        mockReadline.emit('close');
        await promise;

        expect(createInterface).toHaveBeenCalledWith(expect.objectContaining({ input: mockFileStream }));
    });

});
