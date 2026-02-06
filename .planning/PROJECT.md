# VWCGApp

## What This Is

A strategic assessment platform for SMB owners and entrepreneurs that provides genuine value through self-guided business diagnostics. Users complete 11 interconnected assessment tools, receive synthesized insights about their organizational gaps, and can generate professional PDF reports. Serves as a lead generation tool — when users see their gaps clearly, they reach out for help executing recommendations.

## Core Value

**SMB owners get clear, actionable visibility into their business readiness gaps** — across leadership, operations, strategy, and execution capacity — so they can make informed decisions about where to focus.

## Current Milestone: v1.1 Landing Page Excellence

**Goal:** Transform the landing page into a traffic magnet that converts cold traffic into assessment users

**Target features:**
- Pain-focused hero messaging with animated statistics
- Interactive sample report preview with animated gauges and expandable insights
- Mini-assessment teaser (3 questions) with instant result
- Trust badges and credibility signals
- Competitive positioning table (VWCGApp vs Consultant vs DIY)
- Performance optimization (PageSpeed >80, LCP <2.5s)

## Requirements

### Validated (v1.0 Complete)

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

### Active (v1.1)

<!-- Current scope. Building toward these. -->

- [ ] Pain-focused hero messaging with animated statistics
- [ ] Interactive sample report preview (animated gauges, expandable insight cards)
- [ ] Mini-assessment teaser widget (3 questions, instant result)
- [ ] Trust and credibility badges
- [ ] Competitive positioning comparison table
- [ ] Performance optimization (Core Web Vitals targets)

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

**v1.1 Focus:** The user stated "this is my livelihood" — landing page must convert cold traffic (PPC, social ads) into assessment users. Research indicates interactive elements (mini-assessment + sample report) drive 3-4x conversion improvement.

**Deployment:** https://sparkly-speculoos-87b564.netlify.app/ (v1.0 deployed)

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
| Motion + react-countup for animations | Research validated: ~42KB gzipped, GPU-friendly, Astro-compatible | — Pending (v1.1) |
| Mini-assessment bridges to full app | localStorage handoff, teaser answers pre-populate full assessment | — Pending (v1.1) |
| client:visible for below-fold React | Defers 180KB until user scrolls, improves LCP | — Pending (v1.1) |

---
*Last updated: 2026-02-05 after v1.1 milestone initialization*
