# VWCGApp

## What This Is

A strategic assessment platform for SMB owners and entrepreneurs that provides genuine value through self-guided business diagnostics. Users complete 11 interconnected assessment tools, receive synthesized insights about their organizational gaps, and can generate professional PDF reports. The landing page features interactive previews, a mini-assessment teaser, and conversion-optimized messaging. Serves as a lead generation tool — when users see their gaps clearly, they reach out for help executing recommendations.

## Core Value

**SMB owners get clear, actionable visibility into their business readiness gaps** — across leadership, operations, strategy, and execution capacity — so they can make informed decisions about where to focus.

## Current State

**Shipped:** v1.1 Landing Page Excellence (2026-02-07)
**Next Milestone:** TBD — plan with `/gsd:new-milestone`

## Requirements

### Validated

<!-- Shipped and confirmed working. -->

- ✓ Public marketing site with landing page — v1.0
- ✓ WordPress-like blog system (Decap CMS) — v1.0
- ✓ Invite-only access gate for assessment tools — v1.0
- ✓ 11 strategic assessment tools — v1.0
- ✓ Synthesis engine with 7 cross-tool insight rules — v1.0
- ✓ PDF report generation (jsPDF) — v1.0
- ✓ Contact form (Netlify Forms) — v1.0
- ✓ Workspace save/load functionality (.vwcg files) — v1.0
- ✓ Data persistence via localStorage — v1.0
- ✓ Pain-focused hero messaging with animated statistics — v1.1
- ✓ Interactive sample report preview (animated gauges, expandable insight cards) — v1.1
- ✓ Mini-assessment teaser widget (3 questions, instant result, localStorage bridge) — v1.1
- ✓ Trust and credibility badges (privacy, no account, no email, instant results) — v1.1
- ✓ Competitive positioning comparison table (VWCGApp vs Consultant vs DIY) — v1.1
- ✓ Performance optimization: PageSpeed 97, LCP 2.27s, CLS 0.054 — v1.1

### Active

<!-- Current scope. Building toward these. -->

(None — define with `/gsd:new-milestone`)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Database backend — localStorage only, keep it simple
- User accounts/authentication system — invite codes, not user management
- Hard-sell tactics, aggressive CTAs, gated reports — genuine value first
- Video testimonials — no video content available yet
- "As seen in" logos — no press coverage to reference yet
- Newsletter signup — conflicts with "no email required" messaging
- A/B testing infrastructure — build first, test later

## Context

**v1.0 Complete:** 44 requirements across 6 phases delivered 2026-02-05. All core functionality working.

**v1.1 Complete:** 30 requirements across 5 phases delivered 2026-02-07. Landing page transformed with interactive elements, conversion-optimized messaging, and Core Web Vitals targets exceeded.

**Tech Stack:** Astro 5, React 18 (islands), Zustand, Tailwind CSS, Recharts, jsPDF, Decap CMS. Self-hosted fonts (@fontsource/inter, @fontsource/lexend). Vendor chunk splitting (react-vendor, charts, radix-ui).

**Performance:** Lighthouse mobile 97/100, LCP 2.27s, CLS 0.054, TBT 0ms, bundle 23.9KB v1.1 additions (9.13KB gzipped).

**Deployment:** https://sparkly-speculoos-87b564.netlify.app/

**GitHub:** https://github.com/MMFMMF/VWCGApp

## Constraints

- **No database**: All persistence via browser localStorage and downloadable workspace files
- **Invite-only**: Manual invite mechanism (simple, low overhead)
- **Blog CMS**: Needs WordPress-like content management for non-technical editing
- **SEO + Conversion**: Landing page must perform for both organic search and paid traffic
- **Lead gen, not SaaS**: No user accounts, no recurring revenue model — this is a funnel top
- **Performance**: Mobile PageSpeed >80, LCP <2.5s, CLS <0.1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No database | Keeps infrastructure simple, no backend to maintain | ✓ Good — v1.0 validated |
| Manual invites | Lowest friction to implement, consultant controls access | ✓ Good — working |
| Genuine value over hard sell | Builds trust, attracts quality leads who self-select | ✓ Good — philosophy maintained |
| react-countup + react-intersection-observer for counters | 6KB gzipped, viewport-triggered, smooth easing | ✓ Good — v1.1 validated |
| react-circular-progressbar for gauges | 5KB gzipped, SVG-based, customizable | ✓ Good — v1.1 validated |
| Grid-template-rows for expandable cards | Prevents CLS, smoother than max-height transition | ✓ Good — CLS 0.054 |
| Mini-assessment bridges to full app via localStorage | 24h expiry, overwrite prevention, one-time bridge | ✓ Good — v1.1 validated |
| client:visible for below-fold React islands | Defers hydration until scroll, 11 instances, TBT 0ms | ✓ Good — v1.1 validated |
| @fontsource self-hosted fonts | Eliminated Google Fonts CDN, saved 100-300ms on mobile | ✓ Good — v1.1 validated |
| Pure Astro for comparison table | Zero JS impact, semantic HTML, accessible | ✓ Good — v1.1 validated |

---
*Last updated: 2026-02-07 after v1.1 milestone completion*
