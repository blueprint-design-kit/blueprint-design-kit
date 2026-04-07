import { PreviewExpectationValidator } from './PreviewExpectationValidator.js';
import { MAIN_CONTENT_ID, EXPECTATION_CONTENT_ID, EXPECTATION_MESSAGE_ID } from '../../../config/constants.js';

import type { ReactNode } from 'react';

export interface PreviewMainProps {
    component: ReactNode;
    expectation: ReactNode;
}

export default function PreviewMain({ component, expectation }: PreviewMainProps) {
    return <>
        <div className="blueprint-layout-main blueprint-reset-self">
            <div className="blueprint-layout-main-border blueprint-reset-self">
                <div id={MAIN_CONTENT_ID} className="blueprint-layout-main-content blueprint-reset-self">
                    {component}
                </div>
            </div>
        </div>
    {expectation &&
        <div id={EXPECTATION_MESSAGE_ID} className="blueprint-layout-preview-expectation blueprint-reset-self" style={{ display: 'none' }}>
            <div className="blueprint-layout-preview-expectation-main blueprint-reset-self">
                <div className="blueprint-layout-main-border blueprint-reset-self">
                    <div className="blueprint-layout-main-content blueprint-reset-self">
                        <div id={EXPECTATION_CONTENT_ID} className="blueprint-reset-self">{expectation}</div>
                    </div>
                </div>
            </div>
            <PreviewExpectationValidator
                expectation={expectation}
                MAIN_CONTENT_ID={MAIN_CONTENT_ID}
                EXPECTATION_CONTENT_ID={EXPECTATION_CONTENT_ID}
                EXPECTATION_MESSAGE_ID={EXPECTATION_MESSAGE_ID}
            />
        </div>
    }
    </>;
}
