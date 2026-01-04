
# CSS Style Guide - Live Preview

Complete reference for all CSS styles, colors, sizes, and typography used in the A4 document preview.

---

## Page Dimensions

### A4 Landscape (Default)
```css
width: 297mm;
height: 210mm;
padding: 40px; /* ~11mm */
```

### A4 Portrait
```css
width: 210mm;
height: 297mm;
padding: 40px;
```

---

## Color Palette

### Brand Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary (Teal) | `#62c6c1` | `rgb(98, 198, 193)` | Header bar, table titles, links |
| Primary Dark | `#4fa8a3` | `rgb(79, 168, 163)` | Hover states |

**CSS Variable:** `--primary-color: #62c6c1`

### Text Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Near Black | `#111827` | `rgb(17, 24, 39)` | Values, emphasis |
| Dark Gray | `#1f2937` | `rgb(31, 41, 55)` | Main title, project name |
| Medium Dark | `#374151` | `rgb(55, 65, 81)` | Table text |
| Medium Gray | `#4b5563` | `rgb(75, 85, 99)` | Labels |
| Gray | `#6b7280` | `rgb(107, 114, 128)` | Created-by footer |

### Border Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Light Gray | `#e5e7eb` | `rgb(229, 231, 235)` | Table borders, dividers |
| Very Light | `#f3f4f6` | `rgb(243, 244, 246)` | Row borders |

### Background Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Paper | `#fafafa` | `rgb(250, 250, 250)` | A4 page background |
| White | `#ffffff` | `rgb(255, 255, 255)` | Table headers |

---

## Typography

### Font Family
```css
font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Normal | 400 | Body text |
| Medium | 500 | Values |
| Semi-bold | 600 | Labels |
| Bold | 700 | Titles, headers |
| Extra Bold | 800 | Total row |
| Black | 900 | Main title, project name |

### Font Sizes

| Element | CSS Size | Points (pt) | Usage |
|---------|----------|-------------|-------|
| Main Title | 40px | 30pt | Unit model header |
| Footer Project | 18px | 13.5pt | Project name in footer |
| Footer Subtitle | 12px | 9pt | "SALE OFFER" text |
| Table Title | 11px | 8pt | Section headers |
| Table Content | 10px | 7.5pt | Row labels and values |
| Created-by | 9px | 7pt | Agent credit line |
| Footnote | 8px | 6pt | Disclaimers |

### PDF Font Size Mapping

For jsPDF (uses points):

| Element | CSS (px) | PDF (pt) |
|---------|----------|----------|
| Main Title | 40px | 24pt |
| Footer Project | 18px | 12pt |
| Footer Subtitle | 12px | 8pt |
| Table Title | 11px | 8pt |
| Table Content | 10px | 7pt |
| Created-by | 9px | 6pt |

---

## Layout Measurements

### Header Bar
```css
.header-bar {
    width: 100%;
    height: 8mm;
    background-color: var(--primary-color);
    position: absolute;
    top: 0;
    left: 0;
}
```

### Logo Area
```css
.logo-area {
    position: absolute;
    top: 12mm;
    right: 15mm;
    width: 130px;  /* landscape */
    height: 65px;
}

.logo-img {
    max-height: 60px;
    width: auto;
}
```

### Document Header
```css
.document-header {
    margin-top: 5mm;
    margin-bottom: 20px;
}

.main-title {
    font-size: 40px;
    font-weight: 900;
    color: #1f2937;
    line-height: 1;
    letter-spacing: -0.02em;
}
```

### Content Row (Two Columns)
```css
.content-row {
    display: flex;
    flex-direction: row;
    gap: 30px;  /* 8mm */
    flex: 1;
    align-items: flex-start;
}

.col-left {
    width: 40%;
    height: 165mm;
    overflow: hidden;
}

.col-right {
    width: 60%;
    padding-top: 20px;
    padding-bottom: 40px;
}
```

### Footer Area
```css
.footer-area {
    position: absolute;
    bottom: 12mm;
    right: 15mm;
    text-align: right;
}

.footer-proj {
    font-size: 18px;
    font-weight: 900;
    color: #1f2937;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.footer-sub {
    font-size: 12px;
    color: var(--primary-color);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-top: 4px;
}
```

### Created-by Footer
```css
.created-by-footer {
    position: absolute;
    bottom: 4mm;  /* landscape */
    left: 15mm;
    right: 15mm;
    text-align: center;
    font-size: 9px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}
```

---

## Table Styles

### Data Table
```css
.data-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 10px;
    margin-bottom: 6px;  /* landscape: tighter */
}
```

### Table Title (Caption)
```css
.table-title {
    caption-side: top;
    text-align: left;
    color: var(--primary-color);
    font-weight: 700;
    font-size: 11px;  /* landscape: 11px */
    padding: 4px 0 2px;  /* landscape: tighter */
    text-transform: uppercase;
}
```

### Table Cells
```css
.data-table td {
    padding: 2px 0;  /* landscape: 2px, standard: 3px */
    border-bottom: 1px solid #f3f4f6;
    color: #374151;
    vertical-align: middle;
}

.data-table td:first-child {
    padding-right: 10px;
}

.data-table td:last-child {
    padding-left: 10px;
    text-align: right;
}
```

### Row Label
```css
.row-label {
    font-weight: 600;
    width: 65%;
    color: #4b5563;
}
```

### Row Value
```css
.row-value {
    font-weight: 500;
    color: #111827;
}

.row-value-bold {
    font-weight: 700;
    color: #111827;
}
```

### Total Row
```css
.total-row td {
    border-top: 2px solid #e5e7eb;
    border-bottom: none;
    font-weight: 800;
    color: #1f2937;
    padding-top: 8px;
    padding-bottom: 0;
    font-size: 11px;
}
```

### Divider Row
```css
.divider-row {
    height: 12px;
    border-bottom: none !important;
}
```

---

## Payment Plan Table

### Header Row
```css
.table-header-row th {
    text-align: left;
    border-bottom: none;
    font-size: 11px;
    padding: 3px 0;
    color: var(--primary-color);
    font-weight: 700;
}
```

### Columns
```css
/* Column 1: Date - left aligned (default) */

/* Column 2: Percentage - centered */
.pp-table th:nth-child(2),
.pp-table td:nth-child(2) {
    text-align: center;
}

/* Column 3: Amount - right aligned */
.pp-table td:nth-child(3) {
    text-align: right;
}
```

---

## Floor Plan Image

```css
.floorplan-frame {
    height: 140mm;
    border: 1px solid transparent;
    background: transparent;
    border-radius: 4px;
    padding: 6px;
}

#floorPlanImg {
    max-width: 95%;
    max-height: 95%;
    width: auto;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}
```

---

## Spacing Summary

### Vertical Spacing (Landscape)

| Element | Spacing | CSS Property |
|---------|---------|--------------|
| Header bar height | 8mm | `height` |
| Logo from top | 12mm | `top` |
| Title margin top | 5mm | `margin-top` |
| Table gap | 6px | `margin-bottom` |
| Row padding | 2px | `padding` |
| Footer from bottom | 12mm | `bottom` |
| Created-by from bottom | 4mm | `bottom` |

### Horizontal Spacing

| Element | Spacing | CSS Property |
|---------|---------|--------------|
| Page padding | 40px (~11mm) | `padding` |
| Logo from right | 15mm | `right` |
| Column gap | 30px (~8mm) | `gap` |
| Label-value gap | 10px | `padding-right/left` |
| Footer from right | 15mm | `right` |

---

## Z-Index Layers

| Layer | Z-Index | Element |
|-------|---------|---------|
| Paper | 0 | `#a4Page` |
| Header bar | 1 | `.header-bar` |
| Logo | 2 | `.logo-area` |

---

## Box Shadow

### A4 Page
```css
box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
```

### Floor Plan Image
```css
filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
```

---

## PDF Generation Reference

When generating PDF with jsPDF, use these conversions:

### Unit Conversion
- 1mm = 1mm (jsPDF default)
- 1px ≈ 0.264mm
- 1pt ≈ 0.353mm

### Color Format
```javascript
// Hex to RGB for jsPDF
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ];
}

// Usage
doc.setTextColor(98, 198, 193);  // Primary teal
doc.setTextColor(31, 41, 55);    // Dark gray
doc.setTextColor(75, 85, 99);    // Medium gray (labels)
doc.setTextColor(17, 24, 39);    // Near black (values)
doc.setTextColor(107, 114, 128); // Gray (created-by)
```

### Position Reference (Landscape A4)

| Element | X (mm) | Y (mm) |
|---------|--------|--------|
| Header bar | 0 | 0 |
| Logo | 251 (297-11-35) | 12 |
| Main title | 11 | 16 |
| Tables start | 11 | 24 |
| Right column | 130 | 23 |
| Footer | 286 | 195 |
| Created-by | 148.5 (center) | 205 |

---

## Template Differences

### Landscape vs Portrait

| Property | Landscape | Portrait |
|----------|-----------|----------|
| Page width | 297mm | 210mm |
| Page height | 210mm | 297mm |
| Left column | 40% | 45% |
| Right column | 60% | 55% |
| Col-left height | 165mm | 240mm |
| Main title size | 40px | 36px |
| Table font | 10px | 11px |
| Row padding | 2px | 3px |

---

*Generated for Sales Offer Generator v1.0*
