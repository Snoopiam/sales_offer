/**
 * Test Setup File
 * Configures the test environment
 */

import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = String(value);
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: vi.fn((i) => Object.keys(store)[i] || null),
    };
})();

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
});

// Mock console methods to reduce noise in tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

// Reset mocks before each test
beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
});
