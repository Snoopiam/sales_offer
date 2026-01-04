/**
 * PDF Generator Module Tests
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the helper module
vi.mock('../js/utils/helpers.js', () => ({
    getById: vi.fn(),
    getValue: vi.fn()
}));

// Mock the templates module
vi.mock('../js/modules/templates.js', () => ({
    getCurrentTemplate: vi.fn()
}));

// Mock the fonts module
vi.mock('../js/fonts/montserrat-fonts.js', () => ({
    MontserratBlack: 'mock-black-font-base64',
    MontserratBold: 'mock-bold-font-base64',
    MontserratSemiBold: 'mock-semibold-font-base64',
    MontserratRegular: 'mock-regular-font-base64'
}));

import { generateTextPDF } from '../js/modules/pdfGenerator.js';
import { getById, getValue } from '../js/utils/helpers.js';
import { getCurrentTemplate } from '../js/modules/templates.js';

describe('PDF Generator Module', () => {
    let mockDoc;
    let mockJsPDF;
    let mockElements;
    let jsPDFCallArgs;

    beforeEach(() => {
        vi.clearAllMocks();
        jsPDFCallArgs = null;

        // Create mock jsPDF document
        mockDoc = {
            setFillColor: vi.fn(),
            setDrawColor: vi.fn(),
            setTextColor: vi.fn(),
            setFontSize: vi.fn(),
            setFont: vi.fn(),
            rect: vi.fn(),
            line: vi.fn(),
            text: vi.fn(),
            addImage: vi.fn(),
            save: vi.fn(),
            addFileToVFS: vi.fn(),
            addFont: vi.fn()
        };

        // Mock jsPDF as a class constructor
        mockJsPDF = class MockJsPDF {
            constructor(options) {
                jsPDFCallArgs = options;
                Object.assign(this, mockDoc);
            }
        };
        window.jspdf = { jsPDF: mockJsPDF };

        // Mock getComputedStyle
        vi.spyOn(window, 'getComputedStyle').mockReturnValue({
            getPropertyValue: vi.fn(() => '#62c6c1')
        });

        // Setup mock DOM elements
        mockElements = {
            logoImg: {
                src: 'data:image/png;base64,logo123',
                naturalWidth: 200,
                naturalHeight: 100
            },
            floorPlanImg: {
                src: 'data:image/jpeg;base64,floorplan123',
                naturalWidth: 800,
                naturalHeight: 600
            },
            disp_title: { textContent: '2 Bedroom Apartment' },
            'display-unit-number': { textContent: 'A-101' },
            disp_unit_type: { textContent: 'Apartment' },
            disp_views: { textContent: 'Sea View' },
            disp_internal: { textContent: '1,200' },
            disp_balcony: { textContent: '150' },
            'display-total-area': { textContent: '1,350' },
            disp_original_price: { textContent: 'AED 2,500,000' },
            disp_selling_price: { textContent: 'AED 2,800,000' },
            disp_refund: { textContent: 'AED 750,000' },
            disp_balance_resale: { textContent: 'AED 50,000' },
            disp_premium: { textContent: 'AED 300,000' },
            disp_admin_fees: { textContent: 'AED 10,000' },
            disp_adgm_transfer: { textContent: 'AED 50,000' },
            disp_adgm_termination: { textContent: 'AED 1,500' },
            disp_adgm_electronic: { textContent: 'AED 500' },
            disp_agency_fees: { textContent: 'AED 58,800' },
            disp_total: { textContent: 'AED 1,220,800' },
            disp_row_original_price: { style: { display: '' } },
            disp_row_refund: { style: { display: '' } },
            disp_row_balance_resale: { style: { display: '' } },
            disp_row_premium: { style: { display: '' } },
            propertyStatusTable: { style: { display: 'none' } },
            previewPaymentPlanTable: { style: { display: '' } },
            paymentPlanTitle: { textContent: 'PAYMENT PLAN (30:70)' },
            payment_plan_tbody: {
                children: [
                    {
                        querySelectorAll: () => [
                            { textContent: '15 Jan 2024' },
                            { textContent: '10%' },
                            { textContent: 'AED 280,000' }
                        ]
                    },
                    {
                        querySelectorAll: () => [
                            { textContent: '15 Jul 2024' },
                            { textContent: '20%' },
                            { textContent: 'AED 560,000' }
                        ]
                    }
                ]
            },
            disp_project_footer: { textContent: 'Marina Heights' }
        };

        // Mock $ function
        getById.mockImplementation((id) => mockElements[id] || null);

        // Mock getValue
        getValue.mockImplementation((id) => {
            const values = {
                'u_unit_model': '2BR + Maid',
                'input-project-name': 'Marina Heights Tower'
            };
            return values[id] || '';
        });

        // Mock document.querySelector
        vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
            if (selector === '.created-by-footer') {
                return { textContent: 'Created by Kennedy Properties' };
            }
            return null;
        });

        // Default template
        getCurrentTemplate.mockReturnValue('landscape');
    });

    afterEach(() => {
        delete window.jspdf;
        vi.restoreAllMocks();
    });

    describe('generateTextPDF', () => {
        it('creates a jsPDF document with correct orientation for landscape', async () => {
            getCurrentTemplate.mockReturnValue('landscape');

            await generateTextPDF('test-offer');

            expect(jsPDFCallArgs).toEqual({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
                compress: true
            });
        });

        it('creates a jsPDF document with correct orientation for portrait', async () => {
            getCurrentTemplate.mockReturnValue('portrait');

            await generateTextPDF('test-offer');

            expect(jsPDFCallArgs).toEqual({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });
        });

        it('saves the PDF with correct filename', async () => {
            await generateTextPDF('marina-heights');

            expect(mockDoc.save).toHaveBeenCalledWith('marina-heights.pdf');
        });

        it('returns true on success', async () => {
            const result = await generateTextPDF('test');

            expect(result).toBe(true);
        });

        it('draws the header bar with primary color', async () => {
            await generateTextPDF('test');

            expect(mockDoc.setFillColor).toHaveBeenCalledWith(98, 198, 193);
            expect(mockDoc.rect).toHaveBeenCalled();
        });

        it('uses custom brand color when available', async () => {
            window.getComputedStyle.mockReturnValue({
                getPropertyValue: vi.fn(() => '#ff5500')
            });

            await generateTextPDF('test');

            expect(mockDoc.setFillColor).toHaveBeenCalledWith(255, 85, 0);
        });

        it('falls back to default color when brand color is empty', async () => {
            window.getComputedStyle.mockReturnValue({
                getPropertyValue: vi.fn(() => '')
            });

            await generateTextPDF('test');

            // Default color: #62c6c1 = [98, 198, 193]
            expect(mockDoc.setFillColor).toHaveBeenCalledWith(98, 198, 193);
        });
    });

    describe('drawLogo', () => {
        it('adds logo image when available', async () => {
            await generateTextPDF('test');

            expect(mockDoc.addImage).toHaveBeenCalledWith(
                'data:image/png;base64,logo123',
                'PNG',
                expect.any(Number), // logoX
                expect.any(Number), // logoY
                34, // 130px ≈ 34mm
                17, // 65px ≈ 17mm
                undefined,
                'FAST'
            );
        });

        it('includes default logo (KP_blACK) to match live preview', async () => {
            mockElements.logoImg.src = 'path/to/KP_blACK_logo.png';

            await generateTextPDF('test');

            // Logo should now be included to match live preview
            const addImageCalls = mockDoc.addImage.mock.calls;
            const logoCalls = addImageCalls.filter(call => call[0].includes('KP_blACK'));
            expect(logoCalls.length).toBe(1);
        });

        it('skips logo when logoImg is not found', async () => {
            getById.mockImplementation((id) => {
                if (id === 'logoImg') return null;
                return mockElements[id] || null;
            });

            await generateTextPDF('test');

            // Should still complete without error
            expect(mockDoc.save).toHaveBeenCalled();
        });

        it('handles logo addImage error gracefully', async () => {
            mockDoc.addImage.mockImplementation((src, format, x, y, w, h) => {
                if (src.includes('logo')) {
                    throw new Error('Failed to add image');
                }
            });

            // Should not throw
            await expect(generateTextPDF('test')).resolves.toBe(true);
        });
    });

    describe('drawMainTitle', () => {
        it('uses unit model value for title', async () => {
            getValue.mockImplementation((id) => {
                if (id === 'select-unit-model') return '3BR + Maid + Laundry';
                return '';
            });

            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                '3BR + MAID + LAUNDRY',
                expect.any(Number),
                expect.any(Number)
            );
        });

        it('falls back to disp_title when unit model is empty', async () => {
            getValue.mockReturnValue('');
            mockElements.disp_title = { textContent: 'Studio Apartment' };

            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'STUDIO APARTMENT',
                expect.any(Number),
                expect.any(Number)
            );
        });

        it('falls back to dash when both are unavailable', async () => {
            getValue.mockReturnValue('');
            getById.mockImplementation((id) => {
                if (id === 'disp_title') return null;
                return mockElements[id] || null;
            });

            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                '-',
                expect.any(Number),
                expect.any(Number)
            );
        });
    });

    describe('drawPropertyDetailsTable', () => {
        it('draws property details section', async () => {
            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'PROPERTY DETAILS',
                expect.any(Number),
                expect.any(Number)
            );
        });

        it('includes all property detail rows', async () => {
            await generateTextPDF('test');

            // Check that property detail labels are drawn
            expect(mockDoc.text).toHaveBeenCalledWith(
                'Unit No',
                expect.any(Number),
                expect.any(Number)
            );
            expect(mockDoc.text).toHaveBeenCalledWith(
                'Unit Type',
                expect.any(Number),
                expect.any(Number)
            );
            expect(mockDoc.text).toHaveBeenCalledWith(
                'Views',
                expect.any(Number),
                expect.any(Number)
            );
        });
    });

    describe('drawFinancialTable', () => {
        it('draws financial breakdown section', async () => {
            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'FINANCIAL BREAKDOWN',
                expect.any(Number),
                expect.any(Number)
            );
        });

        it('includes selling price', async () => {
            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'Selling Price',
                expect.any(Number),
                expect.any(Number)
            );
        });

        it('hides original price when row is hidden', async () => {
            mockElements.disp_row_original_price = { style: { display: 'none' } };

            await generateTextPDF('test');

            const textCalls = mockDoc.text.mock.calls.map(call => call[0]);
            expect(textCalls).not.toContain('Original Price');
        });

        it('shows off-plan specific rows when visible', async () => {
            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'Refund (Amount Paid to Developer)',
                expect.any(Number),
                expect.any(Number)
            );
            expect(mockDoc.text).toHaveBeenCalledWith(
                'Premium',
                expect.any(Number),
                expect.any(Number)
            );
        });

        it('hides off-plan rows when not visible', async () => {
            mockElements.disp_row_refund = { style: { display: 'none' } };
            mockElements.disp_row_balance_resale = { style: { display: 'none' } };
            mockElements.disp_row_premium = { style: { display: 'none' } };

            await generateTextPDF('test');

            const textCalls = mockDoc.text.mock.calls.map(call => call[0]);
            expect(textCalls).not.toContain('Refund (Amount Paid to Developer)');
            expect(textCalls).not.toContain('Balance Resale Clause');
            expect(textCalls).not.toContain('Premium');
        });
    });

    describe('drawPropertyStatusTable', () => {
        it('skips when propertyStatusTable is hidden', async () => {
            mockElements.propertyStatusTable = { style: { display: 'none' } };

            await generateTextPDF('test');

            const textCalls = mockDoc.text.mock.calls.map(call => call[0]);
            expect(textCalls).not.toContain('PROPERTY STATUS');
        });

        it('draws property status when visible', async () => {
            mockElements.propertyStatusTable = { style: { display: '' } };
            mockElements.disp_row_projecthandover = { style: { display: '' } };
            mockElements.disp_projecthandover = { textContent: 'Q4 2023' };

            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'PROPERTY STATUS',
                expect.any(Number),
                expect.any(Number)
            );
        });

        it('includes visible status rows', async () => {
            mockElements.propertyStatusTable = { style: { display: '' } };
            mockElements.disp_row_projecthandover = { style: { display: '' } };
            mockElements.disp_projecthandover = { textContent: 'Q4 2023' };
            mockElements.disp_row_occupancy = { style: { display: '' } };
            mockElements.disp_occupancy = { textContent: 'Vacant' };

            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'Project Completion',
                expect.any(Number),
                expect.any(Number)
            );
            expect(mockDoc.text).toHaveBeenCalledWith(
                'Status',
                expect.any(Number),
                expect.any(Number)
            );
        });
    });

    describe('drawPaymentPlanTable', () => {
        it('draws payment plan when visible', async () => {
            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'PAYMENT PLAN (30:70)',
                expect.any(Number),
                expect.any(Number)
            );
        });

        it('draws payment plan header row', async () => {
            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'Date Of Payment',
                expect.any(Number),
                expect.any(Number)
            );
            expect(mockDoc.text).toHaveBeenCalledWith(
                '%',
                expect.any(Number),
                expect.any(Number)
            );
        });

        it('draws payment plan data rows', async () => {
            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                '15 Jan 2024',
                expect.any(Number),
                expect.any(Number)
            );
            expect(mockDoc.text).toHaveBeenCalledWith(
                '10%',
                expect.any(Number),
                expect.any(Number)
            );
        });

        it('skips when payment plan table is hidden', async () => {
            mockElements.previewPaymentPlanTable = { style: { display: 'none' } };

            await generateTextPDF('test');

            const textCalls = mockDoc.text.mock.calls.map(call => call[0]);
            expect(textCalls).not.toContain('Date Of Payment');
        });

        it('skips when payment_plan_tbody has no children', async () => {
            mockElements.payment_plan_tbody = { children: [] };

            await generateTextPDF('test');

            const textCalls = mockDoc.text.mock.calls.map(call => call[0]);
            expect(textCalls).not.toContain('Date Of Payment');
        });

        it('uses default title when paymentPlanTitle not found', async () => {
            getById.mockImplementation((id) => {
                if (id === 'paymentPlanTitle') return null;
                return mockElements[id] || null;
            });

            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'PAYMENT PLAN',
                expect.any(Number),
                expect.any(Number)
            );
        });
    });

    describe('drawFloorPlanImage', () => {
        it('adds floor plan image when available', async () => {
            await generateTextPDF('test');

            expect(mockDoc.addImage).toHaveBeenCalledWith(
                'data:image/jpeg;base64,floorplan123',
                'JPEG',
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                undefined,
                'MEDIUM'
            );
        });

        it('includes placeholder floor plan (Asset) to match live preview', async () => {
            mockElements.floorPlanImg.src = 'path/to/Asset_placeholder.png';

            await generateTextPDF('test');

            // Floor plan should now be included to match live preview
            const addImageCalls = mockDoc.addImage.mock.calls;
            const floorPlanCalls = addImageCalls.filter(call => call[0].includes('Asset'));
            expect(floorPlanCalls.length).toBe(1);
        });

        it('skips floor plan when floorPlanImg is not found', async () => {
            getById.mockImplementation((id) => {
                if (id === 'floorPlanImg') return null;
                return mockElements[id] || null;
            });

            await generateTextPDF('test');

            // Should complete without error
            expect(mockDoc.save).toHaveBeenCalled();
        });

        it('uses PNG format for PNG images', async () => {
            mockElements.floorPlanImg.src = 'data:image/png;base64,pngimage';

            await generateTextPDF('test');

            expect(mockDoc.addImage).toHaveBeenCalledWith(
                expect.stringContaining('png'),
                'PNG',
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                undefined,
                'MEDIUM'
            );
        });

        it('handles floor plan addImage error gracefully', async () => {
            mockDoc.addImage.mockImplementation((src) => {
                if (src.includes('floorplan')) {
                    throw new Error('Failed to add floor plan');
                }
            });

            await expect(generateTextPDF('test')).resolves.toBe(true);
        });
    });

    describe('drawFooter', () => {
        it('draws project name in footer', async () => {
            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'MARINA HEIGHTS TOWER',
                expect.any(Number),
                expect.any(Number),
                { align: 'right' }
            );
        });

        it('falls back to disp_project_footer when getValue returns empty', async () => {
            getValue.mockReturnValue('');
            mockElements.disp_project_footer = { textContent: 'Fallback Project' };

            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'FALLBACK PROJECT',
                expect.any(Number),
                expect.any(Number),
                { align: 'right' }
            );
        });

        it('draws SALE OFFER text', async () => {
            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'SALE OFFER',
                expect.any(Number),
                expect.any(Number),
                { align: 'right' }
            );
        });

        it('draws created by footer when element exists', async () => {
            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'CREATED BY KENNEDY PROPERTIES',
                expect.any(Number),
                expect.any(Number),
                { align: 'center' }
            );
        });

        it('skips created by footer when element not found', async () => {
            document.querySelector.mockReturnValue(null);

            await generateTextPDF('test');

            const textCalls = mockDoc.text.mock.calls;
            const createdByCalls = textCalls.filter(call =>
                typeof call[0] === 'string' && call[0].includes('KENNEDY')
            );
            expect(createdByCalls.length).toBe(0);
        });
    });

    describe('getDisplayValue', () => {
        it('returns element textContent when element exists', async () => {
            mockElements['display-unit-number'] = { textContent: '  B-202  ' };

            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                'B-202',
                expect.any(Number),
                expect.any(Number),
                expect.anything()
            );
        });

        it('returns "-" when element not found', async () => {
            getById.mockImplementation((id) => {
                if (id === 'display-unit-number') return null;
                return mockElements[id] || null;
            });

            await generateTextPDF('test');

            expect(mockDoc.text).toHaveBeenCalledWith(
                '-',
                expect.any(Number),
                expect.any(Number),
                expect.anything()
            );
        });

        it('returns "-" when element textContent is empty', async () => {
            mockElements.disp_views = { textContent: '   ' };

            await generateTextPDF('test');

            // Should use '-' for empty content
            expect(mockDoc.text).toHaveBeenCalledWith(
                '-',
                expect.any(Number),
                expect.any(Number),
                expect.anything()
            );
        });
    });

    describe('hexToRgb', () => {
        it('converts hex color correctly', async () => {
            window.getComputedStyle.mockReturnValue({
                getPropertyValue: vi.fn(() => '#ff0000')
            });

            await generateTextPDF('test');

            expect(mockDoc.setFillColor).toHaveBeenCalledWith(255, 0, 0);
        });

        it('handles hex without # prefix', async () => {
            window.getComputedStyle.mockReturnValue({
                getPropertyValue: vi.fn(() => '00ff00')
            });

            await generateTextPDF('test');

            expect(mockDoc.setFillColor).toHaveBeenCalledWith(0, 255, 0);
        });

        it('returns default color for invalid hex', async () => {
            window.getComputedStyle.mockReturnValue({
                getPropertyValue: vi.fn(() => 'invalid')
            });

            await generateTextPDF('test');

            // Default color: [98, 198, 193]
            expect(mockDoc.setFillColor).toHaveBeenCalledWith(98, 198, 193);
        });
    });

    describe('page dimensions', () => {
        it('uses landscape dimensions (297x210) for landscape template', async () => {
            getCurrentTemplate.mockReturnValue('landscape');

            await generateTextPDF('test');

            // Header bar should span full width (297mm for landscape)
            expect(mockDoc.rect).toHaveBeenCalledWith(0, 0, 297, 8, 'F');
        });

        it('uses portrait dimensions (210x297) for portrait template', async () => {
            getCurrentTemplate.mockReturnValue('portrait');

            await generateTextPDF('test');

            // Header bar should span full width (210mm for portrait)
            expect(mockDoc.rect).toHaveBeenCalledWith(0, 0, 210, 8, 'F');
        });
    });
});
