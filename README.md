# Sales Offer Generator

A professional real estate sales offer document generator for Kennedy Property.

## Quick Start

```bash
npm install   # First time only
npm start     # Start server
```

Then open **http://localhost:8000** in your browser.

## Features

- Live A4 Document Preview
- Auto-Calculations (ADGM 2% of Original, Agency Fees, Totals)
- Excel Import (Unit Model, Views, Payment Plan)
- Export: PDF (text-based), PNG, JPG
- Off-Plan & Ready Property support
- Payment Plan editor (based on Original Price)

## BETA Toggle

The **BETA** toggle is in the **top-right of the left sidebar header**.

Toggle it ON to enable:
- Enhanced dropdowns (Unit Model, Views)
- Keyboard shortcuts
- Field tooltips

## Export Formats

| Format | Type | Use Case |
|--------|------|----------|
| **PDF** | Text-based, selectable | Print, Email |
| **PNG** | High-quality image (4x) | Documentation |
| **JPG** | Compressed image | WhatsApp, Email |

## Excel Import

The app imports from Excel files with this structure:

| Row | Column C | Column G | Columns J-L |
|-----|----------|----------|-------------|
| 1 | Project Name | - | Payment Plan |
| 2 | Unit No | Refund | (Date, %, Amount) |
| 3 | Unit Type | Balance | |
| 4 | Unit Model | Premium | |
| 5 | Views | Admin Fees | |
| 6 | Internal Area | ADGM | |
| 7 | Balcony Area | Agency Fees | |
| 8 | Total Area | | |
| 9 | Original Price | | |
| 10 | Selling Price | | |

## Development

```bash
npm test      # Run tests
npm run lint  # Check code
```
