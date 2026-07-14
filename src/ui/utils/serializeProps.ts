import type { BlueprintProps } from "../../blueprint/types.js";

const CONTAINS_SERIALIZED_FLAG = '__contains_serialized_functions__';
const IS_SERIALIZED_FUNCTION_FLAG = '__is_serialized_function__';

export type SerializedFunction = {
    [IS_SERIALIZED_FUNCTION_FLAG]: true;
    asString: string;
};

function serialize(props: BlueprintProps) {
    let hasSerialized = false;
    const serialized: BlueprintProps = { [CONTAINS_SERIALIZED_FLAG]: true };
    for (const prop in props) {
        if (typeof props[prop] === 'function') {
            hasSerialized = true;
            serialized[prop] = {
                [IS_SERIALIZED_FUNCTION_FLAG]: true,
                asString: props[prop].toString(),
            };
        } else {
            serialized[prop] = props[prop];
        }
    }
    return hasSerialized ? serialized : props;
}

function deserialize(props: BlueprintProps) {
    if (!props || !props[CONTAINS_SERIALIZED_FLAG]) { return props; }
    const deserialized: BlueprintProps = {};
    for (const prop in props) {
        if (props[prop] && typeof props[prop] === 'object' && IS_SERIALIZED_FUNCTION_FLAG in props[prop]) {
            deserialized[prop] = new Function(`return ${props[prop].asString}`)();
        } else {
            deserialized[prop] = props[prop];
        }
    }
    delete deserialized[CONTAINS_SERIALIZED_FLAG];
    return deserialized;
}

export function serializePropsForPassing(props: BlueprintProps | BlueprintProps[]) {
    if (!props) { return props; }
    if (Array.isArray(props)) {
        return props.map(p => serialize(p));
    } else {
        return serialize(props);
    }
}

export function deserializeProps(props: BlueprintProps | BlueprintProps[]) {
    if (!props) { return props; }
    if (Array.isArray(props)) {
        return props.map(p => deserialize(p));
    } else {
        return deserialize(props);
    }
}
