'use server';

import { getComponent } from '../../../blueprint/getComponent.js';
import PreviewMain from './PreviewMain.js';

import type { ReactElement, ReactNode } from 'react';
import type { BlueprintProps } from '../../../blueprint/types.js';

export interface PreviewWrapperProps {
    componentPath: string;
    variantProps: BlueprintProps | BlueprintProps[];
    expectation?: ReactNode | undefined;
}

export default async function PreviewWrapperServer({ componentPath, variantProps, expectation }: PreviewWrapperProps) {
    const FunctionComponent = await getComponent(componentPath);
    if (!FunctionComponent) {
        throw new Error(`Component "${componentPath}" not found.`);
    }

    let component: ReactElement;
    if (Array.isArray(variantProps)) {
        const componentPromises = variantProps.map(async (p = {}, i) => {
            return <FunctionComponent key={i} {...p} />;
        });
        component = <>{await Promise.all(componentPromises)}</>;
    } else {
        component = <FunctionComponent {...variantProps} />;
    }

    return <PreviewMain component={component} expectation={expectation} />;
}
