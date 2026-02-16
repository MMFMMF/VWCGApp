# Quick Task 25: Fix Blog Post Layout on 9 New Posts

## Task
Fix two layout issues on all 9 new blog posts deployed in QT24:
1. Author bio appearing at TOP of post instead of BOTTOM after CTA
2. No section separators between H2 sections

## Files Changed (9)

### Modified blog posts
- `src/content/blog/founder-dependency-business-cant-run-without-you.md`
- `src/content/blog/5-decisions-growing-companies-should-not-make-alone.md`
- `src/content/blog/sop-maturity-why-documented-processes-not-working.md`
- `src/content/blog/90-day-roadmap-quarterly-execution-beats-annual-planning.md`
- `src/content/blog/strategic-business-assessment-cost.md`
- `src/content/blog/strategic-vision-team-actually-executes.md`
- `src/content/blog/financial-readiness-can-your-business-afford-to-grow.md`
- `src/content/blog/swot-analysis-small-business-changes-decisions.md`
- `src/content/blog/5-patterns-predict-growing-company-will-stall.md`

## Changes Per Post

1. **Removed opening bio block** — Deleted the italic `*Kamyar Shah has led 650+...*` paragraph + `---` separator that appeared right after frontmatter
2. **Added `---` before closing bio** — Inserted horizontal rule before the closing italic bio paragraph at the bottom
3. **Added `---` before each `##` heading** — Inserted horizontal rules before each H2 section heading for visual separation

## Verification
- Build: Passed clean (19 pages)
- Bio appears below CTA on all 9 posts (not above content)
- Horizontal separators between H2 sections on all 9 posts
- Layout matches existing AI cluster posts (e.g., /blog/ai-readiness-assessment-company-ready)

## Commit
- `c775882` — fix: move author bio below CTA and add section separators on 9 blog posts
