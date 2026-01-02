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

function getTotalInitialPaymentValue() {
    const totalText = $('totalDisplay')?.textContent || $('disp_total')?.textContent || '';
    const numeric = totalText.replace(/[^0-9.-]/g, '');
    return parseFloat(numeric) || 0;
}

// [UPDATED] Matches "On Handover", "Handover", "Completion", "100% Handover", etc.
function isHandoverRow(row) {
    if (!row || !row.date) return false;
    const d = row.date.toString().toLowerCase();
    return d.includes('handover') || d.includes('completion');
}

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
    const offer = getCurrentOffer();
    if (offer.paymentPlan && offer.paymentPlan.length > 0) {
        paymentRows = offer.paymentPlan.map(row => ({
            id: row.id || generateId(),
            date: row.date || '',
            percentage: row.percentage || '',
            amount: row.amount || ''
        }));
    } else {
        paymentRows = [
            { id: generateId(), date: 'On Booking', percentage: '10', amount: '' },
            { id: generateId(), date: '', percentage: '10', amount: '' },
            { id: generateId(), date: '', percentage: '10', amount: '' },
            { id: generateId(), date: 'On Handover', percentage: '70', amount: '' }
        ];
    }

    renderPaymentPlan();
    initSortable();

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

        if (isHandoverRow(row)) {
            tr.classList.add('linked-total');
        }

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

        if (isHandoverRow(row)) {
            amountInput.title = "Linked to Total Initial Payment";
        }

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

function handleRowInput(index, field, value) {
    if (paymentRows[index]) {
        paymentRows[index][field] = value;

        if (field === 'date') {
            const d = value.toString().toLowerCase();
            if (d.includes('handover') || d.includes('completion')) {
                 renderPaymentPlan(); // Re-render to apply styling
            }
        }

        if (field === 'percentage') {
            calculatePaymentAmounts();
        }

        debouncedValidate();
        debouncedSave();
        debouncedPreview();
    }
}

export function addPaymentRow() {
    paymentRows.push({
        id: generateId(),
        date: '',
        percentage: '',
        amount: ''
    });
    renderPaymentPlan();
}

export function deletePaymentRow(index) {
    if (paymentRows.length > 1) {
        paymentRows.splice(index, 1);
        renderPaymentPlan();
    }
}

export function calculatePaymentAmounts() {
    const originalPrice = getNumericValue('u_orig');

    paymentRows.forEach((row, index) => {
        // Skip handover row in standard calc
        if (isHandoverRow(row)) return;

        if (row.percentage && !row.amount) {
            const percent = parseFloat(row.percentage) || 0;
            const amount = Math.round((percent / 100) * originalPrice);
            row.amount = amount > 0 ? amount : '';

            const amountInput = document.querySelector(`input[data-field="amount"][data-index="${index}"]`);
            if (amountInput && !amountInput.value) {
                amountInput.placeholder = amount > 0 ? formatCurrency(amount) : 'Auto';
            }
        }
    });
}

/**
 * [UPDATED] Explicitly sync handover amount
 * Updates the row in the dataset AND the input on screen
 */
export function syncHandoverWithTotal(totalAmount) {
    // Use the relaxed matcher
    const handoverIndex = paymentRows.findIndex(isHandoverRow);

    // We allow 0 updates now (in case you clear the form)
    if (handoverIndex !== -1) {
        const newVal = Math.round(totalAmount);

        // 1. Update Data Model
        paymentRows[handoverIndex].amount = newVal;

        // 2. Update Visual Input immediately
        const amountInput = document.querySelector(`input[data-field="amount"][data-index="${handoverIndex}"]`);
        if (amountInput) {
            amountInput.value = newVal; // Update the box
            // Visual flash effect to show it updated
            amountInput.style.backgroundColor = 'rgba(98, 198, 193, 0.2)';
            setTimeout(() => amountInput.style.backgroundColor = '', 500);
        }
    }
}

function validate() {
    const validation = validatePaymentPlan(paymentRows);
    updatePaymentValidation(validation);
}

function savePaymentPlan() {
    saveCurrentOffer({ paymentPlan: paymentRows });
}

function initSortable() {
    const tbody = $('paymentPlanBody');
    if (!tbody || typeof Sortable === 'undefined') return;

    if (sortableInstance) sortableInstance.destroy();

    sortableInstance = new Sortable(tbody, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        handle: 'tr',
        onEnd: (evt) => {
            const item = paymentRows.splice(evt.oldIndex, 1)[0];
            paymentRows.splice(evt.newIndex, 0, item);
            savePaymentPlan();
            updatePreview();
        }
    });
}

/**
 * Update Preview (Internal)
 */
function updatePreviewInternal(explicitTotal) {
    const tbody = $('pp_body');
    if (!tbody) return;

    const originalPrice = getNumericValue('u_orig');

    const totalInitial = (explicitTotal !== undefined && explicitTotal !== null)
        ? explicitTotal
        : getTotalInitialPaymentValue();

    tbody.innerHTML = '';

    paymentRows.forEach((row, _index) => {
        if (!row.date && !row.percentage && !row.amount) return;

        const percent = parseFloat(row.percentage) || 0;
        const isHandover = isHandoverRow(row);

        let amount = row.amount;

        if (isHandover) {
            // Force handover to match explicit total
            amount = Math.round(totalInitial);
            row.amount = amount;
        } else if (!amount) {
            amount = Math.round((percent / 100) * originalPrice);
        }

        const tr = createElement('tr');
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

    document.dispatchEvent(new CustomEvent('paymentPlanUpdated'));
}

/**
 * Public API to update preview
 */
export function updatePreview(explicitTotal) {
    updatePreviewInternal(explicitTotal);
}

export function getPaymentPlan() { return paymentRows; }
export function setPaymentPlan(data) {
    paymentRows = data.map(row => ({
        id: row.id || generateId(),
        date: row.date || '',
        percentage: row.percentage?.toString().replace('%', '') || '',
        amount: row.amount || ''
    }));
    renderPaymentPlan();
}
export function setPaymentPlanName(name) {
    paymentPlanName = name || '';
    const titleEl = $('paymentPlanTitle');
    if (titleEl) titleEl.textContent = paymentPlanName ? `Payment Plan ${paymentPlanName}` : 'Payment Plan';
}
export function getPaymentPlanName() { return paymentPlanName; }
export function parseCSV(_csv) { return []; }
export function toCSV() { return ''; }
