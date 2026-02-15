# Quick Task 22: Add OG images and meta tags for 6 AI blog posts

## Task 1: Copy 6 PNG images to public/blog/images/

Create `public/blog/images/` and copy from Downloads:
- ai-readiness-assessment.png
- ai-cost-small-business.png
- ai-implementation-no-tech-team.png
- ai-consulting-vs-agency-vs-vendor.png
- ai-use-cases-save-money.png
- ai-pilots-fail.png

## Task 2: Update heroImage frontmatter in 6 blog posts

Map each post to its image:
- ai-readiness-assessment-company-ready.md → /blog/images/ai-readiness-assessment.png
- ai-cost-small-business-realistic-breakdown.md → /blog/images/ai-cost-small-business.png
- ai-implementation-small-business-no-tech-team.md → /blog/images/ai-implementation-no-tech-team.png
- ai-consulting-vs-agency-vs-vendor.md → /blog/images/ai-consulting-vs-agency-vs-vendor.png
- ai-use-cases-save-money-small-business.md → /blog/images/ai-use-cases-save-money.png
- why-ai-pilots-fail-deployment-framework.md → /blog/images/ai-pilots-fail.png

## Task 3: Add og:image:width and og:image:height to MarketingLayout.astro

Add after existing og:image tag:
```html
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

## Verification
- npm run build passes clean
- Built HTML for each blog post contains correct og:image path
