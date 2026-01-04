/**
 * ESLint Configuration - Code Quality Linting (ESLint 9 Flat Config)
 */

export default [
    // Main application code
    {
        files: ['js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                // Browser APIs
                document: 'readonly',
                window: 'readonly',
                HTMLElement: 'readonly',
                Event: 'readonly',
                CustomEvent: 'readonly',
                localStorage: 'readonly',
                Blob: 'readonly',
                File: 'readonly',
                FileReader: 'readonly',
                Uint8Array: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                fetch: 'readonly',
                AbortController: 'readonly',
                Image: 'readonly',
                URL: 'readonly',
                btoa: 'readonly',
                atob: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                alert: 'readonly',
                confirm: 'readonly',
                prompt: 'readonly',
                // CDN libraries
                Sortable: 'readonly',
                XLSX: 'readonly',
                html2pdf: 'readonly',
                html2canvas: 'readonly',
                flatpickr: 'readonly',
                jspdf: 'readonly',
            },
        },
        rules: {
            // Error prevention
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'error',
            'no-duplicate-imports': 'error',
            // Console usage
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            // Best practices
            'eqeqeq': ['error', 'always', { null: 'ignore' }],
            'no-var': 'error',
            'prefer-const': 'warn',
            'no-throw-literal': 'error',
            // Code style
            'no-nested-ternary': 'warn',
            'max-depth': ['warn', 4],
        },
    },
    // Test files
    {
        files: ['tests/**/*.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                vi: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
            },
        },
        rules: {
            'no-console': 'off',
        },
    },
    // Ignored files
    {
        ignores: ['docs/archive/**', 'node_modules/**', '*.config.js'],
    },
];
