import { describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { ClientVsServerTags } from './ClientVsServerTags';

describe('ClientVsServerTags', () => {
    test('renders "use client" badge with correct classes when useClient is true', async () => {
        render(<ClientVsServerTags useClient={true} useServer={undefined} />);

        const badge = page.getByText('use client');
        await expect.element(badge).toBeInTheDocument();
        await expect.element(badge).toHaveClass('blueprint-layout-client-server-badge');
        await expect.element(badge).toHaveClass('blueprint-layout-use-client-badge');
    });

    test('renders "use server" badge with correct classes when useServer is true', async () => {
        render(<ClientVsServerTags useClient={undefined} useServer={true} />);

        const badge = page.getByText('use server');
        await expect.element(badge).toBeInTheDocument();
        await expect.element(badge).toHaveClass('blueprint-layout-client-server-badge');
        await expect.element(badge).toHaveClass('blueprint-layout-use-server-badge');
    });

    test('renders nothing when both useClient and useServer are undefined', async () => {
        await render(<ClientVsServerTags useClient={undefined} useServer={undefined} />);

        expect(document.body.querySelector('.blueprint-layout-client-server-badge')).toBeNull();
    });

    test('renders nothing when options is false', async () => {
        await render(<ClientVsServerTags useClient={true} useServer={undefined} options={false} />);

        expect(document.body.querySelector('.blueprint-layout-client-server-badge')).toBeNull();
    });
});
