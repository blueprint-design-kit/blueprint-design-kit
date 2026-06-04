'use server';

import { getBlueprint } from './getBlueprint.js';
import { getComponent } from './getComponent.js';
import { listComponents } from './listComponents.js';

import type { ReactElement, ReactNode } from 'react';

type OnPropsReady = (
    selectedComponent: string,
    selectedVariant: string | undefined,
    props: Record<string, any>,
) => Promise<Record<string, any>>;

type Expectation = {
    variantName: string;
    expectation?: ReactNode;
    component?: ReactElement;
    errorMessage?: string | undefined;
};

export type ExpectationValidation = {
    componentName: string;
    expectations?: Expectation[] | undefined;
}

export type GetValidationsProps = {
    filter?: string | undefined;
    onPropsReady?: OnPropsReady | undefined;
};

export async function getTestValidations({ filter, onPropsReady }: GetValidationsProps) {
    const validations: ExpectationValidation[] = [];

    let componentList = await listComponents();
    if (filter) {
        componentList = componentList.filter((componentName) => {
            const match = componentName.toLowerCase().match(filter);
            return match && match[0];
        });
    }
    for (const componentName of componentList) {
        const blueprint = await getBlueprint(componentName);
        if (blueprint) {
            const { getVariant, listVariants, validateProps } = blueprint;
            const variantNames = listVariants();
            if (variantNames.length) {
                const expectations: ExpectationValidation['expectations'] = [];
                for (const variantName of variantNames) {
                    let variant = getVariant(variantName);
                    if (variant) {
                        const propsArray = Array.isArray(variant.props) ? variant.props : [variant.props];
                        let invalidProps;
                        for (const [index, p] of propsArray.entries()) {
                            invalidProps = validateProps(p);
                            if (invalidProps) {
                                expectations.push({
                                    variantName,
                                    errorMessage: `${invalidProps} ${variantName}${index ? `[${index}]` : ''}`,
                                });
                                break;
                            }
                        }
                        if (invalidProps) {
                            continue;
                        }
                        const expectation = variant.expectation;
                        if (expectation) {
                            try {
                                const FunctionComponent = await getComponent(componentName);
                                if (!FunctionComponent) {
                                    throw new Error(`Component "${componentName}" not found.`);
                                }
                                const promises = propsArray.map(async (props = {}, i) => {
                                    if (typeof onPropsReady === 'function') {
                                        Object.assign(props, await onPropsReady(componentName, `${variantName}${i ? `[${i}]` : ''}`, props));
                                    }
                                    return <FunctionComponent key={i} {...props} />;
                                });
                                const component = <>{await Promise.all(promises)}</>;
                                expectations.push({
                                    variantName,
                                    expectation,
                                    component,
                                });
                            } catch (error) {
                                console.log(error);
                                expectations.push({
                                    variantName,
                                    errorMessage: String(error),
                                });
                            }
                        }
                    }
                }

                validations.push({
                    componentName,
                    expectations,
                });
            } else {
                validations.push({ componentName });
            }
        } else {
            validations.push({ componentName });
        }
    };

    return validations;
}
