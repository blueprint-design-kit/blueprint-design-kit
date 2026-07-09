import { describe, test, expect, vi, afterEach } from 'vitest';
import LocalStorage from './localStorage';

describe('LocalStorage', () => {

    let store: Record<string, string> = {};

    // Stub window as a plain global so tests run in the Node env without jsdom.
    // The localStorage functions check `typeof window !== 'undefined'` then
    // access the bare `localStorage` global, so both must be stubbed.
    function stubWindow(overrides?: { setItem?: (key: string, value: string) => void }) {
        store = {};
        const mockLocalStorage = {
            getItem: (key: string) => store[key] ?? null,
            setItem: overrides?.setItem ?? ((key: string, value: string) => { store[key] = value; }),
        };
        vi.stubGlobal('window', { localStorage: mockLocalStorage });
        vi.stubGlobal('localStorage', mockLocalStorage);
    }

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    test('prefixes the key with "blueprint_"', () => {
        const ls = new LocalStorage('theme');
        expect(ls.name).toBe('blueprint_theme');
    });

    describe('get', () => {

        test('returns null when key does not exist', () => {
            stubWindow();
            const ls = new LocalStorage<string>('theme');
            expect(ls.get()).toBeNull();
        });

        test('returns parsed value when key exists', () => {
            stubWindow();
            store['blueprint_theme'] = JSON.stringify('dark');
            const ls = new LocalStorage<string>('theme');
            expect(ls.get()).toBe('dark');
        });

        test('returns null and logs error on invalid JSON', () => {
            stubWindow();
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            store['blueprint_theme'] = 'not-valid-json{{{';
            const ls = new LocalStorage<string>('theme');
            expect(ls.get()).toBeNull();
            expect(errorSpy).toHaveBeenCalledOnce();
        });

    });

    describe('set', () => {

        test('serializes and stores the value', () => {
            stubWindow();
            const ls = new LocalStorage<object>('prefs');
            ls.set({ color: 'blue' });
            expect(store['blueprint_prefs']).toBe(JSON.stringify({ color: 'blue' }));
        });

        test('logs error when setItem throws', () => {
            stubWindow({ setItem: () => { throw new Error('quota exceeded'); } });
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            const ls = new LocalStorage<string>('theme');
            ls.set('dark');
            expect(errorSpy).toHaveBeenCalledOnce();
        });

    });

    describe('update', () => {

        test('merges new prop into existing object', () => {
            stubWindow();
            store['blueprint_prefs'] = JSON.stringify({ color: 'blue' });
            const ls = new LocalStorage<Record<string, unknown>>('prefs');
            ls.update('size', 'large');
            expect(JSON.parse(store['blueprint_prefs'])).toEqual({ color: 'blue', size: 'large' });
        });

        test('overwrites existing prop', () => {
            stubWindow();
            store['blueprint_prefs'] = JSON.stringify({ color: 'blue' });
            const ls = new LocalStorage<Record<string, unknown>>('prefs');
            ls.update('color', 'red');
            expect(JSON.parse(store['blueprint_prefs'])).toEqual({ color: 'red' });
        });

        test('starts from empty object when no value exists', () => {
            stubWindow();
            const ls = new LocalStorage<Record<string, unknown>>('prefs');
            ls.update('color', 'green');
            expect(JSON.parse(store['blueprint_prefs'])).toEqual({ color: 'green' });
        });

        test('does not update when current value is not an object', () => {
            stubWindow();
            store['blueprint_prefs'] = JSON.stringify('a-string');
            const ls = new LocalStorage<unknown>('prefs');
            ls.update('color', 'red');
            expect(store['blueprint_prefs']).toBe(JSON.stringify('a-string'));
        });

    });

});
