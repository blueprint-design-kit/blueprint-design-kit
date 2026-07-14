import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTestValidations } from './getTestValidations';
import { getBlueprint } from './getBlueprint.js';
import { getComponent } from './getComponent.js';
import { getComponentMeta } from './getComponentMeta.js';
import { listComponents } from './listComponents.js';
import { serializePropsForPassing } from '../ui/utils/serializeProps.js';

vi.mock(import('./getBlueprint.js'), () => {
    return {
        getBlueprint: vi.fn(),
    };
});

vi.mock(import('./getComponent.js'), () => {
    return {
        getComponent: vi.fn(),
    };
});

vi.mock(import('./getComponentMeta.js'), () => {
    return {
        getComponentMeta: vi.fn(),
    };
});

vi.mock(import('./listComponents.js'), () => {
    return {
        listComponents: vi.fn(),
    };
});

vi.mock(import('../ui/utils/serializeProps.js'), () => {
    return {
        serializePropsForPassing: vi.fn((props) => props),
    };
});

describe('getTestValidations', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('builds expectations with filtered components and resolved props', async () => {
        const mockedListComponents = vi.mocked(listComponents);
        const mockedGetBlueprint = vi.mocked(getBlueprint);
        const mockedGetComponent = vi.mocked(getComponent);

        const validateProps = vi.fn().mockReturnValue(undefined);

        mockedListComponents.mockResolvedValue([{ path: 'Button', meta: {} }, { path: 'Card', meta: {} }]);
        // @ts-expect-error - simplified mock for testing
        mockedGetBlueprint.mockImplementation(async (componentName: string) => {
            if (componentName === 'Button') {
                return {
                    listVariants: () => ['default'],
                    getVariant: () => ({
                        props: [{ size: 'm' }, { size: 'l' }],
                        expectation: 'renders correctly',
                    }),
                    validateProps,
                };
            }
            return undefined;
        });
        mockedGetComponent.mockResolvedValue((props: Record<string, unknown>) => String(props.size));

        const onPropsReady = vi.fn().mockResolvedValue({ extra: 'resolved' });
        const validations = await getTestValidations({ filter: 'but', onPropsReady });

        expect(mockedListComponents).toHaveBeenCalledOnce();
        expect(mockedGetBlueprint).toHaveBeenCalledOnce();
        expect(mockedGetBlueprint).toHaveBeenCalledWith('Button');
        expect(mockedGetComponent).toHaveBeenCalledOnce();
        expect(mockedGetComponent).toHaveBeenCalledWith('Button');

        expect(validateProps).toHaveBeenCalledTimes(2);
        expect(validateProps).toHaveBeenNthCalledWith(1, {
            extra: 'resolved',
            size: 'm',
        });
        expect(validateProps).toHaveBeenNthCalledWith(2, {
            extra: 'resolved',
            size: 'l',
        });

        expect(onPropsReady).toHaveBeenCalledTimes(2);
        expect(onPropsReady).toHaveBeenNthCalledWith(1,
            'Button',
            'default',
            { extra: 'resolved', size: 'm' },
        );
        expect(onPropsReady).toHaveBeenNthCalledWith(2,
            'Button',
            'default[1]',
            { extra: 'resolved', size: 'l' },
        );

        expect(validations).toHaveLength(1);
        expect(validations[0].componentName).toBe('Button');
        expect(validations[0].expectations).toHaveLength(1);
        expect(validations[0].expectations?.[0].variantName).toBe('default');
        expect(validations[0].expectations?.[0].expectation).toBe('renders correctly');

        const component = validations[0].expectations?.[0].component as { props: { children: { props: { extra: unknown } }[] } };
        expect(component).toBeTruthy();
        expect(component.props.children).toHaveLength(2);
        expect(component.props.children[0].props.extra).toBe('resolved');
        expect(component.props.children[1].props.extra).toBe('resolved');
    });

    test('records validation errors and skips rendering for invalid props', async () => {
        const mockedListComponents = vi.mocked(listComponents);
        const mockedGetBlueprint = vi.mocked(getBlueprint);
        const mockedGetComponent = vi.mocked(getComponent);

        const validateProps = vi
            .fn()
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce('Invalid prop "size"');

        mockedListComponents.mockResolvedValue([{ path: 'Button', meta: {} }]);
        // @ts-expect-error - simplified mock for testing
        mockedGetBlueprint.mockResolvedValue({
            listVariants: () => ['default'],
            getVariant: () => ({
                props: [{ size: 'm' }, { size: 'bad' }],
                expectation: 'renders correctly',
            }),
            validateProps,
        });

        const validations = await getTestValidations({});

        expect(mockedGetComponent).not.toHaveBeenCalled();
        expect(validations).toEqual([
            {
                componentName: 'Button',
                expectations: [
                    {
                        variantName: 'default',
                        errorMessage: 'Invalid prop "size" default[1]',
                    },
                ],
            },
        ]);
    });

    test('handles missing blueprints, empty variants, and component load failures', async () => {
        const mockedListComponents = vi.mocked(listComponents);
        const mockedGetBlueprint = vi.mocked(getBlueprint);
        const mockedGetComponent = vi.mocked(getComponent);
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

        mockedListComponents.mockResolvedValue([
            { path: 'A', meta: {} },
            { path: 'B', meta: {} },
            { path: 'C', meta: {} },
        ]);
        // @ts-expect-error - simplified mock for testing
        mockedGetBlueprint.mockImplementation(async (componentName: string) => {
            if (componentName === 'A') {
                return undefined;
            }
            if (componentName === 'B') {
                return {
                    listVariants: () => [],
                    getVariant: () => undefined,
                    validateProps: () => undefined,
                };
            }
            return {
                listVariants: () => ['v1'],
                getVariant: () => ({
                    props: {},
                    expectation: 'should render',
                }),
                validateProps: () => undefined,
            };
        });
        mockedGetComponent.mockResolvedValue(undefined);

        const validations = await getTestValidations({});

        expect(consoleSpy).toHaveBeenCalledOnce();
        expect(validations).toEqual([
            { componentName: 'A' },
            { componentName: 'B' },
            {
                componentName: 'C',
                expectations: [
                    {
                        variantName: 'v1',
                        errorMessage: 'Error: Component "C" not found.',
                    },
                ],
            },
        ]);
    });

    test('wraps component in TestValidationWrapperClient when useClient is true', async () => {
        const mockedListComponents = vi.mocked(listComponents);
        const mockedGetBlueprint = vi.mocked(getBlueprint);
        const mockedGetComponent = vi.mocked(getComponent);
        const mockedGetComponentMeta = vi.mocked(getComponentMeta);
        const mockedSerializePropsForPassing = vi.mocked(serializePropsForPassing);

        mockedListComponents.mockResolvedValue([{ path: 'Button', meta: {} }]);
        mockedGetComponentMeta.mockResolvedValue({ useClient: true });
        // @ts-expect-error - simplified mock for testing
        mockedGetBlueprint.mockResolvedValue({
            listVariants: () => ['default'],
            getVariant: () => ({
                props: { size: 'm' },
                expectation: 'renders correctly',
            }),
            validateProps: vi.fn().mockReturnValue(undefined),
        });
        const FunctionComponent = (props: Record<string, unknown>) => String(props.size);
        mockedGetComponent.mockResolvedValue(FunctionComponent);

        const validations = await getTestValidations({});

        expect(validations).toHaveLength(1);
        expect(validations[0].expectations).toHaveLength(1);

        const component = validations[0].expectations?.[0].component;
        expect(component).toBeTruthy();

        // Props are serialized before being passed to TestValidationWrapperClient
        expect(mockedSerializePropsForPassing).toHaveBeenCalledOnce();
        expect(mockedSerializePropsForPassing).toHaveBeenCalledWith({ size: 'm' });

        // TestValidationWrapperClient receives component and serialized props, not spread props
        const child = (component as { props: { children: { props: { component: unknown; props: unknown } }[] } }).props.children[0];
        expect(child.props.component).toBe(FunctionComponent);
        expect(child.props.props).toEqual({ size: 'm' });
    });

});
