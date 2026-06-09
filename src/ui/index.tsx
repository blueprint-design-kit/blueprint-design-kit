import '../../css/layout.js';
import '../../css/theme-default.js';
import '../../css/preview-controls.js';

import { getBlueprint } from '../blueprint/getBlueprint.js';
import { getComponentMeta } from '../blueprint/getComponentMeta.js';
import { listComponents } from '../blueprint/listComponents.js';
import { TEST_RUNNER_URL_PATH } from '../config/constants.js';

import type { BlueprintSchema, BlueprintProps, BlueprintState, BlueprintVariant, BlueprintLinks } from '../blueprint/types.js';
import type { ReactNode } from 'react';

import BlueprintLayout from './components/BlueprintLayout.js';
import ComponentMenu from './components/left/ComponentMenu.js';
import DocumentationViewer from './components/center/DocumentationViewer.js';
import LinksMenu from './components/center/LinksMenu.js';
import PageTitle from './components/left/PageTitle.js';
import PreviewFrame from './components/center/PreviewFrame.js';
import PropsExplorer from './components/right/PropsExplorer.js';
import TestRunner from './components/center/TestRunner.js';
import TestRunnerLink from './components/left/TestRunnerLink.js';
import TestRunnerLauncher from './components/center/TestRunnerLauncher.js';
import VariantPicker from './components/right/VariantPicker.js';
import PropsProvider from './PropsProvider.js';
import StateProvider from './StateProvider.js';
import PreviewWrapperClient from './components/center/PreviewWrapperClient.js';
import PreviewWrapperServer from './components/center/PreviewWrapperServer.js';

export { useState, useReducer } from './StateProvider.js';

export {
    ComponentMenu,
    DocumentationViewer,
    LinksMenu,
    PreviewFrame,
    PropsExplorer,
    TestRunner,
    VariantPicker,
};

export type BlueprintUIProps = {
    componentPath?: string;
    locale?: string;
    activeState?: {
        variant?: string;
        dark?: string;
        device?: 'mobile' | 'tablet' | 'desktop' | undefined;
        filter?: string;
    };
    options?: {
        pageTitle?: ReactNode;
        baseUrl?: string;
        documentation?: Record<string, ReactNode>;
        componentMenu?: {
            searchBar?: boolean;
        };
        linksMenu?: {
            reversed?: boolean;
        };
        darkMode?: {
            customClassName?: string;
        } | false;
        deviceMode?: {
            includeTablet?: boolean;
            defaultValue?: 'mobile' | 'tablet' | 'desktop';
            breakpoints?: {
                mobile: number;
                tablet: number;
                desktop: number;
            };
            customClasses?: {
                mobile?: string;
                tablet?: string;
                desktop?: string;
            };
        } | false;
        copyJSX?: object | false;
        onPropsReady?: (
                selectedComponent: string | undefined,
                selectedVariant: string | undefined,
                props: Record<string, unknown>,
            ) => Promise<Record<string, unknown>>;
    };
};

export default async function BlueprintComponentUI({
    componentPath,
    locale,
    activeState,
    options = {},
}: BlueprintUIProps) {
    const { pageTitle, documentation, onPropsReady, darkMode, deviceMode, copyJSX, componentMenu } = options;
    const baseUrl = options.baseUrl || '/blueprint';
    const linksMenu = options.linksMenu || { reversed: true }; // we display right-aligned
    const selectedVariant = activeState?.variant || '';
    const darkModeParams = darkMode === false ? false : {
        currentValue: activeState?.dark,
        ...darkMode,
    };
    const deviceModeParams = deviceMode === false ? false : {
        currentValue: activeState?.device,
        ...deviceMode,
    };
    const copyJSXParams = copyJSX === false ? false : {
        ...copyJSX,
    };

    const documentationList = documentation ? Object.keys(documentation) : [];
    const componentList = await listComponents();
    let schema: BlueprintSchema | undefined = void 0;
    let links: BlueprintLinks = [];
    let notes: ReactNode = null;
    let variants: string[] = [];
    let variantProps: BlueprintProps | BlueprintProps[] = {};
    let variantState: BlueprintState = {};
    let useClient: boolean | undefined = void 0;

    let Center = null;
    if (componentPath) {
        if (componentPath === TEST_RUNNER_URL_PATH) {
            Center = <TestRunnerLauncher />;

        } else if (componentPath.startsWith(`${TEST_RUNNER_URL_PATH}/`)) {
            const testFilter = componentPath === `${TEST_RUNNER_URL_PATH}/*` ? '' : componentPath.replace(`${TEST_RUNNER_URL_PATH}/`, '').toLowerCase();
            Center = <TestRunner filter={testFilter} onPropsReady={onPropsReady} />;

        } else if (documentation && documentationList.includes(componentPath)) {
            Center = <DocumentationViewer content={documentation[componentPath]} />;

        } else {
            let variant: BlueprintVariant | undefined = void 0;
            let expectation: ReactNode = null;
            const selectedBlueprint = await getBlueprint(componentPath);
            const validateProps = selectedBlueprint?.validateProps || (() => null);
            if (selectedBlueprint) {
                const { getLinks, getNotes, getSchema, getVariant, listVariants } = selectedBlueprint;
                schema = getSchema(locale);
                links = getLinks(locale);
                notes = getNotes(locale);
                variants = listVariants(locale);
                variant = getVariant(selectedVariant, locale); // gets the selected variant or defaults to the first variant in the config
                if (variant) {
                    variant.props = variant.props || {};
                    variantState = variant.state || {};
                    expectation = variant.expectation;
                }
            }

            const componentMeta = await getComponentMeta(componentPath);
            useClient = componentMeta?.useClient;

            async function extendAndValidateProps(propsPassed: BlueprintProps, i?: number) {
                let propsInternal = propsPassed;
                if (typeof onPropsReady === 'function') {
                    const adjustedProps = await onPropsReady(
                        componentPath,
                        `${selectedVariant}${typeof i === 'number' ? `[${i}]` : ''}`,
                        propsInternal,
                    );
                    propsInternal = adjustedProps || propsInternal;
                }
                const invalidProps = validateProps(propsInternal);
                if (invalidProps) {
                    console.error(`${invalidProps} ${selectedVariant}${typeof i === 'number' ? `[${i}]` : ''}`);
                }
                return propsInternal;
            }

            variantProps = variant && variant.props || {};
            if (Array.isArray(variantProps)) {
                const extendPromises = variantProps.map(async (p = {}, i) => {
                    return await extendAndValidateProps(p, i);
                });
                variantProps = await Promise.all(extendPromises);
            } else {
                variantProps = await extendAndValidateProps(variantProps);
            }

            const component = useClient ?
                <PreviewWrapperClient
                    componentPath={componentPath}
                    expectation={expectation}
                /> :
                <PreviewWrapperServer
                    componentPath={componentPath}
                    variantProps={variantProps}
                    expectation={expectation}
                />;

            Center = <PreviewFrame
                component={component}
                expectation={expectation}
                darkMode={darkModeParams}
                deviceMode={deviceModeParams}
                copyJSX={copyJSXParams}
            />;
        }
    }

    const Header = (
        <>
            {PageTitle({ title: pageTitle, baseUrl })}
            {LinksMenu({ links, ...linksMenu })}
        </>
    );
    const Left = ComponentMenu({ documentationList, componentList, componentPath, activeState, baseUrl, ...componentMenu });
    const LeftBottom = TestRunnerLink({ baseUrl });
    const CenterBottom = notes;
    const RightTop = VariantPicker({ variants, selectedVariant });
    const Right = PropsExplorer({ schema, useClient });

    return (
        <main>
            <PropsProvider value={variantProps}>
                <StateProvider value={variantState}>
                    <BlueprintLayout
                        Header={Header}
                        Left={Left}
                        LeftBottom={LeftBottom}
                        Center={Center}
                        CenterBottom={CenterBottom}
                        RightTop={RightTop}
                        Right={Right}
                    />
                </StateProvider>
            </PropsProvider>
        </main>
    );
}
