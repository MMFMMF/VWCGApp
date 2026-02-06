# Requirements: VWCGApp v1.1

**Defined:** 2026-02-05
**Milestone:** v1.1 Landing Page Excellence
**Core Value:** Make the landing page a traffic magnet that converts cold traffic into assessment users

## v1.1 Requirements

Requirements for landing page excellence milestone. Continues from v1.0 (44 requirements complete).

### Hero & Messaging

- [x] **HERO-01**: Pain-focused headline that addresses visitor's problem ("Stop running your business blind")
- [x] **HERO-02**: Clear value proposition visible above the fold
- [x] **HERO-03**: Animated statistics counters (count-up effect for "10+ tools", "500+ users", etc.)
- [x] **HERO-04**: Single primary CTA button with clear action text
- [x] **HERO-05**: Secondary CTA for "See Sample Report" anchor link

### Interactive Sample Report Preview

- [x] **RPT-01**: Animated gauge charts with count-up effect (AI Readiness %, Leadership DNA %, etc.)
- [x] **RPT-02**: Circular progress visualization for score display
- [x] **RPT-03**: Expandable insight cards (click to reveal full analysis text)
- [x] **RPT-04**: Hover interactions on data points with tooltips
- [x] **RPT-05**: "This could be YOUR business" overlay/messaging
- [x] **RPT-06**: Smooth scroll-triggered entrance animations for report section

### Mini-Assessment Teaser

- [ ] **TSR-01**: 3-question quick assessment widget embedded on landing page
- [ ] **TSR-02**: Progress indicator showing question completion (1/3, 2/3, 3/3)
- [ ] **TSR-03**: Real-time result calculation displayed after 3 questions
- [ ] **TSR-04**: Clear CTA to "Get Full Assessment" linking to /app
- [ ] **TSR-05**: localStorage bridge to pass teaser answers to full assessment

### Trust & Credibility

- [x] **TRS-01**: Privacy badge ("100% Private - Data never leaves your browser")
- [x] **TRS-02**: Security messaging ("No account required")
- [x] **TRS-03**: "No email required" trust signal prominently displayed
- [x] **TRS-04**: Instant results messaging ("Get results in 10 minutes")

### Competitive Positioning

- [ ] **CMP-01**: Comparison table: VWCGApp vs Consultant vs DIY/Guessing
- [ ] **CMP-02**: Time to insight comparison (10 min vs 2-4 weeks vs Never)
- [ ] **CMP-03**: Cost comparison (Free vs $5k-$20k vs $0)
- [ ] **CMP-04**: Objectivity comparison (AI-based vs Varies vs Biased)

### Performance & Animation

- [x] **PRF-01**: Scroll-triggered section reveal animations (fade-in, slide-up)
- [x] **PRF-02**: GPU-friendly animations only (transform, opacity - no layout properties)
- [ ] **PRF-03**: Mobile PageSpeed score > 80
- [ ] **PRF-04**: LCP < 2.5 seconds on mobile
- [ ] **PRF-05**: CLS < 0.1 (no layout shift from animations)
- [x] **PRF-06**: React islands use client:visible for below-fold components

## Out of Scope

Explicitly excluded from v1.1. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Video testimonials | No video content available, adds complexity |
| "As seen in" logos | No press coverage yet to reference |
| User count metrics ("500+ users") | Need real data before displaying |
| A/B testing infrastructure | Separate initiative, focus on building first |
| Multiple CTA variants | Single clear path, test later |
| Chatbot/live chat | Different feature category |
| Newsletter signup | Conflicts with "no email required" messaging |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| HERO-01 | Phase 7 | Complete |
| HERO-02 | Phase 7 | Complete |
| HERO-03 | Phase 7 | Complete |
| HERO-04 | Phase 7 | Complete |
| HERO-05 | Phase 7 | Complete |
| RPT-01 | Phase 8 | Complete |
| RPT-02 | Phase 8 | Complete |
| RPT-03 | Phase 8 | Complete |
| RPT-04 | Phase 8 | Complete |
| RPT-05 | Phase 8 | Complete |
| RPT-06 | Phase 8 | Complete |
| TSR-01 | Phase 9 | Pending |
| TSR-02 | Phase 9 | Pending |
| TSR-03 | Phase 9 | Pending |
| TSR-04 | Phase 9 | Pending |
| TSR-05 | Phase 9 | Pending |
| TRS-01 | Phase 7 | Complete |
| TRS-02 | Phase 7 | Complete |
| TRS-03 | Phase 7 | Complete |
| TRS-04 | Phase 7 | Complete |
| CMP-01 | Phase 10 | Pending |
| CMP-02 | Phase 10 | Pending |
| CMP-03 | Phase 10 | Pending |
| CMP-04 | Phase 10 | Pending |
| PRF-01 | Phase 8 | Complete |
| PRF-02 | Phase 8 | Complete |
| PRF-03 | Phase 11 | Pending |
| PRF-04 | Phase 11 | Pending |
| PRF-05 | Phase 11 | Pending |
| PRF-06 | Phase 8 | Complete |

**Coverage:**
- v1.1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-06 after Phase 8 completion*
