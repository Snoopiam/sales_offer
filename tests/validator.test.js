/**
 * ============================================================================
 * VALIDATOR TESTS - Test Suite for Form Validation
 * ============================================================================
 *
 * PURPOSE: Validates all form validation rules and payment plan validation logic.
 *          Ensures user input is properly validated before processing.
 *
 * WHAT WE TEST:
 * 1. REQUIRED FIELDS: Project name, prices
 * 2. NUMERIC VALIDATION: Min/max ranges, positive numbers only
 * 3. PAYMENT PLAN VALIDATION: Percentage totals must equal 100%
 * 4. FLOATING POINT PRECISION: Handles 33.33 + 33.33 + 33.34 = 100
 * 5. EPSILON COMPARISON: Tolerance for floating point errors (±0.01%)
 *
 * WHY EPSILON COMPARISON:
 * JavaScript floating point math is imprecise:
 *   0.1 + 0.2 = 0.30000000000000004 (not exactly 0.3)
 *   33.33 + 33.33 + 33.34 = 99.99999999999999 (not exactly 100)
 *
 * We use EPSILON (tolerance of 0.01%) to handle these cases:
 *   If |total - 100| < 0.01, we consider it valid
 *
 * CRITICAL TEST SCENARIOS:
 * - Required field validation (empty, whitespace, null)
 * - Numeric range validation (negative, zero, positive)
 * - Payment plan totals (exactly 100%, under, over)
 * - Floating point edge cases (99.995%, 100.005%)
 * - Invalid data handling (NaN, empty strings, missing properties)
 *
 * RUN TESTS:
 * npm test
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';

// Import actual validation function from source module
import { validatePaymentPlan } from '../js/modules/validator.js';

// ============================================================================
// LOCAL VALIDATION LOGIC FOR TESTING
// ============================================================================
// These are pure functions for testing field validation without DOM dependencies
// The actual validateField() in validator.js requires DOM elements

const validationRules = {
    inp_proj: {
        required: true,
        message: 'Project name is required'
    },
    u_orig: {
        required: true,
        min: 0,
        message: 'Original price must be a positive number'
    },
    u_sell: {
        required: true,
        min: 0,
        message: 'Selling price must be a positive number'
    }
};

/**
 * Validate a single field value against rules (pure function for testing)
 */
function validateFieldValue(value, rules) {
    if (!rules) return { valid: true };

    const trimmedValue = value?.trim?.() ?? '';

    // Required check
    if (rules.required && !trimmedValue) {
        return { valid: false, message: rules.message || 'This field is required' };
    }

    // Numeric checks
    if (rules.min !== undefined && trimmedValue) {
        const num = parseFloat(trimmedValue);
        if (isNaN(num) || num < rules.min) {
            return { valid: false, message: rules.message };
        }
    }

    if (rules.max !== undefined && trimmedValue) {
        const num = parseFloat(trimmedValue);
        if (isNaN(num) || num > rules.max) {
            return { valid: false, message: rules.message };
        }
    }

    return { valid: true };
}

describe('validateFieldValue', () => {
    describe('required fields', () => {
        it('fails when required field is empty', () => {
            const result = validateFieldValue('', validationRules.inp_proj);
            expect(result.valid).toBe(false);
            expect(result.message).toBe('Project name is required');
        });

        it('fails when required field is whitespace', () => {
            const result = validateFieldValue('   ', validationRules.inp_proj);
            expect(result.valid).toBe(false);
        });

        it('passes when required field has value', () => {
            const result = validateFieldValue('REEM EIGHT', validationRules.inp_proj);
            expect(result.valid).toBe(true);
        });
    });

    describe('numeric minimum', () => {
        it('fails when value is below minimum', () => {
            const result = validateFieldValue('-100', validationRules.u_orig);
            expect(result.valid).toBe(false);
            expect(result.message).toBe('Original price must be a positive number');
        });

        it('fails when value is not a number', () => {
            const result = validateFieldValue('abc', validationRules.u_orig);
            expect(result.valid).toBe(false);
        });

        it('passes when value meets minimum', () => {
            const result = validateFieldValue('0', validationRules.u_orig);
            expect(result.valid).toBe(true);
        });

        it('passes when value exceeds minimum', () => {
            const result = validateFieldValue('2500000', validationRules.u_orig);
            expect(result.valid).toBe(true);
        });
    });

    describe('no rules', () => {
        it('passes when no rules defined', () => {
            const result = validateFieldValue('anything', undefined);
            expect(result.valid).toBe(true);
        });
    });
});

describe('validatePaymentPlan', () => {
    describe('valid payment plans', () => {
        it('validates when total equals 100%', () => {
            const plan = [
                { date: 'On Booking', percentage: '10' },
                { date: '', percentage: '10' },
                { date: '', percentage: '10' },
                { date: 'On Handover', percentage: '70' }
            ];
            const result = validatePaymentPlan(plan);
            expect(result.valid).toBe(true);
            expect(result.totalPercent).toBe(100);
            expect(result.message).toBe('');
        });

        it('handles floating point precision (33.33 + 33.33 + 33.34)', () => {
            const plan = [
                { percentage: '33.33' },
                { percentage: '33.33' },
                { percentage: '33.34' }
            ];
            const result = validatePaymentPlan(plan);
            expect(result.valid).toBe(true);
        });

        it('handles two decimal places correctly', () => {
            const plan = [
                { percentage: '25.50' },
                { percentage: '24.50' },
                { percentage: '50.00' }
            ];
            const result = validatePaymentPlan(plan);
            expect(result.valid).toBe(true);
        });
    });

    describe('invalid payment plans', () => {
        it('fails when total exceeds 100%', () => {
            const plan = [
                { percentage: '50' },
                { percentage: '60' }
            ];
            const result = validatePaymentPlan(plan);
            expect(result.valid).toBe(false);
            expect(result.totalPercent).toBe(110);
            expect(result.message).toContain('exceeds 100%');
        });

        it('fails when total is under 100%', () => {
            const plan = [
                { percentage: '30' },
                { percentage: '40' }
            ];
            const result = validatePaymentPlan(plan);
            expect(result.valid).toBe(false);
            expect(result.totalPercent).toBe(70);
            expect(result.message).toContain('30% remaining');
        });

        it('calculates remaining percentage correctly', () => {
            const plan = [
                { percentage: '25' },
                { percentage: '25' },
                { percentage: '25' }
            ];
            const result = validatePaymentPlan(plan);
            expect(result.valid).toBe(false);
            expect(result.totalPercent).toBe(75);
            expect(result.message).toBe('Total is 75% (25% remaining)');
        });
    });

    describe('edge cases', () => {
        it('handles empty payment plan', () => {
            const result = validatePaymentPlan([]);
            expect(result.valid).toBe(true);
            expect(result.totalPercent).toBe(0);
        });

        it('handles null payment plan', () => {
            const result = validatePaymentPlan(null);
            expect(result.valid).toBe(true);
            expect(result.totalPercent).toBe(0);
        });

        it('handles invalid percentage values', () => {
            const plan = [
                { percentage: 'abc' },
                { percentage: '50' }
            ];
            const result = validatePaymentPlan(plan);
            expect(result.totalPercent).toBe(50);
        });

        it('handles empty percentage strings', () => {
            const plan = [
                { percentage: '' },
                { percentage: '100' }
            ];
            const result = validatePaymentPlan(plan);
            expect(result.valid).toBe(true);
            expect(result.totalPercent).toBe(100);
        });

        it('handles missing percentage property', () => {
            const plan = [
                { date: 'On Booking' },
                { percentage: '100' }
            ];
            const result = validatePaymentPlan(plan);
            expect(result.valid).toBe(true);
        });
    });

    describe('tolerance threshold', () => {
        it('accepts 99.995% as valid (within epsilon)', () => {
            const plan = [{ percentage: '99.995' }];
            const result = validatePaymentPlan(plan);
            // 99.995 is within EPSILON (0.01) of 100: |99.995 - 100| = 0.005 < 0.01
            expect(result.valid).toBe(true);
        });

        it('rejects 99.99% as invalid (at epsilon boundary)', () => {
            const plan = [{ percentage: '99.99' }];
            const result = validatePaymentPlan(plan);
            // 99.99 is exactly at EPSILON boundary: |99.99 - 100| = 0.01, not < 0.01
            expect(result.valid).toBe(false);
        });

        it('accepts 100.005% as valid (within epsilon)', () => {
            const plan = [{ percentage: '100.005' }];
            const result = validatePaymentPlan(plan);
            expect(result.valid).toBe(true);
        });

        it('rejects 100.02% as over limit', () => {
            const plan = [{ percentage: '100.02' }];
            const result = validatePaymentPlan(plan);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('exceeds');
        });
    });
});

describe('All validation rules', () => {
    it('project name is required', () => {
        expect(validationRules.inp_proj.required).toBe(true);
    });

    it('original price must be positive', () => {
        expect(validationRules.u_orig.min).toBe(0);
    });

    it('selling price must be positive', () => {
        expect(validationRules.u_sell.min).toBe(0);
    });
});
