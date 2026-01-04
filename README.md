# Sales Offer Generator

A professional real estate sales offer document generator with live preview, auto-calculations, and AI-powered document parsing.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tests](https://img.shields.io/badge/tests-430-brightgreen)
![Health](https://img.shields.io/badge/health-80%25-success)

## Features

- **Live A4 Document Preview** - See changes in real-time as you type
- **Auto-Calculations** - Automatic calculation of derived fields (premium, fees, totals)
- **Multiple Templates** - Landscape, Portrait, and Minimal designs
- **Property Categories** - Support for Off-Plan Resale and Ready Property
- **Data Persistence** - Auto-saves to browser storage, never lose your work
- **Excel Import** - Import property data from Excel spreadsheets
- **AI Document Parser** - Extract data from property brochures using Google Gemini
- **Branding Customization** - Custom logo, colors, and labels
- **Multiple Export Formats** - PDF, PNG, and JSON export
- **Template System** - Save and reuse offer templates
- **Security** - Content Security Policy, SRI for CDN resources, input sanitization

## Quick Start

### Step 1: Open a Terminal

Navigate to the project folder:
```bash
cd "Sales Offer"
```

### Step 2: Start the Server

Choose ONE of these options:

**Option A: Node.js (Recommended)**
```bash
npm install        # First time only
npm run serve:node
```

**Option B: Python**
```bash
python -m http.server 8000
```

**Option C: VS Code**
- Install the "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### Step 3: Open the App

Open your browser and go to:
```
http://localhost:8000
```

### Step 4: Create Your Offer

1. Enter property details in the left sidebar
2. Watch the live preview update on the right
3. Click "Export PDF" when ready

> **Important:** You must use a local server (not just double-click the HTML file) because the app uses ES modules.

## Development Setup

### Install Dependencies

```bash
npm install
```

### Available Scripts

```bash
# Start local development server
npm run serve          # Python server
npm run serve:node     # Node.js server

# Run tests
npm test               # Run all tests
npm run test:ui        # Run tests with UI
npm run test:coverage  # Run tests with coverage report

# Linting
npm run lint           # Check for issues
npm run lint:fix       # Auto-fix issues
```

### Testing

The project uses [Vitest](https://vitest.dev/) for testing with 430+ tests covering:

- **helpers.test.js** - Utility functions (formatCurrency, escapeHtml, sanitizeInput, etc.)
- **calculator.test.js** - Financial calculations (ADGM, agency fees, totals)
- **validator.test.js** - Form and payment plan validation

Run tests:
```bash
npm test
```

## Project Structure

```
Sales Offer/
├── index.html              # Main application
├── package.json            # Project configuration & scripts
├── vitest.config.js        # Test configuration
├── eslint.config.js        # Linting configuration
├── .editorconfig           # Editor settings
├── assets/
│   ├── fonts/              # Montserrat font files
│   ├── logos/              # Brand logo assets
│   └── samples/            # Sample PDF documents
├── css/
│   ├── main.css            # Sidebar & layout styles
│   ├── preview.css         # A4 document styles
│   ├── print.css           # Print media styles
│   ├── beta.css            # Beta feature styles
│   └── templates/
│       ├── landscape.css   # Landscape template
│       ├── portrait.css    # Portrait template
│       └── minimal.css     # Minimal template
├── data/                   # Excel data files
├── docs/
│   ├── audit/              # Audit reports
│   ├── archive/            # Archived documentation
│   └── *.md                # Technical documentation
├── js/
│   ├── app.js              # Main application logic
│   ├── fonts/              # Base64 font modules for PDF
│   ├── modules/
│   │   ├── ai.js           # Gemini AI integration
│   │   ├── beta.js         # Beta features toggle
│   │   ├── branding.js     # Logo/color customization
│   │   ├── calculator.js   # Auto-calculations
│   │   ├── category.js     # Property category handling
│   │   ├── excel.js        # Excel import
│   │   ├── export.js       # PDF/PNG/JSON export
│   │   ├── paymentPlan.js  # Payment plan editor
│   │   ├── pdfGenerator.js # Text-based PDF generation
│   │   ├── storage.js      # localStorage management
│   │   ├── templates.js    # Template switching
│   │   └── validator.js    # Form validation
│   └── utils/
│       └── helpers.js      # Utility functions
├── templates/
│   └── default-offer.json  # Default template
└── tests/
    ├── setup.js            # Test environment setup
    ├── coverage/           # Coverage reports
    ├── outputs/            # Test output files
    └── *.test.js           # Test files
```

## Dependencies (CDN)

| Library | Version | Purpose |
|---------|---------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | Latest | Styling |
| [SheetJS (xlsx)](https://sheetjs.com/) | 0.18.5 | Excel parsing |
| [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) | 0.12.1 | PDF generation |
| [SortableJS](https://sortablejs.github.io/Sortable/) | 1.15.6 | Drag-and-drop |
| [Google Fonts (Montserrat)](https://fonts.google.com/specimen/Montserrat) | - | Typography |

All CDN resources include SRI (Subresource Integrity) hashes for security.

## Dev Dependencies

| Library | Purpose |
|---------|---------|
| Vitest | Test runner |
| jsdom | DOM environment for tests |
| @testing-library/dom | DOM testing utilities |
| ESLint | Code linting |
| eslint-plugin-security | Security-focused linting rules |

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Configuration

### Gemini API Key (for AI features)

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Open Settings (gear icon) → AI Settings tab
3. Enter your API key and click "Test Connection"
4. Key is saved locally in your browser

### Branding

1. Open Settings → Branding tab
2. Upload your company logo
3. Set primary color
4. Customize company name and footer text

## Excel Format

The app expects Excel files with this column structure:

| Column C (index 2) | Column G (index 6) | Columns J-L (9-11) |
|-------------------|-------------------|-------------------|
| Project Name | Refund | Payment Plan |
| Unit No | Balance | (Date, %, Amount) |
| Unit Type | Premium | |
| Bedrooms | Admin Fees | |
| Views | ADGM | |
| Internal Area | Agency Fees | |
| Balcony Area | | |
| Total Area | | |
| Original Price | | |
| Selling Price | | |

## Security

This application implements several security measures:

- **Content Security Policy (CSP)** - Restricts resource loading to trusted sources
- **Subresource Integrity (SRI)** - Verifies CDN resources haven't been tampered with
- **Input Sanitization** - Prevents XSS attacks via user input
- **File Validation** - Magic byte checking for uploaded files
- **Secure File Handling** - Size limits and type validation

> **Note:** API keys are stored locally with basic encoding. For production with sensitive data, implement a server-side proxy.

## License

MIT License - feel free to use and modify for your projects.

## Credits

- Original design based on Kennedy Property offer format
- Built with vanilla JavaScript (ES Modules)
- AI features powered by Google Gemini

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | Dec 2025 | Security audit fixes, test suite, ESLint, updated dependencies |
| 1.0.0 | Nov 2025 | Initial release |
