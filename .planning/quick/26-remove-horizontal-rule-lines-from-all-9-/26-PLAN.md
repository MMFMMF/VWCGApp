# Quick Task 26: Remove horizontal rule lines from all 9 new blog posts

## Task 1: Remove all body `---` from 9 posts

For each of the 9 posts in `src/content/blog/`:
1. Remove every `---` line that appears in the body content (after frontmatter)
2. Keep the 2 frontmatter delimiter `---` lines
3. Sections separated only by H2 headings with natural whitespace

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
- Zero `<hr>` tags in rendered HTML for all 9 posts
- Visual match with AI cluster reference posts (no visible horizontal lines)
