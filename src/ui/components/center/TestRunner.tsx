import { TestRunnerClient } from './TestRunnerClient.js';
import { getTestValidations } from '../../../blueprint/getTestValidations.js';

import type { GetValidationsProps } from '../../../blueprint/getTestValidations.js';

export default async function TestRunner({ filter, onPropsReady }: GetValidationsProps) {
    const validations = await getTestValidations({ filter, onPropsReady });

    return <TestRunnerClient
        validations={validations}
    />;
}
