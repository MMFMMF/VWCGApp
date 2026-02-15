---
wave: 1
depends_on: []
files_modified:
  - src/pages/index.astro
  - src/components/marketing/Hero.astro
  - src/components/marketing/Features.astro
  - src/components/marketing/SampleReport.astro
  - src/components/marketing/CTA.astro
  - src/components/marketing/Footer.astro
  - src/layouts/MarketingLayout.astro
  - public/sitemap.xml
  - astro.config.mjs
autonomous: true
---

# Plan: Marketing Landing Page (SEO-Optimized, Mobile-First)

## Objective

Create a conversion-optimized landing page for cold traffic with SEO meta tags, structured data, sitemap, and mobile-responsive design targeting 60%+ mobile visitors.

## Tasks

### Task 1: Create Marketing Layout

**Action:** Create Astro layout for marketing pages with SEO support
**Files:** src/layouts/MarketingLayout.astro
**Details:**

```astro
---
interface Props {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
}

const { title, description, ogImage = '/og-image.png', canonical } = Astro.props;
const siteUrl = 'https://vwcgapp.com'; // Update for production
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content={description} />

  <!-- SEO Meta Tags (MKT-03) -->
  <title>{title} | VWCGApp</title>
  <link rel="canonical" href={canonical || Astro.url.href} />

  <!-- Open Graph -->
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={`${siteUrl}${ogImage}`} />
  <meta property="og:url" content={Astro.url.href} />
  <meta property="og:type" content="website" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

  <!-- Structured Data (MKT-03) -->
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "VWCGApp",
      "applicationCategory": "BusinessApplication",
      "description": description,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "operatingSystem": "Web Browser"
    })}
  </script>

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

  <!-- Preconnect for fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
</head>
<body class="bg-white text-gray-900 antialiased">
  <slot />
</body>
</html>
```

### Task 2: Create Hero Section Component

**Action:** Build conversion-focused hero with clear value proposition
**Files:** src/components/marketing/Hero.astro
**Details:**

```astro
---
interface Props {
  ctaHref?: string;
}

const { ctaHref = '/app' } = Astro.props;
---

<section class="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
    <div class="text-center">
      <!-- Headline (MKT-01) -->
      <h1 class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
        See Where Your Business<br class="hidden sm:inline" />
        <span class="text-indigo-200">Really Stands</span>
      </h1>

      <!-- Subheadline -->
      <p class="mt-6 text-lg sm:text-xl lg:text-2xl text-indigo-100 max-w-3xl mx-auto">
        Get clear, actionable visibility into leadership, operations, strategy, and execution gaps—so you know exactly where to focus.
      </p>

      <!-- Value Props -->
      <div class="mt-8 flex flex-wrap justify-center gap-4 text-sm sm:text-base text-indigo-200">
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
          10+ Assessment Tools
        </span>
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
          AI-Powered Insights
        </span>
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
          PDF Reports
        </span>
      </div>

      <!-- CTA Buttons -->
      <div class="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <a
          href={ctaHref}
          class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all"
        >
          Start Free Assessment
          <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </a>
        <a
          href="#sample-report"
          class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all"
        >
          See Sample Report
        </a>
      </div>

      <!-- Trust Signal -->
      <p class="mt-8 text-sm text-indigo-200">
        No email required • Get results instantly • 100% private
      </p>
    </div>
  </div>

  <!-- Wave Divider -->
  <div class="absolute bottom-0 left-0 right-0">
    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
      <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
    </svg>
  </div>
</section>
```

### Task 3: Create Features Section

**Action:** Showcase key assessment tools and benefits
**Files:** src/components/marketing/Features.astro
**Details:**

```astro
---
const features = [
  {
    title: 'AI Readiness Assessment',
    description: 'Evaluate your organization across 6 AI dimensions—strategy, data, infrastructure, talent, governance, and culture.',
    icon: '🤖'
  },
  {
    title: 'Leadership DNA Analysis',
    description: 'Map current vs target leadership capabilities across vision, execution, empowerment, and more.',
    icon: '🧬'
  },
  {
    title: 'Business Emotional Intelligence',
    description: 'Track organizational EQ over time with trend analysis and actionable insights.',
    icon: '💡'
  },
  {
    title: 'SWOT Matrix Builder',
    description: 'Build a confidence-weighted SWOT analysis with strategic prioritization.',
    icon: '📊'
  },
  {
    title: '90-Day Roadmap Planner',
    description: 'Create an actionable 12-week plan with dependencies and phase-based execution.',
    icon: '🗺️'
  },
  {
    title: 'Cross-Tool Synthesis',
    description: 'Get AI-powered insights that connect findings across all your assessments.',
    icon: '✨'
  }
];
---

<section class="py-16 sm:py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
        10+ Strategic Assessment Tools
      </h2>
      <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
        Comprehensive analysis across leadership, operations, strategy, and execution—all in one place.
      </p>
    </div>

    <div class="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map(feature => (
        <div class="relative p-6 bg-gray-50 rounded-2xl hover:bg-indigo-50 transition-colors">
          <div class="text-4xl mb-4">{feature.icon}</div>
          <h3 class="text-lg font-semibold text-gray-900">{feature.title}</h3>
          <p class="mt-2 text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Task 4: Create Sample Report Preview

**Action:** Show value with sample report preview section
**Files:** src/components/marketing/SampleReport.astro
**Details:**

```astro
---

---

<section id="sample-report" class="py-16 sm:py-24 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
        See What You'll Get
      </h2>
      <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
        Comprehensive reports with actionable insights—download as PDF anytime.
      </p>
    </div>

    <div class="mt-12 relative">
      <!-- Report Preview Card -->
      <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <!-- Report Header -->
        <div class="bg-indigo-600 text-white p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold">Business Assessment Report</h3>
              <p class="text-indigo-200">Sample Company Inc.</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-indigo-200">Generated</div>
              <div class="font-medium">Feb 5, 2026</div>
            </div>
          </div>
        </div>

        <!-- Report Content Preview -->
        <div class="p-6 space-y-6">
          <!-- Insight Cards -->
          <div class="grid md:grid-cols-2 gap-4">
            <div class="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded">HIGH</span>
                <span class="font-medium text-gray-900">Execution Capability Gap</span>
              </div>
              <p class="mt-2 text-sm text-gray-600">Leadership execution score limits strategic pillars to 3. Consider focusing on fewer priorities.</p>
            </div>

            <div class="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 text-xs font-medium bg-amber-500 text-white rounded">MED</span>
                <span class="font-medium text-gray-900">Burnout Risk Detected</span>
              </div>
              <p class="mt-2 text-sm text-gray-600">Tasks exceed safe capacity. Reduce scope or extend timeline to prevent team burnout.</p>
            </div>

            <div class="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 text-xs font-medium bg-green-500 text-white rounded">INFO</span>
                <span class="font-medium text-gray-900">Strength Multiplication</span>
              </div>
              <p class="mt-2 text-sm text-gray-600">Strong alignment between leadership vision and data readiness creates competitive advantage.</p>
            </div>

            <div class="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded">OPP</span>
                <span class="font-medium text-gray-900">Opportunity Match</span>
              </div>
              <p class="mt-2 text-sm text-gray-600">High-confidence market opportunity aligns with your AI capabilities. Prioritize this initiative.</p>
            </div>
          </div>

          <!-- Scores Preview -->
          <div class="flex items-center justify-center gap-8 py-4 border-y border-gray-100">
            <div class="text-center">
              <div class="text-3xl font-bold text-indigo-600">72%</div>
              <div class="text-sm text-gray-500">AI Readiness</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-indigo-600">85%</div>
              <div class="text-sm text-gray-500">Leadership DNA</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-indigo-600">68%</div>
              <div class="text-sm text-gray-500">Advisor Ready</div>
            </div>
          </div>
        </div>

        <!-- Fade Overlay -->
        <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </div>
    </div>

    <div class="mt-8 text-center">
      <a
        href="/app"
        class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
      >
        Get Your Own Report
        <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
      </a>
    </div>
  </div>
</section>
```

### Task 5: Create CTA Section

**Action:** Final conversion-focused call to action
**Files:** src/components/marketing/CTA.astro
**Details:**

```astro
---
interface Props {
  ctaHref?: string;
}

const { ctaHref = '/app' } = Astro.props;
---

<section class="py-16 sm:py-24 bg-indigo-600">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
      Ready to See Where You Stand?
    </h2>
    <p class="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
      Complete your first assessment in under 10 minutes. Get instant insights—no email required.
    </p>

    <div class="mt-10">
      <a
        href={ctaHref}
        class="inline-flex items-center justify-center px-10 py-5 text-xl font-semibold rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all"
      >
        Start Free Assessment Now
        <svg class="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
      </a>
    </div>

    <p class="mt-6 text-sm text-indigo-200">
      Trusted by 500+ business owners • No credit card required
    </p>
  </div>
</section>
```

### Task 6: Create Footer Component

**Action:** Simple footer with links and contact
**Files:** src/components/marketing/Footer.astro
**Details:**

```astro
---

---

<footer class="bg-gray-900 text-gray-400">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid md:grid-cols-4 gap-8">
      <!-- Brand -->
      <div class="md:col-span-2">
        <div class="text-white font-bold text-xl">VWCGApp</div>
        <p class="mt-2 text-sm">
          Value-Weighted Capability Gap Assessment. Get clear visibility into business readiness gaps so you can make informed decisions.
        </p>
      </div>

      <!-- Links -->
      <div>
        <h4 class="text-white font-semibold mb-4">Quick Links</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/" class="hover:text-white transition-colors">Home</a></li>
          <li><a href="/blog" class="hover:text-white transition-colors">Blog</a></li>
          <li><a href="/app" class="hover:text-white transition-colors">Assessment Tools</a></li>
          <li><a href="#contact" class="hover:text-white transition-colors">Contact</a></li>
        </ul>
      </div>

      <!-- Legal -->
      <div>
        <h4 class="text-white font-semibold mb-4">Legal</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a></li>
          <li><a href="/terms" class="hover:text-white transition-colors">Terms of Service</a></li>
        </ul>
      </div>
    </div>

    <div class="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
      <p>&copy; {new Date().getFullYear()} VWCGApp. All rights reserved.</p>
    </div>
  </div>
</footer>
```

### Task 7: Update Landing Page

**Action:** Compose landing page from components
**Files:** src/pages/index.astro
**Details:**

Replace existing content with:

```astro
---
import MarketingLayout from '../layouts/MarketingLayout.astro';
import Hero from '../components/marketing/Hero.astro';
import Features from '../components/marketing/Features.astro';
import SampleReport from '../components/marketing/SampleReport.astro';
import CTA from '../components/marketing/CTA.astro';
import Footer from '../components/marketing/Footer.astro';

const pageTitle = 'Business Assessment & Gap Analysis';
const pageDescription = 'Get clear, actionable visibility into your business readiness gaps across leadership, operations, strategy, and execution. Free assessment tools with instant results.';
---

<MarketingLayout title={pageTitle} description={pageDescription}>
  <main>
    <Hero ctaHref="/app" />
    <Features />
    <SampleReport />
    <CTA ctaHref="/app" />
  </main>
  <Footer />
</MarketingLayout>

<style is:global>
  /* Smooth scroll for anchor links */
  html {
    scroll-behavior: smooth;
  }
</style>
```

### Task 8: Create Sitemap and Configure SEO

**Action:** Add sitemap and configure Astro for SEO
**Files:** public/sitemap.xml, astro.config.mjs
**Details:**

Create static sitemap (can be automated later with @astrojs/sitemap):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.w3.org/2000/svg">
  <url>
    <loc>https://vwcgapp.com/</loc>
    <lastmod>2026-02-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://vwcgapp.com/blog</loc>
    <lastmod>2026-02-05</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://vwcgapp.com/app</loc>
    <lastmod>2026-02-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
```

Update astro.config.mjs to add site URL:

```javascript
// Add site config
site: 'https://vwcgapp.com',
```

### Task 9: Verify Build

**Action:** Run build to verify no errors
**Files:** N/A

## Verification

- [ ] Landing page loads in <2 seconds
- [ ] Hero section displays with value proposition
- [ ] Features section shows 6 tool cards
- [ ] Sample report preview is visible
- [ ] CTA section has clear call to action
- [ ] Footer displays with links
- [ ] Meta tags present in HTML head
- [ ] Structured data JSON-LD present
- [ ] Mobile responsive (test at 375px width)
- [ ] sitemap.xml accessible
- [ ] Build completes successfully

## Must-Haves

- MKT-01: Landing page optimized for cold traffic with clear value proposition and CTAs
- MKT-03: SEO optimization with meta tags, Open Graph, structured data, sitemap
- MKT-04: Mobile-responsive design (tested at 375px and 768px breakpoints)
