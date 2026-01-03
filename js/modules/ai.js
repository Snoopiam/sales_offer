/**
 * AI Module
 * Gemini API integration for document parsing
 */

import { getById, show, hide, toast, setValue } from '../utils/helpers.js';
import { getApiKey, saveApiKey, clearApiKey as clearStoredApiKey } from './storage.js';
import { setPaymentPlan } from './paymentPlan.js';
import { runAllCalculations } from './calculator.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Extraction prompt
const EXTRACTION_PROMPT = `Analyze this real estate property document and extract the following information.
Return ONLY a valid JSON object with these exact fields (use null for any field not found):

{
  "projectName": "string - name of the project/development",
  "unitNo": "string - unit number or identifier",
  "unitType": "string - type like Apartment, Villa, Townhouse",
  "bedrooms": "string - bedroom configuration like '1 Bedroom', '2 Bedroom + Maid'",
  "views": "string - view description like 'Sea View', 'Garden View'",
  "internalArea": "number - internal area in sq ft (just the number)",
  "balconyArea": "number - balcony/terrace area in sq ft (just the number)",
  "totalArea": "number - total area in sq ft (just the number)",
  "originalPrice": "number - original/list price (just the number, no currency)",
  "sellingPrice": "number - selling/offer price (just the number, no currency)",
  "paymentPlan": [
    {
      "date": "string - payment date or milestone like 'On Booking', '01 Dec 2024'",
      "percentage": "string - percentage like '10' (without % symbol)",
      "amount": "number - payment amount (just the number)"
    }
  ]
}

Important:
- Extract numbers without currency symbols or formatting
- For areas, convert to square feet if in different units
- For payment plan, include all milestones found
- Return ONLY the JSON object, no other text`;

let extractedData = null;

/**
 * Initialize AI module
 */
export function initAI() {
    setupAIImportModal();
    setupAPISettings();
}

/**
 * Set up AI Import modal functionality
 */
function setupAIImportModal() {
    const aiImportBtn = getById('aiImportBtn');
    const aiDropZone = getById('aiDropZone');
    const aiFileUpload = getById('aiFileUpload');
    const applyBtn = getById('applyAiDataBtn');

    if (aiImportBtn) {
        aiImportBtn.addEventListener('click', () => {
            // Check for API key first
            const apiKey = getApiKey();
            if (!apiKey) {
                toast('Please set your Gemini API key in Settings first', 'error');
                openSettingsModal();
                return;
            }
            openAIModal();
        });
    }

    if (aiDropZone && aiFileUpload) {
        // Click to upload
        aiDropZone.addEventListener('click', () => aiFileUpload.click());

        // Drag and drop
        aiDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            aiDropZone.classList.add('dragover');
        });

        aiDropZone.addEventListener('dragleave', () => {
            aiDropZone.classList.remove('dragover');
        });

        aiDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            aiDropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) processAIFile(file);
        });

        // File input change
        aiFileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) processAIFile(file);
            e.target.value = '';
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', applyExtractedData);
    }
}

/**
 * Set up API settings
 */
function setupAPISettings() {
    const testBtn = getById('testApiBtn');
    const clearBtn = getById('clearApiBtn');
    const apiKeyInput = getById('geminiApiKey');

    // Load saved API key
    if (apiKeyInput) {
        const savedKey = getApiKey();
        if (savedKey) {
            apiKeyInput.value = savedKey;
        }
    }

    if (testBtn) {
        testBtn.addEventListener('click', testAPIConnection);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearStoredApiKey();
            if (apiKeyInput) apiKeyInput.value = '';
            const status = getById('apiStatus');
            if (status) {
                status.textContent = '';
                status.className = 'api-status';
            }
        });
    }
}

/**
 * Open AI Import modal
 */
function openAIModal() {
    const modal = getById('aiImportModal');
    if (modal) {
        modal.classList.remove('hidden');
        resetAIModal();
    }
}

/**
 * Reset AI modal to upload state
 */
function resetAIModal() {
    show('aiUploadSection');
    hide('aiProcessingSection');
    hide('aiResultSection');
    hide('applyAiDataBtn');
    extractedData = null;
}

/**
 * Process uploaded file with AI
 * @param {File} file - Uploaded file
 */
async function processAIFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        toast('Please upload a PDF, JPG, PNG, or WebP file', 'error');
        return;
    }

    if (file.size > 100 * 1024 * 1024) {
        toast('File must be less than 100MB', 'error');
        return;
    }

    // Show processing state
    hide('aiUploadSection');
    show('aiProcessingSection');

    try {
        // Convert file to base64
        const base64Data = await fileToBase64(file);
        const mimeType = file.type;

        // Call Gemini API
        const result = await callGeminiAPI(base64Data, mimeType);

        if (result) {
            extractedData = result;
            displayExtractedData(result);
            hide('aiProcessingSection');
            show('aiResultSection');
            show('applyAiDataBtn');
        } else {
            throw new Error('No data extracted');
        }
    } catch (error) {
        toast(error.message || 'Failed to process document', 'error');
        resetAIModal();
    }
}

/**
 * Convert file to base64
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 data (without prefix)
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Call Gemini API
 * @param {string} base64Data - Base64 encoded image/PDF
 * @param {string} mimeType - MIME type
 * @returns {Object} Extracted data
 */
async function callGeminiAPI(base64Data, mimeType) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('API key not configured');
    }

    const requestBody = {
        contents: [{
            parts: [
                { text: EXTRACTION_PROMPT },
                {
                    inline_data: {
                        mime_type: mimeType,
                        data: base64Data
                    }
                }
            ]
        }],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048
        }
    };

    // API key sent in header instead of URL to prevent exposure in logs/history
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('No response from AI');
    }

    // Parse JSON from response
    try {
        // Extract JSON from response (handle markdown code blocks)
        let jsonStr = text;
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        } else {
            // Try to find raw JSON
            const startIdx = text.indexOf('{');
            const endIdx = text.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1) {
                jsonStr = text.substring(startIdx, endIdx + 1);
            }
        }
        return JSON.parse(jsonStr);
    } catch (e) {
        throw new Error('Failed to parse AI response');
    }
}

/**
 * Display extracted data for review
 * @param {Object} data - Extracted data
 */
function displayExtractedData(data) {
    const container = getById('aiExtractedData');
    if (!container) return;

    const fields = [
        { key: 'projectName', label: 'Project Name' },
        { key: 'unitNo', label: 'Unit No' },
        { key: 'unitType', label: 'Unit Type' },
        { key: 'bedrooms', label: 'Bedrooms' },
        { key: 'views', label: 'Views' },
        { key: 'internalArea', label: 'Internal Area', suffix: ' sq ft' },
        { key: 'balconyArea', label: 'Balcony Area', suffix: ' sq ft' },
        { key: 'totalArea', label: 'Total Area', suffix: ' sq ft' },
        { key: 'originalPrice', label: 'Original Price', prefix: 'AED ' },
        { key: 'sellingPrice', label: 'Selling Price', prefix: 'AED ' }
    ];

    // Build display using DOM methods to prevent XSS from AI-returned data
    container.innerHTML = '';

    fields.forEach(field => {
        const value = data[field.key];
        if (value !== null && value !== undefined) {
            const displayValue = (field.prefix || '') + formatValue(value) + (field.suffix || '');
            const row = document.createElement('div');
            row.className = 'extracted-data-row';

            const label = document.createElement('span');
            label.className = 'label';
            label.textContent = field.label;

            const valueSpan = document.createElement('span');
            valueSpan.className = 'value';
            valueSpan.textContent = displayValue;

            row.appendChild(label);
            row.appendChild(valueSpan);
            container.appendChild(row);
        }
    });

    // Payment plan
    if (data.paymentPlan && data.paymentPlan.length > 0) {
        const headerRow = document.createElement('div');
        headerRow.className = 'extracted-data-row';
        headerRow.style.borderBottom = 'none';
        headerRow.style.paddingTop = '12px';
        const headerLabel = document.createElement('span');
        headerLabel.className = 'label';
        headerLabel.innerHTML = '<strong>Payment Plan</strong>';
        headerRow.appendChild(headerLabel);
        container.appendChild(headerRow);

        data.paymentPlan.forEach(row => {
            const paymentRow = document.createElement('div');
            paymentRow.className = 'extracted-data-row';
            paymentRow.style.fontSize = '12px';

            const label = document.createElement('span');
            label.className = 'label';
            label.textContent = `${row.date || '-'} (${row.percentage || 0}%)`;

            const valueSpan = document.createElement('span');
            valueSpan.className = 'value';
            valueSpan.textContent = `AED ${formatValue(row.amount)}`;

            paymentRow.appendChild(label);
            paymentRow.appendChild(valueSpan);
            container.appendChild(paymentRow);
        });
    }
}

/**
 * Format value for display
 * @param {any} value - Value to format
 * @returns {string} Formatted value
 */
function formatValue(value) {
    if (typeof value === 'number') {
        return value.toLocaleString('en-US');
    }
    return value?.toString() || '-';
}

/**
 * Apply extracted data to form
 */
function applyExtractedData() {
    if (!extractedData) {
        toast('No data to apply', 'error');
        return;
    }

    // Map extracted data to form fields
    if (extractedData.projectName) setValue('input-project-name', extractedData.projectName);
    if (extractedData.unitNo) setValue('u_unit_number', extractedData.unitNo);
    if (extractedData.unitType) setValue('u_unit_type', extractedData.unitType);
    if (extractedData.bedrooms) setValue('u_unit_model', extractedData.bedrooms);
    if (extractedData.views) setValue('u_views', extractedData.views);
    if (extractedData.internalArea) setValue('input-internal-area', extractedData.internalArea);
    if (extractedData.balconyArea) setValue('input-balcony-area', extractedData.balconyArea);
    if (extractedData.totalArea) setValue('input-total-area', extractedData.totalArea);
    if (extractedData.originalPrice) setValue('u_original_price', extractedData.originalPrice);
    if (extractedData.sellingPrice) setValue('u_selling_price', extractedData.sellingPrice);

    // Apply payment plan
    if (extractedData.paymentPlan && extractedData.paymentPlan.length > 0) {
        setPaymentPlan(extractedData.paymentPlan);
    }

    // Run calculations
    runAllCalculations();

    // Trigger update
    document.dispatchEvent(new CustomEvent('dataImported'));

    // Close modal
    closeAIModal();
    toast('Data applied successfully', 'success');
}

/**
 * Close AI modal
 */
function closeAIModal() {
    const modal = getById('aiImportModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Test API connection
 */
async function testAPIConnection() {
    const apiKeyInput = getById('geminiApiKey');
    const status = getById('apiStatus');
    const apiKey = apiKeyInput?.value?.trim();

    if (!apiKey) {
        if (status) {
            status.textContent = 'Please enter an API key';
            status.className = 'api-status error';
        }
        return;
    }

    if (status) {
        status.textContent = 'Testing connection...';
        status.className = 'api-status';
    }

    try {
        // API key sent in header instead of URL to prevent exposure in logs/history
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
            headers: {
                'x-goog-api-key': apiKey
            }
        });

        if (response.ok) {
            // Save the key
            saveApiKey(apiKey);
            if (status) {
                status.textContent = 'Connection successful! API key saved.';
                status.className = 'api-status success';
            }
        } else {
            const error = await response.json();
            throw new Error(error.error?.message || 'Invalid API key');
        }
    } catch (error) {
        if (status) {
            status.textContent = error.message || 'Connection failed';
            status.className = 'api-status error';
        }
    }
}

/**
 * Open settings modal (helper)
 */
function openSettingsModal() {
    const modal = getById('settingsModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Switch to API tab
        const apiTab = document.querySelector('[data-tab="api"]');
        if (apiTab) apiTab.click();
    }
}

/**
 * Save API key from settings
 */
export function saveAPIKey() {
    const apiKeyInput = getById('geminiApiKey');
    const apiKey = apiKeyInput?.value?.trim();
    if (apiKey) {
        saveApiKey(apiKey);
    }
}
