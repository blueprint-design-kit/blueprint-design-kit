'use client';

import { setUrlParam } from '../../../utils/urlParam.js';

const PARAM_NAME = 'device';

export type ToggleDeviceModeOptions = {
    currentValue: 'mobile' | 'tablet' | 'desktop' | undefined;
    defaultValue?: 'mobile' | 'tablet' | 'desktop' | undefined;
    includeTablet?: boolean | undefined;
    breakpoints?: {
        mobile?: number;
        tablet?: number;
        desktop?: number;
    };
    customClasses?: {
        mobile?: string;
        tablet?: string;
        desktop?: string;
    };
};

function findNextDevice(currentValue: 'mobile' | 'tablet' | 'desktop' | undefined, includeTablet?: boolean) {
    if (currentValue === 'mobile') {
        if (includeTablet) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    } else if (currentValue === 'tablet') {
        return 'desktop';
    } else {
        return 'mobile';
    }
}

export function ToggleDeviceMode({ currentValue, defaultValue, includeTablet }: ToggleDeviceModeOptions) {
    currentValue = currentValue || defaultValue || 'mobile';
    const nextDevice = findNextDevice(currentValue, includeTablet);
    const switchTo = `Switch to ${nextDevice}`;

    function toggleDeviceParam() {
        setUrlParam(PARAM_NAME, nextDevice);
    }

    return <>
        <div
            className="blueprint-layout-preview-control-device-mode"
            data-currentdevice={currentValue}
            data-nextdevice={nextDevice}
            onClick={toggleDeviceParam}
        >
            <svg className="blueprint-device-icons" width="26" height="26" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                <title>{switchTo}</title>
                <g fill="currentColor" fillRule="evenodd">
                    <path className="blueprint-device-desktop" d="M23.7526192,2 C24.9434832,2 25.9182642,2.92516159 25.9974284,4.09595119 L26.0026192,4.25 L26.0026192,15.5 C26.0026192,16.690864 25.0774577,17.6656449 23.9066681,17.7448092 L23.7526192,17.75 L18.5,17.75 L18.5,20.5 L20.25,20.5 C20.6642136,20.5 21,20.8357864 21,21.25 C21,21.6296958 20.7178461,21.943491 20.3517706,21.9931534 L20.25,22 L11,22 C10.5,22 10.2,21.9 10,21.5 C10,21.5 9.85,20.5 11,20.5 L11,20.5 L12.75,20.5 L12.75,17.75 L7.25,17.75 C7,17.75 5.5,17.75 5,16.3 L5,16 L5,9 L5,4.25 C5,3.05913601 5.92516159,2.08435508 7.09595119,2.00519081 L7.25,2 L23.7526192,2 Z" />
                    <path className="blueprint-device-tablet" d="M9.74655313,10 C10.9374171,10 11.912198,10.9251616 11.9913623,12.0959512 L11.9965531,12.25 L11.9965531,23.75 C11.9965531,24.940864 11.0713915,25.9156449 9.90060194,25.9948092 L9.74655313,26 L4.25,26 C3.05913601,26 2.08435508,25.0748384 2.00519081,23.9040488 L2,23.75 L2,12.25 C2,11.059136 2.92516159,10.0843551 4.09595119,10.0051908 L4.25,10 L9.74655313,10 Z M7.74998714,23 L6.24883511,23 L6.14706455,23 C5.78098899,23.056509 5.49883511,23.1 5.49883511,23.5 C5.49883511,23.7 5.78098899,24 6.14706455,24 L6.24883511,24 L7.74998714,24 L7.8517577,23.9931534 C8.21783326,23.943491 8.49998714,23.7296958 8.49998714,23.5 C8.49998714,23.25 8.21783326,23 7.8517577,23.0068466 L7.74998714,23 Z" />
                    <path className="blueprint-device-mobile" d="M9.74655313,10 C10.9374171,10 11.912198,10.9251616 11.9913623,12.0959512 L11.9965531,12.25 L11.9965531,23.75 C11.9965531,24.940864 11.0713915,25.9156449 9.90060194,25.9948092 L9.74655313,26 L4.25,26 C3.05913601,26 2.08435508,25.0748384 2.00519081,23.9040488 L2,23.75 L2,12.25 C2,11.059136 2.92516159,10.0843551 4.09595119,10.0051908 L4.25,10 L9.74655313,10 Z M7,22.5 L7,22.5 C7,22.5 6,22.5 6.05,23.3 L6,23.5 C6.25,24.3 6.5,24.3 6.6,24.42 L7,24.5 C7.57,24.4 7.58,24.25 7.85,23.9 L8,23.5 C8,22.5 7.3,22.5 7.25,22.5 Z M3.5,11.5 L10.5,11.5 L10.5,21 L3.5,21 Z" />
                </g>
            </svg>
        </div>
    </>;
};
