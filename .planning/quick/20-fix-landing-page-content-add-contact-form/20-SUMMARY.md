# Quick Task 20: Fix Landing Page Content + Add Contact Form

## Task
Fix landing page content to match product reality (invite-code gated, not open access), add Netlify contact form to footer replacing exposed email address.

## Changes Made

### Part B — Landing Page Content Fixes

| Item | File | Change |
|------|------|--------|
| B.2 Page title | `src/pages/index.astro` | New SEO-optimized title: "Free Strategic Business Assessment — Score Your Operations in 10 Minutes \| VWCG" |
| B.3 Step 1 | `src/components/marketing/HowItWorks.astro` | "Pick an assessment" → "Enter your invite code" with new description |
| B.3 Step 2 | `src/components/marketing/HowItWorks.astro` | Expanded description mentioning 10 dimensions, ~10 minutes, no trick questions |
| B.4 Social proof | `src/components/marketing/CTA.astro` | Removed fake "Join 1,200+ business owners" pill |
| B.5 Pricing text | `src/components/marketing/ComparisonTable.astro` | "$0 forever" → "$0 with invite code" |
| B.5 CTA text | `src/components/marketing/CTA.astro` | "No email. No signup..." → "No signup. No credit card. Just an invite code." + "Don't have a code?" links |
| B.6 Blog section | `src/pages/index.astro` | Added 3 featured blog posts section above footer |

### Part C — Contact Form (Replaces Email)

| Item | File | Change |
|------|------|--------|
| Footer rewrite | `src/components/marketing/Footer.astro` | Complete rewrite: removed mailto link, added Netlify form |
| Contact form | Footer.astro | Name, email, reason dropdown, message textarea, submit button |
| Spam prevention | Footer.astro | `netlify-honeypot="bot-field"` hidden field |
| UX | Footer.astro | Async JS submission with inline success message (no redirect) |
| Consulting link | Footer.astro | Added kamyarshah.com strategic consulting link |
| Anchor target | Footer.astro | `id="contact"` for #contact links from CTA section |

## Verification

- Build: clean (17 pages, 0 errors)
- No `mailto:` in source
- No `contact@vwcgapp` in source
- No `href="/app"` in built output
- 5 `href="/invite"` in index.html
- 0 instances of "1,200" fake social proof

## Commit

`d9f09b5` — refactor: fix landing page content, add contact form, remove email exposure
