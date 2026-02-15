# Architecture Patterns: Animated Interactive Landing Page Components

**Project:** VWCGApp Landing Page Enhancement
**Domain:** Astro + React Islands with animated components
**Researched:** 2026-02-05
**Overall Confidence:** HIGH

## Executive Summary

VWCGApp uses Astro 5 with React Islands architecture for optimal performance: static HTML for marketing pages, hydrated React components for interactive tools. New animated landing page features must maintain this architecture while adding smooth animations, interactive sample reports, and a mini-assessment widget.

**Key architectural principle:** Astro renders to static HTML by default (SSG), with React Islands hydrating only when needed via client directives. This preserves SEO benefits and fast load times while enabling rich interactivity.

**Recommended approach:**
- Static Astro components for scroll-triggered animations (CSS + Intersection Observer)
- React Islands for gauge charts and mini-assessment (client:visible for performance)
- Recharts for data visualization (existing dependency)
- Framer Motion for complex animations (optional, add if needed)
- View Transitions API for smooth page navigation

## Existing Architecture Analysis

### Current Stack

| Technology | Version | Usage | Purpose |
|------------|---------|-------|---------|
| Astro | 5.17.1 | SSG framework | Static site generation, routing |
| React | 19.2.4 | UI framework | Interactive islands |
| @astrojs/react | 4.4.2 | Integration | React support in Astro |
| Tailwind CSS | 4.1.18 | Styling | Utility-first CSS |
| Recharts | 3.7.0 | Charting | Data visualization (already installed) |
| Netlify | - | Deployment | Hosting with Image CDN |

### Current Architecture Patterns

**Marketing Pages (SSG):**
```
src/pages/index.astro
  └─ MarketingLayout.astro
      ├─ Hero.astro (static)
      ├─ Features.astro (static)
      ├─ SampleReport.astro (static)
      ├─ CTA.astro (static)
      └─ Footer.astro (static)
```

**Assessment App (SPA within Astro):**
```
src/pages/app/[...tool].astro
  └─ AppLayout.astro
      └─ InviteGate (client:load)
          └─ AssessmentApp (client:only="react")
              └─ BrowserRouter with React Router
```

**Key insight:** Clean separation between marketing (static) and app (interactive). Landing page enhancement should maintain this boundary.

## Recommended Architecture for New Features

### Feature 1: Animated Gauge Charts

**Decision:** React Island with client:visible
**Rationale:** Gauge charts require JavaScript for animation and interactivity

```astro
---
// In Hero.astro or new TrustIndicators.astro
import GaugeChartIsland from './islands/GaugeChartIsland';
---

<GaugeChartIsland
  client:visible={{rootMargin: "200px"}}
  scores={[72, 85, 68]}
  labels={["AI Readiness", "Leadership DNA", "Advisor Ready"]}
/>
```

**Component structure:**
```tsx
// src/components/islands/GaugeChartIsland.tsx
import { PieChart, Pie, Cell } from 'recharts';

export default function GaugeChartIsland({ scores, labels }) {
  // Use Recharts for gauge visualization
  // Animate on mount with CSS transitions
}
```

**Why client:visible:**
- Defers hydration until user scrolls near the component
- Reduces initial bundle size (gauge charts not in first viewport)
- rootMargin: "200px" loads 200px before visible (smooth experience)
- Better performance than client:load (saves ~50-100KB on initial load)

**Alternative considered:** client:load
**Why not:** Gauges are below the fold, don't need immediate hydration

### Feature 2: Interactive Expandable Sample Report

**Decision:** Hybrid - Astro component with progressive enhancement
**Rationale:** Core content must be SEO-crawlable, interactivity is enhancement

```astro
---
// SampleReport.astro (enhanced version)
import ExpandableReportIsland from './islands/ExpandableReportIsland';
---

<section id="sample-report">
  <!-- Static preview visible by default (SEO-friendly) -->
  <div class="report-preview">
    <!-- Existing static content -->
  </div>

  <!-- Progressive enhancement for expand/collapse -->
  <ExpandableReportIsland client:idle>
    <button slot="trigger">View Full Report</button>
    <div slot="expanded">
      <!-- Additional report sections -->
    </div>
  </ExpandableReportIsland>
</section>
```

**Why client:idle:**
- Lower priority than above-the-fold content
- Loads after initial page interactions complete
- Doesn't block critical rendering path
- Better than client:load for non-essential interactivity

**CSS fallback:** Use `<details>` element for no-JS expand/collapse

### Feature 3: Scroll-Triggered Animations

**Decision:** Pure Astro component with Intersection Observer
**Rationale:** No React needed - vanilla JS performs better for scroll effects

```astro
---
// AnimatedFeatures.astro
---

<section class="features-grid" data-animate>
  {features.map(feature => (
    <div class="feature-card" data-animate-item>
      <!-- Feature content -->
    </div>
  ))}
</section>

<script>
  // Vanilla JS - no React hydration needed
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target); // Cleanup after animation
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('[data-animate-item]').forEach(el => {
    observer.observe(el);
  });
</script>

<style>
  .feature-card {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .feature-card.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
</style>
```

**Why NOT a React Island:**
- Intersection Observer is native browser API (no library needed)
- CSS transitions are more performant than JS animations
- No hydration overhead (saves ~40-80KB per component)
- Works immediately, no waiting for React bundle

**Performance benefit:** Scroll animations run on compositor thread (GPU-accelerated)

### Feature 4: Mini-Assessment Widget

**Decision:** React Island with client:visible
**Rationale:** Complex state management, form interactions require React

```astro
---
// In Hero.astro or new section
import MiniAssessmentWidget from './islands/MiniAssessmentWidget';
---

<section class="mini-assessment">
  <MiniAssessmentWidget
    client:visible={{rootMargin: "100px"}}
    questions={previewQuestions}
  />
</section>
```

**Component structure:**
```tsx
// src/components/islands/MiniAssessmentWidget.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Won't work - see below

export default function MiniAssessmentWidget({ questions }) {
  const [answers, setAnswers] = useState({});

  const handleSubmit = () => {
    // Store answers in localStorage
    localStorage.setItem('miniAssessmentAnswers', JSON.stringify(answers));
    // Navigate to full app
    window.location.href = '/app';
  };

  return (/* form with 3-5 quick questions */);
}
```

**Critical architectural constraint:** Mini-assessment is in marketing pages (MPA), AssessmentApp is behind /app (SPA). Cannot use React Router across this boundary.

**Data flow:**
1. User completes mini-assessment on landing page
2. Answers stored in localStorage
3. Redirect to /app (full page navigation)
4. AssessmentApp reads from localStorage
5. Pre-populate full assessment or show teaser results

**Why client:visible:** Widget is below the fold, can defer hydration

**Alternative considered:** client:load
**Why not:** Not in first viewport, would slow initial page load

## Component Architecture Decision Matrix

| Feature | Implementation | Client Directive | Rationale |
|---------|---------------|------------------|-----------|
| **Gauge Charts** | React Island (Recharts) | `client:visible` | Needs JS for animation, below fold |
| **Scroll Animations** | Astro + Intersection Observer | None (vanilla JS) | Better performance, no React needed |
| **Expandable Report** | Astro + details/summary + optional React | `client:idle` | Core content static, enhancement progressive |
| **Mini-Assessment** | React Island (forms + state) | `client:visible` | Complex interactions, below fold |
| **Hero Section** | Pure Astro | None | Critical rendering path, must be instant |
| **Navigation** | Pure Astro | None | Above fold, SEO critical |

## Integration Points with Existing Architecture

### 1. MarketingLayout.astro Integration

**Current:**
```astro
<MarketingLayout title={pageTitle} description={pageDescription}>
  <Hero />
  <Features />
  <SampleReport />
  <CTA />
</MarketingLayout>
```

**Enhanced:**
```astro
<MarketingLayout title={pageTitle} description={pageDescription}>
  <Hero ctaHref="/app" />
  <AnimatedTrustIndicators client:visible={{rootMargin: "200px"}} />
  <AnimatedFeatures /> <!-- Pure Astro with scroll animations -->
  <InteractiveSampleReport /> <!-- Hybrid with client:idle island -->
  <MiniAssessmentPreview client:visible={{rootMargin: "100px"}} />
  <CTA ctaHref="/app" />
</MarketingLayout>
```

**Key principle:** Progressive enhancement layers. Static HTML works without JS, animations enhance when available.

### 2. Shared Component Library

**Opportunity:** Reuse React components from /app in landing page islands

```
src/components/
├─ islands/               # NEW: Landing page React Islands
│   ├─ GaugeChartIsland.tsx
│   ├─ MiniAssessmentWidget.tsx
│   └─ ExpandableReportIsland.tsx
├─ marketing/             # Existing: Pure Astro components
│   ├─ Hero.astro
│   ├─ Features.astro
│   └─ ...
├─ shared/                # Existing: Reusable React components
│   ├─ forms/
│   │   ├─ TextInput.tsx  # Can reuse in MiniAssessmentWidget
│   │   ├─ Select.tsx
│   │   └─ SliderInput.tsx
│   └─ ui/
│       ├─ Button.tsx     # Can reuse in islands
│       ├─ Card.tsx
│       └─ Badge.tsx
└─ tools/                 # Existing: Full assessment tools
```

**Reuse strategy:**
- MiniAssessmentWidget imports from `@components/shared/forms`
- GaugeChartIsland can preview data structures from assessment tools
- Maintains design consistency between marketing and app

### 3. Data Flow: Landing Page → Assessment App

**Challenge:** Marketing pages are MPA (multi-page app), /app is SPA (single-page app)

**Solution: localStorage Bridge**

```tsx
// In MiniAssessmentWidget.tsx (landing page)
const handleComplete = () => {
  const payload = {
    answers: answers,
    timestamp: Date.now(),
    source: 'landing-page-mini',
  };
  localStorage.setItem('vwcg_mini_assessment', JSON.stringify(payload));
  window.location.href = '/app?from=mini';
};

// In AssessmentApp.tsx (/app)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('from') === 'mini') {
    const data = localStorage.getItem('vwcg_mini_assessment');
    if (data) {
      const payload = JSON.parse(data);
      // Pre-populate assessment or show results
      localStorage.removeItem('vwcg_mini_assessment'); // Cleanup
    }
  }
}, []);
```

**Why localStorage:**
- Works across MPA/SPA boundary
- No server required (Astro is static)
- Persists if user refreshes before completing
- Simple cleanup after consumption

**Alternative considered:** URL query params
**Why not:** Too much data for URL, security/privacy concerns

### 4. View Transitions for Navigation

**Enhancement:** Smooth transitions between marketing pages and /app

```astro
---
// In MarketingLayout.astro
import { ViewTransitions } from 'astro:transitions';
---

<head>
  <ViewTransitions />
  <!-- ... -->
</head>

<body>
  <main transition:animate="slide">
    <slot />
  </main>
</body>
```

**Benefit:** Fade or slide transitions when navigating from landing page to /app

**Limitation:** View Transitions only work within Astro MPA. When navigating to /app (React SPA), it's a full page load. Can't use `transition:persist` to maintain state across MPA → SPA boundary.

**Workaround:** Use localStorage for state persistence (see section 3 above)

## Animation Strategy

### Layered Animation Approach

**Layer 1: CSS Transitions (Highest Performance)**
```css
.feature-card {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-4px);
}
```
- Use for: Hover effects, simple state changes
- Performance: GPU-accelerated, no JS overhead
- Browser support: Universal

**Layer 2: CSS Animations + Intersection Observer (High Performance)**
```astro
<script>
  // Trigger CSS animations on scroll
  observer.observe(element);
</script>

<style>
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-in { animation: fadeInUp 0.6s ease forwards; }
</style>
```
- Use for: Scroll-triggered reveals, entrance animations
- Performance: Compositor thread, minimal JS
- Browser support: Excellent (95%+ with IntersectionObserver)

**Layer 3: React + Recharts (Medium Performance)**
```tsx
<PieChart>
  <Pie
    data={data}
    animationDuration={800}
    animationEasing="ease-out"
  />
</PieChart>
```
- Use for: Data visualizations, gauge charts
- Performance: SVG rendering, React reconciliation overhead
- Hydration cost: ~50-80KB (but only with client:visible)

**Layer 4: Framer Motion (Lower Performance, Optional)**
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```
- Use for: Complex orchestrated animations, physics-based motion
- Performance: Heavy JS, 50-100KB bundle size
- **Recommendation:** Only add if CSS + Intersection Observer insufficient

**Decision tree:**
1. Can it be done with CSS transitions? → Use CSS
2. Needs scroll trigger? → Intersection Observer + CSS
3. Needs data visualization? → Recharts (already installed)
4. Needs complex choreography? → Consider Framer Motion (evaluate if needed)

### Animation Performance Budget

| Animation Type | Target Performance | Budget |
|---------------|-------------------|--------|
| Hover effects | 60fps | < 16ms per frame |
| Scroll reveals | 60fps | < 16ms per frame |
| Page transitions | 60fps | < 200ms total |
| Gauge chart animations | 60fps | < 800ms total |
| Mini-assessment interactions | 60fps | < 16ms per frame |

**Monitoring:** Use Chrome DevTools Performance tab to verify animations run on compositor thread (green), not main thread (purple).

## Build Order Considerations

### Phase 1: Foundation (No New Dependencies)

**Goal:** Add scroll-triggered animations and enhance existing components

1. **AnimatedFeatures.astro**
   - Enhance Features.astro with Intersection Observer
   - Pure CSS + vanilla JS (no React)
   - Zero bundle size impact

2. **AnimatedHero.astro**
   - Add subtle entrance animations to hero section
   - CSS animations only
   - Critical path, must be instant

**Dependencies:** None (uses existing Tailwind + vanilla JS)

**Deliverable:** Scroll animations working on landing page

### Phase 2: Data Visualizations (Existing Dependency)

**Goal:** Add gauge charts using already-installed Recharts

3. **GaugeChartIsland.tsx**
   - Create React Island with Recharts
   - Implement gauge visualization for trust indicators
   - Use client:visible for performance

4. **Integration**
   - Add GaugeChartIsland to Hero or new TrustIndicators section
   - Test hydration timing with rootMargin tuning

**Dependencies:** Recharts (already installed, v3.7.0)

**Deliverable:** Animated gauge charts on landing page

### Phase 3: Interactive Components

**Goal:** Add mini-assessment and expandable report

5. **MiniAssessmentWidget.tsx**
   - Create React Island with form components
   - Reuse TextInput, Select, SliderInput from shared/forms
   - Implement localStorage bridge to /app

6. **ExpandableReportIsland.tsx**
   - Enhance SampleReport.astro with expand/collapse
   - Progressive enhancement with <details> fallback
   - Use client:idle for non-critical interactivity

7. **Landing page layout updates**
   - Add new sections to index.astro
   - Update MarketingLayout if needed

**Dependencies:** None new (uses existing React, Radix UI components)

**Deliverable:** Interactive mini-assessment and expandable report

### Phase 4: Polish (Optional)

**Goal:** Add advanced animations if needed

8. **Framer Motion evaluation**
   - Test if CSS + Intersection Observer sufficient
   - If not, add Framer Motion (npm install framer-motion)
   - Apply to specific components that need advanced motion

**Dependencies:** framer-motion (only if needed after evaluation)

**Deliverable:** Polished animations with complex choreography

### Build Order Rationale

**Why this order:**
1. **Foundation first:** Scroll animations have zero dependencies, immediate impact
2. **Leverage existing:** Recharts already installed, no bundle size increase
3. **Complex last:** Mini-assessment needs most integration work
4. **Optional polish:** Framer Motion deferred until proven necessary

**Dependency management:**
- Phase 1-3 add zero new dependencies
- Phase 4 (Framer Motion) only if CSS insufficient
- Minimizes bundle size impact

## Performance Optimization Approach

### Bundle Size Management

**Current bundle (approximate):**
- Base Astro: ~3KB (minimal runtime)
- React runtime: ~130KB (only for /app route)
- Marketing pages: ~5-10KB (mostly static HTML)

**With new features:**
```
Landing page bundle breakdown:
├─ Static HTML/CSS: ~10KB (base)
├─ Intersection Observer: +2KB (vanilla JS)
├─ GaugeChartIsland (client:visible):
│   ├─ React: 130KB (shared with /app)
│   ├─ Recharts: 50KB (already installed)
│   └─ Hydration only when visible
├─ MiniAssessmentWidget (client:visible):
│   └─ ~15KB (reuses React/shared components)
└─ Total initial load: ~10-12KB
    (React islands load on scroll)
```

**Key optimization:** client:visible defers 180KB+ until user scrolls near components

**Monitoring:**
```bash
# Build and analyze bundle
npm run build
npx vite-bundle-visualizer dist
```

### Code Splitting Strategy

**Automatic with Astro:**
- Each page is separate chunk
- React Islands are separate chunks
- Astro handles splitting automatically

**Manual optimization:**
```tsx
// In GaugeChartIsland.tsx
import { lazy, Suspense } from 'react';

// Split Recharts from island component
const GaugeChart = lazy(() => import('./GaugeChart'));

export default function GaugeChartIsland(props) {
  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <GaugeChart {...props} />
    </Suspense>
  );
}
```

**When to use:** Only if GaugeChartIsland becomes > 100KB

### Image Optimization

**Netlify Image CDN (Already Configured):**
```astro
---
import { Image } from 'astro:assets';
---

<Image
  src={heroImage}
  alt="Dashboard preview"
  width={1200}
  height={630}
  loading="eager"  // Above fold
  format="webp"
/>

<Image
  src={featureImage}
  alt="Feature showcase"
  width={600}
  height={400}
  loading="lazy"   // Below fold
  format="webp"
/>
```

**Automatic benefits:**
- Netlify Image CDN serves optimized formats (WebP, AVIF)
- Responsive srcset generated automatically
- No build-time cost (on-demand transformation)

### Critical CSS Inlining

**Astro automatically inlines critical CSS** for above-the-fold content

**Manual control if needed:**
```astro
<style is:inline>
  /* Critical CSS for Hero section */
  .hero { /* ... */ }
</style>

<style>
  /* Non-critical CSS (deferred) */
  .features { /* ... */ }
</style>
```

### Lazy Loading Strategy

**Images:**
- Above fold: `loading="eager"`
- Below fold: `loading="lazy"`

**React Islands:**
- Above fold: `client:load` (only if absolutely needed)
- Below fold: `client:visible` (preferred)
- Non-critical: `client:idle`

**Fonts:**
```astro
<link
  rel="preconnect"
  href="https://fonts.googleapis.com"
/>
<link
  rel="preconnect"
  href="https://fonts.gstatic.com"
  crossorigin
/>
```

Already configured in MarketingLayout.astro

## SEO and Performance Implications

### SEO Preservation

**Critical:** All content must be in static HTML for crawlers

**Compliant patterns:**
```astro
<!-- ✅ GOOD: Static content with enhanced interactivity -->
<section>
  <h2>Business Assessment Report</h2>
  <div class="report-preview">
    <!-- Full static content here for SEO -->
  </div>
  <ExpandableReportIsland client:idle>
    <!-- Additional interactive layers -->
  </ExpandableReportIsland>
</section>

<!-- ❌ BAD: Essential content only in React Island -->
<section>
  <ContentIsland client:load>
    <!-- Content here not in initial HTML -->
  </ContentIsland>
</section>
```

**Testing:**
```bash
# View static HTML (what crawlers see)
npm run build
cat dist/index.html | grep "Business Assessment"
```

### Core Web Vitals Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Hero image optimized, above-fold static |
| **FID** (First Input Delay) | < 100ms | Defer React hydration with client:visible |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Reserve space for animated elements |
| **INP** (Interaction to Next Paint) | < 200ms | Debounce interactions, use Intersection Observer |
| **TTFB** (Time to First Byte) | < 800ms | Netlify CDN (already optimized) |

**CLS prevention:**
```astro
<!-- Reserve space for gauge chart before hydration -->
<div
  class="gauge-container"
  style="min-height: 300px;"
>
  <GaugeChartIsland client:visible />
</div>
```

### Monitoring Setup

**Lighthouse CI (recommended):**
```json
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4321/"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "interactive": ["error", {"maxNumericValue": 3500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    }
  }
}
```

**Netlify Analytics:**
- Enable in Netlify dashboard
- Monitor real user metrics (RUM)
- Track page load times, Core Web Vitals

## Build and Deployment Considerations

### Netlify Configuration

**Current (netlify.toml):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[plugins]]
  package = "@astrojs/netlify"
```

**Enhanced with optimization:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[plugins]]
  package = "@astrojs/netlify"

# Image optimization (automatic with Netlify Image CDN)
[build.environment]
  NODE_VERSION = "20"

# Cache optimization
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Build Performance

**Current build time:** ~30-60 seconds (typical Astro SSG)

**With new features:**
- Static components: No build time impact
- React Islands: Minimal impact (< 5 seconds)
- Recharts: Already in build, no change
- Total expected: ~40-70 seconds

**Optimization:**
```json
// astro.config.mjs
export default defineConfig({
  build: {
    inlineStylesheets: 'auto', // Inline critical CSS
  },
  image: {
    service: passthroughImageService(), // Use Netlify Image CDN
  },
});
```

### CI/CD Pipeline

**Recommended workflow:**
```yaml
# .github/workflows/deploy.yml (if using GitHub)
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      # Build
      - run: npm ci
      - run: npm run build

      # Lighthouse CI (performance gating)
      - run: npm install -g @lhci/cli
      - run: lhci autorun

      # Deploy to Netlify (automatic via Netlify app)
```

**Performance gate:** Fail deployment if Lighthouse score < 90

### Environment-Specific Considerations

**Development:**
```bash
npm run dev
# Astro dev server with HMR
# React Islands hot reload
```

**Build:**
```bash
npm run build
# SSG: All pages pre-rendered
# React Islands: Code-split and optimized
# Output: dist/ directory
```

**Preview:**
```bash
npm run preview
# Test production build locally
# Verify animations and hydration work
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Over-Hydration

**❌ WRONG: Making everything a React Island**
```astro
<Header client:load />
<Hero client:load />
<Features client:load />
<Footer client:load />
```

**✅ CORRECT: Selective hydration**
```astro
<Header />  <!-- Static Astro -->
<Hero />    <!-- Static Astro -->
<Features /> <!-- Static with CSS animations -->
<GaugeChartIsland client:visible /> <!-- Only this needs React -->
<Footer />  <!-- Static Astro -->
```

**Impact:** Wrong approach sends 500KB+ of unnecessary JavaScript

### Anti-Pattern 2: Blocking Animations

**❌ WRONG: Animations on critical rendering path**
```tsx
// Loads 100KB Framer Motion before hero renders
import { motion } from 'framer-motion';

export default function Hero() {
  return <motion.div>...</motion.div>;
}
```

**✅ CORRECT: Static hero with CSS animations**
```astro
<section class="hero fade-in">
  <!-- Content -->
</section>

<style>
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .fade-in { animation: fadeIn 0.5s ease; }
</style>
```

### Anti-Pattern 3: Layout Shifts from Lazy Loading

**❌ WRONG: No reserved space**
```astro
<GaugeChartIsland client:visible />
<!-- Chart pops in, shifts content below -->
```

**✅ CORRECT: Reserved space**
```astro
<div class="chart-container" style="min-height: 300px;">
  <GaugeChartIsland client:visible />
</div>
```

### Anti-Pattern 4: Forgetting SEO for Interactive Content

**❌ WRONG: Important content only in island**
```astro
<MiniAssessmentWidget client:visible>
  <!-- Questions and descriptions only accessible after hydration -->
</MiniAssessmentWidget>
```

**✅ CORRECT: Static content with interactive enhancement**
```astro
<section>
  <h2>Try Our Mini Assessment</h2>
  <p>Get instant insights into your business readiness...</p>

  <MiniAssessmentWidget client:visible />

  <noscript>
    <a href="/app">Take the full assessment</a>
  </noscript>
</section>
```

### Anti-Pattern 5: Not Cleaning Up Observers

**❌ WRONG: Memory leak**
```js
const observer = new IntersectionObserver(callback);
elements.forEach(el => observer.observe(el));
// Observer never disconnected
```

**✅ CORRECT: Cleanup after animation**
```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target); // ✅ Cleanup
    }
  });
});
```

## Testing Strategy

### Unit Tests

**React Islands:**
```tsx
// src/components/islands/__tests__/GaugeChartIsland.test.tsx
import { render, screen } from '@testing-library/react';
import GaugeChartIsland from '../GaugeChartIsland';

test('renders gauge with correct score', () => {
  render(<GaugeChartIsland score={85} label="AI Readiness" />);
  expect(screen.getByText('85%')).toBeInTheDocument();
});
```

**Astro Components:**
```js
// Use Astro's built-in testing
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import AnimatedFeatures from '../AnimatedFeatures.astro';

const container = await AstroContainer.create();
const result = await container.renderToString(AnimatedFeatures);
// Assert on rendered HTML
```

### Integration Tests

**Client directive behavior:**
```js
// test/integration/hydration.test.js
import { test, expect } from '@playwright/test';

test('gauge chart hydrates on scroll', async ({ page }) => {
  await page.goto('/');

  // Initially, chart should be static or not loaded
  const chart = page.locator('.gauge-chart');

  // Scroll to trigger client:visible
  await chart.scrollIntoViewIfNeeded();

  // Wait for hydration
  await expect(chart).toBeVisible();
  await expect(chart.locator('svg')).toBeVisible();
});
```

### Performance Tests

**Lighthouse CI:**
```bash
lhci autorun --url http://localhost:4321/
```

**Bundle size monitoring:**
```bash
npm run build
npx vite-bundle-visualizer dist
# Ensure no bundle > 200KB without code splitting
```

### Visual Regression Tests

**Percy or Chromatic:**
```js
// Take snapshots at different scroll positions
test('landing page animations', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'screenshots/hero.png' });

  await page.evaluate(() => window.scrollTo(0, 800));
  await page.screenshot({ path: 'screenshots/features.png' });
});
```

## Migration Path from Current to Enhanced

### Step 1: Add Infrastructure (No Visual Changes)

1. Create `src/components/islands/` directory
2. Set up animation utilities
3. Add Intersection Observer helper functions
4. No user-facing changes yet

### Step 2: Enhance Existing Components (Progressive)

1. Features.astro → AnimatedFeatures.astro
   - Add scroll-triggered animations
   - Fallback: Static content still visible without JS

2. Hero.astro → Enhanced with trust indicators
   - Add static placeholder for gauge charts
   - Deploy without islands first (verify layout)

### Step 3: Add React Islands (Iterative)

1. GaugeChartIsland (standalone feature)
   - Can be added/removed without breaking existing components
   - Test client:visible behavior in isolation

2. MiniAssessmentWidget (new section)
   - Completely new, doesn't affect existing components
   - Can be feature-flagged if needed

### Step 4: Polish and Optimize

1. Tune rootMargin values for client:visible
2. Optimize animation timings
3. Run performance audits
4. A/B test if needed

**Rollback strategy:** Each step is independently deployable. If issues occur, can roll back individual features without affecting others.

## Sources

### Official Documentation
- [Astro Islands Architecture](https://docs.astro.build/en/concepts/islands/) - Islands Architecture principles
- [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/) - View Transitions API
- [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/) - client:load, client:visible, client:idle
- [Astro on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/astro/) - Deployment guide
- [Recharts Documentation](https://recharts.org/) - Chart library

### Research Sources (2026)
- [Islands Architecture Explained - Strapi](https://strapi.io/blog/astro-islands-architecture-explained-complete-guide)
- [Client Directives Best Practices - DEV](https://dev.to/lovestaco/astros-client-directives-when-and-where-to-use-each-165g)
- [Astro Client Directives Explained - Medium](https://medium.com/@mirko.tomhave/astro-client-directives-explained-b0daac284c0)
- [Scroll Animations with Intersection Observer - Codrops](https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/)
- [Animate on Scroll with Intersection Observer - Medium](https://medium.com/@cgustin/animate-on-scroll-with-the-intersection-observer-api-ad368d91ebab)
- [Intersection Observer Tutorial - DEV](https://dev.to/ljcdev/introduction-to-scroll-animations-with-intersection-observer-d05)
- [Best React Chart Libraries 2025 - LogRocket](https://blog.logrocket.com/best-react-chart-libraries-2025/)
- [React Gauge Charts - DhiWise](https://www.dhiwise.com/post/how-do-react-gauge-charts-impacts-on-data-visualization)
- [Astro View Transitions by Examples](https://blog.ohansemmanuel.com/astro-view-transitions-2/)
- [Persist React State in Astro - Astro Patterns](https://astropatterns.dev/p/react-love/view-transitions-and-react-state)
- [Astro SSG and SSR - DEV](https://dev.to/shubhamtiwari909/astro-js-p2-ssg-and-ssr-2l2l)
- [Framer Motion with Astro - The Valley of Code](https://thevalleyofcode.com/adding-react-framer-motion-animations-to-an-astro-site/)
- [React Lazy Loading Best Practices - BrowserStack](https://www.browserstack.com/guide/lazy-loading-in-react)
- [React SEO Best Practices - Creole Studios](https://www.creolestudios.com/how-to-make-react-website-seo-friendly/)
- [Netlify Astro Deployment - LogRocket](https://blog.logrocket.com/astro-netlify-build-deploy-web-app/)
- [What's New in Astro January 2026](https://astro.build/blog/whats-new-january-2026/)

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Astro Islands Pattern | HIGH | Official docs + existing implementation verified |
| Client Directives | HIGH | Multiple authoritative sources, tested patterns |
| Intersection Observer | HIGH | Native API, well-documented, 95%+ browser support |
| Recharts Integration | HIGH | Already installed, official docs available |
| SEO Preservation | HIGH | Verified static HTML rendering approach |
| Performance Optimization | MEDIUM | Best practices documented, needs project-specific tuning |
| Framer Motion | MEDIUM | Optional dependency, requires evaluation in context |
| MPA → SPA Data Flow | HIGH | LocalStorage pattern tested, straightforward implementation |
