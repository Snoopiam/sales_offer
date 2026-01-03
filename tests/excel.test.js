/**
 * Excel Import Module Tests
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the helper module
vi.mock('../js/utils/helpers.js', () => ({
    getById: vi.fn(),
    setValue: vi.fn(),
    toast: vi.fn(),
    formatDate: vi.fn((date) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }),
    excelDateToJS: vi.fn((serial) => new Date(Math.round((serial - 25569) * 86400 * 1000)))
}));

// Mock the paymentPlan module
vi.mock('../js/modules/paymentPlan.js', () => ({
    setPaymentPlan: vi.fn(),
    setPaymentPlanName: vi.fn()
}));

// Mock the calculator module
vi.mock('../js/modules/calculator.js', () => ({
    runAllCalculations: vi.fn()
}));

import { initExcel } from '../js/modules/excel.js';
import { getById, setValue, toast, formatDate, excelDateToJS } from '../js/utils/helpers.js';
import { setPaymentPlan, setPaymentPlanName } from '../js/modules/paymentPlan.js';
import { runAllCalculations } from '../js/modules/calculator.js';

describe('Excel Import Module', () => {
    let mockUploadInput;
    let mockXLSX;
    let mockFileReaderInstance;
    let OriginalFileReader;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock DOM element
        mockUploadInput = {
            addEventListener: vi.fn(),
            value: ''
        };

        getById.mockImplementation((id) => {
            if (id === 'excelUpload') return mockUploadInput;
            return null;
        });

        // Setup mock XLSX library
        mockXLSX = {
            read: vi.fn(),
            utils: {
                sheet_to_json: vi.fn()
            }
        };
        global.XLSX = mockXLSX;

        // Mock localStorage
        const localStorageMock = {
            getItem: vi.fn(() => null),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn()
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

        // Mock FileReader as a class
        OriginalFileReader = global.FileReader;
        mockFileReaderInstance = {
            readAsArrayBuffer: vi.fn(function() {
                // Trigger onload asynchronously
                setTimeout(() => {
                    if (this.onload) {
                        this.onload({ target: { result: this._mockResult || new ArrayBuffer(8) } });
                    }
                }, 0);
            }),
            onload: null,
            onerror: null,
            result: null,
            _mockResult: null
        };

        global.FileReader = class MockFileReader {
            constructor() {
                Object.assign(this, {
                    readAsArrayBuffer: mockFileReaderInstance.readAsArrayBuffer.bind(this),
                    onload: null,
                    onerror: null,
                    result: null,
                    _mockResult: null
                });
                mockFileReaderInstance._instance = this;
            }
        };
    });

    afterEach(() => {
        delete global.XLSX;
        global.FileReader = OriginalFileReader;
        vi.restoreAllMocks();
    });

    describe('initExcel', () => {
        it('attaches change handler to upload input', () => {
            initExcel();

            expect(getById).toHaveBeenCalledWith('excelUpload');
            expect(mockUploadInput.addEventListener).toHaveBeenCalledWith(
                'change',
                expect.any(Function)
            );
        });

        it('handles missing upload input gracefully', () => {
            getById.mockReturnValue(null);

            expect(() => initExcel()).not.toThrow();
        });
    });

    describe('handleExcelUpload', () => {
        let changeHandler;

        beforeEach(() => {
            initExcel();
            changeHandler = mockUploadInput.addEventListener.mock.calls
                .find(call => call[0] === 'change')[1];
        });

        it('does nothing when no file is selected', async () => {
            const event = { target: { files: [], value: '' } };

            await changeHandler(event);

            expect(toast).not.toHaveBeenCalled();
        });

        it('shows error when XLSX library is not loaded', async () => {
            delete global.XLSX;

            const mockFile = new File([''], 'test.xlsx', {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const event = { target: { files: [mockFile], value: 'test.xlsx' } };

            await changeHandler(event);

            expect(toast).toHaveBeenCalledWith(
                'Excel library not loaded. Please refresh the page and try again.',
                'error'
            );
        });

        it('shows error for invalid file type', async () => {
            const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
            Object.defineProperty(mockFile, 'name', { value: 'test.txt' });

            const event = { target: { files: [mockFile], value: 'test.txt' } };

            await changeHandler(event);

            expect(toast).toHaveBeenCalledWith(
                'Please upload an Excel file (.xlsx or .xls)',
                'error'
            );
        });

        it('accepts .xlsx files by MIME type', async () => {
            const mockFile = new File([''], 'test.xlsx', {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const event = { target: { files: [mockFile], value: 'test.xlsx' } };

            await changeHandler(event);

            expect(toast).toHaveBeenCalledWith('Processing Excel file...', 'info');
        });

        it('accepts .xls files by MIME type', async () => {
            const mockFile = new File([''], 'test.xls', {
                type: 'application/vnd.ms-excel'
            });

            const event = { target: { files: [mockFile], value: 'test.xls' } };

            await changeHandler(event);

            expect(toast).toHaveBeenCalledWith('Processing Excel file...', 'info');
        });

        it('accepts files by extension when MIME type is wrong', async () => {
            const mockFile = new File([''], 'test.xlsx', { type: 'application/octet-stream' });
            Object.defineProperty(mockFile, 'name', { value: 'test.xlsx' });

            const event = { target: { files: [mockFile], value: 'test.xlsx' } };

            await changeHandler(event);

            expect(toast).toHaveBeenCalledWith('Processing Excel file...', 'info');
        });

        it('resets input value after upload', async () => {
            const mockFile = new File([''], 'test.xlsx', {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const event = { target: { files: [mockFile], value: 'test.xlsx' } };

            await changeHandler(event);

            expect(event.target.value).toBe('');
        });

        describe('FileReader onload processing', () => {
            async function triggerFileUploadWithData(mockData, options = {}) {
                const { category = null, sheetNames = ['Sheet1'], sheets = { Sheet1: {} } } = options;

                if (category) {
                    localStorage.getItem.mockReturnValue(category);
                }

                mockXLSX.read.mockReturnValue({
                    SheetNames: sheetNames,
                    Sheets: sheets
                });
                mockXLSX.utils.sheet_to_json.mockReturnValue(mockData);

                const mockFile = new File([''], 'test.xlsx', {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                const event = { target: { files: [mockFile], value: 'test.xlsx' } };

                await changeHandler(event);

                // Wait for FileReader async callback
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            it('parses Excel file successfully', async () => {
                const mockData = [
                    ['Project Name', 'Marina Heights'],
                    ['Unit No', 'A-101'],
                    ['Original Price', 2500000],
                    ['Selling Price', 2800000]
                ];

                await triggerFileUploadWithData(mockData);

                expect(mockXLSX.read).toHaveBeenCalled();
                expect(setValue).toHaveBeenCalledWith('input-project-name', 'Marina Heights');
                expect(setValue).toHaveBeenCalledWith('u_unit_number', 'A-101');
                expect(runAllCalculations).toHaveBeenCalled();
            });

            it('uses offplan sheet when available and category is offplan', async () => {
                const mockData = [
                    ['Project Name', 'Offplan Project'],
                    ['Unit No', 'B-202'],
                    ['Original Price', 1500000]
                ];

                await triggerFileUploadWithData(mockData, {
                    category: 'offplan',
                    sheetNames: ['Ready', 'Offplan'],
                    sheets: { Ready: {}, Offplan: {} }
                });

                expect(toast).toHaveBeenCalledWith(
                    expect.stringContaining('Offplan'),
                    'success'
                );
            });

            it('uses ready sheet when available and category is ready', async () => {
                const mockData = [
                    ['Project Name', 'Ready Project'],
                    ['Unit No', 'C-303'],
                    ['Original Price', 3000000]
                ];

                await triggerFileUploadWithData(mockData, {
                    category: 'ready',
                    sheetNames: ['Offplan', 'Ready'],
                    sheets: { Offplan: {}, Ready: {} }
                });

                expect(toast).toHaveBeenCalledWith(
                    expect.stringContaining('Ready'),
                    'success'
                );
            });

            it('uses first sheet as default when category sheet not found', async () => {
                const mockData = [
                    ['Project Name', 'Default Project'],
                    ['Unit No', 'D-404'],
                    ['Original Price', 1000000]
                ];

                await triggerFileUploadWithData(mockData, {
                    category: 'offplan',
                    sheetNames: ['Data'],
                    sheets: { Data: {} }
                });

                expect(toast).toHaveBeenCalledWith(
                    expect.stringContaining('(default)'),
                    'success'
                );
            });

            it('dispatches dataImported event on success', async () => {
                const dispatchSpy = vi.spyOn(document, 'dispatchEvent');

                const mockData = [
                    ['Project Name', 'Event Test'],
                    ['Unit No', 'E-505'],
                    ['Original Price', 2000000]
                ];

                await triggerFileUploadWithData(mockData);

                expect(dispatchSpy).toHaveBeenCalledWith(
                    expect.objectContaining({ type: 'dataImported' })
                );
            });

            it('shows error when parse fails', async () => {
                await triggerFileUploadWithData([]);

                expect(toast).toHaveBeenCalledWith(
                    'Could not parse Excel file. Check format.',
                    'error'
                );
            });

            it('shows error on exception', async () => {
                mockXLSX.read.mockImplementation(() => {
                    throw new Error('Parse error');
                });

                const mockFile = new File([''], 'test.xlsx', {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                const event = { target: { files: [mockFile], value: 'test.xlsx' } };

                await changeHandler(event);
                await new Promise(resolve => setTimeout(resolve, 10));

                expect(toast).toHaveBeenCalledWith(
                    'Error reading Excel file. Please check the format.',
                    'error'
                );
            });
        });
    });

    describe('parseExcelLabelValue (via handleExcelUpload)', () => {
        let changeHandler;

        beforeEach(() => {
            initExcel();
            changeHandler = mockUploadInput.addEventListener.mock.calls
                .find(call => call[0] === 'change')[1];
        });

        async function triggerFileLoad(mockData) {
            mockXLSX.read.mockReturnValue({
                SheetNames: ['Sheet1'],
                Sheets: { Sheet1: {} }
            });
            mockXLSX.utils.sheet_to_json.mockReturnValue(mockData);

            const mockFile = new File([''], 'test.xlsx', {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            await changeHandler({ target: { files: [mockFile], value: 'test.xlsx' } });
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        it('maps Project Name label to input-project-name field', async () => {
            await triggerFileLoad([['Project Name', 'Test Project'], ['Unit No', 'A'], ['Original Price', 1000]]);

            expect(setValue).toHaveBeenCalledWith('input-project-name', 'Test Project');
        });

        it('maps Unit No label to u_unit_number field', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000]
            ]);

            expect(setValue).toHaveBeenCalledWith('u_unit_number', 'A-101');
        });

        it('parses numeric values correctly', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Original Price', 2500000],
                ['Selling Price', '2,800,000'],
                ['Internal Area (sq.ft)', 1500.5]
            ]);

            expect(setValue).toHaveBeenCalledWith('u_original_price', 2500000);
            expect(setValue).toHaveBeenCalledWith('u_selling_price', 2800000);
            expect(setValue).toHaveBeenCalledWith('input-internal-area', 1500.5);
        });

        it('converts decimal percentages to whole numbers', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Paid Percentage', 0.3],
                ['Resale Clause', 0.05],
                ['Original Price', 1000000]
            ]);

            expect(setValue).toHaveBeenCalledWith('u_amount_paid_percent', 30);
            expect(setValue).toHaveBeenCalledWith('u_resale_clause', 5);
        });

        it('does not convert already whole percentages', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Paid Percentage', 30],
                ['Original Price', 1000000]
            ]);

            expect(setValue).toHaveBeenCalledWith('u_amount_paid_percent', 30);
        });

        it('normalizes Views values', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Views', 'Sea Views'],
                ['Original Price', 1000000]
            ]);

            expect(setValue).toHaveBeenCalledWith('u_views', 'Sea View');
        });

        it('skips calculated fields (refund, premium, total initial)', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Refund Amount', 500000],
                ['Premium', 100000],
                ['Total Initial Payment', 750000],
                ['Original Price', 1000000]
            ]);

            expect(setValue).not.toHaveBeenCalledWith(expect.anything(), 500000);
            expect(setValue).not.toHaveBeenCalledWith(expect.anything(), 100000);
            expect(setValue).not.toHaveBeenCalledWith(expect.anything(), 750000);
        });

        it('combines Unit Model with Maid, Laundry, Store rooms', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit Model', '2BR'],
                ["Maid's Room", 'Yes'],
                ['Laundry Room', 'Yes'],
                ['Store Room', 'No'],
                ['Original Price', 1000000]
            ]);

            expect(setValue).toHaveBeenCalledWith('u_unit_model', '2BR + Maid + Laundry');
        });

        it('handles Unit Model without extras', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit Model', 'Studio'],
                ["Maid's Room", 'No'],
                ['Original Price', 1000000]
            ]);

            expect(setValue).toHaveBeenCalledWith('u_unit_model', 'Studio');
        });

        it('skips empty or null values', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', ''],
                ['Views', null],
                ['Original Price', 1000000]
            ]);

            expect(setValue).not.toHaveBeenCalledWith('u_unit_number', '');
            expect(setValue).not.toHaveBeenCalledWith('u_views', null);
        });

        it('skips rows with empty labels', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['', 'Empty Label Value'],
                [null, 'Null Label Value'],
                ['Original Price', 1000000]
            ]);

            expect(setValue).not.toHaveBeenCalledWith(expect.anything(), 'Empty Label Value');
            expect(setValue).not.toHaveBeenCalledWith(expect.anything(), 'Null Label Value');
        });

        it('skips unknown labels', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unknown Field', 'Some Value'],
                ['Original Price', 1000000]
            ]);

            expect(setValue).not.toHaveBeenCalledWith(expect.anything(), 'Some Value');
        });

        it('requires at least 3 fields for success', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101']
            ]);

            expect(toast).toHaveBeenCalledWith(
                'Could not parse Excel file. Check format.',
                'error'
            );
        });

        it('succeeds with 3 or more fields', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000]
            ]);

            expect(toast).toHaveBeenCalledWith(
                expect.stringContaining('3 fields'),
                'success'
            );
        });
    });

    describe('parsePaymentPlanSection (via handleExcelUpload)', () => {
        let changeHandler;

        beforeEach(() => {
            initExcel();
            changeHandler = mockUploadInput.addEventListener.mock.calls
                .find(call => call[0] === 'change')[1];
        });

        async function triggerFileLoad(mockData) {
            mockXLSX.read.mockReturnValue({
                SheetNames: ['Sheet1'],
                Sheets: { Sheet1: {} }
            });
            mockXLSX.utils.sheet_to_json.mockReturnValue(mockData);

            const mockFile = new File([''], 'test.xlsx', {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            await changeHandler({ target: { files: [mockFile], value: 'test.xlsx' } });
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        it('parses payment plan section after Payment Plan label', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000],
                ['Payment Plan', '30:70'],
                [1, 0.10, 45000, 100000],
                [2, 0.20, 45100, 200000],
                [3, 0.70, 45200, 700000]
            ]);

            expect(setPaymentPlan).toHaveBeenCalledWith([
                { date: expect.any(String), percentage: '10', amount: 100000 },
                { date: expect.any(String), percentage: '20', amount: 200000 },
                { date: expect.any(String), percentage: '70', amount: 700000 }
            ]);
        });

        it('sets payment plan name', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000],
                ['Payment Plan', '40:60'],
                [1, 0.40, 45000, 400000]
            ]);

            expect(setPaymentPlanName).toHaveBeenCalledWith('40:60');
        });

        it('converts decimal percentages in payment plan', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000],
                ['Payment Plan', 'Test'],
                [1, 0.25, null, 250000]
            ]);

            expect(setPaymentPlan).toHaveBeenCalledWith([
                expect.objectContaining({ percentage: '25' })
            ]);
        });

        it('handles string percentages with % symbol', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000],
                ['Payment Plan', 'Test'],
                [1, '30%', null, 300000]
            ]);

            expect(setPaymentPlan).toHaveBeenCalledWith([
                expect.objectContaining({ percentage: '30' })
            ]);
        });

        it('converts Excel serial dates', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000],
                ['Payment Plan', 'Test'],
                [1, 0.10, 45000, 100000]
            ]);

            expect(excelDateToJS).toHaveBeenCalledWith(45000);
            expect(formatDate).toHaveBeenCalled();
        });

        it('handles string dates', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000],
                ['Payment Plan', 'Test'],
                [1, 0.10, '15 Jan 2024', 100000]
            ]);

            expect(setPaymentPlan).toHaveBeenCalledWith([
                expect.objectContaining({ date: '15 Jan 2024' })
            ]);
        });

        it('parses string amounts with currency formatting', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000],
                ['Payment Plan', 'Test'],
                [1, 0.10, null, 'AED 100,000']
            ]);

            expect(setPaymentPlan).toHaveBeenCalledWith([
                expect.objectContaining({ amount: 100000 })
            ]);
        });

        it('stops parsing at empty row', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000],
                ['Payment Plan', 'Test'],
                [1, 0.10, null, 100000],
                [],
                [2, 0.20, null, 200000]
            ]);

            expect(setPaymentPlan).toHaveBeenCalledWith([
                expect.objectContaining({ percentage: '10' })
            ]);
        });

        it('stops parsing at non-numeric first column', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000],
                ['Payment Plan', 'Test'],
                [1, 0.10, null, 100000],
                ['Notes', 'Some notes here'],
                [2, 0.20, null, 200000]
            ]);

            expect(setPaymentPlan).toHaveBeenCalledWith([
                expect.objectContaining({ percentage: '10' })
            ]);
        });

        it('does not set payment plan name when empty', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000],
                ['Payment Plan', ''],
                [1, 0.10, null, 100000]
            ]);

            // Empty payment plan name should not call setPaymentPlanName
            expect(setPaymentPlanName).not.toHaveBeenCalled();
        });

        it('handles payment plan with no installments', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000],
                ['Payment Plan', 'Empty'],
                ['Another Section', 'Value']
            ]);

            expect(setPaymentPlan).not.toHaveBeenCalled();
        });

        it('handles installments with only percentage', async () => {
            await triggerFileLoad([
                ['Project Name', 'Test'],
                ['Unit No', 'A-101'],
                ['Original Price', 1000000],
                ['Payment Plan', 'Test'],
                [1, 0.10],
                [2, 0.90]
            ]);

            expect(setPaymentPlan).toHaveBeenCalledWith([
                { date: '', percentage: '10', amount: '' },
                { date: '', percentage: '90', amount: '' }
            ]);
        });
    });

    describe('Field mappings', () => {
        let changeHandler;

        beforeEach(() => {
            initExcel();
            changeHandler = mockUploadInput.addEventListener.mock.calls
                .find(call => call[0] === 'change')[1];
        });

        async function triggerFileLoad(mockData) {
            mockXLSX.read.mockReturnValue({
                SheetNames: ['Sheet1'],
                Sheets: { Sheet1: {} }
            });
            mockXLSX.utils.sheet_to_json.mockReturnValue(mockData);

            const mockFile = new File([''], 'test.xlsx', {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            await changeHandler({ target: { files: [mockFile], value: 'test.xlsx' } });
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        it('maps all known labels correctly', async () => {
            await triggerFileLoad([
                ['Project Name', 'Marina Heights'],
                ['Unit No', 'A-101'],
                ['Unit Type', 'Apartment'],
                ['Views', 'Sea View'],
                ['Internal Area (sq.ft)', 1200],
                ['Balcony Area (sq.ft)', 100],
                ['Total Area (sq.ft)', 1300],
                ['Original Price', 2500000],
                ['Selling Price', 2800000],
                ['Paid Percentage', 0.30],
                ['Resale Clause', 0.05],
                ['Balance Resale Clause (AED)', 50000],
                ['Admin Fees (SaaS)', 10000],
                ['ADGM (2% of Original Price)', 50000],
                ['ADGM Termination Fee', 1500],
                ['ADGM Electronic Service Fee', 500],
                ['Agency Fees (2% of Selling Price + VAT)', 58800]
            ]);

            expect(setValue).toHaveBeenCalledWith('input-project-name', 'Marina Heights');
            expect(setValue).toHaveBeenCalledWith('u_unit_number', 'A-101');
            expect(setValue).toHaveBeenCalledWith('u_unit_type', 'Apartment');
            expect(setValue).toHaveBeenCalledWith('u_views', 'Sea View');
            expect(setValue).toHaveBeenCalledWith('input-internal-area', 1200);
            expect(setValue).toHaveBeenCalledWith('input-balcony-area', 100);
            expect(setValue).toHaveBeenCalledWith('input-total-area', 1300);
            expect(setValue).toHaveBeenCalledWith('u_original_price', 2500000);
            expect(setValue).toHaveBeenCalledWith('u_selling_price', 2800000);
            expect(setValue).toHaveBeenCalledWith('u_amount_paid_percent', 30);
            expect(setValue).toHaveBeenCalledWith('u_resale_clause', 5);
            expect(setValue).toHaveBeenCalledWith('u_balance_resale', 50000);
            expect(setValue).toHaveBeenCalledWith('input-admin-fees', 10000);
            expect(setValue).toHaveBeenCalledWith('u_adgm_transfer', 50000);
            expect(setValue).toHaveBeenCalledWith('u_adgm_termination_fee', 1500);
            expect(setValue).toHaveBeenCalledWith('u_adgm_electronic_fee', 500);
            expect(setValue).toHaveBeenCalledWith('input-agency-fees', 58800);
        });

        it('handles case-insensitive labels', async () => {
            await triggerFileLoad([
                ['PROJECT NAME', 'Test'],
                ['UNIT NO', 'B-202'],
                ['original price', 1000000]
            ]);

            expect(setValue).toHaveBeenCalledWith('input-project-name', 'Test');
            expect(setValue).toHaveBeenCalledWith('u_unit_number', 'B-202');
            expect(setValue).toHaveBeenCalledWith('u_original_price', 1000000);
        });

        it('handles labels with extra whitespace', async () => {
            await triggerFileLoad([
                ['  Project Name  ', 'Test'],
                ['Unit No ', 'C-303'],
                [' Original Price', 1000000]
            ]);

            expect(setValue).toHaveBeenCalledWith('input-project-name', 'Test');
            expect(setValue).toHaveBeenCalledWith('u_unit_number', 'C-303');
            expect(setValue).toHaveBeenCalledWith('u_original_price', 1000000);
        });
    });
});
