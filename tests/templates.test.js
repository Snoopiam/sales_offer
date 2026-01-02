/**
 * Templates Tests - Testing template switching functionality
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
    getCurrentTemplate,
    getAvailableTemplates,
    switchTemplate,
    initTemplates
} from '../js/modules/templates.js';

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

describe('Templates Module', () => {
    beforeEach(() => {
        localStorageMock.clear();
        document.body.innerHTML = `
            <select id="templateSelect">
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="minimal">Minimal</option>
            </select>
            <link id="templateStylesheet" href="">
            <div id="a4Page" class=""></div>
        `;
    });

    describe('getAvailableTemplates', () => {
        it('returns all available templates', () => {
            const templates = getAvailableTemplates();
            expect(templates).toBeDefined();
            expect(templates.landscape).toBeDefined();
            expect(templates.portrait).toBeDefined();
            expect(templates.minimal).toBeDefined();
        });

        it('each template has required properties', () => {
            const templates = getAvailableTemplates();

            Object.values(templates).forEach(template => {
                expect(template.name).toBeDefined();
                expect(template.description).toBeDefined();
                expect(template.cssFile).toBeDefined();
                expect(template.pageClass).toBeDefined();
            });
        });

        it('landscape template has correct properties', () => {
            const templates = getAvailableTemplates();
            expect(templates.landscape.name).toBe('Landscape');
            expect(templates.landscape.cssFile).toBe('css/templates/landscape.css');
            expect(templates.landscape.pageClass).toBe('template-landscape');
        });

        it('portrait template has correct properties', () => {
            const templates = getAvailableTemplates();
            expect(templates.portrait.name).toBe('Portrait');
            expect(templates.portrait.cssFile).toBe('css/templates/portrait.css');
        });

        it('minimal template has correct properties', () => {
            const templates = getAvailableTemplates();
            expect(templates.minimal.name).toBe('Minimal');
            expect(templates.minimal.cssFile).toBe('css/templates/minimal.css');
        });
    });

    describe('getCurrentTemplate', () => {
        it('returns current template ID', () => {
            const current = getCurrentTemplate();
            expect(typeof current).toBe('string');
        });

        it('defaults to landscape', () => {
            expect(getCurrentTemplate()).toBe('landscape');
        });
    });

    describe('initTemplates', () => {
        it('initializes without errors', () => {
            expect(() => initTemplates()).not.toThrow();
        });

        it('sets up template selector', () => {
            initTemplates();
            const selector = document.getElementById('templateSelect');
            expect(selector.value).toBe('landscape');
        });
    });

    describe('switchTemplate', () => {
        beforeEach(() => {
            initTemplates();
        });

        it('switches to portrait template', () => {
            switchTemplate('portrait');
            expect(getCurrentTemplate()).toBe('portrait');
        });

        it('switches to minimal template', () => {
            switchTemplate('minimal');
            expect(getCurrentTemplate()).toBe('minimal');
        });

        it('updates page class when switching', () => {
            switchTemplate('portrait');
            const page = document.getElementById('a4Page');
            expect(page.classList.contains('template-portrait')).toBe(true);
        });

        it('updates stylesheet link when switching', () => {
            switchTemplate('minimal');
            const styleLink = document.getElementById('templateStylesheet');
            expect(styleLink.href).toContain('css/templates/minimal.css');
        });

        it('removes old template class when switching', () => {
            switchTemplate('landscape');
            switchTemplate('portrait');
            const page = document.getElementById('a4Page');
            expect(page.classList.contains('template-landscape')).toBe(false);
            expect(page.classList.contains('template-portrait')).toBe(true);
        });

        it('handles invalid template gracefully', () => {
            const currentBefore = getCurrentTemplate();
            switchTemplate('nonexistent');
            expect(getCurrentTemplate()).toBe(currentBefore);
        });
    });
});
