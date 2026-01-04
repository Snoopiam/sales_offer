# Changelog

All notable changes to the Sales Offer Generator project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-01-04

### Added
- Environment template (.env.example) with dev server configuration
- Consolidated humanization documentation (HUMANIZATION.md)
- CSS frontend references and documentation screenshots
- Comprehensive field reference documentation

### Changed
- Reorganized archive folder into subfolders (reports/, scripts/, samples/)
- Migrated hardcoded hex colors to CSS variables
- Converted small font sizes from px to rem for WCAG 2.2 AA compliance
- Humanized codebase with readable element names:
  - Renamed cryptic IDs (u_orig -> u_original_price, disp_proj -> disp_project_footer)
  - Renamed jQuery-style functions ($ -> getById, $q -> queryOne, $qa -> queryAll)
  - Renamed CSS classes (.pp-table -> .payment-plan-table, .col-left -> .column-left)
- Refactored area field display formatting

### Fixed
- Calculator tests updated to use humanized element IDs
- Orphaned code removed (setText calls to non-existent elements)
- Calculator key mismatch (u_bua vs u_built_up_area)

### Removed
- Duplicate audit files from docs/archive/audit/
- Redundant humanization documentation (consolidated into single file)

## [1.1.0] - 2025-12-15

### Added
- Comprehensive test suite with Vitest (430+ tests)
- ESLint configuration with security plugin
- Code coverage reporting (tests/coverage/)
- Input validation and sanitization helpers
- File validation with magic byte checking
- Content Security Policy (CSP) headers

### Changed
- Updated all CDN dependencies with SRI hashes
- Improved test coverage from 2% to 47%
- Enhanced error handling across modules

### Security
- Added XSS prevention via escapeHtml() and sanitizeInput()
- Implemented file type validation for uploads
- Added size limits for file uploads
- Secured API key storage with basic encoding

## [1.0.0] - 2025-11-01

### Added
- Initial release of Sales Offer Generator
- Live A4 document preview with real-time updates
- Support for Off-Plan Resale and Ready Property categories
- Support for Standard, Villa/Townhouse, and Plot unit types
- Auto-calculations for ADGM fees, agency fees, totals, and premium
- Excel import via SheetJS with column mapping
- PDF export (text-based via jsPDF, screenshot-based via html2pdf)
- PNG and JSON export options
- Payment plan editor with drag-and-drop (SortableJS)
- localStorage persistence with auto-save
- Multiple templates (Landscape, Portrait, Minimal)
- Branding customization (logo, colors, labels)
- AI document parsing via Google Gemini (Beta)
- Print optimization styles

### Technical
- Vanilla JavaScript ES6 modules architecture
- CSS custom properties for theming
- Tailwind CSS utility classes
- ARIA labels and keyboard navigation support

---

[1.2.0]: https://github.com/Snoopiam/sales_offer/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Snoopiam/sales_offer/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Snoopiam/sales_offer/releases/tag/v1.0.0
