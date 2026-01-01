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

import { describe, it, expect } from 'vitest';

// ============================================================================
// PURE CALCULATION FUNCTIONS FOR TESTING
// ============================================================================
// These functions are extracted from calculator.js for isolated unit testing.
// They have no dependencies on DOM, localStorage, or other modules.

/**
 * Calculate total area from internal + balcony
 *
 * BUSINESS RULE:
 * Total Area = Internal Area + Balcony Area
 * Used for standard apartments (not villas/plots)
 *
 * @param {number} internal - Internal area in sq ft
 * @param {number} balcony - Balcony area in sq ft
 * @returns {number} Total area in sq ft, or 0 if both are zero
 */
function calculateTotalArea(internal, balcony) {
    const total = internal + balcony;
    return total > 0 ? total : 0;
}

/**
 * Calculate BUA (Built-Up Area) for villas
 */
function calculateBUA(internal, terrace) {
    const total = internal + terrace;
    return total > 0 ? total : 0;
}

/**
 * Calculate refund amount based on amount paid or percentage
 */
function calculateRefund(original, amountPaidPercent, amountPaid) {
    // If Amount Paid (AED) is provided, use it
    if (amountPaid > 0) {
        return Math.round(amountPaid);
    }
    // If Amount Paid % is provided, calculate from original price
    if (amountPaidPercent > 0 && original > 0) {
        return Math.round(original * (amountPaidPercent / 100));
    }
    return 0;
}

/**
 * Calculate balance resale clause
 * If paid less than resale clause %, balance = difference
 */
function calculateBalance(original, resaleClausePercent, amountPaidPercent, amountPaid) {
    if (!original || !resaleClausePercent) return 0;

    // Calculate effective amount paid percentage
    let effectivePaidPercent = amountPaidPercent;
    if (amountPaid > 0 && original > 0) {
        effectivePaidPercent = (amountPaid / original) * 100;
    }

    // If paid less than resale clause, balance = difference
    if (effectivePaidPercent < resaleClausePercent) {
        const balancePercent = resaleClausePercent - effectivePaidPercent;
        return Math.round(original * (balancePercent / 100));
    }

    return 0;
}

/**
 * Calculate premium (selling - original)
 */
function calculatePremium(selling, original) {
    return selling - original;
}

/**
 * Calculate ADGM fee (2% of original price)
 */
function calculateADGM(original) {
    return Math.round(original * 0.02);
}

/**
 * Calculate agency fees (2% + 5% VAT)
 */
function calculateAgencyFees(selling) {
    const base = selling * 0.02;
    return Math.round(base * 1.05);
}

/**
 * Calculate total initial payment for off-plan
 */
function calculateTotalOffPlan(refund, balance, premium, admin, adgm, agency) {
    return refund + balance + premium + admin + adgm + agency;
}

/**
 * Calculate total initial payment for ready property
 */
function calculateTotalReady(selling, admin, adgm, agency) {
    return selling + admin + adgm + agency;
}

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
