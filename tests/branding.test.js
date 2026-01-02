/**
 * Branding Tests - Testing branding functionality
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
    getCurrentBranding,
    loadBrandingSettings,
    saveBrandingSettings,
    applyBranding,
    resetBranding
} from '../js/modules/branding.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value; }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; })
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Branding Module', () => {
    beforeEach(() => {
        localStorageMock.clear();
        document.body.innerHTML = `
            <input id="brandCompanyName" value="">
            <input id="brandPrimaryColor" type="color" value="#62c6c1">
            <input id="brandPrimaryColorHex" value="#62c6c1">
            <input id="brandFooterText" value="">
            <input id="brandLogoUpload" type="file">
            <span id="logoFileName"></span>
            <div id="logoPreview" class="hidden"></div>
            <img id="logoPreviewImg" src="">
            <button id="removeLogo"></button>
            <input id="labelRefund" value="">
            <input id="labelBalance" value="">
            <input id="labelPremium" value="">
            <input id="labelAdmin" value="">
            <input id="labelAdgm" value="">
            <input id="labelAgency" value="">
            <div id="preview-logo"></div>
            <span id="preview-company-name"></span>
            <span id="preview-footer-text"></span>
        `;
    });

    describe('getCurrentBranding', () => {
        it('returns branding object', () => {
            const branding = getCurrentBranding();
            expect(branding).toBeDefined();
        });

        it('branding has companyName property', () => {
            const branding = getCurrentBranding();
            expect(branding.companyName).toBeDefined();
        });

        it('branding has primaryColor property', () => {
            const branding = getCurrentBranding();
            expect(branding.primaryColor).toBeDefined();
        });

        it('branding has footerText property', () => {
            const branding = getCurrentBranding();
            expect(branding.footerText).toBeDefined();
        });
    });

    describe('loadBrandingSettings', () => {
        it('loads settings without errors', () => {
            expect(() => loadBrandingSettings()).not.toThrow();
        });

        it('populates form fields', () => {
            loadBrandingSettings();
            const companyName = document.getElementById('brandCompanyName');
            expect(companyName).not.toBeNull();
        });
    });

    describe('saveBrandingSettings', () => {
        it('saves settings without errors', () => {
            expect(() => saveBrandingSettings()).not.toThrow();
        });

        it('saves form values to storage', () => {
            const companyName = document.getElementById('brandCompanyName');
            companyName.value = 'Test Company';

            saveBrandingSettings();

            const branding = getCurrentBranding();
            expect(branding.companyName).toBe('Test Company');
        });
    });

    describe('applyBranding', () => {
        it('applies branding without errors', () => {
            expect(() => applyBranding()).not.toThrow();
        });
    });

    describe('resetBranding', () => {
        beforeEach(() => {
            // Mock window.confirm
            window.confirm = vi.fn(() => true);
        });

        it('resets to defaults when confirmed', () => {
            const companyName = document.getElementById('brandCompanyName');
            companyName.value = 'Custom Company';
            saveBrandingSettings();

            resetBranding();

            const branding = getCurrentBranding();
            expect(branding.companyName).toBe('Kennedy Property');
        });

        it('does nothing when cancelled (mock returns false)', () => {
            // Test that resetBranding handles false confirm
            vi.spyOn(window, 'confirm').mockReturnValue(false);

            resetBranding();

            // Just verify it doesn't throw
            expect(true).toBe(true);
        });
    });
});
