# Quick Task 23: Fix siteUrl domain from vwcgapp.com to vwcg.app

## Task
OG image URLs and all canonical/structured data URLs were using `https://vwcgapp.com` instead of `https://vwcg.app`. Social media crawlers couldn't resolve the OG images.

## Root Cause
The `siteUrl` constant was set to `https://vwcgapp.com` in 3 Astro files + astro.config.mjs. Static `robots.txt` and `sitemap.xml` also had the old domain.

## Files Changed (7)
- `src/layouts/MarketingLayout.astro` — siteUrl fix
- `src/pages/blog/[...slug].astro` — siteUrl fix
- `src/pages/blog/index.astro` — siteUrl fix
- `src/lib/pdf/singleToolReport.ts` — PDF footer domain
- `astro.config.mjs` — site URL for sitemap plugin
- `public/robots.txt` — sitemap URL
- `public/sitemap.xml` — all URLs, removed stale /app route

## Verification
- Build: Passed clean (17 pages)
- Zero references to `vwcgapp.com` in built output
- OG tags verified: `https://vwcg.app/blog/images/ai-readiness-assessment.png`

## Commit
- `656b168` — fix: add OG images and social sharing meta tags for blog posts
