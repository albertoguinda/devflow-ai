# TODO — DevFlow AI v4.18.0 Roadmap

> Last updated: 2026-03-08
> Context: Competitive analysis completed. 15→20 tools expansion, gloss luxury UI, new features.
> Baseline: 1487 tests, 45 files, 1356 i18n keys, 0 vulnerabilities, 0 TS errors, 0 ESLint warnings.

---

## Competitive Intelligence Summary

> Full analysis: March 2026 market study of IT-Tools (86), DevToys (30+), CyberChef (300+), ToolCove, AppDevTools, BeginThings (90+).
> **DevFlow AI is the ONLY toolkit with embedded AI** (14/15 tools). Strategy: quality + AI + a11y > quantity.

### Where we win
- AI integration (14/15 tools) — no competitor has this
- WCAG AAA accessibility — 95.9% of websites fail basic WCAG
- Zero barriers (no login, no API key needed, Pollinations free fallback)
- Bilingual EN+ES with AI responding in locale
- Enterprise quality (1487 tests, Clean Architecture, TypeScript strict)

### Where competitors beat us
- Tool count: IT-Tools 86, CyberChef 300+ vs DevFlow 15
- Offline: DevToys desktop, DevToys Web Pro has service worker
- Pipelines: CyberChef recipe chaining (drag & drop)
- Shareability: no competitor has URL-shared state (blue ocean)

---

## Gloss Luxury Visual Upgrade (v4.17.1) — COMPLETED 2026-03-08

- [x] **CSS Foundation** — 10 new CSS variables (glass, surface, shadows) for light+dark
- [x] **Glass upgrade** — `.glass` blur(16px) + saturate(1.8) + CSS variable-driven
- [x] **New utilities** — `.surface-card`, `.hover-lift`, `.accent-glow`, `.btn-luxury`, `.glass-subtle`
- [x] **Typography** — `text-rendering: optimizeLegibility`, `letter-spacing: -0.01em`
- [x] **Selection** — Indigo-tinted selection (light+dark)
- [x] **Scrollbar** — 6px, transparent track, pill thumb
- [x] **Card component** — `surface-card` class (cascades to ALL cards in app)
- [x] **ToolHeader** — Glass morphism, larger glows, ring on icon badge
- [x] **ToolCard** — surface-card + hover-lift, thinner banner, icon scale on hover
- [x] **FeatureCard** — surface-card + hover-lift, accent-glow bar, icon ring
- [x] **Dashboard layout** — Frosted glass sidebar, radial gradient main content
- [x] **Toast** — rounded-xl, shadow-float, backdrop-blur-xl
- [x] **MagicInput** — Glass class, shadow-float
- [x] **31 accent bars** — `h-1` → `h-0.5 accent-glow` across 17 files
- [x] **12 CTA buttons** — `btn-luxury` gloss overlay across 11 tool pages
- [x] **Reduced motion** — All new animations disabled for `prefers-reduced-motion`
- [x] Verification: 0 TS errors, 1487/1487 tests pass, 0 new lint warnings

---

## FASE 1 — New Tools: High-Impact, Zero Dependencies (v4.18.0)

> 5 new tools using ONLY native Web APIs. Each follows the 5-layer pattern.
> Priority: tools that every competitor has AND we can enhance with AI.

### Tool #16: Hash Generator — COMPLETED

> Native Web Crypto API. 33 tests, 40 i18n keys, 5-layer stack complete.

- [x] `types/hash-generator.ts` — HashAlgorithm, HashResult (with id), HashConfig, HmacConfig, HashDetection
- [x] `lib/application/hash-generator.ts` — generateHash, generateHmac, detectHashType, compareHashes, generateFileHash, generateAllHashes, processHash
- [x] `hooks/use-hash-generator.ts` — full state management with useToolHistory
- [x] `app/(dashboard)/tools/hash-generator/page.tsx` — all sections (input, algorithm selector, HMAC, compare, detect, empty state)
- [x] `tests/unit/application/hash-generator.test.ts` — 33 tests passing
- [x] Registry: tools-data, tool-icon-map, commands, smart-navigation
- [x] i18n: ~40 keys in en.json + es.json

---

### Tool #17: JWT Decoder — COMPLETED

> Zero dependencies. 33 tests, 38 i18n keys, 5-layer stack complete.

- [x] `types/jwt-decoder.ts` — JwtParts, JwtValidation, JwtClaim, JwtResult (with id), STANDARD_CLAIMS
- [x] `lib/application/jwt-decoder.ts` — decodeJwt, validateJwt, isExpired, isNotYetValid, getExpiresIn, formatClaims, processJwt, isJwtLike
- [x] `hooks/use-jwt-decoder.ts` — full state management with auto-decode on paste, useToolHistory
- [x] `app/(dashboard)/tools/jwt-decoder/page.tsx` — all sections (input, validation, header, payload, claims, signature, empty state)
- [x] `tests/unit/application/jwt-decoder.test.ts` — 33 tests passing
- [x] Registry: tools-data, tool-icon-map, commands, smart-navigation
- [x] i18n: ~38 keys in en.json + es.json

---

### Tool #18: Color Converter & Palette — COMPLETED

> Pure math, zero dependencies. 49 tests, 37 i18n keys, 5-layer stack complete.

- [x] `types/color-converter.ts` — ColorFormat, ColorValue, ColorResult (with id), ContrastResult, PaletteType, PaletteColor
- [x] `lib/application/color-converter.ts` — parseColor, convertColor, convertToAllFormats, calculateContrast, getWcagLevel, checkContrast, generatePalette, processColorConversion
- [x] `hooks/use-color-converter.ts` — full state management, live contrast, palette generation, history
- [x] `app/(dashboard)/tools/color-converter/page.tsx` — color input + picker, format grid, contrast checker, palette generator
- [x] `tests/unit/application/color-converter.test.ts` — 49 tests passing
- [x] Registry: tools-data, tool-icon-map, commands, smart-navigation
- [x] i18n: ~37 keys in en.json + es.json

---

### Tool #19: Diff / Text Comparer — COMPLETED

> LCS-based diff algorithm, zero dependencies. 33 tests, 19 i18n keys, 5-layer stack complete.

- [x] `types/diff-comparer.ts` — DiffLineType, DiffLine, DiffResult (with id), DiffStats, DiffViewMode
- [x] `lib/application/diff-comparer.ts` — computeDiff (LCS), getDiffStats, processDiff, formatUnifiedDiff
- [x] `hooks/use-diff-comparer.ts` — full state management with view mode toggle
- [x] `app/(dashboard)/tools/diff-comparer/page.tsx` — side-by-side textareas, unified/side-by-side toggle, color-coded diff, stats bar
- [x] `tests/unit/application/diff-comparer.test.ts` — 33 tests passing
- [x] Registry: tools-data, tool-icon-map, commands, smart-navigation
- [x] i18n: ~19 keys in en.json + es.json

---

### Tool #20: Password Generator — COMPLETED

> crypto.getRandomValues(), zero dependencies. 59 tests, 25 i18n keys, 5-layer stack complete.

- [x] `types/password-generator.ts` — PasswordConfig, PasswordStrength, PasswordResult (with id), DEFAULT_PASSWORD_CONFIG
- [x] `lib/application/password-generator.ts` — generatePassword, evaluateStrength, generateBatch, processPassword
- [x] `hooks/use-password-generator.ts` — full state management with config, batch generation
- [x] `app/(dashboard)/tools/password-generator/page.tsx` — config panel (slider + switches), strength meter, batch mode
- [x] `tests/unit/application/password-generator.test.ts` — 59 tests passing
- [x] Registry: tools-data, tool-icon-map, commands, smart-navigation
- [x] i18n: ~25 keys in en.json + es.json

---

### Fase 1 — Cross-cutting tasks

#### Registry & Navigation
- [ ] Update `config/tools-data.ts` — add 5 new tools with metadata
- [ ] Update `config/tool-icon-map.ts` — map 5 new icons
- [ ] Update `config/commands.ts` — add 5 tools to command palette
- [ ] Update `hooks/use-smart-navigation.ts` — add 5 new tool routes to `ToolRoute` union type
- [ ] Update MagicInput detection for new tool types

#### E2E Tests
- [ ] Create `tests/e2e/hash-generator.spec.ts` — basic flow (input → hash → copy)
- [ ] Create `tests/e2e/jwt-decoder.spec.ts` — paste JWT → see decoded parts
- [ ] Create `tests/e2e/color-converter.spec.ts` — input hex → see RGB/HSL
- [ ] Create `tests/e2e/diff-comparer.spec.ts` — input two texts → see diff
- [ ] Create `tests/e2e/password-generator.spec.ts` — generate → copy → strength visible

#### Documentation
- [ ] Update `README.md` — 15→20 tools, update stats (EN + ES sections)
- [ ] Update `CHANGELOG.md` — v4.18.0 section
- [ ] Update `docs/TFM.md` — tool count, test count, i18n keys

#### Verification Gate
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npx vitest run` — all tests pass (target: 1587+)
- [ ] `npm run lint` — 0 new warnings
- [ ] `npm run build` — production build succeeds
- [ ] Visual QA: all 5 new tools in light/dark mode, 375px mobile

---

## FASE 2 — Share via URL (v4.19.0)

> Blue ocean feature: no competitor has shareable tool state. Each share = free marketing.

### 2.1 Core Infrastructure
- [ ] Create `lib/application/share-state.ts`:
  - `encodeState(toolSlug: string, state: Record<string, string>): string` — compress + base64url encode
  - `decodeState(hash: string): { toolSlug: string; state: Record<string, string> } | null`
  - Use `CompressionStream` API (native, no deps) for gzip compression
  - Fallback: plain base64url for browsers without CompressionStream

### 2.2 Share Hook
- [ ] Create `hooks/use-share-state.ts`:
  - `shareCurrentState()` — encode tool state → update URL hash → copy to clipboard
  - `loadSharedState()` — on mount, check URL hash → decode → populate tool state
  - `getShareUrl(): string` — return full URL with encoded state

### 2.3 Share Button Component
- [ ] Create `components/shared/share-button.tsx`:
  - `<ShareButton state={...} toolSlug="json-formatter" />`
  - Uses Web Share API where available (`navigator.share`), falls back to clipboard copy
  - Show toast on share success

### 2.4 Integrate into all 20 tool pages
- [ ] Add `<ShareButton>` next to CopyButton in each tool's output section
- [ ] Add `useShareState()` to each tool's hook to load state on mount from URL hash

### 2.5 i18n
- [ ] Add ~10 keys: `share.copy`, `share.copied`, `share.title`, `share.description`, etc.

### 2.6 Tests
- [ ] Unit tests for `share-state.ts` — encode/decode round-trip, compression, edge cases (empty, oversized)
- [ ] Component test for `share-button.tsx`

---

## FASE 3 — UX Enhancements (v4.20.0)

### 3.1 Clipboard Auto-Detection
- [ ] Enhance `components/tools/magic-input.tsx`:
  - On focus, request `navigator.clipboard.readText()` (requires permission)
  - If clipboard content matches a type (JSON, JWT, hash, regex, etc.), show "Paste from clipboard?" chip
  - Graceful fallback: if permission denied, just show normal placeholder
- [ ] Add i18n keys: `magic.pasteFromClipboard`, `magic.clipboardDetected`

### 3.2 Per-Tool Keyboard Shortcuts
- [ ] Create `hooks/use-tool-shortcuts.ts`:
  - Register tool-specific shortcuts (e.g., Ctrl+Enter to execute primary action)
  - Ctrl+Shift+C to copy output
  - Ctrl+Shift+S to share
  - Escape to clear input
- [ ] Add `<Kbd>` component hints next to CTA buttons showing shortcut
- [ ] Add i18n keys for shortcut descriptions

### 3.3 Visual QA (pending from earlier)
- [ ] Verify JSON Formatter syntax highlighting renders correctly in both light/dark themes
- [ ] Verify Tailwind Sorter dual-preview shows correct dark mode rendering

### 3.4 Tool Enhancements (from previous TODO)
- [ ] Regex Humanizer — visual regex graph/railroad diagram
- [ ] JSON Formatter — tree view collapse/expand
- [ ] Cost Calculator — comparison chart (Recharts bar chart for selected models)
- [ ] Base64 — file upload for batch processing (drag & drop)

---

## FASE 4 — Service Worker Offline (v4.21.0)

> Critical gap vs competition. DevToys Web Pro has full offline, we don't.

### 4.1 Service Worker Setup
- [ ] Install `@serwist/next` (successor to next-pwa for Next.js 16)
- [ ] Create `app/sw.ts` — service worker with Serwist
- [ ] Configure caching strategies:
  - **Cache-first**: static assets (JS, CSS, fonts, images, icons)
  - **Stale-while-revalidate**: tool pages (HTML), config data
  - **Network-first**: API routes (`/api/ai/*`)
  - **Network-only**: health check, external fetches
- [ ] Add offline fallback page — show "You're offline" with list of tools that work offline (all 20)

### 4.2 Manifest Enhancement
- [ ] Update `app/manifest.ts` — add `share_target` for Web Share Target API
- [ ] Add `screenshots` field for richer install experience
- [ ] Add `shortcuts` — quick access to top 5 tools from OS icon

### 4.3 Offline Indicators
- [ ] Create `hooks/use-online-status.ts` — `navigator.onLine` + event listeners
- [ ] Show subtle offline indicator in sidebar when disconnected
- [ ] Disable AI buttons when offline, show "Offline — local mode" chip

### 4.4 Testing
- [ ] Lighthouse PWA audit — target: 100 score
- [ ] Manual test: kill network → verify all tools work → reconnect → AI works again

---

## FASE 5 — Advanced Differentiators (v5.0.0)

> Long-term vision: become the "AI-Native Swiss Army Knife for Developers"

### 5.1 YAML ↔ JSON ↔ TOML Converter (Tool #21)
- [ ] Types + logic + hook + page + tests + i18n (5-layer pattern)
- [ ] AI: detect format, suggest schema validation

### 5.2 Markdown Preview + Editor (Tool #22)
- [ ] Live preview with syntax highlighting
- [ ] AI: generate TOC, fix formatting, suggest structure

### 5.3 QR Code Generator (Tool #23)
- [ ] Canvas-based QR generation (no deps, use qr-code algorithm)
- [ ] Download as PNG/SVG, custom colors, logo overlay

### 5.4 Docker Compose Support
- [ ] Dockerfile for self-hosting: `FROM node:20-slim` + standalone build
- [ ] `docker-compose.yml` for one-command deployment
- [ ] Document in README

### 5.5 Flow Builder (CyberChef-style pipeline)
- [ ] Visual drag-and-drop tool chaining
- [ ] Input → Tool A → Tool B → Output
- [ ] Save/share recipes via URL

---

## KPIs

| Metric | v4.17.0 (actual) | v4.18.0 target | v5.0.0 vision |
|--------|:-----------------:|:--------------:|:-------------:|
| Tools | 15 | 20 | 23+ |
| Unit tests | 1,487 | 1,600+ | 2,000+ |
| i18n keys | 1,356 | 1,500+ | 1,800+ |
| Lighthouse PWA | ~70 | ~80 | 100 |
| WCAG level | AAA | AAA | AAA |
| Offline support | Partial | Partial | Full (SW) |

---

## Session Resume Guide

When resuming work:

1. **Start with verification**: Run `npm run lint && npm run type-check && npm run test:run` to confirm baseline
2. **After each tool**: Run full verification gate before starting next tool
3. **End of session**: Update CHANGELOG.md, README.md, commit, push

### Quick Context
- **Version**: 4.17.0 (current, post-gloss upgrade)
- **Tests**: 45 files, 1487 passing
- **ESLint**: 0 errors, 0 warnings
- **TypeScript**: 0 errors (strict mode, zero `any`)
- **i18n**: 1356 keys in both locales (perfect parity)
- **Vulnerabilities**: 0
- **CI**: 10 jobs (quality, security, dep-review, build, a11y, e2e, codeql, semgrep, lighthouse, release)

---

## Completed Sessions Archive

<details>
<summary>v4.17.0 — Gloss Luxury Visual Upgrade (2026-03-08)</summary>

- CSS foundation: 10 new variables, 5 new utility classes
- 7 component wrappers upgraded (cascading to all pages)
- 31 accent bars + 12 CTA buttons polished
- Typography + scrollbar + selection refinements

</details>

<details>
<summary>v4.15.4–v4.15.6 — Branding & Polish (2026-03-07)</summary>

- Crystal brackets logo, favicon fix, feature/stats cards
- 120 EN + 118 ES keys sentence case, tool card hearts
- i18n sweep: 30 new keys across 6 tools
- i18n dead key cleanup: 430 orphaned keys purged
- 7 obsolete files removed

</details>

<details>
<summary>v4.15.0 — Pixel-Perfect & Responsive (2026-03-06)</summary>

- 11 fixes in 4 phases: mobile layout, GSAP dynamic import, text-xs WCAG, touch targets, debounce, contrast

</details>

<details>
<summary>v4.14.0 — E2E Stability + Feature Iteration (2026-02-28)</summary>

- 12 flaky E2E tests fixed, 3 new E2E tests
- 15-tool deep audit: 0 critical bugs
- 4-layer security+quality audit: 29 fixes across 24 files

</details>

<details>
<summary>v4.13.0 — 15-Tool Feature Iteration (2026-02-27)</summary>

- Every tool got a new feature: syntax highlighting, batch processing, UUID v3/v5, flavor selector, code snippets, SQL DDL, etc.
- +50 tests, +45 i18n keys

</details>

<details>
<summary>v4.12.0 — Security Hardening (2026-02-27)</summary>

- BYOK bypass fix, TOCTOU race, error sanitization, dependency flow enforcement, tech debt zero

</details>

<details>
<summary>v4.10.0–v4.11.0 — Deep Audit + i18n + a11y (2026-02-25–26)</summary>

- 6 bug fixes, ESLint 139→0, a11y toggle semantics, i18n zero hardcoded strings, UX audit all tools

</details>
</details>
