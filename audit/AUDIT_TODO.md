# Sales Offer Generator — Task List

**Started:** 2026-01-02
**Progress:** 0 of 8 complete

---

## High Priority

- [ ] **TC-01** Fix test imports to use actual source modules
  Location: `tests/*.test.js`
  Action: Update imports to use actual module paths, not mocked functions
  Time: 2h

- [ ] **TC-02** Add tests for calculator.js module
  Location: `tests/calculator.test.js`
  Action: Import and test actual calculator.js exports
  Time: 3h

- [ ] **TC-03** Add tests for validator.js module
  Location: `tests/validator.test.js`
  Action: Import and test actual validator.js exports
  Time: 3h

- [ ] **LN-01** Fix ESLint warnings in paymentPlan.js
  Location: `js/modules/paymentPlan.js`
  Action: Change `let` to `const` at line 272, prefix unused params with `_`
  Time: 15min

---

## Medium Priority

- [ ] **TC-04** Increase helpers.js coverage to 60%
  Location: `tests/helpers.test.js`
  Action: Add tests for uncovered helper functions
  Time: 4h

- [ ] **TC-05** Add tests for storage.js core functions
  Location: `tests/storage.test.js` (new)
  Action: Test save/load state functions with mocked localStorage
  Time: 4h

---

## Low Priority

- [ ] **CL-01** Review console statements
  Location: `js/modules/storage.js`, `js/modules/export.js`, `js/modules/excel.js`, `js/modules/ai.js`
  Action: Evaluate if all 16 console statements are necessary for production
  Time: 1h

- [ ] **DC-01** Update README test coverage badge
  Location: `README.md`
  Action: Update badge to reflect actual coverage percentage
  Time: 10min

---

## Completed

| Date | Task | Notes |
|------|------|-------|
| 2026-01-01 | ESLint config fixed | ESLint 9 flat config working |
| 2026-01-01 | Security vulnerabilities | All 7 resolved via updates |
| 2026-01-01 | Dependencies updated | vitest 4.0.16, jsdom 27.4.0 |
| 2026-01-01 | Test suite created | 93 tests passing |
| 2026-01-01 | TODO markers removed | 0 markers in codebase |

---

## Metrics

**Current:** 74/100
**Target:** 85/100

| Metric | Now | Goal |
|--------|-----|------|
| Test Coverage | 2% | 40%+ |
| ESLint Warnings | 3 | 0 |
| Console Statements | 16 | <10 |
| Health Score | 74 | 85 |

---

## Quick Commands

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Fix lint issues
npm run lint:fix

# Start local server
npm start
```

---

*Generated from Audit Report (2026-01-02)*
