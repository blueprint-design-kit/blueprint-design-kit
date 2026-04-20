import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        setupFiles: ['./spec/vitest.setup.ts'],
    },
});
