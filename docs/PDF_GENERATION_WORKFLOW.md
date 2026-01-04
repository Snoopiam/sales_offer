# PDF Generation Workflow

**Document Version:** 1.0
**Last Updated:** 2026-01-04
**Status:** Verified

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Entry Points](#entry-points)
4. [Execution Flow](#execution-flow)
5. [Function Reference](#function-reference)
6. [Layout Specifications](#layout-specifications)
7. [Data Sources](#data-sources)
8. [Error Handling](#error-handling)

---

## Overview

The Sales Offer Generator provides two distinct PDF export methods:

| Method | File | Library | Text | Use Case |
|--------|------|---------|------|----------|
| Text-based PDF | `pdfGenerator.js` | jsPDF | Selectable | Professional documents, searchable |
| Preview PDF | `export.js` | html2pdf | Non-selectable | Visual match to screen |

This document focuses on the **text-based PDF generation** workflow which produces professional, searchable PDFs with selectable text.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  index.html                                                              │
│  ├── Export Button (#exportBtn)                    Line 765             │
│  ├── Export Modal (#exportModal)                   Line 1131            │
│  │   ├── PDF Radio (#exportFormat=pdf)             Line 1141            │
│  │   └── Export Button (#doExportBtn)              Line 1183            │
│  └── jsPDF CDN Scripts                             Lines 93, 99         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│  js/app.js                                                               │
│  ├── import { initExport }                         Line 14              │
│  └── initExport()                                  Line 32              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           EXPORT MODULE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  js/modules/export.js                                                    │
│  ├── import { generateTextPDF }                    Line 9               │
│  ├── initExport()                                  Line 14              │
│  │   └── doExportBtn.addEventListener('click', handleExport)            │
│  ├── handleExport()                                Line 56              │
│  │   └── case 'pdf': await exportPDF(filename)     Line 62              │
│  └── exportPDF(filename)                           Line 89              │
│       └── await generateTextPDF(filename)          Line 93              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        PDF GENERATOR MODULE                              │
├─────────────────────────────────────────────────────────────────────────┤
│  js/modules/pdfGenerator.js                                              │
│  ├── generateTextPDF(filename)                     Line 14              │
│  ├── drawHeaderBar()                               Line 79              │
│  ├── drawLogo()                                    Line 88              │
│  ├── drawMainTitle()                               Line 107             │
│  ├── drawPropertyDetailsTable()                    Line 120             │
│  ├── drawFinancialTable()                          Line 138             │
│  ├── drawPropertyStatusTable()                     Line 175             │
│  ├── drawPaymentPlanTable()                        Line 210             │
│  ├── drawFloorPlanImage()                          Line 260             │
│  ├── drawFooter()                                  Line 296             │
│  ├── drawTableSection()                            Line 326             │
│  ├── getDisplayValue()                             Line 363             │
│  ├── isRowVisible()                                Line 371             │
│  └── hexToRgb()                                    Line 379             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              OUTPUT                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  doc.save(`${filename}.pdf`)                       Line 72              │
│  └── Downloads: {filename}.pdf                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Entry Points

### 1. User Click on Export Button

**File:** `index.html:765`
```html
<button id="exportBtn" class="export-btn">
    <svg>...</svg>
    Export
</button>
```

### 2. Event Listener Registration

**File:** `js/modules/export.js:16-19`
```javascript
const exportBtn = getById('exportBtn');
if (exportBtn) {
    exportBtn.addEventListener('click', openExportModal);
}
```

### 3. Modal Display

**File:** `js/modules/export.js:39-51`
```javascript
function openExportModal() {
    const modal = getById('exportModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Set default filename from project name
        const projectName = getValue('input-project-name') || 'sales-offer';
        const filename = getById('exportFilename');
        if (filename) {
            filename.value = projectName.toLowerCase().replace(/\s+/g, '-');
        }
    }
}
```

### 4. Export Trigger

**File:** `js/modules/export.js:56-82`
```javascript
async function handleExport() {
    const format = document.querySelector('input[name="exportFormat"]:checked')?.value;
    const filename = getValue('exportFilename') || 'sales-offer';

    switch (format) {
        case 'pdf':
            await exportPDF(filename);  // Text-based PDF
            break;
        case 'pdf_preview':
            await exportPreviewPDF(filename);  // Screenshot-based PDF
            break;
        // ... other formats
    }
    closeExportModal();
}
```

---

## Execution Flow

### Step-by-Step Sequence

```
1. User clicks "Export" button
   └── index.html:765 → exportBtn click event

2. Modal opens
   └── export.js:39 → openExportModal()

3. User selects "PDF (Editable Text)" and clicks "Export"
   └── export.js:56 → handleExport()

4. PDF export starts
   └── export.js:89 → exportPDF(filename)

5. Toast notification shown
   └── export.js:90 → toast('Generating PDF...', 'info')

6. PDF generator called
   └── export.js:93 → await generateTextPDF(filename)

7. jsPDF document created
   └── pdfGenerator.js:35-40 → new jsPDF({...})

8. Header bar drawn
   └── pdfGenerator.js:45 → drawHeaderBar()
   └── pdfGenerator.js:79-82 → doc.rect(0, 0, pageWidth, 8, 'F')

9. Logo added
   └── pdfGenerator.js:48 → drawLogo()
   └── pdfGenerator.js:88-101 → doc.addImage()

10. Main title drawn
    └── pdfGenerator.js:51 → drawMainTitle()
    └── pdfGenerator.js:107-114 → doc.text(unitModel.toUpperCase())

11. Property Details table drawn
    └── pdfGenerator.js:54 → drawPropertyDetailsTable()
    └── pdfGenerator.js:120-132 → drawTableSection()

12. Financial Breakdown table drawn
    └── pdfGenerator.js:57 → drawFinancialTable()
    └── pdfGenerator.js:138-169 → drawTableSection()

13. Property Status table drawn (if Ready property)
    └── pdfGenerator.js:60 → drawPropertyStatusTable()
    └── pdfGenerator.js:175-204 → conditional drawTableSection()

14. Payment Plan table drawn (if Off-Plan)
    └── pdfGenerator.js:63 → drawPaymentPlanTable()
    └── pdfGenerator.js:210-255 → conditional table rendering

15. Floor plan image added
    └── pdfGenerator.js:66 → drawFloorPlanImage()
    └── pdfGenerator.js:260-290 → doc.addImage()

16. Footer drawn
    └── pdfGenerator.js:69 → drawFooter()
    └── pdfGenerator.js:296-320 → doc.text() for project name, subtitle

17. PDF saved to disk
    └── pdfGenerator.js:72 → doc.save(`${filename}.pdf`)

18. Success notification
    └── export.js:94 → toast('PDF exported successfully', 'success')
```

---

## Function Reference

### Main Entry Function

#### `generateTextPDF(filename)` — Line 14-74

**Purpose:** Orchestrates the entire PDF generation process

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `filename` | string | Output filename without extension |

**Returns:** `Promise<boolean>` — Success status

**Process:**
1. Initialize jsPDF with A4 dimensions
2. Calculate layout measurements
3. Draw all document sections sequentially
4. Save PDF file

```javascript
export async function generateTextPDF(filename) {
    const { jsPDF } = window.jspdf;
    const template = getCurrentTemplate();
    const isPortrait = template === 'portrait';

    const pageWidth = isPortrait ? 210 : 297;
    const pageHeight = isPortrait ? 297 : 210;
    const margin = 11;

    const doc = new jsPDF({
        orientation: isPortrait ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    // ... draw sections ...

    doc.save(`${filename}.pdf`);
    return true;
}
```

---

### Drawing Functions

#### `drawHeaderBar(doc, pageWidth, height, color)` — Line 79-82

Draws the colored bar at the top of the page.

| Parameter | Type | Value |
|-----------|------|-------|
| height | number | 8mm |
| color | RGB array | Brand color (default: [98, 198, 193]) |

```javascript
function drawHeaderBar(doc, pageWidth, height, color) {
    doc.setFillColor(...color);
    doc.rect(0, 0, pageWidth, height, 'F');
}
```

---

#### `drawLogo(doc, pageWidth)` — Line 88-101

Draws the company logo in the top-right corner.

| Property | CSS Value | PDF Value |
|----------|-----------|-----------|
| Position X | right: 15mm | `pageWidth - 15 - logoWidth` |
| Position Y | top: 12mm | 12mm |
| Width | 130px | 34mm |
| Height | 65px | 17mm |

```javascript
function drawLogo(doc, pageWidth) {
    const logoImg = getById('logoImg');
    if (logoImg && logoImg.src) {
        try {
            const logoWidth = 34;
            const logoHeight = 17;
            const logoX = pageWidth - 15 - logoWidth;
            const logoY = 12;
            doc.addImage(logoImg.src, 'PNG', logoX, logoY,
                         logoWidth, logoHeight, undefined, 'FAST');
        } catch (e) {
            console.warn('Logo could not be added to PDF:', e);
        }
    }
}
```

---

#### `drawMainTitle(doc, margin, yPos)` — Line 107-114

Draws the unit model name as the main title.

| Property | CSS Value | PDF Value |
|----------|-----------|-----------|
| Font size | 40px | 30pt |
| Font | Montserrat Bold | Helvetica Bold |
| Color | #1f2937 | RGB(31, 41, 55) |
| Y Position | margin-top: 5mm | headerBarHeight + 5 |

```javascript
function drawMainTitle(doc, margin, yPos) {
    const unitModel = getValue('select-unit-model')
                      || getById('disp_title')?.textContent || '-';
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(unitModel.toUpperCase(), margin, yPos);
    return yPos + 14;
}
```

---

#### `drawPropertyDetailsTable(doc, yPos, margin, tableWidth, primaryColor)` — Line 120-132

Draws the Property Details section with 6 rows.

**Rows:**
| Label | Data Source ID |
|-------|----------------|
| Unit No | `display-unit-number` |
| Unit Type | `disp_unit_type` |
| Views | `disp_views` |
| Internal Area (Sq.Ft) | `disp_internal` |
| Balcony Area (Sq.Ft) | `disp_balcony` |
| Total Area (Sq.Ft) | `display-total-area` (bold) |

---

#### `drawFinancialTable(doc, yPos, margin, tableWidth, primaryColor)` — Line 138-169

Draws the Financial Breakdown section with conditional rows.

**Always Visible:**
- Selling Price
- Admin Fees (SAAS)
- ADGM Reg. Fee
- ADGM Termination Fee
- ADGM Electronic Service Fee
- Agency Fees
- Total Initial Payment (bold)

**Conditional (Off-Plan only):**
- Original Price (if `disp_row_original_price` visible)
- Refund (if `disp_row_refund` visible)
- Balance Resale Clause (if `disp_row_balance_resale` visible)
- Premium (if `disp_row_premium` visible)

---

#### `drawPropertyStatusTable(doc, yPos, margin, tableWidth, primaryColor)` — Line 175-204

Draws the Property Status section (Ready properties only).

**Visibility Check:** `propertyStatusTable.style.display !== 'none'`

**Conditional Rows:**
| Label | Row ID | Value ID |
|-------|--------|----------|
| Project Completion | `disp_row_projecthandover` | `disp_projecthandover` |
| Project Age | `disp_row_projectage` | `disp_projectage` |
| Unit Received | `disp_row_unithandover` | `disp_unithandover` |
| Unit Ownership | `disp_row_unitownership` | `disp_unitownership` |
| Status | `disp_row_occupancy` | `disp_occupancy` |
| Current Rent | `disp_row_currentrent` | `disp_currentrent` |
| Lease Until | `disp_row_leaseuntil` | `disp_leaseuntil` |
| Service Charge | `disp_row_servicecharge` | `disp_servicecharge` |

---

#### `drawPaymentPlanTable(doc, yPos, margin, tableWidth, primaryColor)` — Line 210-255

Draws the Payment Plan table (Off-Plan properties only).

**Visibility Check:**
- `previewPaymentPlanTable.style.display !== 'none'`
- `payment_plan_tbody.children.length > 0`

**Table Structure:**
| Column | Position | Alignment |
|--------|----------|-----------|
| Date Of Payment | margin + 1 | left |
| % | margin + tableWidth * 0.45 | left |
| Amount (AED) | margin + tableWidth - 1 | right |

---

#### `drawFloorPlanImage(doc, rightColX, rightColWidth, headerBarHeight, pageHeight)` — Line 260-290

Draws the floor plan image in the right column.

**Layout:**
| Property | Calculation |
|----------|-------------|
| Max Width | rightColWidth - 5 |
| Max Height | pageHeight - 55 |
| X Position | rightColX + (rightColWidth - imgWidth) / 2 |
| Y Position | headerBarHeight + 15 |

**Aspect Ratio Handling:**
```javascript
const imgRatio = floorPlanImg.naturalWidth / floorPlanImg.naturalHeight;
if (imgRatio > maxImgWidth / maxImgHeight) {
    imgWidth = maxImgWidth;
    imgHeight = imgWidth / imgRatio;
} else {
    imgHeight = maxImgHeight;
    imgWidth = imgHeight * imgRatio;
}
```

---

#### `drawFooter(doc, pageWidth, pageHeight, margin, primaryColor)` — Line 296-320

Draws the footer section at the bottom-right.

| Element | CSS | PDF | Position |
|---------|-----|-----|----------|
| Project Name | 18px bold | 14pt bold | bottom: 12mm, right: 15mm |
| "SALE OFFER" | 12px primary | 9pt primary | +5mm below project name |
| Created By | 9px gray | 7pt gray | bottom: 4mm, center |

---

#### `drawTableSection(doc, title, startY, margin, tableWidth, primaryColor, rows)` — Line 326-358

Generic function for drawing table sections.

**Title Style:**
- Font: 8pt Helvetica Bold
- Color: Primary brand color

**Row Style:**
- Font: 7pt Helvetica Normal (or Bold for totals)
- Label color: RGB(75, 85, 99)
- Value color: RGB(17, 24, 39)
- Row height: 3.5mm
- Border: RGB(243, 244, 246) line

---

### Helper Functions

#### `getDisplayValue(id)` — Line 363-366

Gets text content from a preview element by ID.

```javascript
function getDisplayValue(id) {
    const el = getById(id);
    return el ? el.textContent.trim() || '-' : '-';
}
```

---

#### `isRowVisible(id)` — Line 371-374

Checks if a row element is visible.

```javascript
function isRowVisible(id) {
    const row = getById(id);
    return row && row.style.display !== 'none';
}
```

---

#### `hexToRgb(hex)` — Line 379-386

Converts hex color to RGB array for jsPDF.

```javascript
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [98, 198, 193];  // Default: teal
}
```

---

## Layout Specifications

### Page Dimensions

| Template | Width | Height | Orientation |
|----------|-------|--------|-------------|
| Landscape | 297mm | 210mm | landscape |
| Portrait | 210mm | 297mm | portrait |

### Column Layout (Landscape)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header Bar (8mm height, primary color)                                   │
├────────────────────────────┬────────────────────────────────────────────┤
│                            │                                            │
│   LEFT COLUMN (40%)        │   RIGHT COLUMN (60%)                       │
│   margin: 11mm             │   X: margin + leftColWidth + 8             │
│                            │                                            │
│   ┌──────────────────┐     │   ┌────────────────────────────────────┐   │
│   │ PROPERTY DETAILS │     │   │                                    │   │
│   ├──────────────────┤     │   │                                    │   │
│   │ Unit No    : xxx │     │   │                                    │   │
│   │ Unit Type  : xxx │     │   │       FLOOR PLAN IMAGE             │   │
│   │ Views      : xxx │     │   │       (aspect ratio preserved)     │   │
│   │ ...              │     │   │                                    │   │
│   └──────────────────┘     │   │                                    │   │
│                            │   │                                    │   │
│   ┌──────────────────┐     │   │                                    │   │
│   │ FINANCIAL        │     │   │                                    │   │
│   │ BREAKDOWN        │     │   └────────────────────────────────────┘   │
│   ├──────────────────┤     │                                            │
│   │ Selling    : xxx │     │                                            │
│   │ Admin      : xxx │     │                           ┌──────────────┐ │
│   │ ADGM       : xxx │     │                           │ PROJECT NAME │ │
│   │ ...              │     │                           │ SALE OFFER   │ │
│   │ Total      : xxx │     │                           └──────────────┘ │
│   └──────────────────┘     │                                            │
│                            │                                            │
├────────────────────────────┴────────────────────────────────────────────┤
│                    CREATED BY FOOTER (centered)                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Font Size Mapping

| CSS (px) | PDF (pt) | Formula |
|----------|----------|---------|
| 40px | 30pt | px × 0.75 |
| 18px | 14pt | px × 0.75 |
| 12px | 9pt | px × 0.75 |
| 10px | 8pt | px × 0.75 |
| 9px | 7pt | px × 0.75 |

### Color Reference

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary | #62c6c1 | (98, 198, 193) | Header, titles, accents |
| Text Dark | #1f2937 | (31, 41, 55) | Main title |
| Text Primary | #111827 | (17, 24, 39) | Table values |
| Text Secondary | #4b5563 | (75, 85, 99) | Table labels |
| Text Muted | #6b7280 | (107, 114, 128) | Footer text |
| Border | #f3f4f6 | (243, 244, 246) | Table lines |

---

## Data Sources

### DOM Element IDs

| Section | Element ID | Type |
|---------|------------|------|
| Logo | `logoImg` | img |
| Title | `select-unit-model` / `disp_title` | select/span |
| Unit No | `display-unit-number` | span |
| Unit Type | `disp_unit_type` | span |
| Views | `disp_views` | span |
| Internal Area | `disp_internal` | span |
| Balcony Area | `disp_balcony` | span |
| Total Area | `display-total-area` | span |
| Original Price | `disp_original_price` | span |
| Selling Price | `disp_selling_price` | span |
| Refund | `disp_refund` | span |
| Balance Resale | `disp_balance_resale` | span |
| Premium | `disp_premium` | span |
| Admin Fees | `disp_admin_fees` | span |
| ADGM Transfer | `disp_adgm_transfer` | span |
| ADGM Termination | `disp_adgm_termination` | span |
| ADGM Electronic | `disp_adgm_electronic` | span |
| Agency Fees | `disp_agency_fees` | span |
| Total | `disp_total` | span |
| Floor Plan | `floorPlanImg` | img |
| Project Name | `input-project-name` / `disp_project_footer` | input/span |
| Payment Plan | `payment_plan_tbody` | tbody |

---

## Error Handling

### Image Errors

Both logo and floor plan have try-catch blocks:

```javascript
try {
    doc.addImage(logoImg.src, 'PNG', ...);
} catch (e) {
    console.warn('Logo could not be added to PDF:', e);
}
```

**Behavior:** Silent failure — PDF generates without image

### Missing Data

All display values have fallback:

```javascript
function getDisplayValue(id) {
    const el = getById(id);
    return el ? el.textContent.trim() || '-' : '-';
}
```

**Behavior:** Shows `-` for missing values

### Export-Level Error

```javascript
async function exportPDF(filename) {
    toast('Generating PDF...', 'info');
    try {
        await generateTextPDF(filename);
        toast('PDF exported successfully', 'success');
    } catch (error) {
        toast('PDF export failed: ' + error.message, 'error');
    }
}
```

**Behavior:** User sees error toast with message

---

## Dependencies

| Library | Version | CDN | Purpose |
|---------|---------|-----|---------|
| jsPDF | 2.5.1 | index.html:93 | PDF document creation |
| html2pdf | 0.12.1 | index.html:99 | Preview PDF (screenshot-based) |

---

*Documentation generated 2026-01-04*
