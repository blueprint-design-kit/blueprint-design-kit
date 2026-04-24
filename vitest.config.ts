import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    name: 'unit',
                    setupFiles: ['./spec/vitest.setup.ts'],
                    include: [
                        'src/**/*.spec.ts',
                        'src/**/*.spec.tsx',
                        'spec/**/*.spec.ts',
                        'spec/**/*.spec.tsx',
                    ],
                    exclude: [
                        '**/*.browser.spec.ts',
                        '**/*.browser.spec.tsx',
                    ],
                },
            },
            {
                test: {
                    name: 'browser',
                    setupFiles: ['./spec/vitest.browser.setup.ts'],
                    include: ['src/ui/components/**/*.browser.spec.tsx'],
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        instances: [
                            { browser: 'chromium' },
                        ],
                        headless: true,
                    },
                },
            },
        ],
    },
});
