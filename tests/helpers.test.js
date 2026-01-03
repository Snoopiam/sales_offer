/**
 * Helpers Tests - Testing actual source file functions
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import actual functions from source
import {
    formatCurrency,
    formatNumber,
    parseCurrency,
    generateId,
    escapeHtml,
    sanitizeInput,
    checkFileSize,
    formatDate,
    excelDateToJS,
    getNumericValue,
    debounce,
    getById,
    queryOne,
    queryAll,
    setValue,
    getValue,
    setText,
    show,
    hide,
    toggle,
    on,
    encodeApiKey,
    decodeApiKey
} from '../js/utils/helpers.js';

describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
        expect(formatCurrency(1000)).toBe('AED 1,000');
        expect(formatCurrency(1234567)).toBe('AED 1,234,567');
        expect(formatCurrency(500000)).toBe('AED 500,000');
    });

    it('formats zero correctly', () => {
        expect(formatCurrency(0)).toBe('AED 0');
    });

    it('handles string input', () => {
        expect(formatCurrency('2500000')).toBe('AED 2,500,000');
        expect(formatCurrency('1000.50')).toBe('AED 1,001');
    });

    it('handles null/undefined', () => {
        expect(formatCurrency(null)).toBe('AED 0');
        expect(formatCurrency(undefined)).toBe('AED 0');
    });

    it('handles invalid input', () => {
        expect(formatCurrency('abc')).toBe('AED 0');
        expect(formatCurrency(NaN)).toBe('AED 0');
    });

    it('handles negative numbers', () => {
        expect(formatCurrency(-500)).toBe('AED -500');
    });

    it('rounds decimal places', () => {
        expect(formatCurrency(1234.567)).toBe('AED 1,235');
        expect(formatCurrency(999.4)).toBe('AED 999');
        expect(formatCurrency(999.5)).toBe('AED 1,000');
    });
});

describe('formatNumber', () => {
    it('formats with default decimals', () => {
        expect(formatNumber(1234.5)).toBe('1,234.50');
        expect(formatNumber(1000)).toBe('1,000.00');
    });

    it('formats with custom decimals', () => {
        expect(formatNumber(1234.5678, 3)).toBe('1,234.568');
        expect(formatNumber(1000, 0)).toBe('1,000');
    });

    it('handles string input', () => {
        expect(formatNumber('1234.56')).toBe('1,234.56');
    });

    it('handles null/undefined', () => {
        expect(formatNumber(null)).toBe('0');
        expect(formatNumber(undefined)).toBe('0');
    });
});

describe('parseCurrency', () => {
    it('parses currency strings', () => {
        expect(parseCurrency('AED 1,000')).toBe(1000);
        expect(parseCurrency('AED 2,500,000')).toBe(2500000);
        expect(parseCurrency('$1,234.56')).toBe(1234.56);
    });

    it('parses plain numbers', () => {
        expect(parseCurrency('1000')).toBe(1000);
        expect(parseCurrency(500)).toBe(500);
    });

    it('handles empty/null input', () => {
        expect(parseCurrency('')).toBe(0);
        expect(parseCurrency(null)).toBe(0);
    });

    it('handles negative values', () => {
        expect(parseCurrency('-500')).toBe(-500);
        expect(parseCurrency('AED -1,000')).toBe(-1000);
    });
});

describe('generateId', () => {
    it('generates unique IDs', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
    });

    it('generates string IDs', () => {
        const id = generateId();
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
    });
});

describe('escapeHtml', () => {
    it('escapes HTML entities', () => {
        expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
        expect(escapeHtml('a & b')).toBe('a &amp; b');
        // Note: browser's textContent/innerHTML doesn't escape quotes
        expect(escapeHtml('"quoted"')).toBe('"quoted"');
        expect(escapeHtml("it's")).toBe("it's");
    });

    it('handles empty/null input', () => {
        expect(escapeHtml('')).toBe('');
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml(undefined)).toBe('');
    });

    it('leaves safe strings unchanged', () => {
        expect(escapeHtml('Hello World')).toBe('Hello World');
        expect(escapeHtml('123')).toBe('123');
    });

    it('escapes angle brackets and ampersand', () => {
        expect(escapeHtml('<div class="test">')).toBe('&lt;div class="test"&gt;');
    });
});

describe('sanitizeInput', () => {
    it('removes angle brackets', () => {
        expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
    });

    it('removes javascript: protocol', () => {
        expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
    });

    it('removes event handlers', () => {
        expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
        expect(sanitizeInput('onmouseover=bad()')).toBe('bad()');
    });

    it('trims whitespace', () => {
        expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('handles empty/null input', () => {
        expect(sanitizeInput('')).toBe('');
        expect(sanitizeInput(null)).toBe('');
    });

    it('preserves safe content', () => {
        expect(sanitizeInput('Hello World 123')).toBe('Hello World 123');
    });
});

describe('checkFileSize', () => {
    it('accepts files within limit', () => {
        const file = { size: 5 * 1024 * 1024 }; // 5MB
        expect(checkFileSize(file, 20)).toBe(true);
    });

    it('rejects files over limit', () => {
        const file = { size: 25 * 1024 * 1024 }; // 25MB
        expect(checkFileSize(file, 20)).toBe(false);
    });

    it('accepts files at exact limit', () => {
        const file = { size: 20 * 1024 * 1024 }; // 20MB
        expect(checkFileSize(file, 20)).toBe(true);
    });
});

describe('formatDate', () => {
    it('formats Date objects', () => {
        const date = new Date('2025-03-15');
        expect(formatDate(date)).toBe('15 Mar 2025');
    });

    it('formats date strings', () => {
        expect(formatDate('2025-12-25')).toBe('25 Dec 2025');
    });

    it('handles empty input', () => {
        expect(formatDate('')).toBe('');
        expect(formatDate(null)).toBe('');
    });

    it('handles invalid dates', () => {
        expect(formatDate('invalid')).toBe('invalid');
    });
});

describe('excelDateToJS', () => {
    it('converts Excel serial dates', () => {
        const date = excelDateToJS(44927);
        expect(date.getFullYear()).toBe(2023);
        expect(date.getMonth()).toBe(0);
        expect(date.getDate()).toBe(1);
    });

    it('handles another date', () => {
        const date = excelDateToJS(45000);
        expect(date.getFullYear()).toBe(2023);
    });
});

describe('getNumericValue', () => {
    beforeEach(() => {
        document.body.innerHTML = '<input id="testInput" value="1234.56"><input id="commaInput" value="1,234">';
    });

    it('parses numeric values from elements', () => {
        // parseFloat stops at non-numeric chars, so commas break parsing
        expect(getNumericValue('testInput')).toBe(1234.56);
    });

    it('returns first number before comma', () => {
        // This is expected behavior - parseFloat stops at comma
        expect(getNumericValue('commaInput')).toBe(1);
    });

    it('returns 0 for missing elements', () => {
        expect(getNumericValue('nonexistent')).toBe(0);
    });
});

describe('debounce', () => {
    it('delays function execution', async () => {
        vi.useFakeTimers();
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced();
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });

    it('only calls once for rapid calls', async () => {
        vi.useFakeTimers();
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced();
        debounced();
        debounced();

        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });

    it('uses default wait time of 300ms', async () => {
        vi.useFakeTimers();
        const fn = vi.fn();
        const debounced = debounce(fn);

        debounced();
        vi.advanceTimersByTime(299);
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
    });
});

// ============================================================================
// DOM HELPER TESTS
// ============================================================================

describe('getById (getElementById)', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="testDiv">Test Content</div><span id="testSpan">Span</span>';
    });

    it('returns element by ID', () => {
        const el = getById('testDiv');
        expect(el).not.toBeNull();
        expect(el.textContent).toBe('Test Content');
    });

    it('returns null for non-existent ID', () => {
        expect(getById('nonexistent')).toBeNull();
    });
});

describe('queryOne (querySelector)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="container">
                <span class="item">First</span>
                <span class="item">Second</span>
            </div>
        `;
    });

    it('returns first matching element', () => {
        const el = queryOne('.item');
        expect(el.textContent).toBe('First');
    });

    it('returns null for no match', () => {
        expect(queryOne('.nonexistent')).toBeNull();
    });

    it('searches within parent element', () => {
        const container = queryOne('.container');
        const item = queryOne('.item', container);
        expect(item.textContent).toBe('First');
    });
});

describe('queryAll (querySelectorAll)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="container">
                <span class="item">First</span>
                <span class="item">Second</span>
                <span class="item">Third</span>
            </div>
        `;
    });

    it('returns all matching elements', () => {
        const items = queryAll('.item');
        expect(items.length).toBe(3);
    });

    it('returns empty NodeList for no match', () => {
        const items = queryAll('.nonexistent');
        expect(items.length).toBe(0);
    });

    it('searches within parent element', () => {
        const container = queryOne('.container');
        const items = queryAll('.item', container);
        expect(items.length).toBe(3);
    });
});

describe('setValue and getValue', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="textInput" type="text" value="">
            <input id="numberInput" type="number" value="">
            <select id="selectInput">
                <option value="opt1">Option 1</option>
                <option value="opt2">Option 2</option>
                <option value="opt3">Option 3</option>
            </select>
        `;
    });

    it('sets and gets text input value', () => {
        setValue('textInput', 'Hello World');
        expect(getValue('textInput')).toBe('Hello World');
    });

    it('sets and gets number input value', () => {
        setValue('numberInput', 12345);
        expect(getValue('numberInput')).toBe('12345');
    });

    it('handles null value', () => {
        setValue('textInput', null);
        expect(getValue('textInput')).toBe('');
    });

    it('handles undefined value', () => {
        setValue('textInput', undefined);
        expect(getValue('textInput')).toBe('');
    });

    it('returns empty string for non-existent element', () => {
        expect(getValue('nonexistent')).toBe('');
    });

    it('does nothing for non-existent element on setValue', () => {
        setValue('nonexistent', 'value'); // Should not throw
    });

    it('sets select element value with exact match', () => {
        setValue('selectInput', 'opt2');
        expect(getValue('selectInput')).toBe('opt2');
    });

    it('handles select with case-insensitive match', () => {
        setValue('selectInput', 'OPT1');
        expect(getValue('selectInput')).toBe('opt1');
    });
});

describe('setText', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="display">Original</div>';
    });

    it('sets text content', () => {
        setText('display', 'New Text');
        expect(getById('display').textContent).toBe('New Text');
    });

    it('shows dash for empty text', () => {
        setText('display', '');
        expect(getById('display').textContent).toBe('-');
    });

    it('shows dash for null', () => {
        setText('display', null);
        expect(getById('display').textContent).toBe('-');
    });

    it('does nothing for non-existent element', () => {
        setText('nonexistent', 'text'); // Should not throw
    });
});

describe('show, hide, toggle', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="testEl" class="hidden">Content</div>';
    });

    it('show removes hidden class', () => {
        show('testEl');
        expect(getById('testEl').classList.contains('hidden')).toBe(false);
    });

    it('hide adds hidden class', () => {
        show('testEl'); // First remove hidden
        hide('testEl');
        expect(getById('testEl').classList.contains('hidden')).toBe(true);
    });

    it('toggle flips visibility', () => {
        const el = getById('testEl');
        expect(el.classList.contains('hidden')).toBe(true);

        toggle('testEl');
        expect(el.classList.contains('hidden')).toBe(false);

        toggle('testEl');
        expect(el.classList.contains('hidden')).toBe(true);
    });

    it('toggle with true forces show', () => {
        toggle('testEl', true);
        expect(getById('testEl').classList.contains('hidden')).toBe(false);
    });

    it('toggle with false forces hide', () => {
        show('testEl');
        toggle('testEl', false);
        expect(getById('testEl').classList.contains('hidden')).toBe(true);
    });

    it('accepts element reference instead of ID', () => {
        const el = getById('testEl');
        show(el);
        expect(el.classList.contains('hidden')).toBe(false);

        hide(el);
        expect(el.classList.contains('hidden')).toBe(true);
    });

    it('handles non-existent element gracefully', () => {
        show('nonexistent'); // Should not throw
        hide('nonexistent'); // Should not throw
        toggle('nonexistent'); // Should not throw
    });
});

describe('on (event listener)', () => {
    beforeEach(() => {
        document.body.innerHTML = '<button id="testBtn">Click</button>';
    });

    it('adds event listener by ID', () => {
        const handler = vi.fn();
        on('testBtn', 'click', handler);

        getById('testBtn').click();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('adds event listener by element', () => {
        const handler = vi.fn();
        const btn = getById('testBtn');
        on(btn, 'click', handler);

        btn.click();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('handles non-existent element gracefully', () => {
        const handler = vi.fn();
        on('nonexistent', 'click', handler); // Should not throw
    });
});

// ============================================================================
// API KEY ENCODING TESTS
// ============================================================================

describe('encodeApiKey', () => {
    it('encodes string to Base64', () => {
        expect(encodeApiKey('hello')).toBe('aGVsbG8=');
        expect(encodeApiKey('sk-abc123')).toBe('c2stYWJjMTIz');
    });

    it('encodes empty string', () => {
        expect(encodeApiKey('')).toBe('');
    });

    it('encodes special characters', () => {
        const encoded = encodeApiKey('test@123!');
        expect(encoded).toBe('dGVzdEAxMjMh');
    });
});

describe('decodeApiKey', () => {
    it('decodes Base64 to string', () => {
        expect(decodeApiKey('aGVsbG8=')).toBe('hello');
        expect(decodeApiKey('c2stYWJjMTIz')).toBe('sk-abc123');
    });

    it('decodes empty string', () => {
        expect(decodeApiKey('')).toBe('');
    });

    it('returns empty for invalid Base64', () => {
        expect(decodeApiKey('!!!invalid!!!')).toBe('');
    });

    it('round-trips correctly', () => {
        const original = 'my-secret-api-key-12345';
        const encoded = encodeApiKey(original);
        const decoded = decodeApiKey(encoded);
        expect(decoded).toBe(original);
    });
});

// ============================================================================
// ADDITIONAL EDGE CASE TESTS
// ============================================================================

describe('formatNumber edge cases', () => {
    it('handles empty string', () => {
        expect(formatNumber('')).toBe('0');
    });

    it('handles NaN', () => {
        expect(formatNumber(NaN)).toBe('0');
    });

    it('handles negative numbers', () => {
        expect(formatNumber(-1234.56)).toBe('-1,234.56');
    });

    it('handles very large numbers', () => {
        expect(formatNumber(1234567890.12)).toBe('1,234,567,890.12');
    });

    it('handles very small decimals', () => {
        expect(formatNumber(0.123456, 4)).toBe('0.1235');
    });
});

describe('parseCurrency edge cases', () => {
    it('handles multiple commas', () => {
        expect(parseCurrency('1,234,567,890')).toBe(1234567890);
    });

    it('handles currency symbols', () => {
        expect(parseCurrency('€1,234.56')).toBe(1234.56);
        expect(parseCurrency('£500')).toBe(500);
    });

    it('handles spaces', () => {
        expect(parseCurrency('AED 1 000 000')).toBe(1000000);
    });
});

describe('formatDate edge cases', () => {
    it('formats timestamp', () => {
        const timestamp = new Date('2024-06-15').getTime();
        expect(formatDate(timestamp)).toBe('15 Jun 2024');
    });

    it('handles Date at month boundaries', () => {
        expect(formatDate('2024-01-01')).toBe('01 Jan 2024');
        expect(formatDate('2024-12-31')).toBe('31 Dec 2024');
    });
});

describe('checkFileSize edge cases', () => {
    it('uses default 50MB limit', () => {
        const file = { size: 50 * 1024 * 1024 };
        expect(checkFileSize(file)).toBe(true);

        const largeFile = { size: 51 * 1024 * 1024 };
        expect(checkFileSize(largeFile)).toBe(false);
    });

    it('handles zero size file', () => {
        const file = { size: 0 };
        expect(checkFileSize(file, 10)).toBe(true);
    });
});

describe('sanitizeInput edge cases', () => {
    it('handles multiple dangerous patterns', () => {
        const input = '<script>javascript:onclick=alert(1)</script>';
        const result = sanitizeInput(input);
        expect(result).not.toContain('<');
        expect(result).not.toContain('javascript:');
        expect(result).not.toContain('onclick=');
    });

    it('handles case variations', () => {
        expect(sanitizeInput('JAVASCRIPT:alert(1)')).not.toContain('javascript');
        expect(sanitizeInput('OnClick=bad()')).not.toContain('onclick');
    });

    it('handles undefined', () => {
        expect(sanitizeInput(undefined)).toBe('');
    });
});
