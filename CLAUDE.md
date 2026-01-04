# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sales Offer Generator - A vanilla JavaScript (ES Modules) real estate sales offer document generator with live A4 preview, auto-calculations, and PDF export. Single-page app loaded via `index.html`.

## Commands

```bash
npm start              # Start dev server at localhost:8000
npm test               # Run all tests (Vitest)
npm test -- --watch    # Watch mode
npm test -- calculator # Run single test file
npm run test:coverage  # Coverage report (outputs to tests/coverage/)
npm run lint           # ESLint check
npm run lint:fix       # ESLint auto-fix
```

## Architecture

### Module System
All JS uses ES Modules. Entry point is `js/app.js` which imports and initializes modules from `js/modules/`. Each module exports functions that are called during app initialization.

### Data Flow
1. User input → Form fields in sidebar (`#inputPanel`)
2. Input listeners → Modules update preview elements in real-time
3. Preview panel → Live A4 document display (`#a4Page`)
4. Export → `pdfGenerator.js` (jsPDF text-based) or `export.js` (html2pdf screenshot)

### Key Modules
| Module | Purpose |
|--------|---------|
| `calculator.js` | Auto-calculations (ADGM fees, agency fees, totals, premium) |
| `pdfGenerator.js` | Text-based PDF generation with jsPDF (selectable text) |
| `export.js` | Export orchestration (PDF, PNG, JSON formats) |
| `storage.js` | localStorage persistence with auto-save |
| `excel.js` | SheetJS Excel import with column mapping |
| `paymentPlan.js` | Sortable payment milestone table |
| `category.js` | Property category switching (Off-Plan vs Ready) |
| `branding.js` | Logo upload, primary color, custom labels |
| `beta.js` | Toggle experimental features (zoom, dashboard, enhanced dropdowns) |

### Two PDF Generation Methods
| Method | Module | Library | Output |
|--------|--------|---------|--------|
| Text PDF | `pdfGenerator.js` | jsPDF | Selectable text, smaller files |
| Preview PDF | `export.js` | html2pdf | Screenshot-based, visual match |

### CSS Architecture
| File | Purpose |
|------|---------|
| `css/main.css` | Sidebar (#inputPanel), modals, buttons, form inputs |
| `css/preview.css` | Base A4 document styles, shared by all templates |
| `css/templates/*.css` | Template overrides (landscape, portrait, minimal) |
| `css/print.css` | Print media query styles |
| `css/beta.css` | Beta feature styles (zoom controls, dashboard modal) |

Templates are applied via class on `#a4Page`: `.template-landscape`, `.template-portrait`, `.template-minimal`

## Conventions

### Element ID Naming
Uses humanized, semantic IDs:
- Input fields (sidebar): `input-internal-area`, `input-selling-price`, `input-admin-fees`
- Display elements (preview): `disp_selling_price`, `disp_premium`, `display-total-area`
- Row visibility toggles: `disp_row_refund`, `disp_row_premium`
- Lock buttons: `lockRefund`, `lockPremium`, `lockAdgm`, `lockAgency`

### Value Formatting
- **Currency**: Formatted via `formatCurrency()` helper (e.g., "1,234,567")
- **Areas**: Raw numbers in inputs, "Sq.Ft" suffix added in display layer (`app.js`)
- **Calculator outputs**: Return raw values; formatting happens in display functions

### CSS Variables
Use variables defined in `css/main.css`:
- Colors: `--primary-color` (#62c6c1 teal), `--text-dark`, `--bg-dark`
- Font sizes should use `rem` for accessibility (not small `px` values)

### Helper Functions
Always use helpers from `js/utils/helpers.js`:
```javascript
getById(id)           // Get element by ID
getValue(id)          // Get input value
setValue(id, value)   // Set input value
formatCurrency(num)   // Format as "1,234,567"
escapeHtml(str)       // XSS prevention
sanitizeInput(str)    // Input sanitization
```

### Testing
- Tests in `tests/*.test.js` mirror module structure
- Mock DOM elements in test setup when needed
- Font module mocked in PDF tests: `vi.mock('../js/fonts/montserrat-fonts.js')`

## Property Categories

Two modes with different fields visible:
1. **Off-Plan Resale** - Shows refund, balance, premium, payment plan table
2. **Ready Property** - Shows property status, occupancy status, service charge

Category state managed by `category.js` with `data-category` attribute on body.

## CDN Dependencies

Libraries loaded via CDN with SRI hashes (in `index.html`):
- Tailwind CSS, SheetJS (xlsx), html2pdf.js, jsPDF, SortableJS

## File Locations

| Type | Location |
|------|----------|
| Tests | `tests/*.test.js` |
| Test coverage | `tests/coverage/` |
| Sample data | `assets/samples/` |
| Font modules (base64) | `js/fonts/` |
| Archived docs | `docs/archive/` |
