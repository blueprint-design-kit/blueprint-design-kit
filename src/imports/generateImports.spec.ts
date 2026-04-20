import { describe, test, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import recursive from 'recursive-readdir';
import { generateImports } from './generateImports';
import { getBlueprintOptions, getComponentOptions, getFileOptions } from '../config/options.js';
import { coverageReport } from './coverageReport.js';
import { fsReadFirstLine } from '../utils/fsReadFirstLine.js';

// @ts-expect-error - simplified mock for testing
vi.mock(import('node:fs'), () => {
    return {
        default: {
            promises: {
                access: vi.fn(),
                writeFile: vi.fn(),
            },
        },
    };
});

vi.mock(import('recursive-readdir'), () => {
    const readDirMock: { default: () => (Promise<string[]>) } = {
        default: vi.fn(() => Promise.resolve([])),
    };
    return readDirMock;
});

vi.mock(import('../config/options.js'), () => {
    return {
        getFileOptions: vi.fn(),
        getComponentOptions: vi.fn(),
        getBlueprintOptions: vi.fn(),
    };
});

vi.mock(import('./coverageReport.js'), () => {
    return {
        coverageReport: vi.fn(),
    };
});

vi.mock(import('../utils/fsReadFirstLine.js'), () => {
    return {
        fsReadFirstLine: vi.fn(),
    };
});

describe('generateImports', () => {

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(getFileOptions).mockReturnValue({
            componentsRoot: './app/components',
            ignore: ['node_modules/**'],
            importsFormat: 'es6',
        });
        vi.mocked(getComponentOptions).mockReturnValue({
            matchComponent: '^(.+)\\.component\\.tsx$',
            readComponentMeta: true,
        });
        vi.mocked(getBlueprintOptions).mockReturnValue({
            matchBlueprint: '^(.+)\\.blueprint\\.tsx$',
        });
        vi.mocked(fs.promises.access).mockResolvedValue(undefined);
        vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);
        vi.mocked(recursive).mockResolvedValue(undefined);
        vi.mocked(coverageReport).mockResolvedValue(undefined as any);
        vi.mocked(fsReadFirstLine).mockResolvedValue(undefined);
    });

    test('returns early when components root is not accessible', async () => {
        vi.mocked(fs.promises.access).mockRejectedValueOnce(new Error('no access'));
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const result = await generateImports();

        expect(result).toBeUndefined();
        expect(errorSpy).toHaveBeenCalledOnce();
        expect(vi.mocked(recursive)).not.toHaveBeenCalled();
    });

    test('returns early when recursive file read fails', async () => {
        vi.mocked(recursive).mockRejectedValueOnce(new Error('recursive fail'));
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const result = await generateImports();

        expect(result).toBeUndefined();
        expect(errorSpy).toHaveBeenCalledOnce();
        expect(vi.mocked(fs.promises.writeFile)).not.toHaveBeenCalled();
    });

    test('builds imports map, reads meta, writes imports file, and reports coverage', async () => {
        // @ts-expect-error - simplified mock for testing
        vi.mocked(recursive).mockResolvedValue([
            './app/components/Atoms/Button.blueprint.tsx',
            './app/components/Atoms/Button.component.tsx',
            './app/components/Atoms/Card.component.tsx',
        ]);
        vi.mocked(fsReadFirstLine).mockImplementation(async (filePath: string) => {
            if (filePath.includes('Button.component.tsx')) {
                return '"use client"';
            }
            return '\'use server\'';
        });

        const result = await generateImports();

        expect(result).toEqual({
            blueprints: {
                './Atoms/Button': './app/components/Atoms/Button.blueprint.tsx',
            },
            components: {
                './Atoms/Button': {
                    path: './app/components/Atoms/Button.component.tsx',
                    meta: { useClient: true },
                },
                './Atoms/Card': {
                    path: './app/components/Atoms/Card.component.tsx',
                    meta: { useServer: true },
                },
            },
        });

        expect(vi.mocked(fs.promises.writeFile)).toHaveBeenCalledOnce();
        const [filePath, fileContent] = vi.mocked(fs.promises.writeFile).mock.calls[0] || [];
        expect(filePath).toBe('.blueprint/blueprint.imports.js');
        expect(String(fileContent)).toContain("'./Atoms/Button': {");
        expect(String(fileContent)).toContain("c: () => import('.././app/components/Atoms/Button.component.tsx')");
        expect(String(fileContent)).toContain("b: () => import('.././app/components/Atoms/Button.blueprint.tsx')");
        expect(String(fileContent)).toContain('m: () => { return {"useClient":true}; }');

        expect(vi.mocked(coverageReport)).toHaveBeenCalledOnce();
        expect(vi.mocked(coverageReport)).toHaveBeenCalledWith(
            './app/components',
            3,
            expect.objectContaining({
                components: expect.any(Object),
                blueprints: expect.any(Object),
            }),
        );
    });

    test('warns when no files are found', async () => {
        // @ts-expect-error - simplified mock for testing
        vi.mocked(recursive).mockResolvedValue([]);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        await generateImports();

        expect(warnSpy).toHaveBeenCalledOnce();
    });

});
