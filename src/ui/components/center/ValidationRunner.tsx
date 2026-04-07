import { ValidationRunnerClient } from './ValidationRunnerClient.js';
import { getValidations } from './ValidationRunnerActions.js';

import type { GetValidationsProps } from './ValidationRunnerActions.js';

export default async function ValidationRunner({ urlPath, onPropsReady }: GetValidationsProps) {
    const validations = await getValidations({ urlPath, onPropsReady });

    return <ValidationRunnerClient
        validations={validations}
    />;
}
