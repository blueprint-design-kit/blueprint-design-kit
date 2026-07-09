'use client';

function setLocalStorageItem(key: string, value: unknown): void {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    }
}

function getLocalStorageItem<T>(key: string): T | null {
    if (typeof window !== 'undefined') {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) as T : null;
        } catch (error) {
            console.error(`Error retrieving ${key} from localStorage:`, error);
            return null;
        }
    }
    return null;
}

class LocalStorage<T> {
    name: string;

    constructor(name: string) {
        this.name = `blueprint_${name}`;
    }

    get(): T | null {
        return getLocalStorageItem<T>(this.name);
    }

    set(value: T): void {
        setLocalStorageItem(this.name, value);
    }

    update(prop: string, value: unknown): void {
        const currentValue = this.get() || {};
        if (typeof currentValue === 'object') {
            const updatedValue = { ...currentValue, [prop]: value };
            this.set(updatedValue as T);
        }
    }
}

export default LocalStorage;
