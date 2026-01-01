/**
 * Branding Module
 * Logo, color, and company customization
 */

import { $, toast } from '../utils/helpers.js';
import { getBranding, saveBranding, getLabels, saveLabels } from './storage.js';

/**
 * Initialize branding functionality
 */
export function initBranding() {
    loadBrandingSettings();
    setupColorPicker();
    setupLogoUpload();
    applyBranding();
}

/**
 * Load branding settings into the form
 */
export function loadBrandingSettings() {
    const branding = getBranding();
    const labels = getLabels();

    // Branding tab
    const companyName = $('brandCompanyName');
    const primaryColor = $('brandPrimaryColor');
    const primaryColorHex = $('brandPrimaryColorHex');
    const footerText = $('brandFooterText');

    if (companyName) companyName.value = branding.companyName || '';
    if (primaryColor) primaryColor.value = branding.primaryColor || '#62c6c1';
    if (primaryColorHex) primaryColorHex.value = branding.primaryColor || '#62c6c1';
    if (footerText) footerText.value = branding.footerText || 'SALE OFFER';

    // Show logo preview if exists
    if (branding.logo) {
        showLogoPreview(branding.logo);
    }

    // Labels tab
    const labelRefund = $('labelRefund');
    const labelBalance = $('labelBalance');
    const labelPremium = $('labelPremium');
    const labelAdmin = $('labelAdmin');
    const labelAdgm = $('labelAdgm');
    const labelAgency = $('labelAgency');

    if (labelRefund) labelRefund.value = labels.refund || '';
    if (labelBalance) labelBalance.value = labels.balance || '';
    if (labelPremium) labelPremium.value = labels.premium || '';
    if (labelAdmin) labelAdmin.value = labels.admin || '';
    if (labelAdgm) labelAdgm.value = labels.adgm || '';
    if (labelAgency) labelAgency.value = labels.agency || '';
}

/**
 * Set up color picker synchronization
 */
function setupColorPicker() {
    const colorPicker = $('brandPrimaryColor');
    const colorHex = $('brandPrimaryColorHex');

    if (colorPicker && colorHex) {
        // Sync picker to hex input
        colorPicker.addEventListener('input', (e) => {
            colorHex.value = e.target.value.toUpperCase();
            previewColor(e.target.value);
        });

        // Sync hex input to picker
        colorHex.addEventListener('input', (e) => {
            let value = e.target.value;
            if (!value.startsWith('#')) {
                value = '#' + value;
            }
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                colorPicker.value = value;
                previewColor(value);
            }
        });
    }
}

/**
 * Preview color change without saving
 * @param {string} color - Color hex value
 */
function previewColor(color) {
    document.documentElement.style.setProperty('--primary-color', color);
}

/**
 * Set up logo upload
 */
function setupLogoUpload() {
    const logoUpload = $('brandLogoUpload');
    const logoFileName = $('logoFileName');

    if (logoUpload) {
        logoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    toast('Please upload an image file', 'error');
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    toast('Image must be less than 5MB', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target.result;
                    showLogoPreview(base64);
                    if (logoFileName) {
                        logoFileName.textContent = file.name;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

/**
 * Show logo preview
 * @param {string} base64 - Base64 image data
 */
function showLogoPreview(base64) {
    const preview = $('logoPreview');
    if (preview) {
        preview.innerHTML = '';
        const img = document.createElement('img');
        img.src = base64;
        img.alt = 'Logo Preview';
        preview.appendChild(img);
        preview.dataset.logo = base64;
    }
}

/**
 * Save branding settings
 */
export function saveBrandingSettings() {
    const branding = {
        companyName: $('brandCompanyName')?.value || 'Kennedy Property',
        primaryColor: $('brandPrimaryColor')?.value || '#62c6c1',
        logo: $('logoPreview')?.dataset.logo || '',
        footerText: $('brandFooterText')?.value || 'SALE OFFER'
    };

    const labels = {
        refund: $('labelRefund')?.value || 'Refund (40% of Original Price)',
        balance: $('labelBalance')?.value || 'Balance Resale Clause**',
        premium: $('labelPremium')?.value || 'Premium (Selling Price - Original Price)',
        admin: $('labelAdmin')?.value || 'Admin Fees (SAAS)',
        adgm: $('labelAdgm')?.value || 'ADGM (2% of Original Price)',
        agency: $('labelAgency')?.value || 'Agency Fees (2% of Selling Price + Vat)'
    };

    saveBranding(branding);
    saveLabels(labels);
    applyBranding();

    toast('Settings saved', 'success');
}

/**
 * Apply branding to the document
 */
export function applyBranding() {
    const branding = getBranding();
    const labels = getLabels();

    // Apply primary color
    document.documentElement.style.setProperty('--primary-color', branding.primaryColor);

    // Apply logo
    const logoImg = $('logoImg');
    if (logoImg && branding.logo) {
        logoImg.src = branding.logo;
    }

    // Apply footer text
    const footerSub = document.querySelector('.footer-sub');
    if (footerSub) {
        footerSub.textContent = branding.footerText || 'SALE OFFER';
    }

    // Apply labels
    const labelElements = {
        'label_paid': labels.refund,
        'label_bal': labels.balance,
        'label_prem': labels.premium,
        'label_adm': labels.admin,
        'label_trans': labels.adgm,
        'label_broker': labels.agency
    };

    Object.entries(labelElements).forEach(([id, text]) => {
        const el = $(id);
        if (el) el.textContent = text;
    });
}

/**
 * Reset branding to defaults
 */
export function resetBranding() {
    const defaultBranding = {
        companyName: 'Kennedy Property',
        primaryColor: '#62c6c1',
        logo: '',
        footerText: 'SALE OFFER'
    };

    const defaultLabels = {
        refund: 'Refund (40% of Original Price)',
        balance: 'Balance Resale Clause**',
        premium: 'Premium (Selling Price - Original Price)',
        admin: 'Admin Fees (SAAS)',
        adgm: 'ADGM (2% of Original Price)',
        agency: 'Agency Fees (2% of Selling Price + Vat)'
    };

    saveBranding(defaultBranding);
    saveLabels(defaultLabels);
    loadBrandingSettings();
    applyBranding();

    toast('Branding reset to defaults', 'success');
}

/**
 * Get current branding for export
 * @returns {Object} Current branding settings
 */
export function getCurrentBranding() {
    return getBranding();
}
