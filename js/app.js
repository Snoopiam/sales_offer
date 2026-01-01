/**
 * ============================================================================
 * APP.JS - Main Application Entry Point
 * ============================================================================
 *
 * PURPOSE: Orchestrates all modules, handles initialization, and manages
 *          the main application flow.
 *
 * MODULES IMPORTED:
 * - helpers.js: DOM utilities, formatting, validation helpers
 * - storage.js: localStorage persistence (offers, branding, templates)
 * - calculator.js: Auto-calculation of derived fields (ADGM, Premium, etc.)
 * - validator.js: Form validation (required fields, percentage totals)
 * - paymentPlan.js: Payment schedule table management
 * - branding.js: Company branding (logo, colors, labels)
 * - templates.js: Document layout templates (landscape/portrait/minimal)
 * - export.js: PDF/PNG/JSON export functionality
 * - excel.js: Excel file import
 * - ai.js: AI document parsing (Gemini API)
 * - beta.js: Experimental features toggle
 * - category.js: Property category switching (Off-Plan/Ready)
 *
 * MAIN FUNCTIONS:
 * - init(): Application startup, initializes all modules
 * - updatePreview(): Syncs input values to preview document
 * - saveFormData(): Persists current form state to localStorage
 * - loadFormData(): Restores form state from localStorage
 *
 * EVENT HANDLING:
 * - Form inputs: Real-time preview updates (debounced 150ms)
 * - Auto-save: Triggered on input changes (debounced 500ms)
 * - Modals: Keyboard trap for accessibility
 *
 * ============================================================================
 */

import { $, $qa, setValue, getValue, setText, formatCurrency, debounce, toast, on, escapeHtml, validateFileType, checkFileSize, compressImageFile } from './utils/helpers.js';
import { saveCurrentOffer, getCurrentOffer, getTemplates, saveTemplate, loadTemplate, deleteTemplate, importOfferFromJSON } from './modules/storage.js';
import { initCalculator, runAllCalculations, calculateTotal, restoreLockStates } from './modules/calculator.js';
import { initValidator, clearAllErrors } from './modules/validator.js';
import { initPaymentPlan, updatePreview as updatePaymentPreview, getPaymentPlan, setPaymentPlan } from './modules/paymentPlan.js';
import { initBranding, loadBrandingSettings, saveBrandingSettings, applyBranding } from './modules/branding.js';
import { initTemplates } from './modules/templates.js';
import { initExport } from './modules/export.js';
import { initExcel } from './modules/excel.js';
import { initAI, saveAPIKey } from './modules/ai.js';
import { initBeta } from './modules/beta.js';
import { initCategory, getReadyPropertyData, setReadyPropertyData, updatePreviewForCategory } from './modules/category.js';

// Debounced functions for performance
const debouncedSave = debounce(saveFormData, 500);
const debouncedPreview = debounce(updatePreview, 150);

// Track last focused element for modal management
let lastFocusedElement = null;

/**
 * Initialize the application
 */
function init() {
    // Initialize all modules
    initTemplates();
    initCalculator();
    initValidator();
    initPaymentPlan();
    initCategory(); // Property category (Off-Plan / Ready)
    initBeta(); // BETA features toggle
    initBranding();
    initExport();
    initExcel();
    initAI();

    // Set up event listeners
    setupFormListeners();
    setupModalListeners();
    setupButtonListeners();
    setupFileUploads();

    // Load saved data
    loadFormData();
    restoreLockStates();

    // Apply branding
    applyBranding();

    // Initial update
    updatePreview();
}

/**
 * Set up form input listeners
 */
function setupFormListeners() {
    // All input fields trigger auto-save and debounced preview update
    const formFields = $qa('#inputPanel input[type="text"], #inputPanel input[type="number"]');
    formFields.forEach(field => {
        field.addEventListener('input', () => {
            debouncedSave();
            debouncedPreview(); // Use debounced preview for better performance
        });
    });

    // Listen for data import events
    document.addEventListener('dataImported', () => {
        updatePreview();
        debouncedSave();
    });
}

/**
 * Open a modal with proper focus management
 * @param {string} modalId - ID of the modal to open
 */
function openModal(modalId) {
    const modal = $(modalId);
    if (!modal) return;

    // Store last focused element
    lastFocusedElement = document.activeElement;

    // Show modal
    modal.classList.remove('hidden');

    // Focus first focusable element
    const focusable = modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
        setTimeout(() => focusable[0].focus(), 50);
    }

    // Set up focus trap
    setupFocusTrap(modal);
}

/**
 * Close a modal with proper focus restoration and cleanup
 * @param {HTMLElement} modal - Modal element to close
 */
function closeModal(modal) {
    if (!modal) return;

    modal.classList.add('hidden');

    // Remove focus trap listener to prevent memory leak
    if (modal._focusTrapHandler) {
        modal.removeEventListener('keydown', modal._focusTrapHandler);
        modal._focusTrapHandler = null;
    }

    // Restore focus to last focused element
    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

/**
 * Set up focus trap within a modal
 * @param {HTMLElement} modal - Modal element
 */
function setupFocusTrap(modal) {
    // Remove existing listener first to prevent memory leaks
    if (modal._focusTrapHandler) {
        modal.removeEventListener('keydown', modal._focusTrapHandler);
    }

    const focusableElements = modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const trapFocus = (e) => {
        if (!modal.classList.contains('hidden')) {
            if (e.key === 'Escape') {
                closeModal(modal);
                return;
            }

            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    };

    // Store reference and add listener
    modal._focusTrapHandler = trapFocus;
    modal.addEventListener('keydown', trapFocus);
}

/**
 * Set up modal event listeners
 */
function setupModalListeners() {
    // Close buttons for all modals
    $qa('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });

    // Click backdrop to close
    $qa('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });

    // Settings modal tabs
    $qa('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            // Update tab buttons
            $qa('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update tab content
            $qa('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === `tab-${tabId}`);
            });
        });
    });

    // Save settings button
    const saveSettingsBtn = $('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            saveBrandingSettings();
            saveAPIKey();
            $('settingsModal')?.classList.add('hidden');
            updatePreview();
        });
    }

    // Save template modal
    const doSaveTemplateBtn = $('doSaveTemplateBtn');
    if (doSaveTemplateBtn) {
        doSaveTemplateBtn.addEventListener('click', handleSaveTemplate);
    }
}

/**
 * Set up button listeners
 */
function setupButtonListeners() {
    // Settings button - now uses accessible modal opening
    on('settingsBtn', 'click', () => {
        loadBrandingSettings();
        openModal('settingsModal');
    });

    // Save template button
    on('saveTemplateBtn', 'click', () => {
        renderTemplatesList();
        openModal('saveTemplateModal');
    });

    // Clear all button
    on('clearAllBtn', 'click', () => {
        if (confirm('Clear all fields? This will reset the form.')) {
            clearForm();
        }
    });

    // Print button
    on('printBtn', 'click', () => {
        window.print();
    });
}

/**
 * Set up file upload handlers
 */
function setupFileUploads() {
    // Floor plan upload
    const fpUpload = $('fp_upload');
    if (fpUpload) {
        fpUpload.addEventListener('change', handleFloorPlanUpload);
    }

    // JSON import
    const jsonUpload = $('jsonUpload');
    if (jsonUpload) {
        jsonUpload.addEventListener('change', handleJSONImport);
    }
}

/**
 * Handle floor plan image upload with enhanced validation
 * @param {Event} e - Change event
 */
async function handleFloorPlanUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const errorContainer = $('floorPlanError');
    const showError = (msg) => {
        if (errorContainer) {
            errorContainer.textContent = msg;
            errorContainer.classList.remove('hidden');
        }
        toast(msg, 'error');
    };

    const clearError = () => {
        if (errorContainer) {
            errorContainer.classList.add('hidden');
        }
    };

    // Check file size (max 20MB for high-quality floor plans)
    if (!checkFileSize(file, 20)) {
        showError('File size exceeds 20MB limit');
        e.target.value = '';
        return;
    }

    // Validate file type with magic bytes
    const isValidType = await validateFileType(file, ['image/']);
    if (!isValidType) {
        showError('Invalid image file. Please upload a JPG, PNG, or WebP image.');
        e.target.value = '';
        return;
    }

    clearError();

    // Compress image before storing - higher quality for floor plans
    // maxWidth: 1600px (good for A4 print), quality: 0.85 (high quality JPEG)
    compressImageFile(file, 1600, 0.85).then(compressedDataUrl => {
        const img = $('floorPlanImg');
        const placeholder = $('imgPlaceholder');
        const fileName = $('floorPlanFileName');

        if (img) {
            img.src = compressedDataUrl;
            img.style.display = 'block';
            // Update alt text dynamically
            const unitModel = getValue('u_bed');
            img.alt = unitModel ? `Floor plan for ${unitModel}` : 'Floor plan image';
        }
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        if (fileName) {
            fileName.textContent = escapeHtml(file.name);
        }

        // Save compressed image to current offer
        saveCurrentOffer({ floorPlanImage: compressedDataUrl });
        toast('Floor plan uploaded successfully', 'success');
    }).catch(err => {
        showError('Failed to process image. Please try again.');
        console.error('Image compression error:', err);
    });
}

/**
 * Handle JSON import
 * @param {Event} e - Change event
 */
function handleJSONImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const success = importOfferFromJSON(event.target.result);
        if (success) {
            loadFormData();
            updatePreview();
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

/**
 * Save form data to storage
 */
function saveFormData() {
    const offer = {
        projectName: getValue('inp_proj'),
        unitNo: getValue('u_unitno'),
        unitType: getValue('u_unittype'),
        bedrooms: getValue('u_bed'),
        views: getValue('u_views'),
        // Standard areas
        internalArea: getValue('u_internal'),
        balconyArea: getValue('u_balcony'),
        totalArea: getValue('u_area'),
        // Villa/Townhouse areas
        villaInternal: getValue('u_villa_internal'),
        villaTerrace: getValue('u_villa_terrace'),
        bua: getValue('u_bua'),
        gfa: getValue('u_gfa'),
        villaTotal: getValue('u_villa_total'),
        plotSize: getValue('u_plotsize'),
        // Plot areas
        plotSizeOnly: getValue('u_plot_size'),
        allowedBuild: getValue('u_allowed_build'),
        // Financial
        originalPrice: getValue('u_orig'),
        sellingPrice: getValue('u_sell'),
        resaleClausePercent: getValue('u_resaleclause'),
        amountPaidPercent: getValue('u_amountpaidpercent'),
        amountPaid: getValue('u_amountpaid'),
        refund: getValue('u_paid'),
        balanceResale: getValue('u_bal'),
        premium: getValue('u_prem'),
        adminFees: getValue('u_adm'),
        adgm: getValue('u_trans'),
        agencyFees: getValue('u_broker'),
        paymentPlan: getPaymentPlan(),
        // Ready Property data
        readyProperty: getReadyPropertyData()
    };
    saveCurrentOffer(offer);
}

/**
 * Load form data from storage
 */
function loadFormData() {
    const offer = getCurrentOffer();

    setValue('inp_proj', offer.projectName);
    setValue('u_unitno', offer.unitNo);
    setValue('u_unittype', offer.unitType);
    setValue('u_bed', offer.bedrooms);
    setValue('u_views', offer.views);
    // Standard areas
    setValue('u_internal', offer.internalArea);
    setValue('u_balcony', offer.balconyArea);
    setValue('u_area', offer.totalArea);
    // Villa/Townhouse areas
    setValue('u_villa_internal', offer.villaInternal);
    setValue('u_villa_terrace', offer.villaTerrace);
    setValue('u_bua', offer.bua);
    setValue('u_gfa', offer.gfa);
    setValue('u_villa_total', offer.villaTotal);
    setValue('u_plotsize', offer.plotSize);
    // Plot areas
    setValue('u_plot_size', offer.plotSizeOnly);
    setValue('u_allowed_build', offer.allowedBuild);
    // Financial
    setValue('u_orig', offer.originalPrice);
    setValue('u_sell', offer.sellingPrice);
    setValue('u_resaleclause', offer.resaleClausePercent);
    setValue('u_amountpaidpercent', offer.amountPaidPercent);
    setValue('u_amountpaid', offer.amountPaid);
    setValue('u_paid', offer.refund);
    setValue('u_bal', offer.balanceResale);
    setValue('u_prem', offer.premium);
    setValue('u_adm', offer.adminFees);
    setValue('u_trans', offer.adgm);
    setValue('u_broker', offer.agencyFees);

    // Load payment plan
    if (offer.paymentPlan && offer.paymentPlan.length > 0) {
        setPaymentPlan(offer.paymentPlan);
    }

    // Load Ready Property data
    if (offer.readyProperty) {
        setReadyPropertyData(offer.readyProperty);
    }

    // Load floor plan image
    if (offer.floorPlanImage) {
        const img = $('floorPlanImg');
        const placeholder = $('imgPlaceholder');
        if (img) {
            img.src = offer.floorPlanImage;
            img.style.display = 'block';
        }
        if (placeholder) {
            placeholder.style.display = 'none';
        }
    }

    // Run calculations after loading
    runAllCalculations();
}

/**
 * Update the document preview
 */
function updatePreview() {
    const unitType = getValue('u_unittype').toLowerCase();

    // Property details - common
    setText('disp_proj', getValue('inp_proj') || 'PROJECT NAME');
    setText('disp_project_name', getValue('inp_proj') || '-');
    setText('disp_unit_no', getValue('u_unitno') || '-');
    setText('disp_unit_type', getValue('u_unittype') || '-');
    setText('disp_bed', getValue('u_bed') || '-');
    setText('disp_title', getValue('u_bed') || '1 Bedroom');
    setText('disp_views', getValue('u_views') || '-');

    // Update preview rows based on unit type
    updatePreviewAreaRows(unitType);

    // Financial breakdown
    setText('disp_orig', formatCurrency(getValue('u_orig')));
    setText('disp_sell', formatCurrency(getValue('u_sell')));
    setText('disp_paid', formatCurrency(getValue('u_paid')));
    setText('disp_bal', formatCurrency(getValue('u_bal')));
    setText('disp_prem', formatCurrency(getValue('u_prem')));
    setText('disp_adm', formatCurrency(getValue('u_adm')));
    setText('disp_trans', formatCurrency(getValue('u_trans')));
    setText('disp_adgm_term', formatCurrency(getValue('u_adgm_term') || 505));
    setText('disp_adgm_elec', formatCurrency(getValue('u_adgm_elec') || 525));
    setText('disp_broker', formatCurrency(getValue('u_broker')));

    // Calculate and display total
    const total = calculateTotal();
    setText('disp_total', formatCurrency(total));

    // Update payment plan preview
    updatePaymentPreview();

    // Update category-specific preview elements
    updatePreviewForCategory();
}

/**
 * Update preview area rows based on unit type
 */
function updatePreviewAreaRows(unitType) {
    // Standard rows
    const standardRows = ['disp_row_internal', 'disp_row_balcony', 'disp_row_area'];
    // Villa rows
    const villaRows = ['disp_row_villa_internal', 'disp_row_villa_terrace', 'disp_row_bua', 'disp_row_gfa', 'disp_row_villa_total', 'disp_row_plotsize'];
    // Plot rows
    const plotRows = ['disp_row_plot_size', 'disp_row_allowed_build'];

    // Hide all first
    [...standardRows, ...villaRows, ...plotRows].forEach(id => {
        const row = $(id);
        if (row) row.style.display = 'none';
    });

    if (unitType === 'villa' || unitType === 'townhouse') {
        // Show villa rows and set values
        villaRows.forEach(id => {
            const row = $(id);
            if (row) row.style.display = '';
        });
        setText('disp_villa_internal', getValue('u_villa_internal') || '-');
        setText('disp_villa_terrace', getValue('u_villa_terrace') || '-');
        setText('disp_bua', getValue('u_bua') || '-');
        setText('disp_gfa', getValue('u_gfa') || '-');
        setText('disp_villa_total', getValue('u_villa_total') || '-');
        setText('disp_plotsize', getValue('u_plotsize') || '-');
    } else if (unitType === 'plot') {
        // Show plot rows and set values
        plotRows.forEach(id => {
            const row = $(id);
            if (row) row.style.display = '';
        });
        setText('disp_plot_size', getValue('u_plot_size') || '-');
        setText('disp_allowed_build', getValue('u_allowed_build') || '-');
    } else {
        // Show standard rows and set values
        standardRows.forEach(id => {
            const row = $(id);
            if (row) row.style.display = '';
        });
        setText('disp_internal', getValue('u_internal') || '-');
        setText('disp_balcony', getValue('u_balcony') || '-');
        setText('disp_area', getValue('u_area') || '-');
    }
}

/**
 * Clear all form fields
 */
function clearForm() {
    const inputs = $qa('#inputPanel input[type="text"], #inputPanel input[type="number"]');
    inputs.forEach(input => {
        input.value = '';
    });

    // Reset payment plan
    setPaymentPlan([
        { date: 'On Booking', percentage: '10', amount: '' },
        { date: '', percentage: '10', amount: '' },
        { date: '', percentage: '10', amount: '' },
        { date: 'On Handover', percentage: '70', amount: '' }
    ]);

    // Clear floor plan
    const img = $('floorPlanImg');
    const placeholder = $('imgPlaceholder');
    if (img) {
        img.src = 'Asset%201@2x.png';
    }
    if (placeholder) {
        placeholder.style.display = 'none';
    }

    // Clear errors
    clearAllErrors();

    // Save cleared state
    saveFormData();
    updatePreview();

    toast('Form cleared', 'success');
}

/**
 * Handle save template action
 */
function handleSaveTemplate() {
    const nameInput = $('templateName');
    const name = nameInput?.value?.trim();

    if (!name) {
        toast('Please enter a template name', 'error');
        return;
    }

    const offer = getCurrentOffer();
    saveTemplate(name, offer);

    // Clear input and close modal
    if (nameInput) nameInput.value = '';
    $('saveTemplateModal')?.classList.add('hidden');

    renderTemplatesList();
}

/**
 * Render saved templates list (XSS-safe)
 */
function renderTemplatesList() {
    const container = $('savedTemplatesList');
    if (!container) return;

    const templates = getTemplates();

    // Clear container safely
    container.textContent = '';

    if (templates.length === 0) {
        const p = document.createElement('p');
        p.style.cssText = 'padding: 12px; color: #9ca3af; font-size: 13px;';
        p.textContent = 'No saved templates';
        container.appendChild(p);
        return;
    }

    // Build templates safely without innerHTML
    templates.forEach(template => {
        const div = document.createElement('div');
        div.className = 'template-item';
        div.dataset.id = template.id;
        div.setAttribute('tabindex', '0');
        div.setAttribute('role', 'listitem');

        const nameSpan = document.createElement('span');
        nameSpan.className = 'template-item-name';
        nameSpan.textContent = template.name; // Safe - uses textContent

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'template-item-actions';

        // Load button
        const loadBtn = document.createElement('button');
        loadBtn.className = 'load-template-btn';
        loadBtn.type = 'button';
        loadBtn.setAttribute('aria-label', `Load template: ${escapeHtml(template.name)}`);
        loadBtn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>';

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-template-btn';
        deleteBtn.type = 'button';
        deleteBtn.setAttribute('aria-label', `Delete template: ${escapeHtml(template.name)}`);
        deleteBtn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';

        actionsDiv.appendChild(loadBtn);
        actionsDiv.appendChild(deleteBtn);
        div.appendChild(nameSpan);
        div.appendChild(actionsDiv);
        container.appendChild(div);
    });

    // Add event listeners
    container.querySelectorAll('.load-template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.target.closest('.template-item').dataset.id;
            handleLoadTemplate(id);
        });
    });

    container.querySelectorAll('.delete-template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.target.closest('.template-item').dataset.id;
            if (confirm('Delete this template?')) {
                deleteTemplate(id);
                renderTemplatesList();
            }
        });
    });
}

/**
 * Handle load template action
 * @param {string} templateId - Template ID
 */
function handleLoadTemplate(templateId) {
    const template = loadTemplate(templateId);
    if (!template) {
        toast('Template not found', 'error');
        return;
    }

    // Load template data
    const offer = template.data;

    setValue('inp_proj', offer.projectName);
    setValue('u_unitno', offer.unitNo);
    setValue('u_unittype', offer.unitType);
    setValue('u_bed', offer.bedrooms);
    setValue('u_views', offer.views);
    setValue('u_internal', offer.internalArea);
    setValue('u_balcony', offer.balconyArea);
    setValue('u_area', offer.totalArea);
    setValue('u_orig', offer.originalPrice);
    setValue('u_sell', offer.sellingPrice);
    setValue('u_paid', offer.refund);
    setValue('u_bal', offer.balanceResale);
    setValue('u_prem', offer.premium);
    setValue('u_adm', offer.adminFees);
    setValue('u_trans', offer.adgm);
    setValue('u_broker', offer.agencyFees);

    if (offer.paymentPlan) {
        setPaymentPlan(offer.paymentPlan);
    }

    // Apply template branding if exists
    if (template.branding) {
        // Could apply template-specific branding here
    }

    runAllCalculations();
    updatePreview();
    saveFormData();

    $('saveTemplateModal')?.classList.add('hidden');
    toast(`Template "${template.name}" loaded`, 'success');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Handle visibility change (save on tab switch)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        saveFormData();
    }
});

// Handle before unload (save on close)
window.addEventListener('beforeunload', () => {
    saveFormData();
});

// BETA feature event listeners
document.addEventListener('clearForm', () => {
    clearForm();
});

document.addEventListener('loadTemplate', (e) => {
    if (e.detail && e.detail.id) {
        handleLoadTemplate(e.detail.id);
    }
});

// Listen for unit type changes to update preview
document.addEventListener('unitTypeChanged', () => {
    updatePreview();
});

// Listen for category changes
document.addEventListener('categoryChanged', () => {
    updatePreview();
    debouncedSave();
});

// Listen for occupancy changes
document.addEventListener('occupancyChanged', () => {
    updatePreview();
    debouncedSave();
});
