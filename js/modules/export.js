/**
 * Export Module
 * PDF, PNG, and JSON export functionality
 */

import { $, toast, getValue } from '../utils/helpers.js';
import { exportOfferAsJSON } from './storage.js';
import { getCurrentTemplate } from './templates.js';

/**
 * Initialize export functionality
 */
export function initExport() {
    // Export button opens modal
    const exportBtn = $('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', openExportModal);
    }

    // Do export button in modal
    const doExportBtn = $('doExportBtn');
    if (doExportBtn) {
        doExportBtn.addEventListener('click', handleExport);
    }

    // Print button
    const printBtn = $('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

/**
 * Open export modal
 */
function openExportModal() {
    const modal = $('exportModal');
    if (modal) {
        modal.classList.remove('hidden');

        // Set default filename
        const projectName = getValue('inp_proj') || 'sales-offer';
        const filename = $('exportFilename');
        if (filename) {
            filename.value = projectName.toLowerCase().replace(/\s+/g, '-');
        }
    }
}

/**
 * Handle export based on selected format
 */
async function handleExport() {
    const format = document.querySelector('input[name="exportFormat"]:checked')?.value;
    const filename = getValue('exportFilename') || 'sales-offer';

    switch (format) {
        case 'pdf':
            await exportPDF(filename);
            break;
        case 'png':
            await exportImage(filename, 'png');
            break;
        case 'jpg':
            await exportImage(filename, 'jpg');
            break;
        case 'json':
            exportJSON(filename);
            break;
        default:
            toast('Please select an export format', 'error');
    }

    // Close modal
    closeExportModal();
}

/**
 * Export as text-based PDF using jsPDF (selectable text, single page)
 * @param {string} filename - Filename without extension
 */
async function exportPDF(filename) {
    toast('Generating PDF...', 'info');

    try {
        const { jsPDF } = window.jspdf;
        const template = getCurrentTemplate();
        const isPortrait = template === 'portrait';

        // A4 dimensions in mm
        const pageWidth = isPortrait ? 210 : 297;
        const pageHeight = isPortrait ? 297 : 210;
        const margin = 10;
        const contentWidth = isPortrait ? 85 : 140; // Left column width
        const rightColX = isPortrait ? 105 : 155;
        const primaryColor = [98, 198, 193]; // #62c6c1

        const doc = new jsPDF({
            orientation: isPortrait ? 'portrait' : 'landscape',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        // Header bar
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 8, 'F');

        let yPos = 16;

        // Project name header
        const projectName = getValue('inp_proj') || 'PROJECT NAME';
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('FLOOR PLANS', margin, yPos);
        yPos += 6;

        // Unit Model title
        const unitModel = getValue('u_bed') || '1 Bedroom';
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(unitModel, margin, yPos);
        yPos += 10;

        // Property Details section
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('Property Details', margin, yPos);
        yPos += 5;

        // Property data rows (compact)
        const propertyRows = [
            ['Project Name', getValue('inp_proj') || '-'],
            ['Unit No', getValue('u_unitno') || '-'],
            ['Unit Type', getValue('u_unittype') || '-'],
            ['Unit Model', getValue('u_bed') || '-'],
            ['Views', getValue('u_views') || '-'],
            ['Internal Area (Sq.Ft)', getValue('u_internal') || '-'],
            ['Balcony Area (Sq.Ft)', getValue('u_balcony') || '-'],
            ['Total Area (Sq.Ft)', getValue('u_area') || '-']
        ];

        doc.setFontSize(8);
        propertyRows.forEach(([label, value]) => {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(label, margin, yPos);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(String(value), margin + 45, yPos);
            yPos += 4;
        });

        yPos += 4;

        // Financial Breakdown section
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('Financial Breakdown', margin, yPos);
        yPos += 5;

        const formatAED = (val) => {
            const num = parseFloat(val) || 0;
            return 'AED ' + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
        };

        const financialRows = [
            ['Original Price', formatAED(getValue('u_orig'))],
            ['Selling Price', formatAED(getValue('u_sell'))],
            ['Refund (Paid to Developer)', formatAED(getValue('u_paid'))],
            ['Balance Resale Clause', formatAED(getValue('u_bal'))],
            ['Premium', formatAED(getValue('u_prem'))],
            ['Admin Fees (SAAS)', formatAED(getValue('u_adm'))],
            ['ADGM (2% of Original)', formatAED(getValue('u_trans'))],
            ['ADGM Termination Fee', formatAED(getValue('u_adgm_term') || '505')],
            ['ADGM Electronic Fee', formatAED(getValue('u_adgm_elec') || '525')],
            ['Agency Fees (2% + VAT)', formatAED(getValue('u_broker'))]
        ];

        doc.setFontSize(8);
        financialRows.forEach(([label, value]) => {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(label, margin, yPos);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(String(value), margin + 45, yPos);
            yPos += 4;
        });

        // Total row
        yPos += 2;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Total Initial Payment', margin, yPos);
        doc.text($('totalDisplay')?.textContent || 'AED 0', margin + 45, yPos);
        yPos += 6;

        // Payment Plan (if exists)
        const ppBody = $('pp_body');
        if (ppBody && ppBody.children.length > 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...primaryColor);
            doc.text('Payment Plan', margin, yPos);
            yPos += 5;

            // Payment plan header
            doc.setFillColor(...primaryColor);
            doc.rect(margin, yPos - 3, contentWidth, 5, 'F');
            doc.setFontSize(7);
            doc.setTextColor(255, 255, 255);
            doc.text('Date', margin + 2, yPos);
            doc.text('%', margin + 35, yPos);
            doc.text('Amount (AED)', margin + 50, yPos);
            yPos += 4;

            // Payment rows
            doc.setTextColor(0, 0, 0);
            Array.from(ppBody.children).forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                    doc.setFont('helvetica', 'normal');
                    doc.text(cells[0].textContent.trim().substring(0, 20), margin + 2, yPos);
                    doc.text(cells[1].textContent.trim(), margin + 35, yPos);
                    doc.text(cells[2].textContent.trim(), margin + 50, yPos);
                    yPos += 3.5;
                }
            });
        }

        // Floor plan image on right side
        const floorPlanImg = $('floorPlanImg');
        if (floorPlanImg && floorPlanImg.src && !floorPlanImg.src.includes('Asset')) {
            const imgWidth = pageWidth - rightColX - margin;
            const imgHeight = pageHeight - 50;
            const imgFormat = floorPlanImg.src.includes('image/png') ? 'PNG' : 'JPEG';
            doc.addImage(floorPlanImg.src, imgFormat, rightColX, 20, imgWidth, imgHeight, undefined, 'MEDIUM');
        }

        // Footer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(projectName, pageWidth - margin, pageHeight - 12, { align: 'right' });
        doc.setFontSize(8);
        doc.text('SALE OFFER', pageWidth - margin, pageHeight - 7, { align: 'right' });

        // Save
        doc.save(`${filename}.pdf`);
        toast('PDF exported successfully', 'success');
    } catch (error) {
        console.error('PDF export failed:', error);
        toast('PDF export failed: ' + error.message, 'error');
    }
}

/**
 * Export as image (PNG or JPG)
 * @param {string} filename - Filename without extension
 * @param {string} format - 'png' or 'jpg'
 */
async function exportImage(filename, format = 'png') {
    const element = $('a4Page');
    if (!element) {
        toast('Document not found', 'error');
        return;
    }

    const formatUpper = format.toUpperCase();
    toast(`Generating ${formatUpper}...`, 'info');

    try {
        // Use html2canvas from html2pdf bundle
        // Scale 4 = 4x resolution for high-quality print (300 DPI equivalent)
        const canvas = await html2canvas(element, {
            scale: 4,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            imageTimeout: 15000,
            removeContainer: true
        });

        // Determine MIME type and quality
        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpg' ? 0.92 : undefined; // JPG quality 92%
        const extension = format === 'jpg' ? 'jpg' : 'png';

        // Convert to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast(`${formatUpper} exported successfully`, 'success');
        }, mimeType, quality);
    } catch (error) {
        console.error(`${formatUpper} export failed:`, error);
        toast(`${formatUpper} export failed`, 'error');
    }
}

/**
 * Export as JSON
 * @param {string} filename - Filename without extension
 */
function exportJSON(filename) {
    try {
        const jsonContent = exportOfferAsJSON();
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast('JSON exported successfully', 'success');
    } catch (error) {
        console.error('JSON export failed:', error);
        toast('JSON export failed', 'error');
    }
}

/**
 * Close export modal
 */
function closeExportModal() {
    const modal = $('exportModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Download helper
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
