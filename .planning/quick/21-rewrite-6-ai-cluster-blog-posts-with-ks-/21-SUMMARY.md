# Quick Task 21: Rewrite 6 AI Cluster Blog Posts

## Task
Replace all 6 AI cluster blog posts with complete rewrites featuring KS voice, updated byline with consulting links, straight dashes (--), and UTF-8 encoding.

## Files Changed (6)
- `src/content/blog/ai-readiness-assessment-company-ready.md`
- `src/content/blog/ai-cost-small-business-realistic-breakdown.md`
- `src/content/blog/ai-implementation-small-business-no-tech-team.md`
- `src/content/blog/ai-consulting-vs-agency-vs-vendor.md`
- `src/content/blog/ai-use-cases-save-money-small-business.md`
- `src/content/blog/why-ai-pilots-fail-deployment-framework.md`

## Key Changes
- Complete content rewrite for all 6 posts with Kamyar Shah's voice and consulting perspective
- Updated byline with links to kamyarshah.com service pages (fractional COO, CMO, coaching, strategy)
- All internal cross-links between posts verified working
- CTA sections link to VWCG Strategic Assessment at vwcg.app/invite
- Frontmatter adapted: `date` → `pubDate`, `featured_image` → `heroImage`, `slug` removed (Astro derives from filename)
- Straight dashes (--) throughout, no em dashes
- Author set to "Kamyar Shah" (was "World Consulting Group")

## Verification
- Build: Passed clean (17 pages)
- Cross-links: 5 internal links verified across posts
- External links: kamyarshah.com service pages and vwcg.app/invite links present

## Commit
- `9f30a5e` — content: rewrite 6 AI cluster blog posts -- KS voice, updated byline, encoding fix
