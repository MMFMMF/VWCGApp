# Phase 11: Performance Optimization - Research

**Researched:** 2026-02-07
**Domain:** Web Performance Optimization (Core Web Vitals, Mobile PageSpeed)
**Confidence:** HIGH

## Summary

Phase 11 focuses on achieving production-ready mobile performance that meets Core Web Vitals standards (PageSpeed >80, LCP <2.5s, CLS <0.1). This research identifies proven optimization strategies for Astro 5 + React Islands architecture targeting mobile users on throttled 3G connections.

The current site has a strong foundation: Astro's zero-JavaScript-by-default architecture delivers 40% faster performance than React frameworks with 90% less JavaScript. The site already uses selective hydration (client:visible) and has kept bundle additions to ~16KB gzipped. However, several optimization opportunities remain: Google Fonts are externally hosted (blocking render), no hero image exists (no LCP optimization needed for images), and no bundle analysis has been performed.

The standard approach for Astro mobile optimization combines: (1) self-hosting fonts with font-display: swap, (2) inlining critical CSS for above-the-fold content, (3) using Astro's built-in Image component with modern formats (WebP/AVIF) when images are added, (4) applying fetchpriority="high" to LCP elements, and (5) bundle analysis to identify optimization targets. Astro 5's architecture advantages—static HTML generation, selective hydration, and automatic CSS optimization—provide a strong baseline that can achieve perfect PageSpeed scores with targeted optimizations.

**Primary recommendation:** Focus on font optimization (self-host + preload), enable Astro's inlineStylesheets: 'auto' configuration, verify React islands use client:visible consistently, run bundle analysis to identify opportunities, and establish Lighthouse CI for continuous monitoring.

## Standard Stack

The established libraries/tools for web performance optimization in Astro 5:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro Built-in Image | 5.17.1+ | Image optimization with WebP/AVIF, responsive srcset | Native Astro feature, automatic optimization, no external dependencies |
| Lighthouse CLI | 12.x | Core Web Vitals testing with 3G throttling | Official Google tool, industry standard for performance auditing |
| rollup-plugin-visualizer | 6.0.5 | Bundle analysis and treemap visualization | De facto standard for Vite/Rollup projects, ESM-only, Node 22+ |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @fontsource/inter | 5.x | Self-hosted Inter font | Replace Google Fonts CDN with local WOFF2 files |
| @fontsource/lexend | 5.x | Self-hosted Lexend font | Replace Google Fonts CDN with local WOFF2 files |
| vite-bundle-analyzer | 2.x | Alternative bundle visualizer | If rollup-plugin-visualizer doesn't meet needs |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Astro Image | Sharp/Unpic | Astro Image is built-in, no dependencies, automatic optimization during build |
| Lighthouse CLI | WebPageTest | Lighthouse is free, local, scriptable; WebPageTest requires API key or online service |
| rollup-plugin-visualizer | webpack-bundle-analyzer | Astro uses Vite/Rollup, not webpack; visualizer is the correct choice |

**Installation:**
```bash
# Bundle analysis
npm install --save-dev rollup-plugin-visualizer

# Self-hosted fonts (replace Google Fonts CDN)
npm install @fontsource/inter @fontsource/lexend

# Lighthouse CLI for testing
npm install --save-dev lighthouse
```

## Architecture Patterns

### Recommended Project Structure (No Changes Needed)

Current structure already follows best practices:
```
src/
├── components/
│   ├── islands/              # React islands with client:* directives
│   └── marketing/            # Static Astro components (zero JS)
├── layouts/                  # Layout templates
├── pages/                    # Route pages
└── styles/
    └── global.css           # Global styles (Tailwind import)
```

### Pattern 1: Font Optimization with Self-Hosting

**What:** Replace Google Fonts CDN with self-hosted WOFF2 files using @fontsource packages
**When to use:** Always for production sites (eliminates render-blocking external requests)
**Example:**
```typescript
// src/layouts/MarketingLayout.astro
---
// Remove Google Fonts CDN links
// Add self-hosted fonts
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/500.css';
import '@fontsource/lexend/600.css';
import '@fontsource/lexend/700.css';
---
<head>
  <!-- Remove these:
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lexend:wght@400;500;600;700&display=swap" rel="stylesheet" />
  -->

  <!-- Optional: Preload critical font weights -->
  <link rel="preload" href="/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/lexend-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin />
</head>
```

**Source:** [Self-host Google Fonts - WP Rocket](https://docs.wp-rocket.me/article/1847-self-host-google-fonts), [Google Fonts Self-Host Performance](https://www.corewebvitals.io/pagespeed/self-host-google-fonts)

### Pattern 2: Astro Image Component for Future Images

**What:** Use Astro's built-in `<Image />` and `<Picture />` components for optimized image delivery
**When to use:** When adding hero images or marketing images in future phases
**Example:**
```astro
---
import { Image, Picture } from 'astro:assets';
import heroImage from '../assets/hero-business.jpg';
---

<!-- Single format with responsive sizing -->
<Image
  src={heroImage}
  alt="Business assessment dashboard"
  width={1200}
  height={630}
  loading="eager"
  fetchpriority="high"
  decoding="sync"
/>

<!-- Multiple formats for best browser support -->
<Picture
  src={heroImage}
  formats={['avif', 'webp', 'jpeg']}
  alt="Business assessment dashboard"
  width={1200}
  height={630}
  loading="eager"
  fetchpriority="high"
  pictureAttributes={{
    class: "hero-image"
  }}
/>
```

**Source:** [Astro Images Documentation](https://docs.astro.build/en/guides/images/), [Astro Picture Component](https://docs.astro.build/en/reference/modules/astro-assets/)

### Pattern 3: Critical Resource Prioritization with fetchpriority

**What:** Use fetchpriority="high" on LCP elements to boost loading priority
**When to use:** On the single most important above-the-fold resource (hero image, hero text, primary CTA)
**Example:**
```astro
<!-- Hero section: first contentful paint element -->
<section class="hero">
  <!-- If hero image existed, mark as high priority -->
  <img
    src="/hero-image.webp"
    alt="Business diagnostic tools"
    fetchpriority="high"
    loading="eager"
  />

  <!-- For text-based LCP, ensure font is preloaded -->
  <h1>Stop Running Your Business Blind</h1>
</section>
```

**Source:** [Optimize Resource Loading with Fetch Priority API](https://web.dev/articles/fetch-priority), [fetchpriority Attribute Guide](https://www.debugbear.com/blog/fetchpriority-attribute)

### Pattern 4: Astro Build Configuration for Performance

**What:** Configure Astro's build options to inline small stylesheets and optimize assets
**When to use:** Always in production builds
**Example:**
```typescript
// astro.config.mjs
export default defineConfig({
  build: {
    inlineStylesheets: 'auto', // Inline stylesheets < 4KB
  },
  vite: {
    build: {
      cssCodeSplit: true,        // Split CSS per route
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'charts': ['recharts', 'react-circular-progressbar'],
          }
        }
      }
    }
  }
});
```

**Source:** [Astro Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/), [Astro inlineStylesheets](https://docs.astro.build/en/guides/styling/)

### Pattern 5: Bundle Analysis Integration

**What:** Add rollup-plugin-visualizer to Vite config for bundle size visualization
**When to use:** Before and after optimization to measure impact
**Example:**
```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  // ... other config
  vite: {
    plugins: [
      visualizer({
        open: true,
        filename: './dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      })
    ]
  }
});
```

**Source:** [rollup-plugin-visualizer GitHub](https://github.com/btd/rollup-plugin-visualizer), [Vite Bundle Analyzer Guide](https://www.edstem.com/blog/blog/vite-bundle-visualizer/)

### Anti-Patterns to Avoid

- **External Google Fonts without font-display:** Causes render-blocking and FOIT (Flash of Invisible Text). Self-host or add `&display=swap` parameter.
- **Preloading too many resources:** Limit to 1-2 critical resources (fonts, LCP image). More preloads compete and slow everything down.
- **client:load on below-fold islands:** Use client:visible instead. Client:load hydrates immediately, hurting TBT (Total Blocking Time).
- **Animating layout properties:** Avoid animating width, height, top, left—these cause layout shifts. Use transform and opacity only.
- **Inlining all stylesheets:** Use inlineStylesheets: 'auto' not 'always'. Large inlined CSS bloats HTML and hurts initial load.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom resize/format scripts | Astro built-in Image component | Handles WebP/AVIF conversion, responsive srcset, automatic optimization, prevents CLS with width/height |
| Font subsetting | Manual WOFF2 generation | @fontsource packages | Pre-subsetted for latin/latin-ext, optimized file sizes, automatic font-face rules |
| Bundle analysis | Custom webpack stats parser | rollup-plugin-visualizer | Interactive treemap, gzip/brotli sizes, module relationships, works with Vite/Rollup |
| Core Web Vitals testing | Manual Chrome DevTools checks | Lighthouse CLI with throttling | Consistent testing environment, simulated 3G, automated scoring, CI integration |
| Critical CSS extraction | Manual inline CSS selection | Astro inlineStylesheets: 'auto' | Automatic detection of small stylesheets, build-time optimization, no runtime overhead |

**Key insight:** Astro already handles most performance optimizations automatically. The framework is designed for speed—manual optimization is needed only for fonts, large bundles, and ensuring proper hydration directives.

## Common Pitfalls

### Pitfall 1: External Font Requests Blocking Render

**What goes wrong:** Loading Google Fonts from googleapis.com/fonts.gstatic.com adds DNS lookup, TLS handshake, and external request latency. Chrome/Safari cache partitioning means fonts aren't shared across sites.

**Why it happens:** Google Fonts are easy to add with a single `<link>` tag, so developers reach for the CDN without considering performance impact.

**How to avoid:** Self-host fonts using @fontsource packages. Install only the weights you need (400, 500, 600, 700). Add font-display: swap to fallback gracefully.

**Warning signs:**
- PageSpeed Insights flags "Eliminate render-blocking resources"
- Lighthouse reports "Serve fonts from same origin"
- FCP/LCP times > 2 seconds on mobile
- Network waterfall shows fonts.googleapis.com requests before content

**Source:** [Why Self-Host Google Fonts in 2023](https://wpspeedmatters.com/self-host-google-fonts/), [Self-Host Google Fonts Performance](https://www.corewebvitals.io/pagespeed/self-host-google-fonts)

### Pitfall 2: Hydrating All Islands with client:load

**What goes wrong:** Using client:load on React islands hydrates JavaScript immediately on page load, blocking the main thread and increasing TBT (Total Blocking Time). This hurts mobile performance on slow CPUs.

**Why it happens:** client:load is the simplest directive. Developers use it without considering when interactivity is actually needed.

**How to avoid:** Audit all React islands and use the most appropriate directive:
- client:visible — for below-fold components (gauges, cards, mini-assessment)
- client:idle — for non-critical UI that can wait (modals, dropdowns)
- client:load — ONLY for above-the-fold interactive elements (none in current site)

**Warning signs:**
- TBT > 200ms in Lighthouse
- JavaScript bundle executes immediately on page load
- Mobile users experience lag before interactions work
- React DevTools shows all islands mounted on initial load

**Current status:** Site already uses client:visible correctly on CounterIsland, GaugeIsland, ExpandableInsightCard, and MiniAssessmentIsland. Verify AssessmentApp uses appropriate directive.

**Source:** [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/), [Client Directives Performance](https://docs.astro.build/en/reference/directives-reference/#client-directives)

### Pitfall 3: Animating Layout Properties Causing CLS

**What goes wrong:** Animating CSS properties like width, height, top, left, or margin causes layout recalculation on every frame, leading to Cumulative Layout Shift (CLS) scores > 0.1.

**Why it happens:** Layout properties are intuitive to animate (expand width, slide down height), but browsers must recalculate page layout for each change.

**How to avoid:** Use CSS transforms and opacity exclusively:
- translate() instead of top/left
- scale() instead of width/height
- opacity instead of display toggling

Ensure explicit width/height on images and use grid-template-rows: 0fr/1fr for expandable sections.

**Warning signs:**
- CLS score > 0.1 in PageSpeed Insights
- Layout shift detected on scroll animations
- ExpandableInsightCard causes page jump when opening
- Lighthouse flags "Avoid large layout shifts"

**Current status:** Phase 8 already implemented GPU-friendly animations (transform/opacity only) and grid-template-rows for ExpandableInsightCard. Verify no new layout-shifting animations were introduced in Phases 9-10.

**Source:** [Cumulative Layout Shift (CLS)](https://web.dev/articles/cls), [Optimize CLS](https://web.dev/articles/optimize-cls), [CSS Transform Animations](https://jessbpeck.com/posts/completecls/)

### Pitfall 4: Missing Width/Height on Images

**What goes wrong:** Images without explicit width and height attributes cause layout shift when they load. The browser reserves no space, content jumps down.

**Why it happens:** Images are added as `<img src="...">` without dimensions. Browser can't calculate aspect ratio until image loads.

**How to avoid:** Always specify width and height on images, even if CSS overrides them. Astro Image component does this automatically. For manual img tags, measure original dimensions or use aspect-ratio CSS.

**Warning signs:**
- CLS score > 0.1
- PageSpeed Insights: "Image elements do not have explicit width and height"
- Visible content jump when images load
- Layout shifts in Lighthouse filmstrip

**Current status:** No hero image exists yet. When adding images in future, use Astro Image component which automatically includes width/height.

**Source:** [Astro Image Component](https://docs.astro.build/en/guides/images/), [Image Optimization CLS](https://web.dev/articles/optimize-cls)

### Pitfall 5: Over-Preloading Resources

**What goes wrong:** Preloading 5+ resources causes browser priority queue congestion. Critical resources compete, nothing loads faster.

**Why it happens:** Developers preload fonts, CSS, images, scripts thinking "more preload = faster." Browser has limited connection slots.

**How to avoid:** Limit to 1-2 critical resources:
- Preload only fonts used above the fold (Inter 600 for headline, Inter 400 for body)
- OR preload LCP image if it's in a CSS background or lazy-loaded component
- Never preload both fonts AND images—pick the LCP element

**Warning signs:**
- PageSpeed Insights: "Preload key requests" has no effect
- Network waterfall shows all resources starting simultaneously
- LCP doesn't improve despite preload hints
- Lighthouse flags "Avoid chaining critical requests"

**Source:** [Preload Critical Resources](https://web.dev/articles/fetch-priority), [fetchpriority Best Practices](https://nitropack.io/blog/priority-hints/)

## Code Examples

Verified patterns from official sources:

### Self-Hosted Fonts with Preload

```astro
---
// src/layouts/MarketingLayout.astro
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/lexend/600.css'; // Only bold for headings
import '@fontsource/lexend/700.css';

// ... other imports
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Preload critical fonts for LCP -->
  <link rel="preload" href="/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/lexend-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin />

  <!-- ... other head content -->
</head>
<body>
  <slot />
</body>
</html>
```

**Source:** [@fontsource Documentation](https://fontsource.org/docs/getting-started), [Font Preload Best Practices](https://web.dev/articles/font-best-practices)

### CSS with font-display: swap Fallback

```css
/* src/styles/global.css */
@import "tailwindcss";

/* Override @fontsource defaults with font-display: swap */
@font-face {
  font-family: 'Inter var';
  font-style: normal;
  font-weight: 400;
  font-display: swap; /* Show fallback immediately, swap when loaded */
  src: local('Inter'), url('/fonts/inter-latin-400-normal.woff2') format('woff2');
}

@font-face {
  font-family: 'Lexend';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local('Lexend'), url('/fonts/lexend-latin-600-normal.woff2') format('woff2');
}

body {
  font-family: 'Inter var', 'Inter', system-ui, -apple-system, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Lexend', 'Inter var', system-ui, sans-serif;
}
```

**Source:** [CSS @font-face font-display](https://developer.chrome.com/blog/font-display), [Font Loading Strategies](https://web.dev/articles/font-best-practices)

### Bundle Analysis Configuration

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  site: 'https://vwcgapp.com',

  build: {
    inlineStylesheets: 'auto', // Inline CSS < 4KB
  },

  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Group React vendor libraries
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
            // Group chart libraries
            if (id.includes('recharts') || id.includes('react-circular-progressbar')) {
              return 'charts';
            }
            // Group Radix UI components
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
          }
        }
      }
    },
    plugins: [
      visualizer({
        open: false,              // Don't auto-open browser
        filename: './dist/stats.html',
        template: 'treemap',      // Options: treemap, sunburst, network
        gzipSize: true,
        brotliSize: true,
      })
    ]
  }
});
```

**Source:** [rollup-plugin-visualizer GitHub](https://github.com/btd/rollup-plugin-visualizer), [Vite Rollup Options](https://vitejs.dev/guide/build.html#chunking-strategy)

### Lighthouse CI Testing Script

```json
// package.json scripts
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test:perf": "npm run build && npm run test:lighthouse",
    "test:lighthouse": "lighthouse http://localhost:4321 --preset=desktop --output=html --output-path=./lighthouse-desktop.html && lighthouse http://localhost:4321 --preset=perf --emulated-form-factor=mobile --throttling.rttMs=150 --throttling.throughputKbps=1638 --throttling.cpuSlowdownMultiplier=4 --output=html --output-path=./lighthouse-mobile.html"
  }
}
```

**Lighthouse CLI command breakdown:**
```bash
# Mobile (Slow 4G / Fast 3G emulation)
lighthouse http://localhost:4321 \
  --preset=perf \
  --emulated-form-factor=mobile \
  --throttling.rttMs=150 \              # 150ms RTT (3G)
  --throttling.throughputKbps=1638 \    # 1.6 Mbps download
  --throttling.cpuSlowdownMultiplier=4 \ # 4x CPU slowdown
  --output=html \
  --output-path=./lighthouse-mobile.html

# Desktop (no throttling)
lighthouse http://localhost:4321 \
  --preset=desktop \
  --output=html \
  --output-path=./lighthouse-desktop.html
```

**Source:** [Lighthouse Throttling Documentation](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md), [Lighthouse CLI Options](https://github.com/GoogleChrome/lighthouse)

### Astro Image Component for Future Use

```astro
---
// Future: When hero image is added
import { Picture } from 'astro:assets';
import heroBusinessDashboard from '../assets/hero-business-dashboard.jpg';
---

<section class="hero">
  <Picture
    src={heroBusinessDashboard}
    formats={['avif', 'webp', 'jpeg']}
    alt="Business assessment dashboard showing leadership and operations metrics"
    width={1200}
    height={630}
    widths={[400, 800, 1200, 1600]}
    sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
    loading="eager"
    fetchpriority="high"
    decoding="sync"
    pictureAttributes={{
      class: "w-full h-auto"
    }}
  />
</section>
```

**Source:** [Astro Picture Component API](https://docs.astro.build/en/reference/modules/astro-assets/), [Image Optimization Guide](https://docs.astro.build/en/guides/images/)

## State of the Art

| Old Approach | Current Approach (2026) | When Changed | Impact |
|--------------|-------------------------|--------------|--------|
| External Google Fonts CDN | Self-hosted WOFF2 with @fontsource | 2023+ (cache partitioning) | Eliminates external DNS/TLS, reduces FCP by 100-300ms |
| WebP only | AVIF → WebP → JPEG fallback | 2024+ (AVIF browser support) | 50% smaller files than JPEG, 20% smaller than WebP |
| Manual CSS inlining | Astro inlineStylesheets: 'auto' | Astro 3.0+ (2023) | Automatic optimization, no manual extraction |
| Preload everything | Preload 1-2 critical resources only | 2024+ (fetchpriority API) | Browsers prioritize effectively, prevents queue congestion |
| Lighthouse v8 | Lighthouse v12 with new metrics | 2025-2026 | Video elements as LCP candidates, improved throttling |
| client:load by default | client:visible for below-fold | Astro 2.0+ (2023) | Defers hydration until scrolled into view, improves TBT |
| webpack-bundle-analyzer | rollup-plugin-visualizer | Vite adoption (2021+) | Native Vite/Rollup support, ESM-only, accurate tree-shaking visualization |

**Deprecated/outdated:**
- **Google Fonts CDN without self-hosting:** Chrome/Safari cache partitioning (2023) means fonts aren't shared across sites. Self-hosting is now faster.
- **PNG for photos:** WebP/AVIF offer 30-50% size reduction with better quality. PNG still useful for graphics/logos with transparency.
- **Intersection Observer polyfills:** All modern browsers support natively (2020+). No polyfill needed for client:visible.
- **Critical CSS inline plugins (Critters):** Astro's inlineStylesheets: 'auto' handles this automatically. No plugin needed.

## Open Questions

Things that couldn't be fully resolved:

1. **Current PageSpeed Baseline Score**
   - What we know: Site builds successfully, uses Astro 5 with React Islands, ~16KB gzipped new bundles
   - What's unclear: Actual current mobile PageSpeed score before optimization (need to run Lighthouse test)
   - Recommendation: Run baseline Lighthouse mobile test on preview deployment to establish starting metrics

2. **AssessmentApp Hydration Strategy**
   - What we know: AssessmentApp is 311KB gzipped, largest bundle on the site
   - What's unclear: What client directive is used on AssessmentApp component (likely client:load since it's the main app)
   - Recommendation: Audit app/[...tool].astro to verify hydration strategy; consider client:idle if interactivity can be delayed

3. **Actual Font File Sizes**
   - What we know: Google Fonts loads Inter (4 weights) + Lexend (4 weights) externally
   - What's unclear: Total KB of font files after switching to @fontsource self-hosted (need to measure)
   - Recommendation: Install @fontsource packages, build, compare dist/ font file sizes to establish actual impact

4. **Third-Party Script Impact**
   - What we know: Site uses Netlify Forms for contact, Decap CMS for blog
   - What's unclear: Whether these inject render-blocking scripts on marketing pages
   - Recommendation: Check Network tab in DevTools for external scripts; consider deferring with defer/async attributes

5. **Hero Image Strategy**
   - What we know: No hero image currently exists (gradient background only)
   - What's unclear: Whether adding a hero image in future phases would become the LCP element (currently text-based LCP)
   - Recommendation: If adding hero image, use Astro Picture component with fetchpriority="high" and measure LCP impact

## Sources

### Primary (HIGH confidence)

- [Astro Documentation - Images](https://docs.astro.build/en/guides/images/) - Official image optimization guide
- [Astro Documentation - Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/) - inlineStylesheets configuration
- [Astro Documentation - Islands Architecture](https://docs.astro.build/en/concepts/islands/) - Client directives best practices
- [Web.dev - Optimize LCP](https://web.dev/articles/optimize-lcp) - Official LCP optimization techniques
- [Web.dev - Optimize CLS](https://web.dev/articles/optimize-cls) - Official CLS optimization guide
- [Web.dev - Fetch Priority API](https://web.dev/articles/fetch-priority) - fetchpriority attribute documentation
- [Lighthouse Throttling Documentation](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md) - Official throttling settings
- [rollup-plugin-visualizer GitHub](https://github.com/btd/rollup-plugin-visualizer) - Official bundle analyzer repository

### Secondary (MEDIUM confidence)

- [Astro Performance Optimization Deep Dive - Blackhole Software](https://www.blackholesoftware.com/blog/astro-performance-optimization-deep-dive/) - Verified with official docs
- [Perfect 100 PageSpeed with Astro - DEV Community](https://dev.to/benajaero/how-we-achieved-a-perfect-100-google-pagespeed-score-with-astrojs-and-partial-hydration-ek1) - Real-world case study
- [Complete Guide to Astro Performance - BetterLink](https://eastondev.com/blog/en/posts/dev/20251202-astro-performance-optimization/) - Comprehensive 8-tip guide
- [Self-Host Google Fonts - WP Rocket](https://docs.wp-rocket.me/article/1847-self-host-google-fonts) - Font optimization best practices
- [Core Web Vitals 2026 Guide - Sky SEO](https://skyseodigital.com/core-web-vitals-optimization-complete-guide-for-2026/) - Current metrics and benchmarks
- [Image Optimization 2025 - AI Bud](https://aibudwp.com/image-optimization-in-2025-webp-avif-srcset-and-preload/) - Modern image formats
- [fetchpriority Attribute - DebugBear](https://www.debugbear.com/blog/fetchpriority-attribute) - Priority hints best practices

### Tertiary (LOW confidence - need validation)

- None - all findings verified with official documentation or multiple secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Astro built-in features documented, @fontsource packages widely used, rollup-plugin-visualizer is standard for Vite
- Architecture: HIGH - Patterns verified in official Astro docs and web.dev performance guides
- Pitfalls: HIGH - Common issues documented in Lighthouse reports and Core Web Vitals guides

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - stable domain, Core Web Vitals thresholds unchanged since 2020)

**Key technology versions researched:**
- Astro: 5.17.1 (current stable)
- Lighthouse: 12.x (latest)
- rollup-plugin-visualizer: 6.0.5 (latest, requires Node 22+)
- @fontsource packages: 5.x (current)
- Core Web Vitals thresholds: LCP <2.5s, CLS <0.1 (unchanged since 2020)
