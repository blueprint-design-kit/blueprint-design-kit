import { describe, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import PropsExplorerItemHeadline from './PropsExplorerItemHeadline';

describe('PropsExplorerItemHeadline', () => {

    test('renders prop name with colon', async () => {
        render(<PropsExplorerItemHeadline classPrefix="bp" name="color" value="red" types={undefined} />);
        await expect.element(page.getByText('color:')).toBeInTheDocument();
    });

    test('renders value in a typed span when not using client', async () => {
        render(<PropsExplorerItemHeadline classPrefix="bp" name="count" value={42} types={undefined} />);
        await expect.element(page.getByText('count:')).toBeInTheDocument();
        const span = document.querySelector('.bp-value-number');
        expect(span?.textContent).toBe('42');
    });

    test('renders color swatch when types includes color and useClient is false', async () => {
        render(<PropsExplorerItemHeadline classPrefix="bp" name="bg" value="#ff0000" types={['color']} />);
        await expect.element(page.getByText('bg:')).toBeInTheDocument();
        expect(document.querySelector('.bp-color-swatch')).toBeTruthy();
    });

    test('renders dropdown select when useClient and allow is provided', async () => {
        render(<PropsExplorerItemHeadline classPrefix="bp" name="size" value="md" types={['string']} allow={['sm', 'md', 'lg']} useClient />);
        await expect.element(page.getByRole('combobox')).toBeInTheDocument();
        expect(document.querySelectorAll('option').length).toBe(3);
    });

    test('renders color swatch and hidden color input when useClient and types includes color', async () => {
        render(<PropsExplorerItemHeadline classPrefix="bp" name="bg" value="#00ff00" types={['color']} useClient />);
        await expect.element(page.getByText('bg:')).toBeInTheDocument();
        expect(document.querySelector('.bp-color-swatch')).toBeTruthy();
        expect(document.querySelector('input[type="color"]')).toBeTruthy();
    });

    test('renders edit icon when useClient and value is not a function', async () => {
        render(<PropsExplorerItemHeadline classPrefix="bp" name="label" value="hello" types={undefined} useClient />);
        await expect.element(page.getByTitle('Edit Value')).toBeInTheDocument();
    });

    test('does not render edit icon when value is a function', async () => {
        render(<PropsExplorerItemHeadline classPrefix="bp" name="onClick" value={() => {}} types={undefined} useClient />);
        await expect.element(page.getByText('onClick:')).toBeInTheDocument();
        expect(document.querySelector('[title="Edit Value"]')).toBeNull();
    });

    test('clicking edit icon shows textarea prefilled with current value', async () => {
        render(<PropsExplorerItemHeadline classPrefix="bp" name="label" value="hello" types={undefined} useClient />);
        await page.getByTitle('Edit Value').click();
        const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
        expect(textarea).toBeTruthy();
        expect(textarea?.value).toBe('"hello"');
    });

    test('pressing Enter in textarea commits new value and calls onUpdate', async () => {
        const onUpdate = vi.fn();
        render(<PropsExplorerItemHeadline classPrefix="bp" name="count" value={1} types={undefined} useClient onUpdate={onUpdate} />);
        await page.getByTitle('Edit Value').click();
        const textarea = page.getByRole('textbox');
        await textarea.fill('42');
        await userEvent.keyboard('{Enter}');
        expect(onUpdate).toHaveBeenCalledWith(42);
    });

    test('clicking edit icon switches to save icon', async () => {
        render(<PropsExplorerItemHeadline classPrefix="bp" name="label" value="hello" types={undefined} useClient />);
        await page.getByTitle('Edit Value').click();
        await expect.element(page.getByTitle('Save Value')).toBeInTheDocument();
    });

});
