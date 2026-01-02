/**
 * Payment Plan Tests - Testing payment plan functionality
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
    getPaymentPlan,
    setPaymentPlan,
    getPaymentPlanName,
    setPaymentPlanName,
    parseCSV,
    toCSV,
    addPaymentRow,
    deletePaymentRow,
    calculatePaymentAmounts,
    initPaymentPlan
} from '../js/modules/paymentPlan.js';

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

describe('Payment Plan Module', () => {
    beforeEach(() => {
        localStorageMock.clear();
        document.body.innerHTML = `
            <input id="paymentPlanName" value="">
            <tbody id="paymentPlanBody"></tbody>
            <div id="paymentPreview"></div>
            <span id="paymentPercentTotal">0%</span>
            <span id="paymentValidation"></span>
            <input id="u_total" value="1000000">
        `;
    });

    describe('getPaymentPlan', () => {
        it('returns payment rows array', () => {
            const plan = getPaymentPlan();
            expect(Array.isArray(plan)).toBe(true);
        });
    });

    describe('setPaymentPlan', () => {
        it('sets payment plan data', () => {
            const data = [
                { date: '2025-01-15', percentage: 10, amount: 100000 },
                { date: '2026-06-01', percentage: 90, amount: 900000 }
            ];

            setPaymentPlan(data);
            const plan = getPaymentPlan();

            expect(plan.length).toBe(2);
            expect(plan[0].date).toBe('2025-01-15');
            expect(plan[1].percentage).toBe('90');
        });

        it('handles empty array', () => {
            setPaymentPlan([]);
            expect(getPaymentPlan().length).toBe(0);
        });
    });

    describe('getPaymentPlanName', () => {
        it('returns payment plan name', () => {
            const name = getPaymentPlanName();
            expect(typeof name).toBe('string');
        });
    });

    describe('setPaymentPlanName', () => {
        it('sets payment plan name', () => {
            setPaymentPlanName('My Custom Plan');
            expect(getPaymentPlanName()).toBe('My Custom Plan');
        });

        it('handles empty string', () => {
            setPaymentPlanName('');
            expect(getPaymentPlanName()).toBe('');
        });
    });

    describe('parseCSV', () => {
        it('returns empty array (stub function)', () => {
            const result = parseCSV('header1,header2\nvalue1,value2');
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });
    });

    describe('toCSV', () => {
        it('returns empty string (stub function)', () => {
            const result = toCSV();
            expect(result).toBe('');
        });
    });

    describe('addPaymentRow', () => {
        beforeEach(() => {
            // Reset payment plan
            setPaymentPlan([]);
        });

        it('adds a row to payment plan', () => {
            const initialLength = getPaymentPlan().length;
            addPaymentRow();
            expect(getPaymentPlan().length).toBe(initialLength + 1);
        });

        it('adds multiple rows', () => {
            setPaymentPlan([]); // Ensure we start fresh
            addPaymentRow();
            addPaymentRow();
            addPaymentRow();
            expect(getPaymentPlan().length).toBe(3);
        });
    });

    describe('deletePaymentRow', () => {
        it('removes a row from payment plan', () => {
            addPaymentRow();
            addPaymentRow();
            const initialLength = getPaymentPlan().length;

            deletePaymentRow(0);
            expect(getPaymentPlan().length).toBe(initialLength - 1);
        });
    });

    describe('initPaymentPlan', () => {
        it('initializes without errors', () => {
            expect(() => initPaymentPlan()).not.toThrow();
        });
    });

    describe('calculatePaymentAmounts', () => {
        beforeEach(() => {
            document.getElementById('u_total').value = '1000000';
        });

        it('calculates without errors', () => {
            setPaymentPlan([
                { milestone: 'Booking', date: '', percentage: 10, amount: 0 },
                { milestone: 'Handover', date: '', percentage: 90, amount: 0 }
            ]);

            expect(() => calculatePaymentAmounts()).not.toThrow();
        });
    });
});
