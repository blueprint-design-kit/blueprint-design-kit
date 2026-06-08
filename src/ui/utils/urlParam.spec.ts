import { describe, test, expect, vi, afterEach } from 'vitest';
import { getUrlParam, setUrlParam, removeUrlParam } from './urlParam';

describe('urlParam', () => {

    let replaceStateSpy: ReturnType<typeof vi.fn>;

    // Stub window as a plain global object so tests run in the default Node env
    // without needing jsdom. The urlParam functions access window at call time,
    // not at module load time, so stubbing globalThis.window is sufficient.
    function stubWindow(href: string) {
        replaceStateSpy = vi.fn();
        const mockLocation = { href };
        vi.stubGlobal('window', {
            location: mockLocation,
            history: { replaceState: replaceStateSpy },
        });
        return mockLocation;
    }

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('getUrlParam', () => {

        test('returns the value for an existing search param', () => {
            stubWindow('http://localhost/?component=Atoms/Button');
            expect(getUrlParam('component')).toBe('Atoms/Button');
        });

        test('returns null when the param is not present', () => {
            stubWindow('http://localhost/');
            expect(getUrlParam('missing')).toBeNull();
        });

        test('returns the correct value when multiple params are present', () => {
            stubWindow('http://localhost/?a=1&b=2&c=3');
            expect(getUrlParam('b')).toBe('2');
        });

    });

    describe('setUrlParam', () => {

        test('calls history.replaceState with the new param when replace=true', () => {
            stubWindow('http://localhost/');
            setUrlParam('tab', 'props', true);

            expect(replaceStateSpy).toHaveBeenCalledOnce();
            const newUrl = replaceStateSpy.mock.calls[0]?.[2] as string;
            expect(newUrl).toContain('tab=props');
        });

        test('preserves existing params when adding a new one with replace=true', () => {
            stubWindow('http://localhost/?existing=yes');
            setUrlParam('tab', 'props', true);

            const newUrl = replaceStateSpy.mock.calls[0]?.[2] as string;
            expect(newUrl).toContain('existing=yes');
            expect(newUrl).toContain('tab=props');
        });

        test('assigns to window.location.href when replace=false (default)', () => {
            const mockLocation = stubWindow('http://localhost/');
            setUrlParam('tab', 'props');

            expect(mockLocation.href).toContain('tab=props');
            expect(replaceStateSpy).not.toHaveBeenCalled();
        });

        test('overrides an existing param value', () => {
            stubWindow('http://localhost/?tab=old');
            setUrlParam('tab', 'new', true);

            const newUrl = replaceStateSpy.mock.calls[0]?.[2] as string;
            expect(newUrl).toContain('tab=new');
            expect(newUrl).not.toContain('tab=old');
        });

    });

    describe('removeUrlParam', () => {

        test('calls history.replaceState without the param when replace=true', () => {
            stubWindow('http://localhost/?component=Button&tab=props');
            removeUrlParam('tab', true);

            expect(replaceStateSpy).toHaveBeenCalledOnce();
            const newUrl = replaceStateSpy.mock.calls[0]?.[2] as string;
            expect(newUrl).not.toContain('tab=');
            expect(newUrl).toContain('component=Button');
        });

        test('assigns to window.location.href without the param when replace=false (default)', () => {
            const mockLocation = stubWindow('http://localhost/?component=Button&tab=props');
            removeUrlParam('tab');

            expect(mockLocation.href).not.toContain('tab=');
            expect(mockLocation.href).toContain('component=Button');
            expect(replaceStateSpy).not.toHaveBeenCalled();
        });

        test('is a no-op when the param does not exist (replace=true)', () => {
            stubWindow('http://localhost/?a=1');
            removeUrlParam('missing', true);

            const newUrl = replaceStateSpy.mock.calls[0]?.[2] as string;
            expect(newUrl).toContain('a=1');
        });

    });

});
