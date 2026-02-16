# Quick Task 23: Fix siteUrl domain from vwcgapp.com to vwcg.app

## Task 1: Fix siteUrl in all source files
Change `https://vwcgapp.com` to `https://vwcg.app` in:
- src/layouts/MarketingLayout.astro (OG tags, canonical URLs)
- src/pages/blog/[...slug].astro (structured data, article URLs)
- src/pages/blog/index.astro (blog listing URLs)
- src/lib/pdf/singleToolReport.ts (PDF footer)
- astro.config.mjs (sitemap generation)
- public/robots.txt (sitemap reference)
- public/sitemap.xml (all URLs + fix stale /app route)

## Verification
- Build passes
- No `vwcgapp.com` in dist/ output
- OG image URLs use `https://vwcg.app/blog/images/...`
