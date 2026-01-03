/**
 * PDF Generator Module
 * Text-based PDF generation that matches the preview layout
 */

import { getById, getValue } from '../utils/helpers.js';
import { getCurrentTemplate } from './templates.js';

/**
 * Generate text-based PDF matching the preview layout
 * @param {string} filename - Filename without extension
 * @returns {Promise<boolean>} Success status
 */
export async function generateTextPDF(filename) {
    const { jsPDF } = window.jspdf;
    const template = getCurrentTemplate();
    const isPortrait = template === 'portrait';

    // A4 dimensions in mm
    const pageWidth = isPortrait ? 210 : 297;
    const pageHeight = isPortrait ? 297 : 210;
    const margin = 11;

    // Get brand color
    const brandColorHex = window.getComputedStyle(document.documentElement)
        .getPropertyValue('--primary-color').trim() || '#62c6c1';
    const primaryColor = hexToRgb(brandColorHex);

    // Layout measurements
    const headerBarHeight = 8;
    const leftColWidth = (pageWidth - margin * 2) * 0.40;
    const rightColX = margin + leftColWidth + 8;
    const rightColWidth = (pageWidth - margin * 2) * 0.60 - 8;

    const doc = new jsPDF({
        orientation: isPortrait ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    let yPos = headerBarHeight + 8;

    // Draw header bar
    drawHeaderBar(doc, pageWidth, headerBarHeight, primaryColor);

    // Draw logo
    drawLogo(doc, pageWidth, margin);

    // Draw main title
    yPos = drawMainTitle(doc, margin, yPos);

    // Draw Property Details table
    yPos = drawPropertyDetailsTable(doc, yPos, margin, leftColWidth, primaryColor);

    // Draw Financial Breakdown table
    yPos = drawFinancialTable(doc, yPos, margin, leftColWidth, primaryColor);

    // Draw Property Status table (Ready properties)
    yPos = drawPropertyStatusTable(doc, yPos, margin, leftColWidth, primaryColor);

    // Draw Payment Plan table (Off-Plan)
    drawPaymentPlanTable(doc, yPos, margin, leftColWidth, primaryColor);

    // Draw floor plan image
    drawFloorPlanImage(doc, rightColX, rightColWidth, headerBarHeight, pageHeight);

    // Draw footer
    drawFooter(doc, pageWidth, pageHeight, margin, primaryColor);

    // Save
    doc.save(`${filename}.pdf`);
    return true;
}

/**
 * Draw the colored header bar
 */
function drawHeaderBar(doc, pageWidth, height, color) {
    doc.setFillColor(...color);
    doc.rect(0, 0, pageWidth, height, 'F');
}

/**
 * Draw company logo
 */
function drawLogo(doc, pageWidth, margin) {
    const logoImg = getById('logoImg');
    if (logoImg && logoImg.src && !logoImg.src.includes('KP_blACK')) {
        try {
            const logoWidth = 35;
            const logoHeight = 17;
            const logoX = pageWidth - margin - logoWidth;
            const logoY = 12;
            doc.addImage(logoImg.src, 'PNG', logoX, logoY, logoWidth, logoHeight, undefined, 'FAST');
        } catch (e) {
            console.warn('Logo could not be added to PDF:', e);
        }
    }
}

/**
 * Draw the main document title
 * @returns {number} Updated Y position
 */
function drawMainTitle(doc, margin, yPos) {
    const unitModel = getValue('u_unit_model') || getById('disp_title')?.textContent || '1 Bedroom';
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(unitModel.toUpperCase(), margin, yPos);
    return yPos + 12;
}

/**
 * Draw Property Details table
 * @returns {number} Updated Y position
 */
function drawPropertyDetailsTable(doc, yPos, margin, tableWidth, primaryColor) {
    const rows = [
        ['Unit No', getDisplayValue('display-unit-number')],
        ['Unit Type', getDisplayValue('disp_unit_type')],
        ['Views', getDisplayValue('disp_views')],
        ['Internal Area (Sq.Ft)', getDisplayValue('disp_internal')],
        ['Balcony Area (Sq.Ft)', getDisplayValue('disp_balcony')],
        ['Total Area (Sq.Ft)', getDisplayValue('display-total-area'), true]
    ];

    yPos = drawTableSection(doc, 'PROPERTY DETAILS', yPos, margin, tableWidth, primaryColor, rows);
    return yPos + 2;
}

/**
 * Draw Financial Breakdown table
 * @returns {number} Updated Y position
 */
function drawFinancialTable(doc, yPos, margin, tableWidth, primaryColor) {
    const rows = [];

    // Original price (check visibility)
    const origRow = getById('disp_row_original_price');
    if (!origRow || origRow.style.display !== 'none') {
        rows.push(['Original Price', getDisplayValue('disp_original_price')]);
    }

    rows.push(['Selling Price', getDisplayValue('disp_selling_price')]);

    // Off-plan specific rows
    if (isRowVisible('disp_row_refund')) {
        rows.push(['Refund (Amount Paid to Developer)', getDisplayValue('disp_refund')]);
    }
    if (isRowVisible('disp_row_balance_resale')) {
        rows.push(['Balance Resale Clause', getDisplayValue('disp_balance_resale')]);
    }
    if (isRowVisible('disp_row_premium')) {
        rows.push(['Premium', getDisplayValue('disp_premium')]);
    }

    // Common fees
    rows.push(['Admin Fees (SAAS)', getDisplayValue('disp_admin_fees')]);
    rows.push(['ADGM (2% of Original Price)', getDisplayValue('disp_adgm_transfer')]);
    rows.push(['ADGM Termination Fee', getDisplayValue('disp_adgm_termination')]);
    rows.push(['ADGM Electronic Service Fee', getDisplayValue('disp_adgm_electronic')]);
    rows.push(['Agency Fees (2% + VAT)', getDisplayValue('disp_agency_fees')]);
    rows.push(['Total Initial Payment', getDisplayValue('disp_total'), true]);

    return drawTableSection(doc, 'FINANCIAL BREAKDOWN', yPos, margin, tableWidth, primaryColor, rows);
}

/**
 * Draw Property Status table (Ready properties only)
 * @returns {number} Updated Y position
 */
function drawPropertyStatusTable(doc, yPos, margin, tableWidth, primaryColor) {
    const statusTable = getById('propertyStatusTable');
    if (!statusTable || statusTable.style.display === 'none') {
        return yPos;
    }

    const rows = [];

    const addRow = (rowId, label, valueId) => {
        if (isRowVisible(rowId)) {
            rows.push([label, getDisplayValue(valueId)]);
        }
    };

    addRow('disp_row_projecthandover', 'Project Completion', 'disp_projecthandover');
    addRow('disp_row_projectage', 'Project Age', 'disp_projectage');
    addRow('disp_row_unithandover', 'Unit Received', 'disp_unithandover');
    addRow('disp_row_unitownership', 'Unit Ownership', 'disp_unitownership');
    addRow('disp_row_occupancy', 'Status', 'disp_occupancy');
    addRow('disp_row_currentrent', 'Current Rent', 'disp_currentrent');
    addRow('disp_row_leaseuntil', 'Lease Until', 'disp_leaseuntil');
    addRow('disp_row_servicecharge', 'Service Charge', 'disp_servicecharge');

    if (rows.length > 0) {
        yPos += 2;
        return drawTableSection(doc, 'PROPERTY STATUS', yPos, margin, tableWidth, primaryColor, rows);
    }

    return yPos;
}

/**
 * Draw Payment Plan table (Off-Plan only)
 * @returns {number} Updated Y position
 */
function drawPaymentPlanTable(doc, yPos, margin, tableWidth, primaryColor) {
    const ppTable = getById('previewPaymentPlanTable');
    const ppBody = getById('payment_plan_tbody');

    if (!ppTable || ppTable.style.display === 'none' || !ppBody || ppBody.children.length === 0) {
        return yPos;
    }

    yPos += 2;

    // Title
    const ppTitle = getById('paymentPlanTitle')?.textContent || 'PAYMENT PLAN';
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(ppTitle.toUpperCase(), margin, yPos);
    yPos += 4;

    // Header row
    doc.setFillColor(...primaryColor);
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.rect(margin, yPos - 3, tableWidth, 5, 'F');
    doc.text('Date Of Payment', margin + 1, yPos);
    doc.text('%', margin + tableWidth * 0.45, yPos);
    doc.text('Amount (AED)', margin + tableWidth - 1, yPos, { align: 'right' });
    yPos += 4;

    // Data rows
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    Array.from(ppBody.children).forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
            doc.text(cells[0].textContent.trim(), margin + 1, yPos);
            doc.text(cells[1].textContent.trim(), margin + tableWidth * 0.45, yPos);
            doc.text(cells[2].textContent.trim(), margin + tableWidth - 1, yPos, { align: 'right' });
            yPos += 3.5;
        }
    });

    return yPos;
}

/**
 * Draw the floor plan image
 */
function drawFloorPlanImage(doc, rightColX, rightColWidth, headerBarHeight, pageHeight) {
    const floorPlanImg = getById('floorPlanImg');

    if (!floorPlanImg || !floorPlanImg.src || floorPlanImg.src.includes('Asset')) {
        return;
    }

    try {
        const maxImgWidth = rightColWidth - 5;
        const maxImgHeight = pageHeight - 55;

        const imgRatio = floorPlanImg.naturalWidth / floorPlanImg.naturalHeight;
        let imgWidth, imgHeight;

        if (imgRatio > maxImgWidth / maxImgHeight) {
            imgWidth = maxImgWidth;
            imgHeight = imgWidth / imgRatio;
        } else {
            imgHeight = maxImgHeight;
            imgWidth = imgHeight * imgRatio;
        }

        const imgX = rightColX + (rightColWidth - imgWidth) / 2;
        const imgY = headerBarHeight + 15;

        const imgFormat = floorPlanImg.src.includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(floorPlanImg.src, imgFormat, imgX, imgY, imgWidth, imgHeight, undefined, 'MEDIUM');
    } catch (e) {
        console.warn('Floor plan image could not be added to PDF:', e);
    }
}

/**
 * Draw the footer section
 */
function drawFooter(doc, pageWidth, pageHeight, margin, primaryColor) {
    const projectName = getValue('input-project-name') || getById('disp_project_footer')?.textContent || 'PROJECT NAME';
    const footerY = pageHeight - 15;

    // Project name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(projectName.toUpperCase(), pageWidth - margin, footerY, { align: 'right' });

    // "SALE OFFER" text
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('SALE OFFER', pageWidth - margin, footerY + 5, { align: 'right' });

    // Created by footer
    const createdByEl = document.querySelector('.created-by-footer');
    if (createdByEl) {
        doc.setFontSize(6);
        doc.setTextColor(107, 114, 128);
        doc.setFont('helvetica', 'normal');
        doc.text(createdByEl.textContent.trim().toUpperCase(), pageWidth / 2, pageHeight - 5, { align: 'center' });
    }
}

/**
 * Draw a table section with title and rows
 * @returns {number} Updated Y position
 */
function drawTableSection(doc, title, startY, margin, tableWidth, primaryColor, rows) {
    let yPos = startY;

    // Section title
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(title, margin, yPos);
    yPos += 4;

    // Data rows
    doc.setFontSize(7);

    rows.forEach(([label, value, isBold]) => {
        // Border line
        doc.setDrawColor(243, 244, 246);
        doc.line(margin, yPos + 1, margin + tableWidth, yPos + 1);

        // Label
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text(label, margin, yPos);

        // Value
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(17, 24, 39);
        doc.text(String(value), margin + tableWidth, yPos, { align: 'right' });

        yPos += 3.5;
    });

    return yPos;
}

/**
 * Get display value from preview element
 */
function getDisplayValue(id) {
    const el = getById(id);
    return el ? el.textContent.trim() || '-' : '-';
}

/**
 * Check if a row element is visible
 */
function isRowVisible(id) {
    const row = getById(id);
    return row && row.style.display !== 'none';
}

/**
 * Convert hex color to RGB array
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [98, 198, 193];
}
