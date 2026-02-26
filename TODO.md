# TODO — DevFlow AI v4.11.0 (Post-Audit Polish)

> Last updated: 2026-02-26
> Context: Continuation of deep audit session. Priority 1-3 tasks from v4.10.0 completed. ARIA semantics fixed, i18n gaps closed, UX audited, docs updated.

---

## Completed in This Session (2026-02-26)

### Priority 1: Accessibility — Toggle Button Semantics
- [x] **Token Visualizer** — Added `aria-pressed` to model selector buttons (3 providers)
- [x] **Variable Name Wizard** — Added `aria-pressed` to language selector (5 languages) and batch target convention selector (5 conventions)
- [x] **HTTP Status Finder** — Added `aria-pressed` + individual `aria-label` with i18n (`httpStatus.filterCategory`) to all 5 category filter buttons

> Note: Used `aria-pressed` instead of `role="radio"` because HeroUI v3 Button TypeScript types don't accept `role` prop. `aria-pressed` is the correct ARIA pattern for toggle buttons in a group.

### Priority 2: i18n Gaps
- [x] **Regex Humanizer hook** — Replaced 3 hardcoded English error fallbacks (`"Explanation failed"`, `"Generation failed"`, `"Test failed"`) with `t()` calls (`regex.explanationFailed`, `regex.generationFailed`, `regex.testFailed`)
- [x] **Git Commit Generator hook** — Replaced hardcoded `"Breaking change detected in diff"` with `t("gitCommit.breakingDetected")`
- [x] **5 new i18n keys** added to both `en.json` and `es.json` (1595 → 1600 keys per locale, perfect parity)
- [x] **Context Manager** — Model preset names verified as proper nouns (intentionally not localized)
- [x] **Cost Calculator** — No hardcoded `$2.5` found (previously fixed or misreported)

### Priority 3: UX Audit
- [x] **Error states** — All 15 tools verified: 14/15 have `role="alert"` on error cards. UUID Generator has no error state (purely synchronous tool, can't fail)
- [x] **Empty states** — All 15 tools have meaningful placeholder messages (no blank boxes)
- [x] **Loading states** — All AI-enabled tools show spinner + disable button during calls

### Documentation Updates
- [x] **SECURITY.md** — Updated supported versions from `3.x` to `4.x + 3.x`
- [x] **docs/DEPLOYMENT.md** — Updated health check version example from `4.8.0` to `4.11.0`

### Verification
- [x] `tsc --noEmit` — 0 errors
- [x] `npm run lint` — 0 errors, 0 warnings
- [x] `npm run test:run` — 45 files, 1416 tests passing
- [x] `npm run test:coverage` — All CORE files above thresholds
- [x] i18n parity: 1600 keys in both EN and ES

---

## Completed in Previous Session (2026-02-25)

### Bug Fixes
- [x] Easter egg invisible in production — switched to `console.info`
- [x] API status route missing try-catch
- [x] AIStatusResult.provider incorrectly nullable
- [x] Pollinations missing top_p
- [x] Division by zero in code-review page
- [x] dto-matic Spanish error in logic layer

### Accessibility (WCAG AAA)
- [x] API Key Guide — dialog role, modal, escape handler
- [x] DataTable select — aria-label
- [x] 13 tool error cards — role="alert" + aria-hidden on icons

### Code Quality
- [x] ESLint: 139 warnings → 0
- [x] Rate limiter singleton simplified
- [x] BYOK validation hardening

---

## Pending Tasks (Next Session)

### Priority 1: Testing

- [ ] **Add E2E tests for new ARIA attributes** — Verify `aria-pressed` renders correctly on token-visualizer, variable-name-wizard, http-status-finder
- [ ] **Coverage review** — Verify no CORE file dropped below 80% after hook changes
- [ ] **Integration tests** — Cross-tool smart navigation (`devflow-shared-data`) for all 10 detector rules

### Priority 2: Final Documentation

- [ ] Update `CHANGELOG.md` with v4.11.0 section documenting all fixes
- [ ] Update `README.md` stats: i18n keys (1595 → 1600)
- [ ] Update `docs/TFM.md` if any stats changed significantly
- [ ] Bump `package.json` version to 4.11.0

### Priority 3: Nice-to-Have

- [ ] **Bundle analysis** — Run `npm run analyze` and check for any new large imports
- [ ] **Lighthouse audit** — Run against deployed site, verify scores maintained
- [ ] **Easter egg verification** — Manually check `console.info` appears in production

---

## Session Resume Guide

When resuming work:

1. **Start with verification**: Run `npm run lint && npm run type-check && npm run test:run` to confirm baseline
2. **Priority 1 first**: Testing improvements are the most impactful remaining items
3. **After each change**: Run `npm run lint` (0 warnings) and `npm run test:run` (1416+)
4. **End of session**: Update CHANGELOG.md, commit, push, verify CI on GitHub

### Quick Context
- **Version**: 4.10.0 (current), next will be 4.11.0
- **Tests**: 45 files, 1416 passing
- **ESLint**: 0 errors, 0 warnings
- **TypeScript**: 0 errors (strict mode, zero `any`)
- **i18n**: 1600 keys in both locales (perfect parity)
- **CI**: 10 jobs (quality, security, dep-review, build, a11y, e2e, codeql, semgrep, lighthouse, release)
