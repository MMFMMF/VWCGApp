# Quick Task 22: Add OG images and meta tags for 6 AI blog posts

## Task
Add social sharing (Open Graph + Twitter Card) images and meta tags for the 6 AI cluster blog posts.

## Files Changed (13)
**6 new images:**
- `public/blog/images/ai-readiness-assessment.png`
- `public/blog/images/ai-cost-small-business.png`
- `public/blog/images/ai-implementation-no-tech-team.png`
- `public/blog/images/ai-consulting-vs-agency-vs-vendor.png`
- `public/blog/images/ai-use-cases-save-money.png`
- `public/blog/images/ai-pilots-fail.png`

**6 blog posts (heroImage updated):**
- `src/content/blog/ai-readiness-assessment-company-ready.md`
- `src/content/blog/ai-cost-small-business-realistic-breakdown.md`
- `src/content/blog/ai-implementation-small-business-no-tech-team.md`
- `src/content/blog/ai-consulting-vs-agency-vs-vendor.md`
- `src/content/blog/ai-use-cases-save-money-small-business.md`
- `src/content/blog/why-ai-pilots-fail-deployment-framework.md`

**1 layout:**
- `src/layouts/MarketingLayout.astro` — added `og:image:width` and `og:image:height`

## Key Changes
- Copied 6 branded PNG images (1200x630) to `public/blog/images/`
- Updated `heroImage` frontmatter from placeholder `.webp` paths to real `.png` paths
- Added `og:image:width` (1200) and `og:image:height` (630) meta tags to MarketingLayout
- Existing `og:image`, `twitter:card`, and `twitter:image` tags were already in place

## Verification
- Build: Passed clean (17 pages)
- OG tags verified in built HTML: correct full URL, width, height, twitter card

## Commit
- `a76ea31` — feat: add OG images and meta tags for 6 AI blog posts
