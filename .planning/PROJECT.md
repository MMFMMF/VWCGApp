# VWCGApp

## What This Is

A strategic assessment platform for SMB owners and entrepreneurs that provides genuine value through self-guided business diagnostics. Users complete 11 interconnected assessment tools, receive synthesized insights about their organizational gaps, and can generate professional PDF reports. Serves as a lead generation tool — when users see their gaps clearly, they reach out for help executing recommendations.

## Core Value

**SMB owners get clear, actionable visibility into their business readiness gaps** — across leadership, operations, strategy, and execution capacity — so they can make informed decisions about where to focus.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Public marketing site with landing page optimized for cold traffic conversion (PPC, social ads)
- [ ] WordPress-like blog system for SEO and organic traffic building
- [ ] Invite-only access gate for assessment tools
- [ ] 11 strategic assessment tools (AI Readiness, Leadership DNA, Business EI, Vision Canvas, SWOT, SOP Taxonomy, SOP Creation, SOP Management, 90-Day Roadmap, Advisor Readiness, Report Center)
- [ ] Synthesis engine with cross-tool insight rules
- [ ] PDF report generation
- [ ] Simple contact form for users who want help
- [ ] Workspace save/load functionality (.vwcg files)
- [ ] Data persistence via localStorage (no database)

### Out of Scope

- Database backend — localStorage only, keep it simple
- User accounts/authentication system — invite codes, not user management
- Hard-sell tactics, aggressive CTAs, gated reports — genuine value first
- Auto-attaching PDF to contact form — user sends PDF when consultant responds

## Context

**Origin:** Previously built with Google Gravity AI, which produced structurally unsound code with poor dependency management, no testing, and extremely limited context. The instructional manual describes intent, but the implementation quality is suspect.

**Validation needed:** The 11 tools and 5 synthesis rules (E1-E5) are inherited from the original spec but need validation. Research required to determine if these are the right tools for SMB owners and if the synthesis thresholds generate genuinely useful insights.

**Reference material:** Instructional manual at `C:\Users\Kamyar\Downloads\vwcgapp_instructional_manual.md` contains detailed specs for all tools, UI layouts, data structures, and synthesis rules.

**Existing deployment:** https://vwcgapp.web.app/ (quality unknown, built with problematic tooling)

## Constraints

- **No database**: All persistence via browser localStorage and downloadable workspace files
- **Invite-only**: Manual invite mechanism (simple, low overhead)
- **Blog CMS**: Needs WordPress-like content management for non-technical editing
- **SEO + Conversion**: Landing page must perform for both organic search and paid traffic
- **Lead gen, not SaaS**: No user accounts, no recurring revenue model — this is a funnel top

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No database | Keeps infrastructure simple, no backend to maintain | — Pending |
| Manual invites | Lowest friction to implement, consultant controls access | — Pending |
| Research-first approach | Original spec may be flawed, validate before building | — Pending |
| Genuine value over hard sell | Builds trust, attracts quality leads who self-select | — Pending |

---
*Last updated: 2026-02-04 after initialization*
