import type { ReactNode } from 'react';

const blueprintLink = 'https://blueprint.build';

interface BlueprintLayoutProps {
    Header?: ReactNode;
    Left?: ReactNode;
    LeftBottom?: ReactNode;
    Center?: ReactNode;
    CenterBottom?: ReactNode;
    RightTop?: ReactNode;
    Right?: ReactNode;
    RightBottom?: ReactNode;
}

export default function BlueprintLayout({
    Header,
    Left,
    LeftBottom,
    Center,
    CenterBottom,
    RightTop,
    Right,
    RightBottom,
}: BlueprintLayoutProps) {
    return <div className="blueprint-ui blueprint-reset-self">
        <div className="blueprint-layout blueprint-reset-self">
            <div className="blueprint-layout-left-region">
                <div className="blueprint-layout-tile blueprint-layout-header blueprint-reset">
                    <div className="blueprint-layout-header-inner">
                        {Header}
                    </div>
                </div>
                <div className="blueprint-layout-body-row">
                    <div className="blueprint-layout-column-left blueprint-reset">
                        <div className="blueprint-layout-tile blueprint-layout-left">
                            {Left}
                        </div>
                        <div className="blueprint-layout-tile blueprint-layout-left-bottom">
                            {LeftBottom || <div>w/ <a target="_blank" href={blueprintLink}>Blueprint</a></div>}
                        </div>
                    </div>
                    <div className="blueprint-layout-column-center blueprint-reset-self">
                        <div className="blueprint-layout-tile blueprint-layout-center blueprint-reset-self">
                            {Center}
                        </div>
                        <div className="blueprint-layout-tile blueprint-layout-center-bottom blueprint-reset">
                            {CenterBottom}
                        </div>
                    </div>
                </div>
            </div>
            <div className="blueprint-layout-column-right blueprint-reset">
                <div className="blueprint-layout-tile blueprint-layout-right-top">
                    {RightTop}
                </div>
                <div className="blueprint-layout-tile blueprint-layout-right">
                    {Right}
                </div>
                <div className="blueprint-layout-tile blueprint-layout-right-bottom">
                    {RightBottom}
                </div>
            </div>
        </div>
    </div>;
};
