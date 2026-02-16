# Quick Task 25: Fix blog post layout on 9 new posts

## Task 1: Fix all 9 new blog posts

For each of the 9 posts in `src/content/blog/`:
1. **Remove opening bio block** — Delete the italic `*Kamyar Shah has led 650+...*` paragraph that appears right after frontmatter, plus the `---` separator below it
2. **Add `---` before closing bio** — Insert a `---` horizontal rule before the closing italic bio paragraph at the bottom
3. **Add `---` before each `## ` heading** — Insert horizontal rules before each H2 section heading

Posts:
- founder-dependency-business-cant-run-without-you.md
- 5-decisions-growing-companies-should-not-make-alone.md
- sop-maturity-why-documented-processes-not-working.md
- 90-day-roadmap-quarterly-execution-beats-annual-planning.md
- strategic-business-assessment-cost.md
- strategic-vision-team-actually-executes.md
- financial-readiness-can-your-business-afford-to-grow.md
- swot-analysis-small-business-changes-decisions.md
- 5-patterns-predict-growing-company-will-stall.md

## Verification
- Build passes
- Sample 3 posts: bio below CTA, separators between H2 sections
