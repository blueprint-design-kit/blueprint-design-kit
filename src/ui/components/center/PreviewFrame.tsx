import { ToggleDarkMode, type ToggleDarkModeOptions } from './previewControls/ToggleDarkMode.js';
import { ToggleDeviceMode, type ToggleDeviceModeOptions } from './previewControls/ToggleDeviceMode.js';
import { CopyAsJsxButton, type CopyAsJsxOptions } from './previewControls/CopyAsJsxButton.js';
import { MAIN_CONTENT_ID } from '../../../config/constants.js';

import type { ReactNode } from 'react';

export type PreviewFrameProps = {
    component: ReactNode;
    expectation?: ReactNode | undefined;
    darkMode?: ToggleDarkModeOptions | false | undefined;
    deviceMode?: ToggleDeviceModeOptions | false | undefined;
    copyJSX?: CopyAsJsxOptions | false | undefined;
};

function getBreakpoint(deviceMode?: ToggleDeviceModeOptions | false | undefined) {
    const defaultMobile = 375;
    const defaultTablet = 768;
    if (deviceMode) {
        if (deviceMode.currentValue === 'mobile') {
            return deviceMode.breakpoints?.mobile || defaultMobile;
        } else if (deviceMode.currentValue === 'tablet') {
            return deviceMode.breakpoints?.tablet || defaultTablet;
        } else {
            return deviceMode.breakpoints?.desktop || undefined;
        }
    }
    return;
}

function getCustomDeviceClasses(deviceMode?: ToggleDeviceModeOptions | false | undefined) {
    if (deviceMode && deviceMode.customClasses && deviceMode.currentValue) {
        return deviceMode.customClasses[deviceMode?.currentValue] || '';
    }
    return '';
}

export default function PreviewFrame({
    component,
    darkMode,
    deviceMode,
    copyJSX,
}: PreviewFrameProps) {
    if (deviceMode) {
        deviceMode.currentValue = deviceMode.currentValue || deviceMode.defaultValue || 'mobile';
    }
    const currentBreakpoint = getBreakpoint(deviceMode);
    const customDeviceClasses = getCustomDeviceClasses(deviceMode);
    const mainStyle = {
        width: currentBreakpoint ? `${currentBreakpoint}px` : '100%',
    };

    return <>
        <div className={`blueprint-layout-preview-frame-outer blueprint-reset-self ${darkMode && darkMode.currentValue || ''}`}>
            <div className="blueprint-layout-preview-frame blueprint-reset-self">
                <div className="blueprint-layout-preview-wrapper blueprint-reset-self">
                    <div className={`blueprint-layout-device-wrapper blueprint-reset-self ${customDeviceClasses}`} style={mainStyle}>
                        {component}
                    </div>
                </div>
                <div className="blueprint-layout-preview-controls blueprint-reset">
                    {darkMode && <ToggleDarkMode {...darkMode} />}
                    {deviceMode && <ToggleDeviceMode {...deviceMode} />}
                    {copyJSX && <CopyAsJsxButton selectorId={MAIN_CONTENT_ID} />}
                </div>
            </div>
        </div>
    </>;
}
