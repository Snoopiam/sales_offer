/**
 * ============================================================================
 * CALCULATOR TESTS - Test Suite for Financial Calculations
 * ============================================================================
 *
 * PURPOSE: Validates all calculation formulas used in the sales offer generator.
 *          These tests ensure accuracy of financial computations.
 *
 * WHY PURE FUNCTIONS:
 * Calculator functions are extracted as pure functions for testing.
 * Pure functions = same input always gives same output (no DOM, no state).
 * This makes them easy to test and debug.
 *
 * WHAT WE TEST:
 * 1. Area Calculations (Total Area, BUA for villas)
 * 2. Refund Calculations (from percentage or direct amount)
 * 3. Balance Calculations (resale clause logic)
 * 4. Premium Calculations (profit/loss on resale)
 * 5. Fee Calculations (ADGM, Agency fees)
 * 6. Total Calculations (Off-Plan vs Ready Property)
 * 7. Real-world Scenarios (complete calculations)
 * 8. DOM-dependent Functions (calculateField, runAllCalculations, etc.)
 *
 * TESTING APPROACH:
 * - Test happy path (normal inputs → expected outputs)
 * - Test edge cases (zero values, negative values, missing data)
 * - Test precision (rounding, floating point math)
 * - Test business logic (e.g., when balance is owed vs not owed)
 *
 * RUN TESTS:
 * npm test
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================================
// MOCK DEPENDENCIES
// ============================================================================

// Mock values for getNumericValue
const mockNumericValues = {};

// Mock helpers module
vi.mock('../js/utils/helpers.js', () => ({
    getNumericValue: vi.fn((id) => mockNumericValues[id] || 0),
    formatCurrency: vi.fn((value) => `AED ${value.toLocaleString()}`),
    getById: vi.fn((id) => document.getElementById(id))
}));

// Mock storage module
const mockLockedFields = new Set();
vi.mock('../js/modules/storage.js', () => ({
    isFieldLocked: vi.fn((fieldId) => mockLockedFields.has(fieldId)),
    toggleFieldLock: vi.fn((fieldId) => {
        if (mockLockedFields.has(fieldId)) {
            mockLockedFields.delete(fieldId);
        } else {
            mockLockedFields.add(fieldId);
        }
    })
}));

// ============================================================================
// IMPORT PURE CALCULATION FUNCTIONS FROM SOURCE
// ============================================================================
// These functions are exported from calculator.js for unit testing.
// They have no dependencies on DOM, localStorage, or other modules.

import {
    calculateTotalArea,
    calculateBUA,
    calculateRefund,
    calculateBalance,
    calculatePremium,
    calculateADGM,
    calculateAgencyFees,
    calculateTotalOffPlan,
    calculateTotalReady,
    calculateField,
    runAllCalculations,
    calculateTotal,
    initCalculator,
    restoreLockStates
} from '../js/modules/calculator.js';

import { getNumericValue, formatCurrency, getById } from '../js/utils/helpers.js';
import { isFieldLocked, toggleFieldLock } from '../js/modules/storage.js';

describe('calculateTotalArea', () => {
    it('adds internal and balcony areas', () => {
        expect(calculateTotalArea(918.38, 173.94)).toBeCloseTo(1092.32);
        expect(calculateTotalArea(500, 100)).toBe(600);
    });

    it('handles zero values', () => {
        expect(calculateTotalArea(0, 0)).toBe(0);
        expect(calculateTotalArea(500, 0)).toBe(500);
        expect(calculateTotalArea(0, 100)).toBe(100);
    });
});

describe('calculateBUA', () => {
    it('adds internal and terrace for villas', () => {
        expect(calculateBUA(2500, 500)).toBe(3000);
        expect(calculateBUA(3000, 800)).toBe(3800);
    });

    it('handles zero values', () => {
        expect(calculateBUA(0, 0)).toBe(0);
    });
});

describe('calculateRefund', () => {
    it('uses direct amount when provided', () => {
        expect(calculateRefund(2000000, 20, 500000)).toBe(500000);
        expect(calculateRefund(1000000, 10, 150000)).toBe(150000);
    });

    it('calculates from percentage when no direct amount', () => {
        expect(calculateRefund(2000000, 20, 0)).toBe(400000);
        expect(calculateRefund(1000000, 25, 0)).toBe(250000);
    });

    it('returns zero when no inputs', () => {
        expect(calculateRefund(0, 0, 0)).toBe(0);
        expect(calculateRefund(1000000, 0, 0)).toBe(0);
    });

    it('rounds to nearest whole number', () => {
        expect(calculateRefund(1000000, 33.33, 0)).toBe(333300);
    });
});

describe('calculateBalance', () => {
    it('calculates balance when paid less than resale clause', () => {
        // 40% resale clause, 20% paid = 20% balance
        expect(calculateBalance(2000000, 40, 20, 0)).toBe(400000);
    });

    it('returns zero when paid equals or exceeds resale clause', () => {
        expect(calculateBalance(2000000, 40, 40, 0)).toBe(0);
        expect(calculateBalance(2000000, 40, 50, 0)).toBe(0);
    });

    it('uses direct amount to calculate percentage', () => {
        // 40% resale clause, paid 400000 on 2000000 = 20% paid = 20% balance
        expect(calculateBalance(2000000, 40, 0, 400000)).toBe(400000);
    });

    it('returns zero when missing required values', () => {
        expect(calculateBalance(0, 40, 20, 0)).toBe(0);
        expect(calculateBalance(2000000, 0, 20, 0)).toBe(0);
    });
});

describe('calculatePremium', () => {
    it('calculates difference between selling and original', () => {
        expect(calculatePremium(2500000, 2000000)).toBe(500000);
        expect(calculatePremium(3000000, 2500000)).toBe(500000);
    });

    it('handles negative premium (selling below original)', () => {
        expect(calculatePremium(1800000, 2000000)).toBe(-200000);
    });

    it('handles equal prices', () => {
        expect(calculatePremium(2000000, 2000000)).toBe(0);
    });
});

describe('calculateADGM', () => {
    it('calculates 2% of original price', () => {
        expect(calculateADGM(2500000)).toBe(50000);
        expect(calculateADGM(1000000)).toBe(20000);
    });

    it('rounds to nearest whole number', () => {
        expect(calculateADGM(1234567)).toBe(24691);
    });

    it('handles zero', () => {
        expect(calculateADGM(0)).toBe(0);
    });
});

describe('calculateAgencyFees', () => {
    it('calculates 2% + 5% VAT', () => {
        // 2500000 * 0.02 = 50000, * 1.05 = 52500
        expect(calculateAgencyFees(2500000)).toBe(52500);
    });

    it('handles various prices', () => {
        // 1000000 * 0.02 = 20000, * 1.05 = 21000
        expect(calculateAgencyFees(1000000)).toBe(21000);
    });

    it('rounds to nearest whole number', () => {
        // 1234567 * 0.02 = 24691.34, * 1.05 = 25925.907
        expect(calculateAgencyFees(1234567)).toBe(25926);
    });
});

describe('calculateTotalOffPlan', () => {
    it('sums all off-plan components', () => {
        const refund = 400000;
        const balance = 400000;
        const premium = 500000;
        const admin = 5250;
        const adgm = 50000;
        const agency = 52500;

        expect(calculateTotalOffPlan(refund, balance, premium, admin, adgm, agency))
            .toBe(1407750);
    });

    it('handles zero values', () => {
        expect(calculateTotalOffPlan(0, 0, 0, 0, 0, 0)).toBe(0);
    });
});

describe('calculateTotalReady', () => {
    it('sums selling price and fees', () => {
        const selling = 2500000;
        const admin = 5250;
        const adgm = 50000;
        const agency = 52500;

        expect(calculateTotalReady(selling, admin, adgm, agency))
            .toBe(2607750);
    });
});

describe('Real-world calculation scenarios', () => {
    it('calculates complete off-plan scenario', () => {
        // Given: Property with original 2,118,940, selling 2,500,000
        // 40% resale clause, 20% paid
        const original = 2118940;
        const selling = 2500000;
        const resaleClause = 40;
        const amountPaidPercent = 20;
        const adminFees = 5250;

        const refund = calculateRefund(original, amountPaidPercent, 0);
        const balance = calculateBalance(original, resaleClause, amountPaidPercent, 0);
        const premium = calculatePremium(selling, original);
        const adgm = calculateADGM(original);
        const agency = calculateAgencyFees(selling);

        expect(refund).toBe(423788); // 20% of original
        expect(balance).toBe(423788); // 20% remaining to reach 40%
        expect(premium).toBe(381060); // selling - original
        expect(adgm).toBe(42379); // 2% of original
        expect(agency).toBe(52500); // 2.1% of selling

        const total = calculateTotalOffPlan(refund, balance, premium, adminFees, adgm, agency);
        expect(total).toBe(1328765); // Updated: ADGM now based on original price
    });

    it('calculates ready property scenario', () => {
        const selling = 3000000;
        const original = 2800000; // Ready properties also have original price
        const adminFees = 5250;
        const adgm = calculateADGM(original);
        const agency = calculateAgencyFees(selling);

        expect(adgm).toBe(56000); // 2% of original
        expect(agency).toBe(63000);

        const total = calculateTotalReady(selling, adminFees, adgm, agency);
        expect(total).toBe(3124250); // Updated: ADGM now based on original price
    });
});

// ============================================================================
// DOM-DEPENDENT FUNCTION TESTS
// ============================================================================
// These tests cover the functions that interact with DOM elements and localStorage.
// They require mocking document, localStorage, and imported helper functions.

describe('DOM-dependent calculator functions', () => {
    beforeEach(() => {
        // Clear mocks between tests
        vi.clearAllMocks();

        // Clear mock data
        Object.keys(mockNumericValues).forEach(key => delete mockNumericValues[key]);
        mockLockedFields.clear();

        // Setup localStorage mock
        const localStorageData = {};
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn((key) => localStorageData[key] || null),
                setItem: vi.fn((key, value) => { localStorageData[key] = value; }),
                removeItem: vi.fn((key) => { delete localStorageData[key]; }),
                clear: vi.fn(() => { Object.keys(localStorageData).forEach(key => delete localStorageData[key]); })
            },
            writable: true
        });

        // Setup basic DOM structure
        // IDs must match the humanized IDs used in calculator.js
        document.body.innerHTML = `
            <input id="input-total-area" type="text" />
            <input id="input-built-up-area" type="text" />
            <input id="input-refund-amount" type="text" />
            <input id="input-balance-resale" type="text" />
            <input id="input-premium-amount" type="text" />
            <input id="input-adgm-transfer" type="text" />
            <input id="input-agency-fees" type="text" />
            <input id="input-internal-area" type="text" />
            <input id="input-balcony-area" type="text" />
            <input id="input-villa-internal" type="text" />
            <input id="input-villa-terrace" type="text" />
            <input id="input-original-price" type="text" />
            <input id="input-selling-price" type="text" />
            <input id="input-resale-clause" type="text" />
            <input id="input-amount-paid-percent" type="text" />
            <input id="input-amount-paid" type="text" />
            <input id="input-admin-fees" type="text" />
            <input id="input-adgm-termination-fee" type="text" />
            <input id="input-adgm-electronic-fee" type="text" />
            <span id="display-total-payment"></span>
            <button class="lock-btn" data-target="input-refund-amount"></button>
            <button class="lock-btn" data-target="input-premium-amount"></button>
            <button class="lock-btn" data-target="input-total-area"></button>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('calculateField', () => {
        it('skips calculation if field is locked', () => {
            mockLockedFields.add('input-total-area');
            mockNumericValues['input-internal-area'] = 500;
            mockNumericValues['input-balcony-area'] = 100;

            const areaInput = document.getElementById('input-total-area');
            areaInput.value = 'manual value';

            calculateField('input-total-area');

            expect(areaInput.value).toBe('manual value'); // Unchanged
            expect(isFieldLocked).toHaveBeenCalledWith('input-total-area');
        });

        it('calculates input-total-area when not locked', () => {
            mockNumericValues['input-internal-area'] = 918.38;
            mockNumericValues['input-balcony-area'] = 173.94;

            calculateField('input-total-area');

            const areaInput = document.getElementById('input-total-area');
            expect(areaInput.value).toBe('1092.32 Sq.Ft');
        });

        it('calculates input-built-up-area for villas', () => {
            mockNumericValues['input-villa-internal'] = 2500;
            mockNumericValues['input-villa-terrace'] = 500;

            calculateField('input-built-up-area');

            const buaInput = document.getElementById('input-built-up-area');
            expect(buaInput.value).toBe('3000.00 Sq.Ft');
        });

        it('calculates input-refund-amount from percentage', () => {
            mockNumericValues['input-original-price'] = 2000000;
            mockNumericValues['input-amount-paid-percent'] = 20;
            mockNumericValues['input-amount-paid'] = 0;

            calculateField('input-refund-amount');

            const refundInput = document.getElementById('input-refund-amount');
            expect(refundInput.value).toBe('400000');
        });

        it('calculates input-refund-amount from direct amount', () => {
            mockNumericValues['input-original-price'] = 2000000;
            mockNumericValues['input-amount-paid-percent'] = 20;
            mockNumericValues['input-amount-paid'] = 500000;

            calculateField('input-refund-amount');

            const refundInput = document.getElementById('input-refund-amount');
            expect(refundInput.value).toBe('500000');
        });

        it('calculates input-balance-resale when paid less than clause', () => {
            mockNumericValues['input-original-price'] = 2000000;
            mockNumericValues['input-resale-clause'] = 40;
            mockNumericValues['input-amount-paid-percent'] = 20;
            mockNumericValues['input-amount-paid'] = 0;

            calculateField('input-balance-resale');

            const balanceInput = document.getElementById('input-balance-resale');
            expect(balanceInput.value).toBe('400000');
        });

        it('sets input-balance-resale to empty when paid meets clause', () => {
            mockNumericValues['input-original-price'] = 2000000;
            mockNumericValues['input-resale-clause'] = 40;
            mockNumericValues['input-amount-paid-percent'] = 40;
            mockNumericValues['input-amount-paid'] = 0;

            calculateField('input-balance-resale');

            const balanceInput = document.getElementById('input-balance-resale');
            expect(balanceInput.value).toBe('');
        });

        it('calculates input-premium-amount', () => {
            mockNumericValues['input-selling-price'] = 2500000;
            mockNumericValues['input-original-price'] = 2000000;

            calculateField('input-premium-amount');

            const premiumInput = document.getElementById('input-premium-amount');
            expect(premiumInput.value).toBe('500000');
        });

        it('calculates input-adgm-transfer', () => {
            mockNumericValues['input-original-price'] = 2500000;

            calculateField('input-adgm-transfer');

            const adgmInput = document.getElementById('input-adgm-transfer');
            expect(adgmInput.value).toBe('50000');
        });

        it('calculates input-agency-fees', () => {
            mockNumericValues['input-selling-price'] = 2500000;

            calculateField('input-agency-fees');

            const agencyInput = document.getElementById('input-agency-fees');
            expect(agencyInput.value).toBe('52500');
        });

        it('does nothing if calculation function not found', () => {
            calculateField('nonexistent_field');
            // Should not throw
        });

        it('does nothing if element not found', () => {
            document.getElementById('input-total-area').remove();

            mockNumericValues['input-internal-area'] = 500;
            mockNumericValues['input-balcony-area'] = 100;

            calculateField('input-total-area');
            // Should not throw
        });

        it('sets area to empty when zero', () => {
            mockNumericValues['input-internal-area'] = 0;
            mockNumericValues['input-balcony-area'] = 0;

            calculateField('input-total-area');

            const areaInput = document.getElementById('input-total-area');
            expect(areaInput.value).toBe('');
        });
    });

    describe('runAllCalculations', () => {
        it('calculates all fields', () => {
            mockNumericValues['input-internal-area'] = 918.38;
            mockNumericValues['input-balcony-area'] = 173.94;
            mockNumericValues['input-villa-internal'] = 2500;
            mockNumericValues['input-villa-terrace'] = 500;
            mockNumericValues['input-original-price'] = 2000000;
            mockNumericValues['input-selling-price'] = 2500000;
            mockNumericValues['input-resale-clause'] = 40;
            mockNumericValues['input-amount-paid-percent'] = 20;
            mockNumericValues['input-amount-paid'] = 0;
            mockNumericValues['input-admin-fees'] = 5250;
            mockNumericValues['input-adgm-termination-fee'] = 1000;
            mockNumericValues['input-adgm-electronic-fee'] = 500;

            runAllCalculations();

            expect(document.getElementById('input-total-area').value).toBe('1092.32 Sq.Ft');
            expect(document.getElementById('input-built-up-area').value).toBe('3000.00 Sq.Ft');
            expect(document.getElementById('input-refund-amount').value).toBe('400000');
            expect(document.getElementById('input-balance-resale').value).toBe('400000');
            expect(document.getElementById('input-premium-amount').value).toBe('500000');
            expect(document.getElementById('input-adgm-transfer').value).toBe('40000');
            expect(document.getElementById('input-agency-fees').value).toBe('52500');
        });

        it('skips locked fields', () => {
            mockLockedFields.add('input-premium-amount');
            document.getElementById('input-premium-amount').value = 'locked value';

            mockNumericValues['input-selling-price'] = 2500000;
            mockNumericValues['input-original-price'] = 2000000;

            runAllCalculations();

            expect(document.getElementById('input-premium-amount').value).toBe('locked value');
        });

        it('updates total display', () => {
            mockNumericValues['input-refund-amount'] = 400000;
            mockNumericValues['input-balance-resale'] = 400000;
            mockNumericValues['input-premium-amount'] = 500000;
            mockNumericValues['input-admin-fees'] = 5250;
            mockNumericValues['input-adgm-transfer'] = 40000;
            mockNumericValues['input-adgm-termination-fee'] = 1000;
            mockNumericValues['input-adgm-electronic-fee'] = 500;
            mockNumericValues['input-agency-fees'] = 52500;

            localStorage.setItem('propertyCategory', 'offplan');

            runAllCalculations();

            expect(formatCurrency).toHaveBeenCalled();
        });
    });

    describe('calculateTotal', () => {
        it('calculates off-plan total', () => {
            localStorage.setItem('propertyCategory', 'offplan');

            mockNumericValues['input-refund-amount'] = 400000;
            mockNumericValues['input-balance-resale'] = 400000;
            mockNumericValues['input-premium-amount'] = 500000;
            mockNumericValues['input-admin-fees'] = 5250;
            mockNumericValues['input-adgm-transfer'] = 40000;
            mockNumericValues['input-adgm-termination-fee'] = 1000;
            mockNumericValues['input-adgm-electronic-fee'] = 500;
            mockNumericValues['input-agency-fees'] = 52500;

            const total = calculateTotal();

            // 400000 + 400000 + 500000 + 5250 + 40000 + 1000 + 500 + 52500 = 1399250
            expect(total).toBe(1399250);
        });

        it('calculates ready property total', () => {
            localStorage.setItem('propertyCategory', 'ready');

            mockNumericValues['input-selling-price'] = 2500000;
            mockNumericValues['input-admin-fees'] = 5250;
            mockNumericValues['input-adgm-transfer'] = 50000;
            mockNumericValues['input-adgm-termination-fee'] = 1000;
            mockNumericValues['input-adgm-electronic-fee'] = 500;
            mockNumericValues['input-agency-fees'] = 52500;

            const total = calculateTotal();

            // 2500000 + 5250 + 50000 + 1000 + 500 + 52500 = 2609250
            expect(total).toBe(2609250);
        });

        it('defaults to offplan when no category set', () => {
            // localStorage returns null for propertyCategory
            mockNumericValues['input-refund-amount'] = 100000;
            mockNumericValues['input-balance-resale'] = 0;
            mockNumericValues['input-premium-amount'] = 50000;
            mockNumericValues['input-admin-fees'] = 0;
            mockNumericValues['input-adgm-transfer'] = 0;
            mockNumericValues['input-adgm-termination-fee'] = 0;
            mockNumericValues['input-adgm-electronic-fee'] = 0;
            mockNumericValues['input-agency-fees'] = 0;

            const total = calculateTotal();

            // Off-plan formula used: refund + balance + premium + fees
            expect(total).toBe(150000);
        });

        it('updates display-total-payment element', () => {
            localStorage.setItem('propertyCategory', 'ready');
            mockNumericValues['input-selling-price'] = 1000000;
            mockNumericValues['input-admin-fees'] = 0;
            mockNumericValues['input-adgm-transfer'] = 0;
            mockNumericValues['input-adgm-termination-fee'] = 0;
            mockNumericValues['input-adgm-electronic-fee'] = 0;
            mockNumericValues['input-agency-fees'] = 0;

            calculateTotal();

            const totalDisplayEl = document.getElementById('display-total-payment');
            expect(totalDisplayEl.textContent).toBe('AED 1,000,000');
        });

        it('handles missing display-total-payment element', () => {
            document.getElementById('display-total-payment').remove();

            localStorage.setItem('propertyCategory', 'ready');
            mockNumericValues['input-selling-price'] = 1000000;

            // Should not throw
            const total = calculateTotal();
            expect(total).toBe(1000000);
        });
    });

    describe('initCalculator', () => {
        it('adds input listeners to trigger fields', () => {
            initCalculator();

            const originalPriceInput = document.getElementById('input-original-price');
            const inputEvent = new Event('input');

            // Set values and trigger input
            mockNumericValues['input-original-price'] = 2000000;
            mockNumericValues['input-selling-price'] = 2500000;

            originalPriceInput.dispatchEvent(inputEvent);

            // Premium should be recalculated
            expect(getNumericValue).toHaveBeenCalled();
        });

        it('adds input listeners to fee fields', () => {
            initCalculator();

            const adminFeesInput = document.getElementById('input-admin-fees');
            const inputEvent = new Event('input');

            adminFeesInput.dispatchEvent(inputEvent);

            // calculateTotal should have been called
            expect(formatCurrency).toHaveBeenCalled();
        });

        it('adds click listeners to lock buttons', () => {
            initCalculator();

            const lockBtn = document.querySelector('.lock-btn[data-target="input-refund-amount"]');
            const clickEvent = new Event('click');

            lockBtn.dispatchEvent(clickEvent);

            // Toggle should have been called
            expect(toggleFieldLock).toHaveBeenCalledWith('input-refund-amount');
        });

        it('runs initial calculations', () => {
            mockNumericValues['input-internal-area'] = 500;
            mockNumericValues['input-balcony-area'] = 100;

            initCalculator();

            expect(document.getElementById('input-total-area').value).toBe('600.00 Sq.Ft');
        });

        it('handles missing trigger field elements', () => {
            document.getElementById('input-original-price').remove();

            // Should not throw
            initCalculator();
        });

        it('handles missing fee field elements', () => {
            document.getElementById('input-admin-fees').remove();

            // Should not throw
            initCalculator();
        });
    });

    describe('restoreLockStates', () => {
        it('restores locked state for locked fields', () => {
            mockLockedFields.add('input-refund-amount');

            restoreLockStates();

            const lockBtn = document.querySelector('.lock-btn[data-target="input-refund-amount"]');
            const refundInput = document.getElementById('input-refund-amount');

            expect(lockBtn.classList.contains('locked')).toBe(true);
            expect(refundInput.readOnly).toBe(false);
            expect(refundInput.classList.contains('calculated')).toBe(false);
            expect(lockBtn.innerHTML).toContain('svg');
        });

        it('does not modify unlocked fields', () => {
            // input-premium-amount is not locked

            restoreLockStates();

            const lockBtn = document.querySelector('.lock-btn[data-target="input-premium-amount"]');

            expect(lockBtn.classList.contains('locked')).toBe(false);
        });

        it('handles missing input element', () => {
            mockLockedFields.add('input-total-area');
            document.getElementById('input-total-area').remove();

            // Should not throw
            restoreLockStates();

            const lockBtn = document.querySelector('.lock-btn[data-target="input-total-area"]');
            expect(lockBtn.classList.contains('locked')).toBe(true);
        });

        it('restores multiple locked fields', () => {
            mockLockedFields.add('input-refund-amount');
            mockLockedFields.add('input-premium-amount');

            restoreLockStates();

            const refundBtn = document.querySelector('.lock-btn[data-target="input-refund-amount"]');
            const premiumBtn = document.querySelector('.lock-btn[data-target="input-premium-amount"]');

            expect(refundBtn.classList.contains('locked')).toBe(true);
            expect(premiumBtn.classList.contains('locked')).toBe(true);
        });
    });

    describe('lock toggle behavior', () => {
        it('toggles from unlocked to locked state', () => {
            initCalculator();

            const lockBtn = document.querySelector('.lock-btn[data-target="input-refund-amount"]');
            const refundInput = document.getElementById('input-refund-amount');

            // Initial state - unlocked
            expect(lockBtn.classList.contains('locked')).toBe(false);

            // Click to lock
            lockBtn.dispatchEvent(new Event('click'));

            expect(lockBtn.classList.contains('locked')).toBe(true);
            expect(refundInput.readOnly).toBe(false);
            expect(refundInput.classList.contains('calculated')).toBe(false);
        });

        it('toggles from locked to unlocked state', () => {
            initCalculator();

            const lockBtn = document.querySelector('.lock-btn[data-target="input-refund-amount"]');
            const refundInput = document.getElementById('input-refund-amount');

            // Set initial locked state
            lockBtn.classList.add('locked');
            refundInput.readOnly = false;

            // Click to unlock
            lockBtn.dispatchEvent(new Event('click'));

            expect(lockBtn.classList.contains('locked')).toBe(false);
            expect(refundInput.readOnly).toBe(true);
            expect(refundInput.classList.contains('calculated')).toBe(true);
        });

        it('recalculates field when unlocked', () => {
            initCalculator();

            const lockBtn = document.querySelector('.lock-btn[data-target="input-refund-amount"]');
            const refundInput = document.getElementById('input-refund-amount');

            // Set locked state with manual value
            lockBtn.classList.add('locked');
            refundInput.value = '999999';

            // Set calculation values
            mockNumericValues['input-original-price'] = 2000000;
            mockNumericValues['input-amount-paid-percent'] = 20;
            mockNumericValues['input-amount-paid'] = 0;

            // Click to unlock (should recalculate)
            lockBtn.dispatchEvent(new Event('click'));

            // Field should be recalculated
            expect(refundInput.value).toBe('400000');
        });

        it('focuses input when locked', () => {
            initCalculator();

            const lockBtn = document.querySelector('.lock-btn[data-target="input-refund-amount"]');
            const refundInput = document.getElementById('input-refund-amount');

            const focusSpy = vi.spyOn(refundInput, 'focus');

            // Click to lock
            lockBtn.dispatchEvent(new Event('click'));

            expect(focusSpy).toHaveBeenCalled();
        });

        it('updates lock icon SVG when toggled', () => {
            initCalculator();

            const lockBtn = document.querySelector('.lock-btn[data-target="input-refund-amount"]');

            // Click to lock
            lockBtn.dispatchEvent(new Event('click'));

            expect(lockBtn.innerHTML).toContain('lock-icon');
            expect(lockBtn.innerHTML).toContain('svg');
        });
    });

    describe('edge cases', () => {
        it('handles negative premium correctly', () => {
            mockNumericValues['input-selling-price'] = 1800000;
            mockNumericValues['input-original-price'] = 2000000;

            calculateField('input-premium-amount');

            const premiumInput = document.getElementById('input-premium-amount');
            expect(premiumInput.value).toBe('-200000');
        });

        it('handles balance when paid exceeds resale clause', () => {
            mockNumericValues['input-original-price'] = 2000000;
            mockNumericValues['input-resale-clause'] = 40;
            mockNumericValues['input-amount-paid-percent'] = 50;
            mockNumericValues['input-amount-paid'] = 0;

            calculateField('input-balance-resale');

            const balanceInput = document.getElementById('input-balance-resale');
            expect(balanceInput.value).toBe('');
        });

        it('handles direct amount overriding percentage for balance', () => {
            mockNumericValues['input-original-price'] = 2000000;
            mockNumericValues['input-resale-clause'] = 40;
            mockNumericValues['input-amount-paid-percent'] = 0;
            mockNumericValues['input-amount-paid'] = 400000; // 20% paid

            calculateField('input-balance-resale');

            const balanceInput = document.getElementById('input-balance-resale');
            expect(balanceInput.value).toBe('400000'); // 20% balance needed
        });

        it('handles zero original price for refund', () => {
            mockNumericValues['input-original-price'] = 0;
            mockNumericValues['input-amount-paid-percent'] = 20;
            mockNumericValues['input-amount-paid'] = 0;

            calculateField('input-refund-amount');

            const refundInput = document.getElementById('input-refund-amount');
            expect(refundInput.value).toBe('');
        });

        it('handles all fee fields being zero', () => {
            localStorage.setItem('propertyCategory', 'offplan');

            mockNumericValues['input-refund-amount'] = 0;
            mockNumericValues['input-balance-resale'] = 0;
            mockNumericValues['input-premium-amount'] = 0;
            mockNumericValues['input-admin-fees'] = 0;
            mockNumericValues['input-adgm-transfer'] = 0;
            mockNumericValues['input-adgm-termination-fee'] = 0;
            mockNumericValues['input-adgm-electronic-fee'] = 0;
            mockNumericValues['input-agency-fees'] = 0;

            const total = calculateTotal();

            expect(total).toBe(0);
        });

        it('handles BUA with zero values', () => {
            mockNumericValues['input-villa-internal'] = 0;
            mockNumericValues['input-villa-terrace'] = 0;

            calculateField('input-built-up-area');

            const buaInput = document.getElementById('input-built-up-area');
            expect(buaInput.value).toBe('');
        });
    });
});
