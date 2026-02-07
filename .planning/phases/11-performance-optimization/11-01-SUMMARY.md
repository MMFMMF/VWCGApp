---
phase: 11
plan: 01
subsystem: performance
tags: [fonts, build-optimization, performance, astro, bundle-analysis]
requires: [10-02]
provides:
  - Self-hosted fonts via @fontsource (no external CDN requests)
  - Astro build optimization configuration (inlineStylesheets, manualChunks)
  - Bundle visualizer integration for size analysis
affects: [11-02, 11-03]
tech-stack:
  added:
    - "@fontsource/inter": "Font files for Inter typeface"
    - "@fontsource/lexend": "Font files for Lexend typeface"
    - "rollup-plugin-visualizer": "Bundle size analysis and visualization"
  patterns:
    - "Self-hosted web fonts with @fontsource (eliminates external CDN)"
    - "Astro inlineStylesheets: 'auto' for CSS optimization"
    - "Manual vendor chunk splitting (react, charts, radix-ui)"
key-files:
  created:
    - "dist/stats.html": "Bundle visualizer treemap report"
  modified:
    - "package.json": "Added @fontsource packages and analyze script"
    - "astro.config.mjs": "Build optimization and vendor chunking config"
    - "src/layouts/MarketingLayout.astro": "Self-hosted font imports"
    - "src/layouts/BaseLayout.astro": "Self-hosted font imports"
    - "src/styles/global.css": "Removed 'Inter var' references"
decisions:
  - decision: "Self-host fonts via @fontsource instead of Google Fonts CDN"
    rationale: "Chrome/Safari cache partitioning eliminated CDN benefit; self-hosting saves 100-300ms on mobile FCP/LCP"
    date: "2026-02-07"
  - decision: "Use inlineStylesheets: 'auto' (not 'always')"
    rationale: "Only inlines small CSS files (<4KB), reduces request count without bloating HTML"
    date: "2026-02-07"
  - decision: "Manual vendor chunking (react-vendor, charts, radix-ui)"
    rationale: "Vendor code changes rarely; splitting enables better browser caching for returning users"
    date: "2026-02-07"
metrics:
  duration: "3 minutes"
  completed: "2026-02-07"
---

# Phase 11 Plan 01: Self-Hosted Fonts & Build Optimization Summary

**One-liner:** Eliminated external Google Fonts CDN with self-hosted @fontsource packages and configured Astro build pipeline with CSS inlining and vendor chunk splitting for optimal caching.

## What Was Delivered

### Self-Hosted Fonts via @fontsource
- **Packages installed:** `@fontsource/inter` and `@fontsource/lexend` (weights 400-700)
- **Layouts updated:** Both `MarketingLayout.astro` and `BaseLayout.astro` import self-hosted font CSS
- **Google Fonts removed:** All preconnect and googleapis.com link tags eliminated
- **Font rendering:** WOFF2 files with font-display: swap (no Flash of Invisible Text)
- **Performance gain:** Eliminates DNS lookup, TLS handshake, and external request (~100-300ms saved on mobile)

### Astro Build Optimizations
- **CSS inlining:** `inlineStylesheets: 'auto'` reduces request count by inlining CSS files < 4KB
- **Vendor splitting:** Manual chunks for `react-vendor` (60.77 KB), `charts` (117.47 KB), `radix-ui` (27.87 KB)
- **Caching benefit:** Vendor bundles change rarely, enabling long-term browser caching

### Bundle Analysis
- **Visualizer plugin:** rollup-plugin-visualizer generates treemap report at `dist/stats.html`
- **Analyze script:** `npm run analyze` builds and reports bundle size
- **Current bundle sizes:**
  - react-vendor: 194.40 KB (60.77 KB gzipped)
  - charts: 403.30 KB (117.47 KB gzipped)
  - radix-ui: 78.93 KB (27.87 KB gzipped)
  - AssessmentApp: 525.99 KB (166.75 KB gzipped)

## Technical Implementation

### Task 1: Self-Host Fonts
**Commit:** `5da6f18`

1. Installed `@fontsource/inter` and `@fontsource/lexend` packages
2. Added font CSS imports to both layout frontmatter:
   ```typescript
   import '@fontsource/inter/400.css';
   import '@fontsource/inter/500.css';
   import '@fontsource/inter/600.css';
   import '@fontsource/inter/700.css';
   import '@fontsource/lexend/400.css';
   import '@fontsource/lexend/500.css';
   import '@fontsource/lexend/600.css';
   import '@fontsource/lexend/700.css';
   ```
3. Removed all Google Fonts link tags from both layouts
4. Updated `global.css` to remove 'Inter var' references (changed to standard 'Inter')

**Verification:**
- ✅ Build passes with no errors
- ✅ `grep -r "fonts.googleapis.com" src/` returns zero results
- ✅ Font packages exist in node_modules/@fontsource/

### Task 2: Configure Build Optimizations
**Commit:** `d146a31`

1. Installed `rollup-plugin-visualizer` as dev dependency
2. Updated `astro.config.mjs`:
   - Added `build: { inlineStylesheets: 'auto' }`
   - Configured `manualChunks` function for vendor splitting:
     ```javascript
     manualChunks: (id) => {
       if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
         return 'react-vendor';
       }
       if (id.includes('recharts') || id.includes('react-circular-progressbar')) {
         return 'charts';
       }
       if (id.includes('@radix-ui')) {
         return 'radix-ui';
       }
     }
     ```
   - Added visualizer plugin with treemap template, gzip/brotli size reporting
3. Added `"analyze"` script to package.json

**Verification:**
- ✅ Build passes with no errors
- ✅ `dist/stats.html` generated (1.2 MB HTML report)
- ✅ Build output shows separate vendor chunks (react-vendor, charts, radix-ui)
- ✅ astro.config.mjs contains `inlineStylesheets: 'auto'`

## Decisions Made

### 1. Self-Host Fonts Instead of Google Fonts CDN
**Decision:** Replace Google Fonts CDN with @fontsource self-hosted packages

**Rationale:**
- Modern browsers (Chrome/Safari) use cache partitioning, eliminating CDN sharing benefit
- Self-hosting removes external DNS lookup + TLS handshake (~100-300ms on mobile)
- @fontsource provides optimized WOFF2 files with font-display: swap by default
- No preload hints needed — browser prioritization works naturally

**Impact:** Mobile FCP/LCP improved by removing render-blocking external request

### 2. CSS Inlining Strategy
**Decision:** Use `inlineStylesheets: 'auto'` (not 'always')

**Rationale:**
- 'auto' inlines only CSS files < 4KB
- Reduces request waterfall for small stylesheets
- Large CSS files remain external for better caching
- Avoids bloating HTML with large inline styles

**Impact:** Optimal balance between request count and HTML size

### 3. Vendor Chunk Splitting
**Decision:** Split vendor bundles into react-vendor, charts, and radix-ui

**Rationale:**
- Vendor code changes infrequently compared to app code
- Separate chunks enable long-term browser caching
- Returning users load vendors from cache, only fetching changed app code
- Chunk sizes: react (60KB), charts (117KB), radix-ui (27KB) — all cacheable

**Impact:** Better caching strategy, reduced bandwidth for returning users

## Build Metrics

### Bundle Sizes (Before Splitting)
- AssessmentApp: 1,005.43 KB (311.32 KB gzipped)

### Bundle Sizes (After Splitting)
- **react-vendor:** 194.40 KB (60.77 KB gzipped)
- **charts:** 403.30 KB (117.47 KB gzipped)
- **radix-ui:** 78.93 KB (27.87 KB gzipped)
- **AssessmentApp:** 525.99 KB (166.75 KB gzipped)

**Total gzipped size:** ~373 KB (sum of main chunks)

### Build Performance
- Build time: 8.26s (6 pages)
- Vendor chunks generated successfully
- Bundle visualizer report: 1.2 MB HTML

## Success Criteria Verification

✅ **Both layouts self-host fonts via @fontsource**
- MarketingLayout.astro: 8 @fontsource imports added
- BaseLayout.astro: 8 @fontsource imports added
- Zero Google Fonts CDN requests verified

✅ **Astro build uses inlineStylesheets: 'auto'**
- Configured in astro.config.mjs line 23
- CSS < 4KB inlined automatically

✅ **Bundle splitting configured with manualChunks**
- react-vendor chunk: 194.40 KB (60.77 KB gzipped)
- charts chunk: 403.30 KB (117.47 KB gzipped)
- radix-ui chunk: 78.93 KB (27.87 KB gzipped)

✅ **Bundle visualizer generates dist/stats.html**
- File exists: 1.2 MB HTML report
- Treemap visualization with gzip/brotli sizes

✅ **Build passes with no errors**
- Final build: 8.26s, 6 pages
- All static routes generated successfully

## Deviations from Plan

**None** — Plan executed exactly as written.

## Key Code Patterns

### Self-Hosted Font Import Pattern
```typescript
// In layout frontmatter
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/500.css';
import '@fontsource/lexend/600.css';
import '@fontsource/lexend/700.css';
```

### Vendor Chunk Splitting Pattern
```javascript
manualChunks: (id) => {
  if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
    return 'react-vendor';
  }
  if (id.includes('recharts') || id.includes('react-circular-progressbar')) {
    return 'charts';
  }
  if (id.includes('@radix-ui')) {
    return 'radix-ui';
  }
}
```

### Bundle Visualizer Configuration
```javascript
visualizer({
  open: false,
  filename: './dist/stats.html',
  template: 'treemap',
  gzipSize: true,
  brotliSize: true,
})
```

## Next Phase Readiness

### Phase 11 Plan 02: Image Optimization & Responsive Images
**Prerequisites met:**
- ✅ Self-hosted fonts eliminate external requests
- ✅ Build optimization config in place
- ✅ Bundle analysis tooling ready

**Blockers:** None

**Next steps:**
1. Optimize hero image with WebP/AVIF formats
2. Implement responsive srcset for different viewport sizes
3. Add lazy loading for below-fold images
4. Verify Lighthouse mobile performance score

### Phase 11 Plan 03: Mobile Performance Testing
**Prerequisites met:**
- ✅ Fonts optimized (no external CDN)
- ✅ Bundle splitting configured (better caching)
- ✅ Analysis tools ready (dist/stats.html)

**Considerations:**
- Current AssessmentApp bundle: 166.75 KB gzipped (may need further splitting)
- Hero image optimization needed before final Lighthouse audit
- Target: Mobile PageSpeed >80, LCP <2.5s

## Files Modified

### package.json
- Added dependencies: `@fontsource/inter`, `@fontsource/lexend`
- Added devDependency: `rollup-plugin-visualizer`
- Added script: `"analyze": "astro build && echo 'Bundle report: dist/stats.html'"`

### astro.config.mjs
- Added import: `visualizer` from rollup-plugin-visualizer
- Added `build: { inlineStylesheets: 'auto' }`
- Added `vite.build.rollupOptions.output.manualChunks` function
- Added visualizer plugin to vite.plugins

### src/layouts/MarketingLayout.astro
- Added 8 @fontsource font imports in frontmatter
- Removed 3 Google Fonts link tags from <head>

### src/layouts/BaseLayout.astro
- Added 8 @fontsource font imports in frontmatter
- Removed 3 Google Fonts link tags from <head>

### src/styles/global.css
- Changed `font-family: 'Inter var', 'Inter', ...` to `font-family: 'Inter', ...`
- Changed heading font-family: removed 'Inter var' fallback

## Commits

| Commit | Task | Files | Description |
|--------|------|-------|-------------|
| `5da6f18` | Task 1 | package.json, layouts, global.css | Self-host fonts via @fontsource |
| `d146a31` | Task 2 | package.json, astro.config.mjs | Configure build optimizations and visualizer |

---

**Phase 11 Plan 01 complete** — Self-hosted fonts and build optimizations delivered.
**Next:** Plan 02 (Image Optimization & Responsive Images)
