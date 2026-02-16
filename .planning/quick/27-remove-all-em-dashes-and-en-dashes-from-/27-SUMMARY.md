# Quick Task 27: Remove Em Dashes From Blog Posts

## Task
Remove all em dashes (U+2014) and en dashes (U+2013) visible on the 9 new blog post pages.

## Investigation
- 9 blog post markdown files: already clean (0 em/en dashes, 0 double hyphens)
- Rendered HTML showed 1 em dash per page, sourced from the **Footer component**
- AI cluster posts have 15-28 em dashes each from `--` (double hyphens) converted by the markdown renderer

## Files Changed (2)
- `src/components/marketing/Footer.astro` — replaced "readiness — no" with "readiness. No"
- `src/pages/blog/index.astro` — replaced "Blog —" with "Blog |" in page title

## Verification
- Build: Passed clean (19 pages)
- All 9 new blog posts: 0 em dashes, 0 en dashes in rendered HTML
- Blog post markdown source: confirmed clean (no em/en dashes, no double hyphens)

## Commit
- `10a667d` — fix: remove em dashes from Footer and blog index title
