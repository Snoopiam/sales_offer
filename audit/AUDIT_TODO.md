# AUDIT TODO
**Project:** Sales Offer Generator | **Started:** 2025-12-31

## Progress: [==--------] 0% (0/14)

---

## CRITICAL (Do First)

- [ ] **MP-01** Add test suite with Vitest
  - Location: `New tests/ directory`
  - Action: Install Vitest, create test files for helpers, calculator, validator, storage
  - Effort: L (20-30h)
  - From: Finding C-01

---

## HIGH Priority

- [ ] **QW-01** Add Content Security Policy
  - Location: `index.html` (line 4, after charset meta)
  - Action: Add CSP meta tag with appropriate directives
  - Effort: XS (30min)
  - From: Finding H-02

- [ ] **QW-04** Add API key storage warning
  - Location: `index.html` (settings modal, AI tab)
  - Action: Add warning text below API key input
  - Effort: S (1h)
  - From: Finding H-01

- [ ] **MP-03** Implement server-side API proxy
  - Location: `New server/ directory`
  - Action: Create Node.js or serverless proxy for Gemini API
  - Effort: L (15-20h)
  - From: Finding H-01

---

## MEDIUM Priority

- [ ] **QW-02** Remove debug console.log statements
  - Location: `js/app.js` (lines 30, 60)
  - Action: Delete or comment out "initializing" and "ready" logs
  - Effort: XS (15min)
  - From: Finding L-03

- [ ] **QW-05** Create package.json for dependency tracking
  - Location: `New package.json`
  - Action: Create package.json with CDN versions documented
  - Effort: S (30min)
  - From: Finding L-02

- [ ] **MP-02** Add ESLint configuration
  - Location: `New eslint.config.js`
  - Action: Install and configure ESLint with security plugin
  - Effort: M (4-6h)
  - From: Best practice

- [ ] **MP-04** Encrypt sensitive localStorage data
  - Location: `js/modules/storage.js`, new `js/utils/crypto.js`
  - Action: Implement Web Crypto API encryption for sensitive fields
  - Effort: M (6-8h)
  - From: Finding M-02

---

## LOW Priority

- [ ] **QW-03** Add .editorconfig file
  - Location: `New .editorconfig`
  - Action: Create editor configuration for code consistency
  - Effort: XS (15min)
  - From: Best practice

- [ ] **FI-01** Update CDN dependencies
  - Location: `index.html` (script tags)
  - Action: Update xlsx, html2pdf.js, SortableJS to latest, regenerate SRI
  - Effort: S (1h)
  - From: Dependency analysis

- [ ] **FI-02** Add loading states for async operations
  - Location: `js/modules/export.js`, `js/modules/ai.js`, `js/modules/excel.js`
  - Action: Add skeleton loaders and progress indicators
  - Effort: M (3-4h)
  - From: UX improvement

- [ ] **FI-03** Add keyboard shortcuts
  - Location: `js/app.js`
  - Action: Implement Ctrl+S, Ctrl+E, Ctrl+P shortcuts
  - Effort: S (2h)
  - From: UX improvement

---

## BACKLOG (Reconsider)

- [ ] **R-01** TypeScript migration
  - Location: All JS files
  - Action: Convert codebase to TypeScript
  - Effort: XL (40+h)
  - Status: Consider only for major feature additions

- [ ] **R-02** Framework migration
  - Location: Entire project
  - Action: Migrate to React/Vue
  - Effort: XXL (80+h)
  - Status: Skip - vanilla JS works well for this app size

---

## Completed

| Date | ID | Notes |
|------|-----|-------|
| 2025-12-01 | SEC-01 | XSS protection via escapeHtml and DOM methods |
| 2025-12-01 | SEC-02 | File validation with magic bytes |
| 2025-12-01 | SEC-03 | SRI hashes added for CDN scripts |
| 2025-12-01 | SEC-04 | Input sanitization function added |
| 2025-12-01 | SEC-05 | localStorage quota handling |
| 2025-12-01 | SEC-06 | Image compression to prevent quota issues |

---

## Quick Commands

```bash
# Run local server
python -m http.server 8000

# Future: Run tests (after MP-01)
npm test

# Future: Run linter (after MP-02)
npm run lint
```

---

## Metrics Dashboard

### Current
| Metric | Value | Status |
|--------|-------|--------|
| Health Score | 67/100 | CAUTION |
| Test Coverage | 0% | CRITICAL |
| Security Issues (HIGH) | 2 | AT RISK |
| TODO/FIXME | 0 | HEALTHY |
| Documentation | 85% | HEALTHY |

### Target (After Quick Wins + MP-01)
| Metric | Value | Status |
|--------|-------|--------|
| Health Score | 80+/100 | HEALTHY |
| Test Coverage | 60%+ | CAUTION |
| Security Issues (HIGH) | 0 | HEALTHY |
| TODO/FIXME | 0 | HEALTHY |
| Documentation | 90% | HEALTHY |

---

## Notes

### Priority Order
1. **QW-01** (CSP) - Quick security win
2. **QW-02** (Debug logs) - Quick cleanup
3. **MP-01** (Tests) - Foundation for future work
4. **QW-04** (API warning) - User awareness
5. **MP-03** (API proxy) - Proper security fix

### Dependencies
- MP-02 (ESLint) should wait for MP-01 (Tests) to avoid blocking
- MP-04 (Encryption) is optional if MP-03 (API proxy) is implemented
- FI-* tasks can be done in any order

---

**Last Updated:** 2025-12-31
**Next Review:** After completing Quick Wins
