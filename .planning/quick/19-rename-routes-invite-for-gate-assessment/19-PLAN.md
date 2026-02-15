---
phase: quick-19
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/assessment/[...tool].astro (new, moved from app/)
  - src/pages/app/[...tool].astro (deleted)
  - src/pages/invite.astro
  - src/components/AssessmentApp.tsx
  - src/pages/index.astro
  - src/pages/blog/[...slug].astro
  - src/layouts/AppLayout.astro
  - src/layouts/MarketingLayout.astro
  - src/components/marketing/Hero.astro
  - src/components/marketing/HowItWorks.astro
  - src/components/marketing/CTA.astro
  - src/components/marketing/Footer.astro
  - src/components/marketing/SampleReport.astro
  - src/components/islands/MiniAssessmentIsland.tsx
  - src/content/blog/why-assess-business.md
  - src/content/blog/sample-post.md
  - netlify.toml
  - CLAUDE.md
autonomous: true
---

Rename routes: /invite for gate, /assessment for tool, update all internal links, add domain redirects.
