# Quick Task 19 Summary

## Task
Rename routes: /invite for gate, /assessment for tool, update all links, add domain redirects

## Changes

### Files created
- `src/pages/assessment/[...tool].astro` — Assessment app mount point (moved from app/)

### Files deleted
- `src/pages/app/[...tool].astro` — Old app route

### Files modified (15)
- `src/components/AssessmentApp.tsx` — basename="/app" → basename="/assessment"
- `src/pages/invite.astro` — redirect target /app → /assessment
- `src/pages/index.astro` — all ctaHref="/app" → ctaHref="/invite"
- `src/pages/blog/[...slug].astro` — CTA href="/app" → href="/invite"
- `src/layouts/AppLayout.astro` — nav link /app → /assessment
- `src/layouts/MarketingLayout.astro` — header CTA /app → /invite
- `src/components/marketing/Hero.astro` — default ctaHref /app → /invite
- `src/components/marketing/HowItWorks.astro` — default ctaHref /app → /invite
- `src/components/marketing/CTA.astro` — default ctaHref /app → /invite
- `src/components/marketing/Footer.astro` — link /app → /invite
- `src/components/marketing/SampleReport.astro` — CTA /app → /invite
- `src/components/islands/MiniAssessmentIsland.tsx` — CTA /app?tool=ai-readiness → /invite
- `src/content/blog/why-assess-business.md` — inline link /app → /invite
- `src/content/blog/sample-post.md` — inline link /app → /invite
- `netlify.toml` — SPA redirect /assessment/*, 301 /app/* → /assessment/, domain redirects
- `CLAUDE.md` — Updated route documentation

### Netlify redirects added
- `/assessment/*` → `/assessment/index.html` (200, SPA)
- `/app/*` → `/assessment/:splat` (301, force)
- `https://www.businessadvisors.app/*` → `https://vwcg.app/:splat` (301)
- `https://*.vwcg.app/*` → `https://vwcg.app/:splat` (301)

## Verification
- Build passes clean (tsc + astro build, 17 pages)
- `/assessment/index.html` generated (was `/app/index.html`)
- No `/app/` directory in dist
- Zero `href="/app"` references in built HTML
- 49 `href="/invite"` references across 16 HTML files
- All 13 blog posts intact
- `/invite/index.html` generated
