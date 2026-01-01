/**
 * Payment Plan Module
 * Structured payment plan editor with add/remove/reorder
 */

import { $, generateId, formatCurrency, getNumericValue, createElement, debounce } from '../utils/helpers.js';
import { validatePaymentPlan, updatePaymentValidation } from './validator.js';
import { saveCurrentOffer, getCurrentOffer } from './storage.js';

let paymentRows = [];
let paymentPlanName = '';
let sortableInstance = null;

// Debounced functions to prevent race conditions during fast typing
const debouncedSave = debounce(() => {
    saveCurrentOffer({ paymentPlan: paymentRows });
}, 300);

const debouncedValidate = debounce(() => {
    const validation = validatePaymentPlan(paymentRows);
    updatePaymentValidation(validation);
}, 150);

const debouncedPreview = debounce(() => {
    updatePreviewInternal();
}, 150);

/**
 * Initialize payment plan editor
 */
export function initPaymentPlan() {
    // Load saved payment plan
    const offer = getCurrentOffer();
    if (offer.paymentPlan && offer.paymentPlan.length > 0) {
        paymentRows = offer.paymentPlan.map(row => ({
            id: row.id || generateId(),
            date: row.date || '',
            percentage: row.percentage || '',
            amount: row.amount || ''
        }));
    } else {
        // Add default empty rows
        paymentRows = [
            { id: generateId(), date: 'On Booking', percentage: '10', amount: '' },
            { id: generateId(), date: '', percentage: '10', amount: '' },
            { id: generateId(), date: '', percentage: '10', amount: '' },
            { id: generateId(), date: 'On Handover', percentage: '70', amount: '' }
        ];
    }

    renderPaymentPlan();
    initSortable();

    // Add row button
    const addBtn = $('addPaymentRowBtn');
    if (addBtn) {
        addBtn.addEventListener('click', addPaymentRow);
    }
}

/**
 * Render payment plan table
 */
export function renderPaymentPlan() {
    const tbody = $('paymentPlanBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    paymentRows.forEach((row, index) => {
        const tr = createElement('tr', { dataset: { id: row.id } });

        // Date cell
        const dateCell = createElement('td');
        const dateInput = createElement('input', {
            type: 'text',
            value: row.date,
            placeholder: 'e.g., 01 Dec 2024',
            dataset: { field: 'date', index: index.toString() }
        });
        dateInput.addEventListener('input', (e) => handleRowInput(index, 'date', e.target.value));
        dateCell.appendChild(dateInput);
        tr.appendChild(dateCell);

        // Percentage cell
        const percentCell = createElement('td');
        const percentInput = createElement('input', {
            type: 'text',
            value: row.percentage,
            placeholder: '10%',
            style: { width: '50px' },
            dataset: { field: 'percentage', index: index.toString() }
        });
        percentInput.addEventListener('input', (e) => {
            const val = e.target.value.replace('%', '');
            handleRowInput(index, 'percentage', val);
        });
        percentCell.appendChild(percentInput);
        tr.appendChild(percentCell);

        // Amount cell
        const amountCell = createElement('td');
        const amountInput = createElement('input', {
            type: 'number',
            value: row.amount,
            placeholder: 'Auto',
            dataset: { field: 'amount', index: index.toString() }
        });
        amountInput.addEventListener('input', (e) => handleRowInput(index, 'amount', e.target.value));
        amountCell.appendChild(amountInput);
        tr.appendChild(amountCell);

        // Delete button cell
        const deleteCell = createElement('td');
        if (paymentRows.length > 1) {
            const deleteBtn = createElement('button', {
                className: 'delete-row-btn',
                title: 'Delete row'
            }, '×');
            deleteBtn.addEventListener('click', () => deletePaymentRow(index));
            deleteCell.appendChild(deleteBtn);
        }
        tr.appendChild(deleteCell);

        tbody.appendChild(tr);
    });

    calculatePaymentAmounts();
    validate();
    savePaymentPlan();
}

/**
 * Handle input in a payment row
 * Uses debouncing to prevent race conditions during fast typing
 * @param {number} index - Row index
 * @param {string} field - Field name
 * @param {string} value - New value
 */
function handleRowInput(index, field, value) {
    if (paymentRows[index]) {
        paymentRows[index][field] = value;

        if (field === 'percentage') {
            calculatePaymentAmounts();
        }

        // Use debounced functions to prevent race conditions
        debouncedValidate();
        debouncedSave();
        debouncedPreview();
    }
}

/**
 * Add a new payment row
 */
export function addPaymentRow() {
    paymentRows.push({
        id: generateId(),
        date: '',
        percentage: '',
        amount: ''
    });
    renderPaymentPlan();
}

/**
 * Delete a payment row
 * @param {number} index - Row index
 */
export function deletePaymentRow(index) {
    if (paymentRows.length > 1) {
        paymentRows.splice(index, 1);
        renderPaymentPlan();
    }
}

/**
 * Calculate payment amounts based on percentages and original price
 */
export function calculatePaymentAmounts() {
    const originalPrice = getNumericValue('u_orig');

    paymentRows.forEach((row, index) => {
        if (row.percentage && !row.amount) {
            const percent = parseFloat(row.percentage) || 0;
            const amount = Math.round((percent / 100) * originalPrice);
            row.amount = amount > 0 ? amount : '';

            // Update input if exists
            const amountInput = document.querySelector(`input[data-field="amount"][data-index="${index}"]`);
            if (amountInput && !amountInput.value) {
                amountInput.placeholder = amount > 0 ? formatCurrency(amount) : 'Auto';
            }
        }
    });
}

/**
 * Validate payment plan
 */
function validate() {
    const validation = validatePaymentPlan(paymentRows);
    updatePaymentValidation(validation);
}

/**
 * Save payment plan to storage
 */
function savePaymentPlan() {
    saveCurrentOffer({ paymentPlan: paymentRows });
}

/**
 * Initialize SortableJS for drag-to-reorder
 */
function initSortable() {
    const tbody = $('paymentPlanBody');
    if (!tbody || typeof Sortable === 'undefined') return;

    if (sortableInstance) {
        sortableInstance.destroy();
    }

    sortableInstance = new Sortable(tbody, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        handle: 'tr',
        onEnd: (evt) => {
            // Reorder array
            const item = paymentRows.splice(evt.oldIndex, 1)[0];
            paymentRows.splice(evt.newIndex, 0, item);
            savePaymentPlan();
            updatePreview();
        }
    });
}

/**
 * Update preview with current payment plan (internal - use debounced version)
 */
function updatePreviewInternal() {
    const tbody = $('pp_body');
    if (!tbody) return;

    const originalPrice = getNumericValue('u_orig');
    tbody.innerHTML = '';

    paymentRows.forEach(row => {
        if (!row.date && !row.percentage && !row.amount) return;

        const percent = parseFloat(row.percentage) || 0;
        const amount = row.amount || Math.round((percent / 100) * originalPrice);

        const tr = createElement('tr');

        // Use DOM methods instead of innerHTML to prevent XSS
        const dateCell = createElement('td');
        dateCell.textContent = row.date || '-';

        const percentCell = createElement('td');
        percentCell.textContent = row.percentage ? row.percentage + '%' : '-';

        const amountCell = createElement('td', { style: { textAlign: 'right' } });
        amountCell.textContent = formatCurrency(amount);

        tr.appendChild(dateCell);
        tr.appendChild(percentCell);
        tr.appendChild(amountCell);
        tbody.appendChild(tr);
    });

    // Dispatch event for other modules
    document.dispatchEvent(new CustomEvent('paymentPlanUpdated'));
}

/**
 * Update preview with current payment plan (public API)
 */
export function updatePreview() {
    updatePreviewInternal();
}

/**
 * Get current payment plan data
 * @returns {Array} Payment plan rows
 */
export function getPaymentPlan() {
    return paymentRows;
}

/**
 * Set payment plan data
 * @param {Array} data - Payment plan data
 */
export function setPaymentPlan(data) {
    paymentRows = data.map(row => ({
        id: row.id || generateId(),
        date: row.date || '',
        percentage: row.percentage?.toString().replace('%', '') || '',
        amount: row.amount || ''
    }));
    renderPaymentPlan();
}

/**
 * Set payment plan name (e.g., "30:70")
 * @param {string} name - Payment plan name
 */
export function setPaymentPlanName(name) {
    paymentPlanName = name || '';
    updatePaymentPlanTitle();
}

/**
 * Get payment plan name
 * @returns {string} Payment plan name
 */
export function getPaymentPlanName() {
    return paymentPlanName;
}

/**
 * Update the Payment Plan title in the preview
 */
function updatePaymentPlanTitle() {
    const titleEl = $('paymentPlanTitle');
    if (titleEl) {
        titleEl.textContent = paymentPlanName
            ? `Payment Plan ${paymentPlanName}`
            : 'Payment Plan';
    }
}

/**
 * Parse CSV format to payment plan (for legacy support)
 * @param {string} csv - CSV string
 * @returns {Array} Payment plan data
 */
export function parseCSV(csv) {
    const lines = csv.split('\n');
    const data = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const parts = trimmed.split(',');
        if (parts.length >= 3) {
            data.push({
                id: generateId(),
                date: parts[0].trim(),
                percentage: parts[1].trim().replace('%', ''),
                amount: parts[2].trim().replace(/[^0-9.-]/g, '')
            });
        }
    });

    return data;
}

/**
 * Convert payment plan to CSV format
 * @returns {string} CSV string
 */
export function toCSV() {
    return paymentRows
        .filter(row => row.date || row.percentage || row.amount)
        .map(row => `${row.date},${row.percentage}%,${row.amount}`)
        .join('\n');
}
