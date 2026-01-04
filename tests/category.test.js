/**
 * Category Tests - Testing category switching functionality
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
    getCategory,
    getOccupancy,
    setCategory,
    setOccupancy,
    initCategory
} from '../js/modules/category.js';

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

describe('Category Module', () => {
    beforeEach(() => {
        localStorageMock.clear();
        document.body.innerHTML = `
            <div id="categoryTabs">
                <button data-category="offplan" class="active">Off-Plan</button>
                <button data-category="ready">Ready</button>
            </div>
            <div id="offplanFields"></div>
            <div id="readyFields" class="hidden"></div>
            <div id="occupancySelector" class="hidden">
                <button data-occupancy="owner">Owner</button>
                <button data-occupancy="vacant">Vacant</button>
                <button data-occupancy="leased">Leased</button>
            </div>
            <div id="leaseFields" class="hidden"></div>
            <input id="u_showoriginal" type="checkbox">
            <input id="u_showpropertystatus" type="checkbox">
            <select id="u_projecthandover_type"><option value="Q1">Q1</option></select>
            <select id="u_projecthandover_period"><option value="2025">2025</option></select>
            <input id="u_projecthandover_year" value="">
            <select id="u_unithandover_type"><option value="Q1">Q1</option></select>
            <select id="u_unithandover_period"><option value="2025">2025</option></select>
            <input id="u_unithandover_year" value="">
            <input id="u_currentrent" value="">
            <input id="u_leaseuntil" value="">
            <input id="u_rentrefund" type="checkbox">
            <input id="u_servicecharge" value="">
            <span id="showOriginalLabel"></span>
            <span id="showPropertyStatusLabel"></span>
            <div id="disp_row_original_price"></div>
            <div id="disp_row_property_status"></div>
        `;
    });

    describe('getCategory', () => {
        it('returns current category', () => {
            const category = getCategory();
            expect(typeof category).toBe('string');
        });

        it('defaults to offplan', () => {
            expect(getCategory()).toBe('offplan');
        });
    });

    describe('getOccupancy', () => {
        it('returns current occupancy', () => {
            const occupancy = getOccupancy();
            expect(typeof occupancy).toBe('string');
        });

        it('defaults to owner', () => {
            expect(getOccupancy()).toBe('owner');
        });
    });

    describe('setCategory', () => {
        it('changes category to ready', () => {
            setCategory('ready');
            expect(getCategory()).toBe('ready');
        });

        it('changes category to offplan', () => {
            setCategory('ready');
            setCategory('offplan');
            expect(getCategory()).toBe('offplan');
        });

        it('stores category in localStorage', () => {
            setCategory('ready');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('propertyCategory', 'ready');
        });
    });

    describe('setOccupancy', () => {
        it('changes occupancy to vacant', () => {
            setOccupancy('vacant');
            expect(getOccupancy()).toBe('vacant');
        });

        it('changes occupancy to leased', () => {
            setOccupancy('leased');
            expect(getOccupancy()).toBe('leased');
        });

        it('changes occupancy to owner', () => {
            setOccupancy('leased');
            setOccupancy('owner');
            expect(getOccupancy()).toBe('owner');
        });
    });

    describe('initCategory', () => {
        it('initializes without errors', () => {
            expect(() => initCategory()).not.toThrow();
        });

        it('reads saved category from localStorage', () => {
            localStorageMock.setItem('propertyCategory', 'ready');
            initCategory();
            expect(getCategory()).toBe('ready');
        });

        it('sets occupancy through setOccupancy', () => {
            initCategory();
            setOccupancy('leased');
            expect(getOccupancy()).toBe('leased');
        });
    });
});
