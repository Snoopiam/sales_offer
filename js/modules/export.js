/**
 * Export Module
 * PDF, PNG, and JSON export functionality
 */

import { getById, toast, getValue } from '../utils/helpers.js';
import { exportOfferAsJSON } from './storage.js';
import { getCurrentTemplate } from './templates.js';
import { generateTextPDF } from './pdfGenerator.js';

/**
 * Initialize export functionality
 */
export function initExport() {
    // Export button opens modal
    const exportBtn = getById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', openExportModal);
    }

    // Do export button in modal
    const doExportBtn = getById('doExportBtn');
    if (doExportBtn) {
        doExportBtn.addEventListener('click', handleExport);
    }

    // Print button
    const printBtn = getById('printBtn');
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
    const modal = getById('exportModal');
    if (modal) {
        modal.classList.remove('hidden');

        // Set default filename
        const projectName = getValue('input-project-name') || 'sales-offer';
        const filename = getById('exportFilename');
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
        case 'pdf_preview':
            await exportPreviewPDF(filename);
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
 * Export as text-based PDF using jsPDF (selectable text)
 * Uses separate pdfGenerator module for layout
 * @param {string} filename - Filename without extension
 */
async function exportPDF(filename) {
    toast('Generating PDF...', 'info');

    try {
        await generateTextPDF(filename);
        toast('PDF exported successfully', 'success');
    } catch (error) {
        toast('PDF export failed: ' + error.message, 'error');
    }
}

/**
 * Export as visual PDF matching the live preview (non-selectable text)
 * @param {string} filename - Filename without extension
 */
async function exportPreviewPDF(filename) {
    const element = getById('a4Page');
    if (!element) {
        toast('Document not found', 'error');
        return;
    }

    toast('Generating preview PDF...', 'info');

    try {
        const template = getCurrentTemplate();
        const isPortrait = template === 'portrait';

        await html2pdf()
            .set({
                margin: 0,
                filename: `${filename}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: {
                    scale: 3,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: isPortrait ? 'portrait' : 'landscape'
                },
                pagebreak: { mode: ['avoid-all'] }
            })
            .from(element)
            .save();

        toast('Preview PDF exported successfully', 'success');
    } catch (error) {
        toast('Preview PDF export failed: ' + error.message, 'error');
    }
}

/**
 * Export as image (PNG or JPG)
 * @param {string} filename - Filename without extension
 * @param {string} format - 'png' or 'jpg'
 */
async function exportImage(filename, format = 'png') {
    const element = getById('a4Page');
    if (!element) {
        toast('Document not found', 'error');
        return;
    }

    const formatUpper = format.toUpperCase();
    toast(`Generating ${formatUpper}...`, 'info');

    try {
        const canvasOptions = {
            scale: 5,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            imageTimeout: 15000,
            removeContainer: true
        };

        let canvas = null;
        if (window.html2canvas) {
            canvas = await html2canvas(element, canvasOptions);
        } else if (window.html2pdf && typeof window.html2pdf === 'function') {
            canvas = await window.html2pdf().set({ html2canvas: canvasOptions }).from(element).toCanvas();
        } else {
            throw new Error('html2canvas is not available');
        }

        // Determine MIME type and quality
        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpg' ? 0.98 : undefined; // JPG quality 98%
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
    const modal = getById('exportModal');
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
