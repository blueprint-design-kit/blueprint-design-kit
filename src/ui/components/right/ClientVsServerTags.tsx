
export type ClientOrServerProps = {
    useClient: boolean | undefined;
    useServer: boolean | undefined;
    options?: object | false | undefined;
};

export function ClientVsServerTags({ useClient, useServer, options }: ClientOrServerProps) {
    if (options === false) { return null; }

    const commonClass = 'blueprint-layout-client-server-badge';
    if (useClient) {
        return <span className={`${commonClass} blueprint-layout-use-client-badge`}>use client</span>;
    }

    if (useServer) {
        return <span className={`${commonClass} blueprint-layout-use-server-badge`}>use server</span>;
    }

    return null;
}
