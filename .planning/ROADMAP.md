# Roadmap: VWCGApp

**Created:** 2026-02-04
**Last Updated:** 2026-02-06 (Phase 8 complete)

---

## Milestone v1.0: Core Platform (COMPLETE)

**Phases:** 1-6
**Requirements:** 44
**Status:** Complete - Delivered 2026-02-05

| Phase | Name | Goal | Requirements | Status |
|-------|------|------|--------------|--------|
| 1 | Foundation & Infrastructure | Build core architecture and state management | 5 | Complete |
| 2 | First Assessment Tools | Deliver first 3 interactive assessment tools with visualization | 3 | Complete |
| 3 | Core Strategic Assessments | Complete strategic assessment suite with SWOT, Vision, and SOP tools | 7 | Complete |
| 4 | Planning & Synthesis Engine | Build 90-Day Roadmap and implement cross-tool insight synthesis | 12 | Complete |
| 5 | Reports & Workspace Management | Enable PDF generation and workspace save/load functionality | 9 | Complete |
| 6 | Marketing Site & Access Control | Launch public marketing site, blog, and invite-only access gate | 11 | Complete |

---

## Milestone v1.1: Landing Page Excellence

**Phases:** 7-11
**Requirements:** 30
**Status:** In Progress
**Core Value:** Make the landing page a traffic magnet that converts cold traffic into assessment users

### Phase Overview

| Phase | Name | Goal | Requirements | Status |
|-------|------|------|--------------|--------|
| 7 | Hero & Trust Messaging | Transform hero section and establish trust signals | 9 | Complete |
| 8 | Interactive Sample Report | Add animated report preview with scroll-triggered reveals | 9 | Complete |
| 9 | Mini-Assessment Teaser | Build 3-question quick assessment widget | 5 | Complete |
| 10 | Competitive Positioning | Add comparison table showing value vs alternatives | 4 | Complete |
| 11 | Performance Optimization | Achieve mobile PageSpeed >80 and LCP <2.5s | 3 | Pending |

---

## Phase 7: Hero & Trust Messaging (COMPLETE)

**Goal:** Transform hero section with pain-focused messaging and establish trust through credibility signals

**Status:** Complete - Delivered 2026-02-06

**Plans:** 1 plan

Plans:
- [x] 07-01-PLAN.md — Transform hero with pain-focused messaging, animated statistics counters, and enhanced trust signals

**Requirements:**
- **HERO-01**: Pain-focused headline that addresses visitor's problem ("Stop running your business blind")
- **HERO-02**: Clear value proposition visible above the fold
- **HERO-03**: Animated statistics counters (count-up effect for "10+ tools", "500+ users", etc.)
- **HERO-04**: Single primary CTA button with clear action text
- **HERO-05**: Secondary CTA for "See Sample Report" anchor link
- **TRS-01**: Privacy badge ("100% Private - Data never leaves your browser")
- **TRS-02**: Security messaging ("No account required")
- **TRS-03**: "No email required" trust signal prominently displayed
- **TRS-04**: Instant results messaging ("Get results in 10 minutes")

**Success Criteria:**
1. Visitor immediately understands the problem being solved (pain point clear within 3 seconds)
2. Primary value proposition ("10-minute business diagnostic") visible above fold on mobile and desktop
3. Trust signals (privacy, no account, no email) displayed near CTA without overwhelming design
4. Statistics counters animate smoothly on page load with count-up effect (respects prefers-reduced-motion)

**Dependencies:** None (enhances existing v1.0 landing page)

---

## Phase 8: Interactive Sample Report (COMPLETE)

**Goal:** Add animated sample report preview with interactive elements to demonstrate assessment value

**Status:** Complete - Delivered 2026-02-06

**Plans:** 2 plans

Plans:
- [x] 08-01-PLAN.md — Create GaugeIsland and ExpandableInsightCard island components
- [x] 08-02-PLAN.md — Integrate islands into SampleReport with scroll animations and messaging

**Requirements:**
- **RPT-01**: Animated gauge charts with count-up effect (AI Readiness %, Leadership DNA %, etc.)
- **RPT-02**: Circular progress visualization for score display
- **RPT-03**: Expandable insight cards (click to reveal full analysis text)
- **RPT-04**: Hover interactions on data points with tooltips
- **RPT-05**: "This could be YOUR business" overlay/messaging
- **RPT-06**: Smooth scroll-triggered entrance animations for report section
- **PRF-01**: Scroll-triggered section reveal animations (fade-in, slide-up)
- **PRF-02**: GPU-friendly animations only (transform, opacity - no layout properties)
- **PRF-06**: React islands use client:visible for below-fold components

**Success Criteria:**
1. Sample report section appears on landing page with 2-3 animated gauge charts showing realistic assessment scores
2. Gauge charts animate count-up from 0 to target value when scrolled into viewport
3. Insight cards expand on click to reveal full analysis text without page jump
4. All animations use transform/opacity only (no width/height/top/left changes)
5. React islands (gauge charts, expandable cards) load only when visible (client:visible hydration)

**Dependencies:** Phase 7 (hero messaging sets context for report preview)

---

## Phase 9: Mini-Assessment Teaser

**Goal:** Build 3-question quick assessment widget that provides instant value and drives full assessment completion

**Status:** Complete - Delivered 2026-02-06

**Plans:** 4 plans

Plans:
- [x] 09-01-PLAN.md — Create MiniAssessmentIsland component with linear wizard, progress indicator, and result display
- [x] 09-02-PLAN.md — Create Astro wrapper and integrate into landing page between SampleReport and CTA
- [x] 09-03-PLAN.md — Implement localStorage bridge to pre-populate AI Readiness tool with teaser answers
- [x] 09-04-PLAN.md — Human verification of complete mini-assessment flow

**Requirements:**
- **TSR-01**: 3-question quick assessment widget embedded on landing page
- **TSR-02**: Progress indicator showing question completion (1/3, 2/3, 3/3)
- **TSR-03**: Real-time result calculation displayed after 3 questions
- **TSR-04**: Clear CTA to "Get Full Assessment" linking to /app
- **TSR-05**: localStorage bridge to pass teaser answers to full assessment

**Success Criteria:**
1. Mini-assessment widget embedded inline on landing page (not modal popup)
2. User completes 3 questions with progress indicator showing 1/3, 2/3, 3/3 completion
3. Instant result displayed after question 3 (e.g., "Your AI Readiness: 45% - Room for Growth")
4. "Get Full Assessment" CTA links to /app with teaser data persisted in localStorage
5. Full assessment in /app pre-populates with teaser answers (user doesn't re-answer same questions)

**Dependencies:** Phase 8 (sample report provides context for assessment value)

---

## Phase 10: Competitive Positioning

**Goal:** Add comparison table demonstrating value proposition versus consultants and DIY approaches

**Status:** Complete - Delivered 2026-02-06

**Plans:** 2 plans

Plans:
- [x] 10-01-PLAN.md — Create ComparisonTable.astro component and integrate into landing page
- [x] 10-02-PLAN.md — Human verification of comparison table visual design and responsiveness

**Requirements:**
- **CMP-01**: Comparison table: VWCGApp vs Consultant vs DIY/Guessing
- **CMP-02**: Time to insight comparison (10 min vs 2-4 weeks vs Never)
- **CMP-03**: Cost comparison (Free vs $5k-$20k vs $0)
- **CMP-04**: Objectivity comparison (AI-based vs Varies vs Biased)

**Success Criteria:**
1. Comparison table appears on landing page with 3 columns (VWCGApp, Consultant, DIY)
2. VWCGApp column highlights advantages: 10 min, Free, AI-based objectivity
3. Visual design clearly shows VWCGApp as superior choice (checkmarks vs X marks, or similar)

**Dependencies:** Phase 9 (mini-assessment demonstrates speed advantage claimed in comparison)

---

## Phase 11: Performance Optimization

**Goal:** Achieve production-ready mobile performance meeting Core Web Vitals standards

**Requirements:**
- **PRF-03**: Mobile PageSpeed score > 80
- **PRF-04**: LCP < 2.5 seconds on mobile
- **PRF-05**: CLS < 0.1 (no layout shift from animations)

**Success Criteria:**
1. Mobile PageSpeed Insights score >80 (test from PageSpeed Insights tool)
2. Largest Contentful Paint (LCP) <2.5s on throttled 3G mobile connection
3. Cumulative Layout Shift (CLS) <0.1 (animations do not cause layout shifts)
4. Hero image optimized with WebP/AVIF formats and responsive srcset
5. Bundle analysis shows <100KB total JavaScript increase from v1.0 baseline

**Dependencies:** Phases 7-10 (all features implemented before optimization)

---

## Coverage Validation

### v1.1 Requirements by Category

**Hero & Messaging:** 5 requirements (HERO-01 to HERO-05) → Phase 7
**Trust & Credibility:** 4 requirements (TRS-01 to TRS-04) → Phase 7
**Interactive Sample Report:** 6 requirements (RPT-01 to RPT-06) → Phase 8
**Mini-Assessment Teaser:** 5 requirements (TSR-01 to TSR-05) → Phase 9
**Competitive Positioning:** 4 requirements (CMP-01 to CMP-04) → Phase 10
**Performance & Animation:** 6 requirements (PRF-01, PRF-02, PRF-03, PRF-04, PRF-05, PRF-06) → Phase 8 (3), Phase 11 (3)

### Final Tally

- **Total v1.1 requirements:** 30
- **Mapped to phases:** 30
- **Unmapped:** 0 ✓

### Requirements Distribution by Phase

| Phase | Requirements | Percentage |
|-------|--------------|------------|
| 7 | 9 | 30% |
| 8 | 9 | 30% |
| 9 | 5 | 17% |
| 10 | 4 | 13% |
| 11 | 3 | 10% |

---

## Phase Dependencies

```
Phase 7 (Hero & Trust) ← establishes messaging foundation
    ↓
Phase 8 (Sample Report) ← demonstrates assessment value
    ↓
Phase 9 (Mini-Assessment) ← drives engagement and full assessment starts
    ↓
Phase 10 (Competitive Positioning) ← validates value proposition claims
    ↓
Phase 11 (Performance) ← ensures fast, production-ready experience
```

---

## Estimated Timeline

Based on research recommendations and complexity analysis:

| Phase | Duration | Cumulative | Milestone |
|-------|----------|------------|-----------|
| 7 | 2 weeks | Week 2 | Hero transformation complete |
| 8 | 3 weeks | Week 5 | Interactive report preview working |
| 9 | 2 weeks | Week 7 | Mini-assessment live |
| 10 | 1 week | Week 8 | Competitive positioning added |
| 11 | 2 weeks | Week 10 | **v1.1 PRODUCTION LAUNCH** |

**Total timeline:** 10 weeks to production-ready landing page

---

## Critical Success Factors

### Technical Quality Gates
- Mobile PageSpeed score >80
- LCP <2.5s on mobile (throttled 3G)
- CLS <0.1 (animations don't shift layout)
- Total bundle increase <100KB from v1.0
- React islands load only when visible (client:visible pattern)

### User Experience Gates
- Hero pain point understood in <3 seconds
- Sample report preview showcases 2-3 assessment scores
- Mini-assessment completion time <2 minutes
- Comparison table clearly shows VWCGApp advantages
- All animations respect prefers-reduced-motion

### Conversion Goals
- Assessment start conversion ≥25% (target from research)
- Mini-assessment completion rate ≥60%
- Mini-assessment → full assessment bridge working (localStorage handoff)
- Mobile conversion rate within 20% of desktop

---

## v1.0 Phase Details (REFERENCE)

<details>
<summary>Phase 1: Foundation & Infrastructure (COMPLETE)</summary>

**Goal:** Establish core technical architecture with state management, routing, shared UI components, and localStorage persistence

**Requirements:**
- **ARC-01**: Modular tool architecture — each tool is self-contained component
- **ARC-02**: Tool registry pattern for dynamic tool registration
- **ARC-03**: Standardized tool interface (data structure, state management, PDF export)
- **ARC-04**: Documented tool creation pattern for adding new tools
- **ARC-05**: Synthesis rule registry for adding new rules without modifying engine core

**Success Criteria:**
1. Project builds successfully with Astro 5 + React Islands architecture
2. Zustand state management with localStorage persistence working and tested
3. Tool registry pattern allows adding new tools without modifying core routing
4. Shared UI component library (forms, buttons, charts) is functional and reusable
5. Developer can add a new tool in <30 minutes using documented pattern

**Dependencies:** None (foundational phase)
**Status:** ✅ Complete
</details>

<details>
<summary>Phase 2: First Assessment Tools (COMPLETE)</summary>

**Goal:** Deliver first three interactive assessment tools with radar chart visualization to validate core architecture

**Requirements:**
- **AST-01**: AI Readiness Assessment
- **AST-02**: Leadership DNA
- **AST-03**: Business Emotional Intelligence

**Success Criteria:**
1. All three assessment tools accept user input and persist data to localStorage
2. Radar charts render correctly with Recharts for all three tools
3. Business EQ multi-entry trend tracking shows historical data visualization
4. User can navigate between tools without losing data
5. Mobile-responsive design works on screens down to 375px width

**Dependencies:** Phase 1
**Status:** ✅ Complete
</details>

<details>
<summary>Phase 3: Core Strategic Assessments (COMPLETE)</summary>

**Goal:** Complete strategic assessment suite with SWOT analysis, Vision Canvas, SOP maturity evaluation, and Advisor Readiness

**Requirements:**
- **AST-04**: SWOT Analysis
- **AST-05**: Vision Canvas
- **AST-06**: Advisor Readiness
- **AST-07**: Financial Readiness Assessment
- **SOP-01**: SOP Maturity Assessment
- **SOP-02**: Identification of top 3 critical SOPs
- **SOP-03**: Template suggestions

**Status:** ✅ Complete
</details>

<details>
<summary>Phase 4: Planning & Synthesis Engine (COMPLETE)</summary>

**Goal:** Build 90-Day Roadmap planning tool and implement cross-tool synthesis engine with 7 insight rules

**Requirements:**
- **PLN-01 to PLN-04**: 90-Day Roadmap (4 requirements)
- **SYN-01 to SYN-09**: Synthesis Engine (9 requirements)

**Status:** ✅ Complete
</details>

<details>
<summary>Phase 5: Reports & Workspace Management (COMPLETE)</summary>

**Goal:** Enable PDF report generation and workspace file export/import functionality

**Requirements:**
- **RPT-01 to RPT-04**: PDF Reports (4 requirements)
- **WRK-01 to WRK-05**: Workspace Management (5 requirements)

**Status:** ✅ Complete
</details>

<details>
<summary>Phase 6: Marketing Site & Access Control (COMPLETE)</summary>

**Goal:** Launch public marketing site with SEO-optimized landing page, blog CMS, and invite-only access gate

**Requirements:**
- **MKT-01 to MKT-04**: Marketing Site (4 requirements)
- **ACC-01 to ACC-04**: Access Control (4 requirements)
- **CTT-01 to CTT-03**: Contact & Lead Capture (3 requirements)

**Status:** ✅ Complete
</details>

---

*Roadmap created: 2026-02-04*
*v1.1 milestone added: 2026-02-05*
*Phase 7 complete: 2026-02-06*
*Phase 8 complete: 2026-02-06*
*Phase 9 complete: 2026-02-06*
*Phase 10 complete: 2026-02-06*
*Derived from: PROJECT.md, REQUIREMENTS-v1.1.md, research/SUMMARY.md*
*Next step: Plan Phase 11 - Performance Optimization*
