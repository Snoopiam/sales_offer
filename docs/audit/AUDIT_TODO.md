# Sales Offer Generator — Task List

**Started:** 2026-01-02
**Updated:** 2026-01-04
**Progress:** 5 of 11 complete

---

## Completed (Phase 1 - Core Testing)

- [x] **Add tests for export.js**
  Location: `tests/export.test.js`
  Result: 31 tests, 99.02% coverage

- [x] **Add tests for excel.js**
  Location: `tests/excel.test.js`
  Result: 45 tests, 98.10% coverage

- [x] **Add tests for pdfGenerator.js**
  Location: `tests/pdfGenerator.test.js`
  Result: 48 tests, 98.23% coverage

- [x] **Expand calculator.js tests**
  Location: `tests/calculator.test.js`
  Result: 68 tests, 99.25% coverage

- [x] **Expand validator.js tests**
  Location: `tests/validator.test.js`
  Result: 66 tests, 95.34% coverage

---

## High Priority

- [ ] **Address xlsx vulnerability**
  Location: `package.json` (xlsx dependency)
  Action: Evaluate alternatives or add input validation
  Issue: Prototype pollution and ReDoS vulnerabilities

- [ ] **Add tests for ai.js**
  Location: `tests/ai.test.js` (new file)
  Action: Test API integration with mocks
  Current: 0% coverage (501 lines)

- [ ] **Add tests for beta.js**
  Location: `tests/beta.test.js` (new file)
  Action: Test feature flag functionality
  Current: 0% coverage (1,193 lines)

---

## Medium Priority

- [ ] **Remove console statements from export.js**
  Location: `js/modules/export.js:199, 224`
  Action: Replace with user-facing error messages

- [ ] **Remove console statements from pdfGenerator.js**
  Location: `js/modules/pdfGenerator.js:98, 288`
  Action: Replace with silent handling or user message

- [ ] **Remove console statements from storage.js**
  Location: `js/modules/storage.js:273, 328, 343, 354, 362, 513, 1051`
  Action: Replace with proper error handling

---

## Low Priority

- [ ] **Improve paymentPlan.js coverage**
  Location: `tests/paymentPlan.test.js`
  Current: 30.59% coverage
  Target: 60%+

- [ ] **Improve category.js coverage**
  Location: `tests/category.test.js`
  Current: 43.90% coverage
  Target: 70%+

- [ ] **Improve helpers.js coverage**
  Location: `tests/helpers.test.js`
  Current: 59.64% coverage
  Target: 80%+

---

## Completed Log

| Date | Task | Result |
|------|------|--------|
| 2026-01-02 | Add tests for export.js | 31 tests, 99.02% |
| 2026-01-02 | Add tests for excel.js | 45 tests, 98.10% |
| 2026-01-02 | Add tests for pdfGenerator.js | 48 tests, 98.23% |
| 2026-01-02 | Expand calculator.js tests | 68 tests, 99.25% |
| 2026-01-02 | Expand validator.js tests | 66 tests, 95.34% |
| 2026-01-04 | Fix pdfGenerator.js layout | Matches live preview |

---

## Metrics

**Current:** 80/100
**Target:** 90/100

| Metric | Previous | Current | Goal |
|--------|----------|---------|------|
| Test Coverage | 21.7% | 47.86% | 75% |
| Tests | 224 | 430 | 500+ |
| Console Statements | 18 | 11 | 0 |
| Untested Modules | 5 | 2 | 0 |
| Vulnerabilities | 0 | 1 | 0 |

---

*Generated from Audit Report (2026-01-04)*
