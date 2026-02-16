# Quick Task 24: Deploy 9 New Blog Posts with OG Images, Schema Markup, Redirects, and Cross-Links

## Task 1: Copy 9 OG images to public/blog/images/
Copy from `C:\Users\Kamyar\Downloads\` to `public/blog/images/`:
- founder-dependency-business-cant-run-without-you.png
- 5-decisions-growing-companies-should-not-make-alone.png
- sop-maturity-why-documented-processes-not-working.png
- 90-day-roadmap-quarterly-execution-beats-annual-planning.png
- strategic-business-assessment-cost.png
- strategic-vision-team-actually-executes.png
- financial-readiness-can-your-business-afford-to-grow.png
- swot-analysis-small-business-changes-decisions.png
- 5-patterns-predict-growing-company-will-stall.png

## Task 2: Create 9 blog post .md files in src/content/blog/
Frontmatter adaptation rules:
- `title` from **Title**
- `description` from **Meta description**
- `pubDate` from deployment schedule (backdated Feb 1-15)
- `author: "Kamyar Shah"`
- `tags` from **Tags** (as array)
- `heroImage` from **Featured image** path
- `draft: false`
- NO `slug` field (Astro derives from filename)

Files to create:
1. founder-dependency-business-cant-run-without-you.md (pubDate: 2026-02-01)
2. 5-decisions-growing-companies-should-not-make-alone.md (pubDate: 2026-02-03)
3. sop-maturity-why-documented-processes-not-working.md (pubDate: 2026-02-04)
4. 90-day-roadmap-quarterly-execution-beats-annual-planning.md (pubDate: 2026-02-06)
5. strategic-business-assessment-cost.md (pubDate: 2026-02-08)
6. strategic-vision-team-actually-executes.md (pubDate: 2026-02-10)
7. financial-readiness-can-your-business-afford-to-grow.md (pubDate: 2026-02-11)
8. swot-analysis-small-business-changes-decisions.md (pubDate: 2026-02-13)
9. 5-patterns-predict-growing-company-will-stall.md (pubDate: 2026-02-15)

## Task 3: Delete 7 old blog posts
Delete replaced posts:
- src/content/blog/sop-creation-guide.md (replaced by sop-maturity post)
- src/content/blog/90-day-business-roadmap.md (replaced by 90-day-roadmap post)
- src/content/blog/swot-analysis-tool.md (replaced by swot-analysis post)

Delete obsolete posts:
- src/content/blog/business-not-ready-for-ai.md
- src/content/blog/best-sop-management-tools-2025.md
- src/content/blog/why-assess-business.md
- src/content/blog/sample-post.md

## Task 4: Add 301 redirects to netlify.toml
Replacement redirects:
- /blog/sop-creation-guide → /blog/sop-maturity-why-documented-processes-not-working
- /blog/90-day-business-roadmap → /blog/90-day-roadmap-quarterly-execution-beats-annual-planning
- /blog/swot-analysis-tool → /blog/swot-analysis-small-business-changes-decisions

Deletion redirects:
- /blog/business-not-ready-for-ai → /blog/ai-readiness-assessment-company-ready
- /blog/best-sop-management-tools-2025 → /blog/sop-maturity-why-documented-processes-not-working
- /blog/why-assess-business → /blog/strategic-business-assessment-cost
- /blog/sample-post → /blog

Update existing /guide/* redirects to point to new slugs (3 redirects changed).

## Task 5: Update [...slug].astro schema
- Change Article schema author from Organization to Person (Kamyar Shah)
- Add publisher logo as https://vwcg.app/logo.png
- Add articleSection (from first tag)
- Add BreadcrumbList JSON-LD
- Add Person JSON-LD
- Pass multiple structuredData items (array)

## Task 6: Update MarketingLayout.astro
- Support structuredData as array (multiple JSON-LD blocks)
- Update Organization schema: add alternateName "VWCG", sameAs, founder, better description

## Task 7: Update blog/index.astro
- Change schema from Blog to CollectionPage with ItemList
- List all posts in reverse chronological order

## Task 8: Add cross-links to 6 existing AI cluster posts
One link per post:
- ai-implementation-small-business-no-tech-team → /blog/sop-maturity-why-documented-processes-not-working
- ai-readiness-assessment-company-ready → /blog/financial-readiness-can-your-business-afford-to-grow
- ai-cost-small-business-realistic-breakdown → /blog/strategic-business-assessment-cost
- why-ai-pilots-fail-deployment-framework → /blog/90-day-roadmap-quarterly-execution-beats-annual-planning
- ai-use-cases-save-money-small-business → /blog/sop-maturity-why-documented-processes-not-working
- ai-consulting-vs-agency-vs-vendor → /blog/5-decisions-growing-companies-should-not-make-alone

## Task 9: Update sitemap.xml
- Add all 9 new post URLs with backdated lastmod
- Update 6 AI cluster post lastmod to 2026-02-16
- Remove 7 deleted post URLs
- Update /blog lastmod to 2026-02-16

## Task 10: Build and verify
- `npm run build` must pass clean
- Verify no references to deleted slugs in build output
- Verify OG images are accessible

## Verification
- Build passes
- All 9 new posts created with correct frontmatter
- 7 old posts deleted
- 7 redirects added to netlify.toml
- 3 existing /guide/* redirects updated
- Schema markup on all blog post pages and index
- 6 cross-links added to AI cluster posts
- Sitemap updated
