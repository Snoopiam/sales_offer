/**
 * Excel Import Module
 * Handle Excel file parsing and data extraction
 *
 * FORMAT: Label-Value pairs in Columns A-B
 * - Rows 1-25: Property details and financial data
 * - Row 25: Payment Plan name (e.g., "30:70")
 * - Rows 26+: Payment Plan installments (columns A-D)
 *
 * Supports Off-Plan Resale and Ready Property categories
 */

import { $, setValue, toast, formatDate, excelDateToJS } from '../utils/helpers.js';
import { setPaymentPlan, setPaymentPlanName } from './paymentPlan.js';
import { runAllCalculations } from './calculator.js';

/**
 * Label mappings - maps Excel labels (Column A) to form field IDs
 * Keys are normalized (lowercase, trimmed)
 */
const LABEL_TO_FIELD = {
    'project name': 'inp_proj',
    'unit no': 'u_unitno',
    'unit type': 'u_unittype',
    'unit model': 'u_bed',
    'views': 'u_views',
    'internal area (sq.ft)': 'u_internal',
    'balcony area (sq.ft)': 'u_balcony',
    'total area (sq.ft)': 'u_area',
    'original price': 'u_orig',
    'selling price': 'u_sell',
    'paid percentage': 'u_amountpaidpercent',
    'resale clause': 'u_resaleclause',
    'balance resale clause (aed)': 'u_bal',
    'admin fees (saas)': 'u_adm',
    'adgm (2% of original price)': 'u_trans',
    'adgm termination fee': 'u_adgm_term',
    'adgm electronic service fee': 'u_adgm_elec',
    'agency fees (2% of selling price + vat)': 'u_broker'
};

/**
 * Fields that store percentages as decimals (0.3 = 30%)
 */
const DECIMAL_PERCENT_FIELDS = ['u_amountpaidpercent', 'u_resaleclause'];

/**
 * Numeric fields that should be parsed as numbers
 */
const NUMERIC_FIELDS = [
    'u_internal', 'u_balcony', 'u_area', 'u_orig', 'u_sell',
    'u_amountpaidpercent', 'u_resaleclause', 'u_bal', 'u_adm',
    'u_trans', 'u_adgm_term', 'u_adgm_elec', 'u_broker'
];

/**
 * Initialize Excel import
 */
export function initExcel() {
    const uploadInput = $('excelUpload');
    if (uploadInput) {
        uploadInput.addEventListener('change', handleExcelUpload);
    }
}

/**
 * Handle Excel file upload
 * @param {Event} e - Change event
 */
async function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check if XLSX library is loaded
    if (typeof XLSX === 'undefined') {
        toast('Excel library not loaded. Please refresh the page and try again.', 'error');
        console.error('XLSX library is not available. Make sure SheetJS is loaded.');
        return;
    }

    // Validate file type
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
        toast('Please upload an Excel file (.xlsx or .xls)', 'error');
        return;
    }

    toast('Processing Excel file...', 'info');

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Get current category from localStorage (what user has selected)
            const currentCategory = localStorage.getItem('propertyCategory') || 'offplan';
            const sheetNames = workbook.SheetNames.map(s => s.toLowerCase());
            let sheetToUse = workbook.SheetNames[0];
            let sheetFound = false;

            // Import based on currently selected category
            if (currentCategory === 'ready') {
                if (sheetNames.includes('ready')) {
                    sheetToUse = workbook.SheetNames[sheetNames.indexOf('ready')];
                    sheetFound = true;
                }
            } else {
                if (sheetNames.includes('offplan')) {
                    sheetToUse = workbook.SheetNames[sheetNames.indexOf('offplan')];
                    sheetFound = true;
                }
            }

            const selectedSheet = workbook.Sheets[sheetToUse];
            const jsonData = XLSX.utils.sheet_to_json(selectedSheet, { header: 1 });

            // Show which sheet was imported
            const sheetUsedName = sheetFound ? sheetToUse : `${sheetToUse} (default)`;

            // Parse using new Label-Value format
            const parseResult = parseExcelLabelValue(jsonData);

            if (parseResult.success) {
                runAllCalculations();
                toast(`Imported from "${sheetUsedName}" sheet (${parseResult.fieldsFound} fields)`, 'success');
            } else {
                toast('Could not parse Excel file. Check format.', 'error');
            }
        } catch (err) {
            console.error('Excel parsing error:', err);
            toast('Error reading Excel file. Please check the format.', 'error');
        }
    };
    reader.readAsArrayBuffer(file);

    // Reset input so same file can be uploaded again
    e.target.value = '';
}

/**
 * Parse Excel data in Label-Value format (Columns A-B)
 *
 * Format:
 * - Column A: Labels (Project Name, Unit no, etc.)
 * - Column B: Values
 * - Row with "Payment Plan" label marks end of property data
 * - Rows after that contain payment plan installments (columns A-D)
 *
 * @param {Array} jsonData - Array of rows from Excel
 * @returns {Object} { success: boolean, fieldsFound: number }
 */
function parseExcelLabelValue(jsonData) {
    if (!jsonData || jsonData.length === 0) {
        return { success: false, fieldsFound: 0 };
    }

    let fieldsFound = 0;
    let paymentPlanStartRow = -1;
    let paymentPlanName = '';

    // Track special fields for Unit Model combination
    let unitModel = '';
    let hasMaidsRoom = false;
    let hasLaundryRoom = false;
    let hasStoreRoom = false;

    // Parse Label-Value rows
    for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || !row[0]) continue;

        const label = String(row[0]).toLowerCase().trim();
        const value = row[1];

        // Check for Payment Plan row (marks start of payment plan section)
        if (label === 'payment plan') {
            paymentPlanStartRow = i + 1;
            paymentPlanName = value ? String(value).trim() : '';
            continue;
        }

        // Skip if we've reached payment plan section
        if (paymentPlanStartRow > 0 && i >= paymentPlanStartRow) {
            continue;
        }

        // Handle special fields for Unit Model combination
        if (label === 'unit model') {
            unitModel = value ? String(value).trim() : '';
            continue;
        }
        if (label === "maid's room" || label === 'maids room' || label === 'maid room') {
            hasMaidsRoom = String(value).toLowerCase().trim() === 'yes';
            continue;
        }
        if (label === 'laundry room') {
            hasLaundryRoom = String(value).toLowerCase().trim() === 'yes';
            continue;
        }
        if (label === 'store room') {
            hasStoreRoom = String(value).toLowerCase().trim() === 'yes';
            continue;
        }

        // Skip calculated/display-only fields (we'll calculate these)
        if (label.includes('refund') || label.includes('premium') || label.includes('total initial')) {
            continue;
        }

        // Look up field ID from label
        const fieldId = LABEL_TO_FIELD[label];
        if (!fieldId) continue;

        // Skip if no value
        if (value === undefined || value === null || value === '') continue;

        // Process value
        let processedValue = value;

        // Handle numeric fields
        if (NUMERIC_FIELDS.includes(fieldId)) {
            let numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));

            if (isNaN(numValue)) continue;

            // Convert decimal percentages to whole numbers (0.3 → 30)
            if (DECIMAL_PERCENT_FIELDS.includes(fieldId) && numValue < 1) {
                numValue = numValue * 100;
            }

            processedValue = numValue;
        }

        // Normalize Views values (e.g., "Community Views" → "Community View")
        if (fieldId === 'u_views' && typeof processedValue === 'string') {
            // Remove trailing 's' from "Views" to match dropdown options
            processedValue = processedValue.replace(/\s+Views$/i, ' View');
        }

        // Set value in form
        setValue(fieldId, processedValue);
        fieldsFound++;
    }

    // Combine Unit Model with Maid's Room, Laundry Room, Store Room
    if (unitModel) {
        let combinedModel = unitModel;
        const extras = [];
        if (hasMaidsRoom) extras.push("Maid");
        if (hasLaundryRoom) extras.push("Laundry");
        if (hasStoreRoom) extras.push("Store");

        if (extras.length > 0) {
            combinedModel = `${unitModel} + ${extras.join(' + ')}`;
        }

        setValue('u_bed', combinedModel);
        fieldsFound++;
    }

    // Parse Payment Plan section
    if (paymentPlanStartRow > 0) {
        const paymentPlan = parsePaymentPlanSection(jsonData, paymentPlanStartRow);
        if (paymentPlan.length > 0) {
            setPaymentPlan(paymentPlan);

            // Set payment plan name if available
            if (paymentPlanName && typeof setPaymentPlanName === 'function') {
                setPaymentPlanName(paymentPlanName);
            }
        }
    }

    // Trigger update
    document.dispatchEvent(new CustomEvent('dataImported'));

    return { success: fieldsFound >= 3, fieldsFound };
}

/**
 * Parse Payment Plan section from Excel
 *
 * Format (rows after "Payment Plan" label):
 * - Column A: Installment number (1, 2, 3, 4...)
 * - Column B: Percentage as decimal (0.1, 0.3, 0.7...)
 * - Column C: Date (text like "On Booking", "On Handover", or Excel serial number)
 * - Column D: Amount in AED
 *
 * @param {Array} jsonData - Excel data
 * @param {number} startRow - Row index where payment plan data starts
 * @returns {Array} Payment plan data
 */
function parsePaymentPlanSection(jsonData, startRow) {
    const paymentPlan = [];

    for (let i = startRow; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row) continue;

        // Check if row has data (at least installment number or percentage)
        const installmentNum = row[0];
        const percentValue = row[1];
        const dateValue = row[2];
        const amountValue = row[3];

        // Stop if we hit an empty row or non-numeric first column
        if (installmentNum === undefined || installmentNum === null || installmentNum === '') {
            break;
        }

        // Skip if first column is not a number (might be another section)
        if (typeof installmentNum !== 'number' && !/^\d+$/.test(String(installmentNum).trim())) {
            break;
        }

        // Format percentage (convert decimal to whole number)
        let percentStr = '';
        if (percentValue !== undefined && percentValue !== null) {
            if (typeof percentValue === 'number') {
                percentStr = percentValue < 1 ? (percentValue * 100).toString() : percentValue.toString();
            } else {
                percentStr = String(percentValue).replace('%', '').trim();
            }
        }

        // Format date
        let dateStr = '';
        if (dateValue !== undefined && dateValue !== null) {
            if (typeof dateValue === 'number') {
                // Excel serial date
                dateStr = formatDate(excelDateToJS(dateValue));
            } else {
                dateStr = String(dateValue).trim();
            }
        }

        // Format amount
        let amountVal = '';
        if (amountValue !== undefined && amountValue !== null) {
            if (typeof amountValue === 'number') {
                amountVal = amountValue;
            } else {
                const parsed = parseFloat(String(amountValue).replace(/[^0-9.-]/g, ''));
                amountVal = isNaN(parsed) ? '' : parsed;
            }
        }

        // Add to payment plan if we have meaningful data
        if (percentStr || dateStr || amountVal) {
            paymentPlan.push({
                date: dateStr,
                percentage: percentStr,
                amount: amountVal
            });
        }
    }

    return paymentPlan;
}
