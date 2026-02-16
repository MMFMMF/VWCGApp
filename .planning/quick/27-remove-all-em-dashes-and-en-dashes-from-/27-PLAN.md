# Quick Task 27: Remove em dashes from blog posts

## Task 1: Find and remove all em/en dashes visible on 9 blog post pages

1. Check blog post markdown files for em/en dashes (U+2014, U+2013)
2. Check rendered HTML for em/en dashes introduced by template/components
3. Fix the source of any em/en dashes found
4. Verify zero em/en dashes in rendered HTML for all 9 posts

## Verification
- Build passes
- `grep` for U+2014 and U+2013 returns zero results in rendered HTML for all 9 posts
