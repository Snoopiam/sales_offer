# Security Fixes - Quick Reference Guide

## Critical Issues - Fix First (Priority 1)

### 1. API Key Storage (CRITICAL)
**File:** `js/modules/storage.js` + `js/utils/helpers.js`

**Current (INSECURE):**
```javascript
// helpers.js lines 270-272
export function encodeApiKey(text) {
    return btoa(text); // BASE64 IS NOT ENCRYPTION!
}
```

**Fix Option A - Server Proxy (RECOMMENDED):**
```javascript
// Create new file: server/api/gemini-proxy.js
async function callGeminiAPI(base64Data, mimeType) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: base64Data, mimeType })
    });
    return response.json();
}
// API key stored on server only
```

**Fix Option B - Web Crypto API (NOT RECOMMENDED but better than current):**
```javascript
// Replace helpers.js encodeApiKey/decodeApiKey
import { encrypt, decrypt } from './crypto.js';

export async function encodeApiKey(text) {
    const key = await deriveKey(); // User-provided password
    return await encrypt(text, key);
}

export async function decodeApiKey(encrypted) {
    const key = await deriveKey();
    return await decrypt(encrypted, key);
}
```

---

### 2. XSS via innerHTML (CRITICAL)
**Files:** `js/app.js` (line 492), `js/modules/ai.js` (line 346), `js/modules/paymentPlan.js` (line 240)

**Current (VULNERABLE):**
```javascript
// app.js line 492
container.innerHTML = templates.map(template => `
    <div class="template-item" data-id="${template.id}">
        <span class="template-item-name">${template.name}</span>
    </div>
`).join('');
```

**Fix:**
```javascript
// Create sanitization utility
export function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Use in templates
container.innerHTML = templates.map(template => `
    <div class="template-item" data-id="${escapeHtml(template.id)}">
        <span class="template-item-name">${escapeHtml(template.name)}</span>
    </div>
`).join('');

// BETTER: Use createElement
function renderTemplate(template) {
    const div = document.createElement('div');
    div.className = 'template-item';
    div.dataset.id = template.id;

    const span = document.createElement('span');
    span.className = 'template-item-name';
    span.textContent = template.name; // Safe - no HTML parsing

    div.appendChild(span);
    return div;
}

container.innerHTML = '';
templates.forEach(template => {
    container.appendChild(renderTemplate(template));
});
```

**Apply to all files using innerHTML:**
- js/app.js line 492
- js/modules/ai.js line 324-329, 336-342
- js/modules/paymentPlan.js line 240-261
- js/modules/beta.js (multiple locations)

---

### 3. File Upload Validation (CRITICAL)
**Files:** `js/app.js` (line 185), `js/modules/branding.js` (line 105), `js/modules/ai.js` (line 170)

**Current (INSECURE):**
```javascript
// app.js line 185
if (!file.type.startsWith('image/')) {
    toast('Please upload an image file', 'error');
    return;
}
```

**Fix:**
```javascript
async function validateImageUpload(file) {
    // 1. Whitelist extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileName = file.name.toLowerCase();
    if (!allowedExtensions.some(ext => fileName.endsWith(ext))) {
        throw new Error('Only JPG, PNG, and WebP images allowed');
    }

    // 2. Check MIME type (defense in depth)
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.type)) {
        throw new Error('Invalid file type');
    }

    // 3. Size limit
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
        throw new Error('Image must be less than 5MB');
    }

    // 4. Validate magic bytes
    const isValid = await validateFileSignature(file);
    if (!isValid) {
        throw new Error('File appears to be corrupted');
    }

    // 5. Verify it's actually an image
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(e.target.result);
            img.onerror = () => reject(new Error('Not a valid image'));
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function validateFileSignature(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const arr = new Uint8Array(e.target.result);

            // PNG: 89 50 4E 47
            if (arr[0] === 0x89 && arr[1] === 0x50 &&
                arr[2] === 0x4E && arr[3] === 0x47) {
                resolve(true);
                return;
            }

            // JPEG: FF D8 FF
            if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) {
                resolve(true);
                return;
            }

            // WebP: RIFF ... WEBP
            if (arr[0] === 0x52 && arr[1] === 0x49 &&
                arr[2] === 0x46 && arr[3] === 0x46 &&
                arr[8] === 0x57 && arr[9] === 0x45 &&
                arr[10] === 0x42 && arr[11] === 0x50) {
                resolve(true);
                return;
            }

            resolve(false);
        };
        reader.readAsArrayBuffer(file.slice(0, 12));
    });
}

// Usage
async function handleFloorPlanUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const dataUrl = await validateImageUpload(file);
        // Proceed with upload
        displayFloorPlan(dataUrl);
    } catch (error) {
        toast(error.message, 'error');
    }
}
```

**CRITICAL: Block SVG Uploads**
```javascript
// In branding.js and ai.js, NEVER allow SVG
const BLOCKED_TYPES = ['image/svg+xml'];
if (BLOCKED_TYPES.includes(file.type)) {
    throw new Error('SVG files are not allowed for security reasons');
}
```

---

### 4. Subresource Integrity (CRITICAL)
**File:** `index.html` (lines 9-12)

**Current (VULNERABLE):**
```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
```

**Fix:**
```html
<!-- Step 1: Generate SRI hashes -->
<!-- Visit https://www.srihash.org/ or use: -->
<!-- openssl dgst -sha384 -binary FILENAME | openssl base64 -A -->

<!-- Step 2: Add integrity attributes -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        integrity="sha512-r22gChDnGvBylk90+2e/ycr3RVrDi8DIOkIGNhJlKfG7URM9QuhvQvKEcZtPVqWMU9pxoY7Kz1BM3YEAVmY5Vg=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"></script>

<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"
        integrity="sha512-ibiVhQV6w8hTLqcR4VtRQG5K7U0EwR3cBIb7f4zfcLLhL5FdYPr0ZxWYWfXH5CXYk7A7cTlRIxQkVqjhGWQXTA=="
        crossorigin="anonymous"></script>

<!-- TailwindCSS: Cannot use SRI with CDN build -->
<!-- Option 1: Self-host with build process -->
<!-- Option 2: Use specific versioned build -->
<link href="https://unpkg.com/tailwindcss@3.4.1/dist/tailwind.min.css"
      rel="stylesheet"
      integrity="sha384-..."
      crossorigin="anonymous">
```

---

### 5. Content Security Policy (CRITICAL)
**File:** `index.html` (add to <head>)

**Add:**
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self'
        https://cdn.tailwindcss.com
        https://cdnjs.cloudflare.com
        https://cdn.jsdelivr.net
        'sha256-{hash-of-inline-script}';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob:;
    connect-src 'self' https://generativelanguage.googleapis.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
">
```

**Better: Use HTTP header (requires server configuration)**
```nginx
# nginx.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-$request_id' https://cdn.tailwindcss.com; ..." always;
```

---

### 6. Remove Sensitive Logging (CRITICAL)
**Files:** Multiple (search for console.error, console.log)

**Find and Replace:**
```javascript
// Search: console.error
// Replace with logging wrapper

// Create js/utils/logger.js
const isDevelopment = window.location.hostname === 'localhost';

export const logger = {
    error: (message, error) => {
        if (isDevelopment) {
            console.error(message, error);
        } else {
            // Send sanitized error to logging service
            // Remove sensitive data
            const sanitized = {
                message: error?.message || 'Unknown error',
                timestamp: new Date().toISOString()
            };
            // reportError(sanitized); // Implement if needed
        }
    },
    warn: (message) => {
        if (isDevelopment) {
            console.warn(message);
        }
    },
    info: (message) => {
        if (isDevelopment) {
            console.log(message);
        }
    }
};

// Replace all instances:
// console.error('AI processing error:', error);
// with:
// logger.error('AI processing error:', error);
```

---

## High Priority Issues (Priority 2)

### 7. Encrypt localStorage Data
**File:** `js/modules/storage.js`

**Create:** `js/utils/crypto.js`
```javascript
// Basic Web Crypto API wrapper
export class SecureStorage {
    static async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(salt),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }

    static async encrypt(data, password) {
        const encoder = new TextEncoder();
        const key = await this.deriveKey(password, 'sales-offer-salt');
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(data)
        );

        // Return iv + encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        return btoa(String.fromCharCode(...combined));
    }

    static async decrypt(encryptedData, password) {
        const decoder = new TextDecoder();
        const key = await this.deriveKey(password, 'sales-offer-salt');

        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        return decoder.decode(decrypted);
    }
}
```

**Usage:**
```javascript
// Encrypt sensitive offer data before storing
import { SecureStorage } from '../utils/crypto.js';

export async function saveCurrentOffer(offer) {
    const state = loadState();

    // Encrypt financial data
    const sensitiveData = {
        originalPrice: offer.originalPrice,
        sellingPrice: offer.sellingPrice,
        paymentPlan: offer.paymentPlan
    };

    const password = prompt('Enter encryption password'); // Or derive from user session
    offer.encryptedFinancials = await SecureStorage.encrypt(
        JSON.stringify(sensitiveData),
        password
    );

    // Remove plain text
    delete offer.originalPrice;
    delete offer.sellingPrice;
    delete offer.paymentPlan;

    state.currentOffer = { ...state.currentOffer, ...offer };
    saveState(state);
}
```

---

### 8. Add Data Expiration
**File:** `js/modules/storage.js`

```javascript
export function saveState(state) {
    try {
        const timestampedState = {
            ...state,
            _metadata: {
                timestamp: Date.now(),
                ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
                version: '1.0'
            }
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timestampedState));
    } catch (e) {
        console.error('Failed to save state:', e);
        toast('Failed to save data', 'error');
    }
}

export function loadState() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const state = JSON.parse(stored);

            // Check expiration
            if (state._metadata) {
                const age = Date.now() - state._metadata.timestamp;
                if (age > state._metadata.ttl) {
                    console.info('Data expired, clearing');
                    localStorage.removeItem(STORAGE_KEY);
                    return { ...defaultState };
                }
            }

            return deepMerge(defaultState, state);
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
    return { ...defaultState };
}
```

---

### 9. Rate Limiting
**File:** `js/modules/ai.js`

**Create:** `js/utils/rateLimiter.js`
```javascript
export class RateLimiter {
    constructor(maxCalls, windowMs) {
        this.maxCalls = maxCalls;
        this.windowMs = windowMs;
        this.calls = [];
    }

    async throttle(fn) {
        const now = Date.now();

        // Remove old calls outside window
        this.calls = this.calls.filter(time => now - time < this.windowMs);

        if (this.calls.length >= this.maxCalls) {
            const oldestCall = this.calls[0];
            const waitTime = this.windowMs - (now - oldestCall);
            const seconds = Math.ceil(waitTime / 1000);
            throw new Error(`Rate limit exceeded. Please wait ${seconds} seconds.`);
        }

        this.calls.push(now);
        return await fn();
    }

    reset() {
        this.calls = [];
    }
}
```

**Usage in ai.js:**
```javascript
import { RateLimiter } from '../utils/rateLimiter.js';

// 5 calls per minute
const geminiLimiter = new RateLimiter(5, 60000);

async function processAIFile(file) {
    // ... validation code ...

    try {
        const base64Data = await fileToBase64(file);
        const mimeType = file.type;

        // Apply rate limiting
        const result = await geminiLimiter.throttle(() =>
            callGeminiAPI(base64Data, mimeType)
        );

        // ... rest of code ...
    } catch (error) {
        toast(error.message, 'error');
        resetAIModal();
    }
}
```

---

## Testing Checklist

### XSS Tests
```javascript
// Test inputs in all text fields:
const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>',
    'javascript:alert(1)',
    '<iframe src="javascript:alert(1)">',
    '\';alert(String.fromCharCode(88,83,83))//\';'
];

// Verify none execute when:
// 1. Saving template names
// 2. Entering property details
// 3. AI import data
// 4. Payment plan dates
```

### File Upload Tests
```bash
# Create test files:
1. malicious.svg (with <script> tag)
2. file.jpg.exe (double extension)
3. polyglot.jpg (valid JPG + HTML)
4. oversized.jpg (>5MB)
5. fake.png (rename .exe to .png)

# Verify all are rejected
```

### localStorage Tests
```javascript
// Open browser console
localStorage.getItem('salesOfferApp')

// Verify:
// 1. API key is encrypted (not base64)
// 2. Sensitive data is encrypted
// 3. Data expires after TTL
```

---

## Quick Validation Script

**Create:** `validate-security.js`
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Security Validation Script\n');

let issues = 0;

// Check 1: innerHTML usage
console.log('Checking for unsafe innerHTML usage...');
const jsFiles = [
    'js/app.js',
    'js/modules/ai.js',
    'js/modules/paymentPlan.js'
];

jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('.innerHTML =') && !content.includes('escapeHtml')) {
        console.error(`  ❌ ${file} uses innerHTML without sanitization`);
        issues++;
    }
});

// Check 2: SRI in HTML
console.log('\nChecking for SRI attributes...');
const html = fs.readFileSync('index.html', 'utf8');
const scripts = html.match(/<script[^>]+src=/g) || [];
scripts.forEach(script => {
    if (!script.includes('integrity=')) {
        console.error(`  ❌ Script tag missing integrity: ${script.substring(0, 50)}...`);
        issues++;
    }
});

// Check 3: CSP
console.log('\nChecking for Content Security Policy...');
if (!html.includes('Content-Security-Policy')) {
    console.error('  ❌ No CSP found in HTML');
    issues++;
}

// Check 4: API key encoding
console.log('\nChecking API key security...');
const helpers = fs.readFileSync('js/utils/helpers.js', 'utf8');
if (helpers.includes('btoa(text)') && helpers.includes('encodeApiKey')) {
    console.error('  ❌ API key using insecure base64 encoding');
    issues++;
}

console.log(`\n${'='.repeat(50)}`);
if (issues === 0) {
    console.log('✅ All checks passed!');
} else {
    console.error(`❌ Found ${issues} security issues`);
    process.exit(1);
}
```

**Run:** `node validate-security.js`

---

## Summary of Changes

### Files to Modify
1. ✅ `index.html` - Add SRI, CSP
2. ✅ `js/utils/helpers.js` - Add escapeHtml, remove btoa encoding
3. ✅ `js/modules/storage.js` - Add encryption, expiration
4. ✅ `js/modules/ai.js` - Sanitize output, add rate limiting
5. ✅ `js/app.js` - Sanitize template rendering
6. ✅ `js/modules/branding.js` - Block SVG, add validation
7. ✅ `js/modules/paymentPlan.js` - Sanitize dates
8. ✅ All files - Replace console.error with logger

### Files to Create
1. ✅ `js/utils/crypto.js` - Encryption utilities
2. ✅ `js/utils/rateLimiter.js` - Rate limiting
3. ✅ `js/utils/logger.js` - Secure logging
4. ✅ `validate-security.js` - Validation script
5. ✅ `server/api/gemini-proxy.js` - API proxy (if using server)

### Estimated Time
- **Critical fixes:** 8-12 hours
- **High priority:** 4-6 hours
- **Testing:** 4 hours
- **Total:** 16-22 hours

---

**Next Steps:**
1. Backup current code
2. Create feature branch: `git checkout -b security-fixes`
3. Apply fixes in order of priority
4. Test thoroughly
5. Run validation script
6. Peer review
7. Deploy to staging
8. Penetration test
9. Deploy to production
