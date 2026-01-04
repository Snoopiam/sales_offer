/**
 * ============================================================================
 * VITEST CONFIGURATION - Test Runner Setup
 * ============================================================================
 *
 * PURPOSE: Configures Vitest test runner for unit and integration testing.
 *
 * WHAT IS VITEST:
 * A blazing-fast unit test framework compatible with Jest API.
 * Built on Vite, supports ESM modules natively.
 *
 * KEY FEATURES CONFIGURED:
 *
 * 1. JSDOM ENVIRONMENT
 *    - Simulates browser DOM in Node.js
 *    - Provides document, window, localStorage, etc.
 *    - Required for testing DOM-dependent code
 *
 * 2. GLOBALS
 *    - Makes describe, it, expect available without imports
 *    - Matches Jest/Jasmine style testing
 *    - No need to import { describe, it, expect } in every test file
 *
 * 3. TEST FILES
 *    - Looks for *.test.js files in tests/ directory
 *    - Pattern: tests slash star star slash star.test.js (recursive)
 *
 * 4. CODE COVERAGE
 *    - Provider: V8 (Chrome's coverage tool, built into Node.js)
 *    - Reporters:
 *      • text: Terminal output (for CI/local viewing)
 *      • html: Interactive HTML report (coverage/index.html)
 *      • lcov: Standard format for IDE integration
 *    - Include: All js/ files (modules, utils)
 *    - Exclude: app.js (has heavy DOM dependencies, hard to test)
 *
 * 5. SETUP FILES
 *    - tests/setup.js runs before all tests
 *    - Used for global mocks, polyfills, test utilities
 *
 * RUNNING TESTS:
 * npm test              → Run all tests
 * npm run test:coverage → Run tests with coverage report
 * npm run test:ui       → Open interactive test UI
 * npm run test:watch    → Watch mode (re-run on file changes)
 *
 * COVERAGE REPORTS:
 * After running npm run test:coverage:
 * - Terminal: See coverage % in console
 * - HTML: Open coverage/index.html in browser
 * - VS Code: Coverage highlights in editor (with Coverage Gutters extension)
 *
 * ============================================================================
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // ========================================
        // ENVIRONMENT
        // ========================================
        // 'jsdom' = simulate browser environment in Node.js
        // Provides: window, document, localStorage, etc.
        // Alternative: 'node' (for pure Node.js testing, no DOM)
        environment: 'jsdom',

        // ========================================
        // GLOBALS
        // ========================================
        // Makes test functions available globally
        // Without this, you'd need: import { describe, it, expect } from 'vitest'
        // With this: describe(), it(), expect() work directly
        globals: true,

        // ========================================
        // TEST FILE PATTERN
        // ========================================
        // Look for test files matching this glob pattern
        // star star = any nested directory
        // *.test.js = files ending in .test.js
        // Example matches: tests/calculator.test.js, tests/utils/helpers.test.js
        include: ['tests/**/*.test.js'],

        // ========================================
        // CODE COVERAGE
        // ========================================
        coverage: {
            // V8 provider = Native Node.js coverage (fast, accurate)
            // Alternative: 'istanbul' (more features, slower)
            provider: 'v8',

            // Coverage report formats
            reporter: [
                'text',   // Terminal output (for quick viewing)
                'html',   // Interactive HTML (tests/coverage/index.html)
                'lcov'    // Standard format (for IDE/CI integration)
            ],

            // Output directory for coverage reports
            reportsDirectory: 'tests/coverage',

            // Which files to include in coverage analysis
            include: ['js/**/*.js'],

            // Which files to exclude from coverage
            // app.js = main entry point with heavy DOM dependencies
            // Difficult to test in isolation, excluded from coverage metrics
            exclude: ['js/app.js'],
        },

        // ========================================
        // SETUP FILES
        // ========================================
        // Files to run before any tests
        // Used for:
        // - Global mocks (localStorage, fetch, etc.)
        // - Test utilities
        // - Environment configuration
        setupFiles: ['tests/setup.js'],
    },
});
