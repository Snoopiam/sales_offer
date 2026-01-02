/**
 * Storage Tests - Testing localStorage management functions
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
    loadState,
    saveState,
    getCurrentOffer,
    saveCurrentOffer,
    getBranding,
    saveBranding,
    getLabels,
    saveLabels,
    getSettings,
    saveSettings,
    isFieldLocked,
    toggleFieldLock,
    getTemplates,
    saveTemplate,
    deleteTemplate,
    getApiKey,
    saveApiKey,
    clearApiKey,
    clearAllData,
    exportOfferAsJSON,
    importOfferFromJSON
} from '../js/modules/storage.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value; }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        get length() { return Object.keys(store).length; },
        key: vi.fn((i) => Object.keys(store)[i] || null)
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Storage Module', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    describe('loadState', () => {
        it('returns default state when localStorage is empty', () => {
            const state = loadState();
            expect(state).toBeDefined();
            expect(state.currentOffer).toBeDefined();
            expect(state.templates).toBeDefined();
            expect(state.branding).toBeDefined();
        });

        it('returns saved state from localStorage', () => {
            const testState = {
                _version: 1,
                currentOffer: { projectName: 'Test Project' },
                templates: [],
                branding: { companyName: 'Test Co' },
                settings: { lockedFields: [] }
            };
            localStorageMock.setItem('salesOfferApp', JSON.stringify(testState));

            const state = loadState();
            expect(state.currentOffer.projectName).toBe('Test Project');
        });
    });

    describe('saveState', () => {
        it('saves state to localStorage', () => {
            const state = loadState();
            state.currentOffer.projectName = 'New Project';
            saveState(state);

            expect(localStorageMock.setItem).toHaveBeenCalled();
        });
    });

    describe('getCurrentOffer and saveCurrentOffer', () => {
        it('gets current offer', () => {
            const offer = getCurrentOffer();
            expect(offer).toBeDefined();
        });

        it('saves and retrieves offer', () => {
            const offer = {
                projectName: 'Marina Heights',
                unitNo: 'A-101',
                originalPrice: '2500000'
            };
            saveCurrentOffer(offer);

            const retrieved = getCurrentOffer();
            expect(retrieved.projectName).toBe('Marina Heights');
            expect(retrieved.unitNo).toBe('A-101');
        });
    });

    describe('getBranding and saveBranding', () => {
        it('gets default branding', () => {
            const branding = getBranding();
            expect(branding).toBeDefined();
            expect(branding.companyName).toBeDefined();
        });

        it('saves and retrieves branding', () => {
            const branding = {
                companyName: 'My Company',
                primaryColor: '#ff0000',
                logo: '',
                footerText: 'Custom Footer'
            };
            saveBranding(branding);

            const retrieved = getBranding();
            expect(retrieved.companyName).toBe('My Company');
            expect(retrieved.primaryColor).toBe('#ff0000');
        });
    });

    describe('getLabels and saveLabels', () => {
        it('gets default labels', () => {
            const labels = getLabels();
            expect(labels).toBeDefined();
        });

        it('saves and retrieves labels', () => {
            const labels = {
                projectLabel: 'Project Name',
                unitLabel: 'Unit Number'
            };
            saveLabels(labels);

            const retrieved = getLabels();
            expect(retrieved.projectLabel).toBe('Project Name');
        });
    });

    describe('getSettings and saveSettings', () => {
        it('gets default settings', () => {
            const settings = getSettings();
            expect(settings).toBeDefined();
            expect(settings.lockedFields).toBeDefined();
        });

        it('saves and retrieves settings', () => {
            const settings = {
                lockedFields: ['u_premium', 'u_adgm'],
                theme: 'dark'
            };
            saveSettings(settings);

            const retrieved = getSettings();
            expect(retrieved.lockedFields).toContain('u_premium');
        });
    });

    describe('isFieldLocked and toggleFieldLock', () => {
        it('returns false for unlocked field', () => {
            expect(isFieldLocked('u_premium')).toBe(false);
        });

        it('toggles field lock state', () => {
            expect(isFieldLocked('u_premium')).toBe(false);

            const newState = toggleFieldLock('u_premium');
            expect(newState).toBe(true);
            expect(isFieldLocked('u_premium')).toBe(true);

            const unlockedState = toggleFieldLock('u_premium');
            expect(unlockedState).toBe(false);
            expect(isFieldLocked('u_premium')).toBe(false);
        });
    });

    describe('Template Management', () => {
        beforeEach(() => {
            // Clear templates before each test
            localStorageMock.clear();
        });

        it('getTemplates returns empty array initially', () => {
            const templates = getTemplates();
            expect(Array.isArray(templates)).toBe(true);
            expect(templates.length).toBe(0);
        });

        it('saveTemplate creates a new template', () => {
            const offer = { projectName: 'Template Test' };
            const template = saveTemplate('My Template', offer);

            expect(template.name).toBe('My Template');
            expect(template.id).toBeDefined();
            expect(template.data.projectName).toBe('Template Test');

            const templates = getTemplates();
            expect(templates.length).toBe(1);
        });

        it('deleteTemplate removes a template', () => {
            const offer = { projectName: 'To Delete' };
            const template = saveTemplate('Delete Me', offer);
            const initialLength = getTemplates().length;

            deleteTemplate(template.id);
            expect(getTemplates().length).toBe(initialLength - 1);
        });

        it('saveTemplate with branding', () => {
            const offer = { projectName: 'With Branding' };
            const branding = { companyName: 'Test Co' };
            const template = saveTemplate('Branded Template', offer, branding);

            expect(template.branding.companyName).toBe('Test Co');
        });
    });

    describe('API Key Management', () => {
        it('getApiKey returns empty for no key', () => {
            const key = getApiKey();
            expect(key).toBe('');
        });

        it('saveApiKey and getApiKey work together', () => {
            saveApiKey('sk-test-key-12345');
            const key = getApiKey();
            expect(key).toBe('sk-test-key-12345');
        });

        it('clearApiKey removes the key', () => {
            saveApiKey('sk-test-key');
            clearApiKey();
            expect(getApiKey()).toBe('');
        });
    });

    describe('clearAllData', () => {
        it('clears data when user confirms', () => {
            // Mock window.confirm to return true
            const originalConfirm = window.confirm;
            window.confirm = vi.fn(() => true);

            // Mock window.location.reload
            const originalReload = window.location.reload;
            delete window.location;
            window.location = { reload: vi.fn() };

            saveCurrentOffer({ projectName: 'Test' });
            clearAllData();

            // Verify confirm was called
            expect(window.confirm).toHaveBeenCalled();

            // Restore mocks
            window.confirm = originalConfirm;
            window.location.reload = originalReload;
        });

        it('does not clear data when user cancels', () => {
            // Mock window.confirm to return false
            const originalConfirm = window.confirm;
            window.confirm = vi.fn(() => false);

            saveCurrentOffer({ projectName: 'Keep This' });
            clearAllData();

            const offer = getCurrentOffer();
            expect(offer.projectName).toBe('Keep This');

            // Restore mock
            window.confirm = originalConfirm;
        });
    });

    describe('JSON Import/Export', () => {
        beforeEach(() => {
            localStorageMock.clear();
        });

        it('exportOfferAsJSON returns valid JSON string', () => {
            saveCurrentOffer({ projectName: 'Export Test' });
            saveBranding({ companyName: 'Export Co' });

            const json = exportOfferAsJSON();
            const parsed = JSON.parse(json);

            expect(parsed.offer.projectName).toBe('Export Test');
            expect(parsed.branding.companyName).toBe('Export Co');
            expect(parsed.exportedAt).toBeDefined();
        });

        it('importOfferFromJSON imports data correctly', () => {
            const jsonData = JSON.stringify({
                offer: { projectName: 'Imported Project', unitNo: 'B-202' },
                branding: { companyName: 'Imported Co' },
                labels: {},
                paymentPlan: [],
                paymentPlanName: 'Test Plan'
            });

            const result = importOfferFromJSON(jsonData);
            expect(result).toBe(true);

            const offer = getCurrentOffer();
            expect(offer.projectName).toBe('Imported Project');
        });

        it('importOfferFromJSON returns false for invalid JSON', () => {
            const result = importOfferFromJSON('invalid json');
            expect(result).toBe(false);
        });

        it('importOfferFromJSON merges with existing data', () => {
            saveCurrentOffer({ projectName: 'Original', unitNo: 'A-100' });

            const jsonData = JSON.stringify({
                offer: { projectName: 'Updated' }
            });

            importOfferFromJSON(jsonData);

            const offer = getCurrentOffer();
            expect(offer.projectName).toBe('Updated');
            expect(offer.unitNo).toBe('A-100'); // Preserved from original
        });
    });
});
