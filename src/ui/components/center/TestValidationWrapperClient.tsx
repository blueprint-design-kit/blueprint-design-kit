"use client";

import { deserializeProps } from "../../utils/serializeProps.js";

import type { BlueprintProps } from "../../../blueprint/types.js";

interface TestValidationWrapperClientProps {
    key: number;
    component: React.FunctionComponent;
    props: BlueprintProps;
}

export default function TestValidationWrapperClient({
    key,
    component: FunctionComponent,
    props,
}: TestValidationWrapperClientProps) {
    return <FunctionComponent key={key} {...deserializeProps(props)} />;
}
