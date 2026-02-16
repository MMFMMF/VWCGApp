# Quick Task 24: Deploy 9 New Blog Posts with OG Images, Schema Markup, Redirects, and Cross-Links

## Task
Deploy 9 new business strategy blog posts (batch 2) to vwcg.app/blog with cover images, enhanced JSON-LD schema, 301 redirects for replaced/deleted posts, and cross-links to existing AI cluster posts.

## Files Changed (36)

### New blog posts (9)
- `src/content/blog/founder-dependency-business-cant-run-without-you.md` (Feb 1)
- `src/content/blog/5-decisions-growing-companies-should-not-make-alone.md` (Feb 3)
- `src/content/blog/sop-maturity-why-documented-processes-not-working.md` (Feb 4)
- `src/content/blog/90-day-roadmap-quarterly-execution-beats-annual-planning.md` (Feb 6)
- `src/content/blog/strategic-business-assessment-cost.md` (Feb 8)
- `src/content/blog/strategic-vision-team-actually-executes.md` (Feb 10)
- `src/content/blog/financial-readiness-can-your-business-afford-to-grow.md` (Feb 11)
- `src/content/blog/swot-analysis-small-business-changes-decisions.md` (Feb 13)
- `src/content/blog/5-patterns-predict-growing-company-will-stall.md` (Feb 15)

### New OG images (9)
- `public/blog/images/founder-dependency-business-cant-run-without-you.png`
- `public/blog/images/5-decisions-growing-companies-should-not-make-alone.png`
- `public/blog/images/sop-maturity-why-documented-processes-not-working.png`
- `public/blog/images/90-day-roadmap-quarterly-execution-beats-annual-planning.png`
- `public/blog/images/strategic-business-assessment-cost.png`
- `public/blog/images/strategic-vision-team-actually-executes.png`
- `public/blog/images/financial-readiness-can-your-business-afford-to-grow.png`
- `public/blog/images/swot-analysis-small-business-changes-decisions.png`
- `public/blog/images/5-patterns-predict-growing-company-will-stall.png`

### Deleted blog posts (7)
- `src/content/blog/sop-creation-guide.md` (replaced by sop-maturity)
- `src/content/blog/90-day-business-roadmap.md` (replaced by 90-day-roadmap)
- `src/content/blog/swot-analysis-tool.md` (replaced by swot-analysis)
- `src/content/blog/business-not-ready-for-ai.md`
- `src/content/blog/best-sop-management-tools-2025.md`
- `src/content/blog/sample-post.md`
- `src/content/blog/why-assess-business.md`

### Modified files (11)
- `netlify.toml` — 7 new 301 redirects + 5 updated /guide/* redirects
- `public/sitemap.xml` — 15 blog post URLs + updated lastmod dates
- `src/layouts/MarketingLayout.astro` — Organization schema update, array structuredData support, og:site_name
- `src/pages/blog/[...slug].astro` — Article + BreadcrumbList + Person JSON-LD schemas
- `src/pages/blog/index.astro` — CollectionPage schema with ItemList
- `src/content/blog/ai-implementation-small-business-no-tech-team.md` — cross-link to SOP maturity
- `src/content/blog/ai-readiness-assessment-company-ready.md` — cross-link to financial readiness
- `src/content/blog/ai-cost-small-business-realistic-breakdown.md` — cross-link to assessment cost
- `src/content/blog/why-ai-pilots-fail-deployment-framework.md` — cross-link to 90-day roadmap
- `src/content/blog/ai-use-cases-save-money-small-business.md` — cross-link to SOP maturity
- `src/content/blog/ai-consulting-vs-agency-vs-vendor.md` — cross-link to 5 decisions

## Schema Markup
- **Article** schema on all 15 blog posts (Person author: Kamyar Shah)
- **BreadcrumbList** schema on all 15 blog posts (Home > Blog > Post)
- **Person** schema on all 15 blog posts (Kamyar Shah with knowsAbout)
- **CollectionPage** schema on /blog index with 15-item ItemList
- **Organization** schema site-wide (alternateName, sameAs, founder)

## Redirects (12 total in netlify.toml)
- 3 replaced: sop-creation-guide, 90-day-business-roadmap, swot-analysis-tool
- 4 deleted: business-not-ready-for-ai, best-sop-management-tools-2025, why-assess-business, sample-post
- 5 updated: /guide/* redirects now point to new slugs (no redirect chains)

## Verification
- Build: Passed clean (19 pages)
- 3 JSON-LD blocks per blog post (Article + BreadcrumbList + Person)
- CollectionPage with 15 ListItems on blog index
- og:site_name: "VWCG by World Consulting Group"
- article:author: https://kamyarshah.com
- Zero references to deleted slugs in built output

## Commit
- `94c2b31` — feat: deploy 9 new blog posts with OG images, schema markup, redirects, and cross-links
