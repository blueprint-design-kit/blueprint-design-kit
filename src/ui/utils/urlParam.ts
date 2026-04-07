'use client';

export function getUrlParam(key: string) {
    const url = new URL(window.location.href);
    return url.searchParams.get(key);
}

export function setUrlParam(key: string, value: string, replace: boolean = false) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    if (replace) {
        window.history.replaceState(null, '', url.toString());
    } else {
        window.location.href = url.toString();
    }
}

export function removeUrlParam(key: string, replace: boolean = false) {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    if (replace) {
        window.history.replaceState(null, '', url.toString());
    } else {
        window.location.href = url.toString();
    }
}
