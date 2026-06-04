import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Blueprint } from './Blueprint';
import * as validateBlueprintModule from './validateBlueprint';
import * as validatePropsModule from './validateProps';

describe('Blueprint', () => {

    describe('new Blueprint()', () => {

        beforeEach(() => {
            vi.clearAllMocks();
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        test('handles invalid blueprint configurations', () => {
            const spy = vi.spyOn(validateBlueprintModule, 'validateBlueprint');
            const bp = new Blueprint({ schema: {} });
            bp.make();
            expect(spy).toHaveBeenCalled();
        });

        test('returns a blueprint instance', () => {
            const bp = new Blueprint({ schema: {} });
            expect(typeof bp.make).toBe('function');
            const {
                getLinks,
                getNotes,
                getSchema,
                getVariant,
                listVariants,
                validateProps,
                withDefaultProps,
            } = bp.make();

            expect(typeof getLinks).toBe('function');
            expect(typeof getNotes).toBe('function');
            expect(typeof getSchema).toBe('function');
            expect(typeof getVariant).toBe('function');
            expect(typeof listVariants).toBe('function');
            expect(typeof validateProps).toBe('function');
            expect(typeof withDefaultProps).toBe('function');

            expect(getLinks()).toEqual([]);
            expect(getNotes()).toBeUndefined();
            expect(getSchema()).toEqual({});
            expect(getVariant()).toBeUndefined();
            expect(listVariants()).toEqual([]);
            expect(validateProps({})).toBeUndefined();
            expect(withDefaultProps({})).toEqual({});
        });

        test('getLinks', () => {
            const mockedLinks = [
                'https://example.com',
                { url: 'https://example.com', type: 'Example', icon: 'ReactNode' },
            ];
            const mockedLinksFr = [
                'https://example.com/fr',
            ];
            const bp = new Blueprint({
                schema: {},
                links: mockedLinks,
                locales: {
                    fr: {
                        links: mockedLinksFr,
                    },
                },
            });
            const { getLinks } = bp.make();
            expect(getLinks()).toBe(mockedLinks);
            expect(getLinks('fr')).toBe(mockedLinksFr);
        });

        test('getNotes', () => {
            const mockedNotes = 'These are some notes about this component';
            const mockedNotesFr = 'Voici quelques notes sur ce composant';
            const bp = new Blueprint({
                schema: {},
                notes: mockedNotes,
                locales: {
                    fr: {
                        notes: mockedNotesFr,
                    },
                },
            });
            const { getNotes } = bp.make();
            expect(getNotes()).toBe(mockedNotes);
            expect(getNotes('fr')).toBe(mockedNotesFr);
        });

        test('getSchema', () => {
            const mockedSchema = {
                propOne: {
                    default: 123,
                    type: ['number', 'undefined'],
                    source: 'http://datasource.com/123',
                    allow: [123, 456],
                    min: 100,
                    max: 500,
                },
            };
            const mockedSchemaFr = {
                propOne: {
                    default: 999,
                },
            };
            const bp = new Blueprint({
                schema: mockedSchema,
                locales: {
                    fr: {
                        schema: mockedSchemaFr,
                    },
                },
            });
            const { getSchema } = bp.make();
            expect(getSchema()).toBe(mockedSchema);
            expect(getSchema('fr')).toBe(mockedSchemaFr);
        });

        test('getVariant', () => {
            const v1 = {
                props: { propOne: 123 },
                state: { stateOne: 'abc' },
                expectation: 'Variant 1 expectation',
            };
            const v2 = {
                props: { propOne: 456 },
            };
            const v3 = {
                props: { propOne: 999 },
            };
            const bp = new Blueprint({
                schema: {},
                variants: {
                    v1,
                    'v-2': v2,
                },
                locales: {
                    fr: {
                        variants: {
                            v3,
                        },
                    },
                },
            });
            const { getVariant } = bp.make();
            expect(getVariant()).toBe(v1);
            expect(getVariant('v1')).toBe(v1);
            expect(getVariant('v-2')).toBe(v2);
            expect(getVariant('v3', 'fr')).toBe(v3);
            expect(getVariant(undefined, 'fr')).toBe(v3);
            expect(() => getVariant('v3')).toThrow('Blueprint variant "v3" not found');
        });

        test('listVariants', () => {
            const bp = new Blueprint({
                schema: {},
                variants: {
                    v1: {},
                    'v-2': {},
                },
                locales: {
                    fr: {
                        variants: {
                            v3: {},
                        },
                    },
                },
            });
            const { listVariants } = bp.make();
            expect(listVariants()).toEqual(['v1', 'v-2']);
            expect(listVariants('fr')).toEqual(['v3']);
        });

        test('validateProps', () => {
            const spy = vi.spyOn(validatePropsModule, 'validatePropsAgainstSchema');
            const schema = { p1: { type: 'string' } };
            const schemaFr = { p2: { type: 'string' } };
            const props = { foo: 'bar' };
            const bp = new Blueprint({
                schema: schema,
                locales: { fr: { schema: schemaFr } },
            });
            const { validateProps } = bp.make();
            validateProps(props);
            expect(spy).toHaveBeenCalledExactlyOnceWith(props, schema, '');
            validateProps(props, 'fr');
            expect(spy).toHaveBeenCalledWith(props, schemaFr, '');
        });

        test('withDefaultProps', () => {
            vi.spyOn(validatePropsModule, 'validatePropsAgainstSchema');
            const schema = { p1: { default: 1 } };
            const schemaFr = { p2: { default: 2 } };
            const props = { foo: 'bar' };
            const bp = new Blueprint({
                schema: schema,
                locales: { fr: { schema: schemaFr } },
            });
            const { withDefaultProps } = bp.make();
            expect(withDefaultProps({ p1: 99 })).toStrictEqual({ p1: 99 });
            expect(withDefaultProps(props)).toStrictEqual({ p1: 1, foo: 'bar' });
            expect(withDefaultProps(props, 'fr')).toStrictEqual({ p2: 2, foo: 'bar' });
        });

    });

});
