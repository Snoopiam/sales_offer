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
 * 6. DOM-DEPENDENT FUNCTIONS: validateField, validateAll, showFieldError, etc.
 * 7. PAYMENT VALIDATION DISPLAY: updatePaymentValidation
 * 8. VALIDATOR INITIALIZATION: initValidator with event listeners
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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock helpers module
vi.mock('../js/utils/helpers.js', () => ({
    getById: vi.fn((id) => document.getElementById(id)),
    queryAll: vi.fn((selector) => document.querySelectorAll(selector))
}));

// Import functions from source module
import {
    validatePaymentPlan,
    validateField,
    validateAll,
    showFieldError,
    clearFieldError,
    clearAllErrors,
    updatePaymentValidation,
    initValidator
} from '../js/modules/validator.js';

import { getById, queryAll } from '../js/utils/helpers.js';

// ============================================================================
// LOCAL VALIDATION LOGIC FOR TESTING
// ============================================================================
// These are pure functions for testing field validation without DOM dependencies
// The actual validateField() in validator.js requires DOM elements

const validationRules = {
    'input-project-name': {
        required: true,
        message: 'Project name is required'
    },
    u_original_price: {
        required: true,
        min: 0,
        message: 'Original price must be a positive number'
    },
    u_selling_price: {
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
            const result = validateFieldValue('', validationRules['input-project-name']);
            expect(result.valid).toBe(false);
            expect(result.message).toBe('Project name is required');
        });

        it('fails when required field is whitespace', () => {
            const result = validateFieldValue('   ', validationRules['input-project-name']);
            expect(result.valid).toBe(false);
        });

        it('passes when required field has value', () => {
            const result = validateFieldValue('REEM EIGHT', validationRules['input-project-name']);
            expect(result.valid).toBe(true);
        });
    });

    describe('numeric minimum', () => {
        it('fails when value is below minimum', () => {
            const result = validateFieldValue('-100', validationRules.u_original_price);
            expect(result.valid).toBe(false);
            expect(result.message).toBe('Original price must be a positive number');
        });

        it('fails when value is not a number', () => {
            const result = validateFieldValue('abc', validationRules.u_original_price);
            expect(result.valid).toBe(false);
        });

        it('passes when value meets minimum', () => {
            const result = validateFieldValue('0', validationRules.u_original_price);
            expect(result.valid).toBe(true);
        });

        it('passes when value exceeds minimum', () => {
            const result = validateFieldValue('2500000', validationRules.u_original_price);
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
        expect(validationRules['input-project-name'].required).toBe(true);
    });

    it('original price must be positive', () => {
        expect(validationRules.u_original_price.min).toBe(0);
    });

    it('selling price must be positive', () => {
        expect(validationRules.u_selling_price.min).toBe(0);
    });
});

// ============================================================================
// DOM-DEPENDENT FUNCTION TESTS
// ============================================================================
// These tests cover the functions that interact with DOM elements.

describe('DOM-dependent validator functions', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup DOM structure
        document.body.innerHTML = `
            <div class="field-container">
                <input id="input-project-name" class="input-field" type="text" value="" />
            </div>
            <div class="field-container">
                <input id="u_original_price" class="input-field" type="text" value="" />
            </div>
            <div class="field-container">
                <input id="u_selling_price" class="input-field" type="text" value="" />
            </div>
            <div class="field-container">
                <input id="unknown_field" class="input-field" type="text" value="test" />
            </div>
            <span id="paymentPercentTotal"></span>
            <span id="paymentValidation"></span>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('validateField', () => {
        it('returns valid true for field with no rules', () => {
            const result = validateField('unknown_field');
            expect(result.valid).toBe(true);
        });

        it('returns valid true for non-existent field', () => {
            const result = validateField('nonexistent');
            expect(result.valid).toBe(true);
        });

        it('returns invalid for empty required field', () => {
            document.getElementById('input-project-name').value = '';

            const result = validateField('input-project-name');

            expect(result.valid).toBe(false);
            expect(result.message).toBe('Project name is required');
        });

        it('returns invalid for whitespace-only required field', () => {
            document.getElementById('input-project-name').value = '   ';

            const result = validateField('input-project-name');

            expect(result.valid).toBe(false);
        });

        it('returns valid for required field with value', () => {
            document.getElementById('input-project-name').value = 'Test Project';

            const result = validateField('input-project-name');

            expect(result.valid).toBe(true);
        });

        it('returns invalid for negative number when min is 0', () => {
            document.getElementById('u_original_price').value = '-100';

            const result = validateField('u_original_price');

            expect(result.valid).toBe(false);
            expect(result.message).toBe('Original price must be a positive number');
        });

        it('returns invalid for non-numeric value when min is defined', () => {
            document.getElementById('u_original_price').value = 'abc';

            const result = validateField('u_original_price');

            expect(result.valid).toBe(false);
        });

        it('returns valid for zero when min is 0', () => {
            document.getElementById('u_original_price').value = '0';

            const result = validateField('u_original_price');

            expect(result.valid).toBe(true);
        });

        it('returns valid for positive number', () => {
            document.getElementById('u_selling_price').value = '2500000';

            const result = validateField('u_selling_price');

            expect(result.valid).toBe(true);
        });
    });

    describe('validateAll', () => {
        it('returns valid false with errors when all fields empty', () => {
            const result = validateAll();

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBe(3);
        });

        it('returns valid true when all required fields filled', () => {
            document.getElementById('input-project-name').value = 'Test Project';
            document.getElementById('u_original_price').value = '2000000';
            document.getElementById('u_selling_price').value = '2500000';

            const result = validateAll();

            expect(result.valid).toBe(true);
            expect(result.errors.length).toBe(0);
        });

        it('collects all errors from multiple invalid fields', () => {
            document.getElementById('input-project-name').value = '';
            document.getElementById('u_original_price').value = '-100';
            document.getElementById('u_selling_price').value = 'abc';

            const result = validateAll();

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBe(3);
            expect(result.errors[0].fieldId).toBe('input-project-name');
            expect(result.errors[1].fieldId).toBe('u_original_price');
            expect(result.errors[2].fieldId).toBe('u_selling_price');
        });

        it('includes error messages in results', () => {
            document.getElementById('input-project-name').value = '';

            const result = validateAll();

            const projectError = result.errors.find(e => e.fieldId === 'input-project-name');
            expect(projectError.message).toBe('Project name is required');
        });
    });

    describe('showFieldError', () => {
        it('adds error class to field', () => {
            showFieldError('input-project-name', 'Field is required');

            const field = document.getElementById('input-project-name');
            expect(field.classList.contains('error')).toBe(true);
        });

        it('creates error message element', () => {
            showFieldError('input-project-name', 'Field is required');

            const errorEl = document.querySelector('.field-error');
            expect(errorEl).not.toBeNull();
            expect(errorEl.textContent).toBe('Field is required');
        });

        it('replaces existing error message', () => {
            showFieldError('input-project-name', 'First error');
            showFieldError('input-project-name', 'Second error');

            const errors = document.querySelectorAll('.field-error');
            expect(errors.length).toBe(1);
            expect(errors[0].textContent).toBe('Second error');
        });

        it('does nothing for non-existent field', () => {
            showFieldError('nonexistent', 'Error');
            // Should not throw
            const errors = document.querySelectorAll('.field-error');
            expect(errors.length).toBe(0);
        });

        it('applies correct styles to error element', () => {
            showFieldError('input-project-name', 'Error message');

            const errorEl = document.querySelector('.field-error');
            expect(errorEl.style.color).toBe('rgb(239, 68, 68)');
            expect(errorEl.style.fontSize).toBe('10px');
            expect(errorEl.style.display).toBe('block');
        });
    });

    describe('clearFieldError', () => {
        it('removes error class from field', () => {
            const field = document.getElementById('input-project-name');
            field.classList.add('error');

            clearFieldError('input-project-name');

            expect(field.classList.contains('error')).toBe(false);
        });

        it('removes error message element', () => {
            showFieldError('input-project-name', 'Error');

            clearFieldError('input-project-name');

            const errorEl = document.querySelector('.field-error');
            expect(errorEl).toBeNull();
        });

        it('does nothing for non-existent field', () => {
            clearFieldError('nonexistent');
            // Should not throw
        });

        it('handles field without existing error', () => {
            clearFieldError('input-project-name');
            // Should not throw
            const field = document.getElementById('input-project-name');
            expect(field.classList.contains('error')).toBe(false);
        });
    });

    describe('clearAllErrors', () => {
        it('removes error class from all fields', () => {
            document.getElementById('input-project-name').classList.add('error');
            document.getElementById('u_original_price').classList.add('error');

            clearAllErrors();

            expect(document.querySelectorAll('.input-field.error').length).toBe(0);
        });

        it('removes all error message elements', () => {
            showFieldError('input-project-name', 'Error 1');
            showFieldError('u_original_price', 'Error 2');

            clearAllErrors();

            expect(document.querySelectorAll('.field-error').length).toBe(0);
        });

        it('handles no errors to clear', () => {
            clearAllErrors();
            // Should not throw
            expect(document.querySelectorAll('.field-error').length).toBe(0);
        });
    });

    describe('updatePaymentValidation', () => {
        it('updates percent total display', () => {
            updatePaymentValidation({ valid: true, totalPercent: 100, message: '' });

            const percentTotal = document.getElementById('paymentPercentTotal');
            expect(percentTotal.textContent).toBe('100%');
        });

        it('clears message and shows success for valid', () => {
            updatePaymentValidation({ valid: true, totalPercent: 100, message: '' });

            const validationMsg = document.getElementById('paymentValidation');
            expect(validationMsg.textContent).toBe('');
            expect(validationMsg.classList.contains('success')).toBe(true);
            expect(validationMsg.classList.contains('error')).toBe(false);
        });

        it('shows error message for invalid', () => {
            updatePaymentValidation({
                valid: false,
                totalPercent: 70,
                message: 'Total is 70% (30% remaining)'
            });

            const validationMsg = document.getElementById('paymentValidation');
            expect(validationMsg.textContent).toBe('Total is 70% (30% remaining)');
            expect(validationMsg.classList.contains('error')).toBe(true);
            expect(validationMsg.classList.contains('success')).toBe(false);
        });

        it('handles missing percent total element', () => {
            document.getElementById('paymentPercentTotal').remove();

            updatePaymentValidation({ valid: true, totalPercent: 100, message: '' });
            // Should not throw
        });

        it('handles missing validation message element', () => {
            document.getElementById('paymentValidation').remove();

            updatePaymentValidation({ valid: false, totalPercent: 50, message: 'Error' });
            // Should not throw
        });

        it('displays decimal percentages correctly', () => {
            updatePaymentValidation({ valid: false, totalPercent: 33.33, message: '' });

            const percentTotal = document.getElementById('paymentPercentTotal');
            expect(percentTotal.textContent).toBe('33.33%');
        });
    });

    describe('initValidator', () => {
        it('sets up blur event listeners on validation fields', () => {
            initValidator();

            const projectField = document.getElementById('input-project-name');
            projectField.value = '';
            projectField.dispatchEvent(new Event('blur'));

            // Should show error
            expect(projectField.classList.contains('error')).toBe(true);
        });

        it('shows error message on blur when invalid', () => {
            initValidator();

            const projectField = document.getElementById('input-project-name');
            projectField.value = '';
            projectField.dispatchEvent(new Event('blur'));

            const errorEl = projectField.parentElement.querySelector('.field-error');
            expect(errorEl).not.toBeNull();
            expect(errorEl.textContent).toBe('Project name is required');
        });

        it('clears error on blur when valid', () => {
            initValidator();

            const projectField = document.getElementById('input-project-name');

            // First trigger error
            projectField.value = '';
            projectField.dispatchEvent(new Event('blur'));
            expect(projectField.classList.contains('error')).toBe(true);

            // Then make valid and blur again
            projectField.value = 'Test Project';
            projectField.dispatchEvent(new Event('blur'));
            expect(projectField.classList.contains('error')).toBe(false);
        });

        it('sets up input event listeners to clear errors', () => {
            initValidator();

            const projectField = document.getElementById('input-project-name');

            // First show error
            showFieldError('input-project-name', 'Error');
            expect(projectField.classList.contains('error')).toBe(true);

            // Input should clear error
            projectField.dispatchEvent(new Event('input'));
            expect(projectField.classList.contains('error')).toBe(false);
        });

        it('handles missing field elements gracefully', () => {
            document.getElementById('input-project-name').remove();

            initValidator();
            // Should not throw
        });

        it('sets up listeners for numeric validation fields', () => {
            initValidator();

            const priceField = document.getElementById('u_original_price');
            priceField.value = '-100';
            priceField.dispatchEvent(new Event('blur'));

            expect(priceField.classList.contains('error')).toBe(true);
        });

        it('validates all three rule fields', () => {
            initValidator();

            // Test all fields have listeners
            ['input-project-name', 'u_original_price', 'u_selling_price'].forEach(fieldId => {
                const field = document.getElementById(fieldId);
                field.value = '';
                field.dispatchEvent(new Event('blur'));
                expect(field.classList.contains('error')).toBe(true);
            });
        });
    });

    describe('validation flow integration', () => {
        it('complete validation workflow', () => {
            initValidator();

            // 1. Empty fields should fail validation
            let result = validateAll();
            expect(result.valid).toBe(false);

            // 2. Fill in project name
            const projectField = document.getElementById('input-project-name');
            projectField.value = 'Test Project';
            projectField.dispatchEvent(new Event('input'));

            // 3. Fill in prices
            document.getElementById('u_original_price').value = '2000000';
            document.getElementById('u_selling_price').value = '2500000';

            // 4. Now validation should pass
            result = validateAll();
            expect(result.valid).toBe(true);
        });

        it('shows and clears errors correctly', () => {
            initValidator();

            const projectField = document.getElementById('input-project-name');

            // Blur empty field - should show error
            projectField.value = '';
            projectField.dispatchEvent(new Event('blur'));
            expect(document.querySelector('.field-error')).not.toBeNull();

            // Type something - should clear error
            projectField.value = 'T';
            projectField.dispatchEvent(new Event('input'));
            expect(document.querySelector('.field-error')).toBeNull();

            // Blur with value - should stay valid
            projectField.dispatchEvent(new Event('blur'));
            expect(projectField.classList.contains('error')).toBe(false);
        });
    });
});
