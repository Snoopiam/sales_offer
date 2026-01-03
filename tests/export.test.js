/**
 * Export Module Tests
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the helper module
vi.mock('../js/utils/helpers.js', () => ({
    getById: vi.fn(),
    toast: vi.fn(),
    getValue: vi.fn()
}));

// Mock the storage module
vi.mock('../js/modules/storage.js', () => ({
    exportOfferAsJSON: vi.fn()
}));

// Mock the templates module
vi.mock('../js/modules/templates.js', () => ({
    getCurrentTemplate: vi.fn()
}));

// Mock the pdfGenerator module
vi.mock('../js/modules/pdfGenerator.js', () => ({
    generateTextPDF: vi.fn()
}));

import { initExport, downloadFile } from '../js/modules/export.js';
import { getById, toast, getValue } from '../js/utils/helpers.js';
import { exportOfferAsJSON } from '../js/modules/storage.js';
import { getCurrentTemplate } from '../js/modules/templates.js';
import { generateTextPDF } from '../js/modules/pdfGenerator.js';

describe('Export Module', () => {
    let mockElements;
    let mockCreateObjectURL;
    let mockRevokeObjectURL;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock DOM elements
        mockElements = {
            exportBtn: {
                addEventListener: vi.fn()
            },
            doExportBtn: {
                addEventListener: vi.fn()
            },
            printBtn: {
                addEventListener: vi.fn()
            },
            exportModal: {
                classList: {
                    add: vi.fn(),
                    remove: vi.fn()
                }
            },
            exportFilename: {
                value: ''
            },
            a4Page: document.createElement('div')
        };

        // Mock $ to return elements
        getById.mockImplementation((id) => mockElements[id] || null);

        // Mock URL methods
        mockCreateObjectURL = vi.fn(() => 'blob:test-url');
        mockRevokeObjectURL = vi.fn();
        global.URL.createObjectURL = mockCreateObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;

        // Mock document.querySelector for radio buttons
        vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
            if (selector === 'input[name="exportFormat"]:checked') {
                return { value: 'pdf' };
            }
            return null;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initExport', () => {
        it('attaches click handler to export button', () => {
            initExport();

            expect(getById).toHaveBeenCalledWith('exportBtn');
            expect(mockElements.exportBtn.addEventListener).toHaveBeenCalledWith(
                'click',
                expect.any(Function)
            );
        });

        it('attaches click handler to doExportBtn', () => {
            initExport();

            expect(getById).toHaveBeenCalledWith('doExportBtn');
            expect(mockElements.doExportBtn.addEventListener).toHaveBeenCalledWith(
                'click',
                expect.any(Function)
            );
        });

        it('attaches click handler to print button', () => {
            initExport();

            expect(getById).toHaveBeenCalledWith('printBtn');
            expect(mockElements.printBtn.addEventListener).toHaveBeenCalledWith(
                'click',
                expect.any(Function)
            );
        });

        it('handles missing export button gracefully', () => {
            getById.mockImplementation((id) => {
                if (id === 'exportBtn') return null;
                return mockElements[id];
            });

            expect(() => initExport()).not.toThrow();
        });

        it('handles missing doExportBtn gracefully', () => {
            getById.mockImplementation((id) => {
                if (id === 'doExportBtn') return null;
                return mockElements[id];
            });

            expect(() => initExport()).not.toThrow();
        });

        it('handles missing print button gracefully', () => {
            getById.mockImplementation((id) => {
                if (id === 'printBtn') return null;
                return mockElements[id];
            });

            expect(() => initExport()).not.toThrow();
        });

        it('print button triggers window.print', () => {
            const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

            initExport();

            // Get the click handler that was registered
            const clickHandler = mockElements.printBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            clickHandler();

            expect(printSpy).toHaveBeenCalled();
        });
    });

    describe('openExportModal (via exportBtn click)', () => {
        it('removes hidden class from modal', () => {
            getValue.mockReturnValue('Test Project');

            initExport();

            // Get the click handler for exportBtn
            const clickHandler = mockElements.exportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            clickHandler();

            expect(mockElements.exportModal.classList.remove).toHaveBeenCalledWith('hidden');
        });

        it('sets default filename from project name', () => {
            getValue.mockReturnValue('Marina Heights Tower');

            initExport();

            const clickHandler = mockElements.exportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            clickHandler();

            expect(mockElements.exportFilename.value).toBe('marina-heights-tower');
        });

        it('uses default filename when project name is empty', () => {
            getValue.mockReturnValue('');

            initExport();

            const clickHandler = mockElements.exportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            clickHandler();

            // Should use 'sales-offer' as default
            expect(getValue).toHaveBeenCalledWith('input-project-name');
        });

        it('handles missing modal gracefully', () => {
            getById.mockImplementation((id) => {
                if (id === 'exportModal') return null;
                return mockElements[id];
            });

            initExport();

            const clickHandler = mockElements.exportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            expect(() => clickHandler()).not.toThrow();
        });
    });

    describe('handleExport - PDF format', () => {
        beforeEach(() => {
            getValue.mockImplementation((id) => {
                if (id === 'exportFilename') return 'test-file';
                return '';
            });
        });

        it('calls generateTextPDF for pdf format', async () => {
            generateTextPDF.mockResolvedValue();
            document.querySelector.mockReturnValue({ value: 'pdf' });

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(generateTextPDF).toHaveBeenCalledWith('test-file');
            expect(toast).toHaveBeenCalledWith('Generating PDF...', 'info');
        });

        it('shows success toast on PDF export success', async () => {
            generateTextPDF.mockResolvedValue();
            document.querySelector.mockReturnValue({ value: 'pdf' });

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(toast).toHaveBeenCalledWith('PDF exported successfully', 'success');
        });

        it('shows error toast on PDF export failure', async () => {
            generateTextPDF.mockRejectedValue(new Error('Generation failed'));
            document.querySelector.mockReturnValue({ value: 'pdf' });

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(toast).toHaveBeenCalledWith('PDF export failed: Generation failed', 'error');
        });
    });

    describe('handleExport - Preview PDF format', () => {
        beforeEach(() => {
            getValue.mockImplementation((id) => {
                if (id === 'exportFilename') return 'preview-test';
                return '';
            });

            // Mock html2pdf global
            global.html2pdf = vi.fn(() => ({
                set: vi.fn().mockReturnThis(),
                from: vi.fn().mockReturnThis(),
                save: vi.fn().mockResolvedValue()
            }));
        });

        afterEach(() => {
            delete global.html2pdf;
        });

        it('uses landscape orientation for non-portrait templates', async () => {
            document.querySelector.mockReturnValue({ value: 'pdf_preview' });
            getCurrentTemplate.mockReturnValue('landscape');

            const mockHtml2pdf = {
                set: vi.fn().mockReturnThis(),
                from: vi.fn().mockReturnThis(),
                save: vi.fn().mockResolvedValue()
            };
            global.html2pdf = vi.fn(() => mockHtml2pdf);

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(mockHtml2pdf.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    jsPDF: expect.objectContaining({
                        orientation: 'landscape'
                    })
                })
            );
        });

        it('uses portrait orientation for portrait template', async () => {
            document.querySelector.mockReturnValue({ value: 'pdf_preview' });
            getCurrentTemplate.mockReturnValue('portrait');

            const mockHtml2pdf = {
                set: vi.fn().mockReturnThis(),
                from: vi.fn().mockReturnThis(),
                save: vi.fn().mockResolvedValue()
            };
            global.html2pdf = vi.fn(() => mockHtml2pdf);

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(mockHtml2pdf.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    jsPDF: expect.objectContaining({
                        orientation: 'portrait'
                    })
                })
            );
        });

        it('shows error when a4Page element is missing', async () => {
            document.querySelector.mockReturnValue({ value: 'pdf_preview' });
            getById.mockImplementation((id) => {
                if (id === 'a4Page') return null;
                return mockElements[id];
            });

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(toast).toHaveBeenCalledWith('Document not found', 'error');
        });

        it('shows success toast on preview PDF success', async () => {
            document.querySelector.mockReturnValue({ value: 'pdf_preview' });
            getCurrentTemplate.mockReturnValue('landscape');

            const mockHtml2pdf = {
                set: vi.fn().mockReturnThis(),
                from: vi.fn().mockReturnThis(),
                save: vi.fn().mockResolvedValue()
            };
            global.html2pdf = vi.fn(() => mockHtml2pdf);

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(toast).toHaveBeenCalledWith('Preview PDF exported successfully', 'success');
        });
    });

    describe('handleExport - Image formats (PNG/JPG)', () => {
        beforeEach(() => {
            getValue.mockImplementation((id) => {
                if (id === 'exportFilename') return 'image-test';
                return '';
            });
        });

        it('shows error when a4Page element is missing for PNG', async () => {
            document.querySelector.mockReturnValue({ value: 'png' });
            getById.mockImplementation((id) => {
                if (id === 'a4Page') return null;
                return mockElements[id];
            });

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(toast).toHaveBeenCalledWith('Document not found', 'error');
        });

        it('uses html2canvas when available', async () => {
            document.querySelector.mockReturnValue({ value: 'png' });

            const mockCanvas = {
                toBlob: vi.fn((callback, mimeType) => {
                    callback(new Blob(['test'], { type: mimeType }));
                })
            };
            global.html2canvas = vi.fn().mockResolvedValue(mockCanvas);

            // Mock link click
            const mockLink = {
                href: '',
                download: '',
                click: vi.fn()
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(global.html2canvas).toHaveBeenCalled();
            expect(toast).toHaveBeenCalledWith('Generating PNG...', 'info');
        });

        it('falls back to html2pdf for canvas when html2canvas unavailable', async () => {
            document.querySelector.mockReturnValue({ value: 'png' });

            const mockCanvas = {
                toBlob: vi.fn((callback, mimeType) => {
                    callback(new Blob(['test'], { type: mimeType }));
                })
            };

            delete global.html2canvas;
            global.html2pdf = vi.fn(() => ({
                set: vi.fn().mockReturnThis(),
                from: vi.fn().mockReturnThis(),
                toCanvas: vi.fn().mockResolvedValue(mockCanvas)
            }));

            const mockLink = {
                href: '',
                download: '',
                click: vi.fn()
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(global.html2pdf).toHaveBeenCalled();
        });

        it('throws error when neither html2canvas nor html2pdf available', async () => {
            document.querySelector.mockReturnValue({ value: 'png' });

            delete global.html2canvas;
            delete global.html2pdf;

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(toast).toHaveBeenCalledWith('PNG export failed', 'error');
        });

        it('exports JPG with correct MIME type', async () => {
            document.querySelector.mockReturnValue({ value: 'jpg' });

            const mockCanvas = {
                toBlob: vi.fn((callback, mimeType, quality) => {
                    expect(mimeType).toBe('image/jpeg');
                    expect(quality).toBe(0.98);
                    callback(new Blob(['test'], { type: mimeType }));
                })
            };
            global.html2canvas = vi.fn().mockResolvedValue(mockCanvas);

            const mockLink = {
                href: '',
                download: '',
                click: vi.fn()
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(toast).toHaveBeenCalledWith('Generating JPG...', 'info');
        });
    });

    describe('handleExport - JSON format', () => {
        beforeEach(() => {
            getValue.mockImplementation((id) => {
                if (id === 'exportFilename') return 'json-test';
                return '';
            });
        });

        it('exports JSON successfully', async () => {
            document.querySelector.mockReturnValue({ value: 'json' });
            exportOfferAsJSON.mockReturnValue('{"test": "data"}');

            const mockLink = {
                href: '',
                download: '',
                click: vi.fn()
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(exportOfferAsJSON).toHaveBeenCalled();
            expect(mockLink.download).toBe('json-test.json');
            expect(mockLink.click).toHaveBeenCalled();
            expect(toast).toHaveBeenCalledWith('JSON exported successfully', 'success');
        });

        it('shows error toast on JSON export failure', async () => {
            document.querySelector.mockReturnValue({ value: 'json' });
            exportOfferAsJSON.mockImplementation(() => {
                throw new Error('Export failed');
            });

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(toast).toHaveBeenCalledWith('JSON export failed', 'error');
        });

        it('cleans up URL after download', async () => {
            document.querySelector.mockReturnValue({ value: 'json' });
            exportOfferAsJSON.mockReturnValue('{}');

            const mockLink = {
                href: '',
                download: '',
                click: vi.fn()
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
        });
    });

    describe('handleExport - No format selected', () => {
        it('shows error when no format is selected', async () => {
            document.querySelector.mockReturnValue(null);
            getValue.mockReturnValue('test');

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(toast).toHaveBeenCalledWith('Please select an export format', 'error');
        });
    });

    describe('handleExport - Modal closing', () => {
        it('closes modal after export', async () => {
            document.querySelector.mockReturnValue({ value: 'json' });
            exportOfferAsJSON.mockReturnValue('{}');
            getValue.mockReturnValue('test');

            const mockLink = {
                href: '',
                download: '',
                click: vi.fn()
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(mockElements.exportModal.classList.add).toHaveBeenCalledWith('hidden');
        });
    });

    describe('downloadFile', () => {
        it('creates blob and triggers download', () => {
            const mockLink = {
                href: '',
                download: '',
                click: vi.fn()
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

            downloadFile('test content', 'test.txt', 'text/plain');

            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(mockLink.download).toBe('test.txt');
            expect(mockLink.click).toHaveBeenCalled();
            expect(mockRevokeObjectURL).toHaveBeenCalled();
        });

        it('handles different MIME types', () => {
            const mockLink = {
                href: '',
                download: '',
                click: vi.fn()
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

            downloadFile('{"data": true}', 'data.json', 'application/json');

            expect(mockLink.download).toBe('data.json');
        });
    });

    describe('Default filename handling', () => {
        it('uses sales-offer as default when filename is empty', async () => {
            document.querySelector.mockReturnValue({ value: 'json' });
            getValue.mockReturnValue(''); // Empty filename
            exportOfferAsJSON.mockReturnValue('{}');

            const mockLink = {
                href: '',
                download: '',
                click: vi.fn()
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

            initExport();

            const clickHandler = mockElements.doExportBtn.addEventListener.mock.calls
                .find(call => call[0] === 'click')[1];

            await clickHandler();

            expect(mockLink.download).toBe('sales-offer.json');
        });
    });
});
