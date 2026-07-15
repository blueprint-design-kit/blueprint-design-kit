import { describe, test, expect } from 'vitest';
import { nestSubdirectories } from './nestSubdirectories';

describe('nestSubdirectories', () => {

    describe('empty and flat input', () => {
        test('returns empty __ array for empty input', () => {
            const result = nestSubdirectories([]);
            expect(result).toEqual({
                __: [],
            });
        });

        test('places a single flat component in the root __ array', () => {
            const result = nestSubdirectories(['Button']);
            expect(result).toEqual({
                __: ['Button'],
            });
        });

        test('places multiple flat components in the root __ array', () => {
            const result = nestSubdirectories(['Button', 'Input']);
            expect(result).toEqual({
                __: ['Button', 'Input'],
            });
        });
    });

    describe('single-level subdirectories', () => {
        test('nests a component under its subdirectory key', () => {
            const result = nestSubdirectories(['ui/Button']);
            expect(result).toEqual({
                __: [],
                ui: {
                    __: ['Button'],
                },
            });
        });

        test('groups multiple components under the same subdirectory', () => {
            const result = nestSubdirectories(['ui/Button', 'ui/Input']);
            expect(result).toEqual({
                __: [],
                ui: {
                    __: ['Button', 'Input'],
                },
            });
        });

        test('creates separate keys for different subdirectories', () => {
            const result = nestSubdirectories(['forms/Input', 'ui/Button']);
            expect(result).toEqual({
                __: [],
                forms: {
                    __: ['Input'],
                },
                ui: {
                    __: ['Button'],
                },
            });
        });

        test('places flat and nested components correctly alongside each other', () => {
            const result = nestSubdirectories(['Standalone', 'ui/Button']);
            expect(result).toEqual({
                __: ['Standalone'],
                ui: {
                    __: ['Button'],
                },
            });
        });
    });

    describe('multi-level subdirectories', () => {
        test('nests a component multiple levels deep', () => {
            const result = nestSubdirectories(['ui/components/Button']);
            expect(result).toEqual({
                __: [],
                ui: {
                    __: [],
                    components: {
                        __: ['Button'],
                    },
                },
            });
        });

        test('handles components at different depths in the same tree', () => {
            const result = nestSubdirectories([
                'ui/Button',
                'ui/components/Input',
                'ui/components/Checkbox',
                'ui/components/forms/Email',
            ]);
            expect(result).toEqual({
                __: [],
                ui: {
                    __: ['Button'],
                    components: {
                        __: ['Input', 'Checkbox'],
                        forms: {
                            __: ['Email'],
                        },
                    },
                },
            });
        });
    });

    describe('collapseSameNameDirectories', () => {
        test('collapses a directory with a single component that shares its name', () => {
            const result = nestSubdirectories(['Button/Button', 'Input']);
            expect(result).toEqual({
                __: ['Button/Button', 'Input'],
            });
        });

        test('does not collapse when a directory contains multiple components', () => {
            const result = nestSubdirectories(['Button/Button', 'Button/Other']);
            expect(result).toEqual({
                __: [],
                Button: {
                    __: ['Button', 'Other'],
                },
            });
        });

        test('collapses matching directories recursively at deeper levels', () => {
            const result = nestSubdirectories(['ui/Root', 'ui/Button/Button', 'ui/Other/Input']);
            expect(result).toEqual({
                __: [],
                ui: {
                    __: ['Button/Button', 'Root'],
                    Other: {
                        __: ['Input'],
                    },
                },
            });
        });
    });

});
