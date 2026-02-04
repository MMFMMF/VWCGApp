# Roadmap: VWCGApp

**Created:** 2026-02-04
**Total Phases:** 6
**Total Requirements:** 44

## Phase Overview

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|------------------|
| 1 | Foundation & Infrastructure | Build core architecture and state management | 5 | 3 |
| 2 | First Assessment Tools | Deliver first 3 interactive assessment tools with visualization | 3 | 4 |
| 3 | Core Strategic Assessments | Complete strategic assessment suite with SWOT, Vision, and SOP tools | 4 | 4 |
| 4 | Planning & Synthesis Engine | Build 90-Day Roadmap and implement cross-tool insight synthesis | 8 | 5 |
| 5 | Reports & Workspace Management | Enable PDF generation and workspace save/load functionality | 9 | 4 |
| 6 | Marketing Site & Access Control | Launch public marketing site, blog, and invite-only access gate | 11 | 5 |

---

## Phase 1: Foundation & Infrastructure

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

---

## Phase 2: First Assessment Tools

**Goal:** Deliver first three interactive assessment tools with radar chart visualization to validate core architecture

**Requirements:**
- **AST-01**: AI Readiness Assessment — 6 dimensions (Strategy, Data, Infrastructure, Talent, Governance, Culture), 0-100% sliders, radar chart visualization
- **AST-02**: Leadership DNA — 6 dimensions (Vision, Execution, Empowerment, Decisiveness, Adaptability, Integrity), current vs target (0-10), dual-layer radar chart
- **AST-03**: Business Emotional Intelligence — 6 dimensions (Self Awareness, Self Regulation, Motivation, Empathy, Social Skills, Intuition), trend tracking over time, multi-entry support

**Success Criteria:**
1. All three assessment tools accept user input and persist data to localStorage
2. Radar charts render correctly with Recharts for all three tools
3. Business EQ multi-entry trend tracking shows historical data visualization
4. User can navigate between tools without losing data
5. Mobile-responsive design works on screens down to 375px width

**Dependencies:** Phase 1 (tool architecture, state management, UI components)

---

## Phase 3: Core Strategic Assessments

**Goal:** Complete strategic assessment suite with SWOT analysis, Vision Canvas, SOP maturity evaluation, and Advisor Readiness

**Requirements:**
- **AST-04**: SWOT Analysis — 4-quadrant matrix (Strengths, Weaknesses, Opportunities, Threats), confidence levels (1-5) per item
- **AST-05**: Vision Canvas — North Star metric, strategic pillars (max 6), core values list
- **AST-06**: Advisor Readiness — 20 questions across 4 categories (Strategic Alignment, Operational Maturity, Financial Health, Cultural Readiness), 1-5 scale, maturity percentage calculation
- **AST-07**: Financial Readiness Assessment — 5-8 key financial health indicators (cash flow, runway, debt-to-equity, profit margins, revenue growth), visual dashboard, risk score output
- **SOP-01**: SOP Maturity Assessment — current process maturity evaluation (0-5 scale)
- **SOP-02**: Identification of top 3 critical SOPs needed based on assessment results
- **SOP-03**: Template suggestions for identified SOP gaps

**Success Criteria:**
1. SWOT 4-quadrant matrix displays items with confidence level indicators
2. Vision Canvas captures North Star metric and validates max 6 pillars
3. Advisor Readiness calculates maturity percentage across 4 categories correctly
4. Financial Readiness displays visual dashboard and generates risk score
5. SOP Maturity identifies and displays top 3 critical SOP gaps with template suggestions

**Dependencies:** Phase 2 (assessment tool pattern established)

---

## Phase 4: Planning & Synthesis Engine

**Goal:** Build 90-Day Roadmap planning tool and implement cross-tool synthesis engine with 7 insight rules

**Requirements:**
- **PLN-01**: 90-Day Roadmap — 12-week timeline across 3 phases (Foundation 1-4, Growth 5-8, Scale 9-12)
- **PLN-02**: Task creation with title, owner, week, status, dependencies
- **PLN-03**: Status tracking (planned, in-progress, completed)
- **PLN-04**: Timeline visualization with phase-based coloring
- **SYN-01**: E1 — Execution Capability Gap (Leadership Execution < 6 + Pillars exceed dynamic limit)
- **SYN-02**: E2 — Unmitigated Threat (SWOT threat confidence >= 4 + no roadmap task addressing it)
- **SYN-03**: E3 — Burnout Risk (Advisor maturity < 50% + tasks > safe capacity)
- **SYN-04**: E4 — Strength Leverage (FIXED: high-confidence strength not connected to value proposition)
- **SYN-05**: E5 — SOP Metric Missing (metrics defined but SOP maturity too low)
- **SYN-06**: E10 — Opportunity-Capability Match (high-confidence opportunity + aligned capabilities)
- **SYN-07**: E11 — Strength Multiplication (compounding advantages across multiple dimensions)
- **SYN-08**: Automatic synthesis on every state update
- **SYN-09**: Insight display with severity badges, recommendations, related tools

**Success Criteria:**
1. 90-Day Roadmap creates tasks across 12-week timeline with dependency tracking
2. Timeline visualization shows 3 phases with color-coded tasks
3. Synthesis engine detects all 7 rules (E1-E5, E10-E11) correctly from test scenarios
4. Insights display with severity levels (critical/warning/info) and actionable recommendations
5. Synthesis runs automatically after any assessment tool data changes

**Dependencies:** Phase 3 (all assessment tools needed for cross-tool synthesis rules)

---

## Phase 5: Reports & Workspace Management

**Goal:** Enable PDF report generation and workspace file export/import functionality

**Requirements:**
- **RPT-01**: Section selection for PDF generation (checkboxes per tool)
- **RPT-02**: PDF generation with selected sections (jsPDF)
- **RPT-03**: Report includes assessment scores, charts, and synthesis insights
- **RPT-04**: Download as `VWCGReport_[workspace-name].pdf`
- **WRK-01**: Auto-save to browser localStorage via Zustand persist
- **WRK-02**: Save workspace to downloadable .vwcg file (JSON format)
- **WRK-03**: Load workspace from .vwcg or .json file
- **WRK-04**: Safe mode for imports with validation and partial import selection
- **WRK-05**: Logic version tracking and upgrade mechanism

**Success Criteria:**
1. PDF generates in <5 seconds with selected sections, charts, and synthesis insights
2. PDF includes radar charts, SWOT matrix, timeline visualization rendered correctly
3. Workspace exports to .vwcg file and imports back without data loss
4. Safe mode validates imported files and allows user to select which sections to import
5. Auto-save to localStorage happens within 1 second of any data change (debounced)

**Dependencies:** Phase 4 (synthesis insights needed for reports, all tools needed for complete workspace)

---

## Phase 6: Marketing Site & Access Control

**Goal:** Launch public marketing site with SEO-optimized landing page, blog CMS, and invite-only access gate for assessment tools

**Requirements:**
- **MKT-01**: Landing page optimized for cold traffic conversion (PPC, social ads)
- **MKT-02**: Blog with Decap CMS for WordPress-like content editing
- **MKT-03**: SEO optimization (meta tags, structured data, sitemap)
- **MKT-04**: Mobile-responsive design (60%+ expected mobile traffic)
- **ACC-01**: Public landing page and blog accessible without invite
- **ACC-02**: Assessment tools gated behind invite code entry
- **ACC-03**: Simple invite code generation and validation
- **ACC-04**: Session persistence for validated users (sessionStorage)
- **CTT-01**: Contact form using Netlify Forms or Formspree (no backend)
- **CTT-02**: Pre-filled message template ("Please contact me to discuss execution of my recommendations")
- **CTT-03**: Form submission sends to consultant email

**Success Criteria:**
1. Landing page loads in <2 seconds on mobile with clear value proposition and sample report preview
2. Blog CMS allows non-technical user to create/edit posts via Decap CMS interface
3. SEO meta tags, structured data, and sitemap.xml present for all public pages
4. Invite code validation prevents access to assessment tools without valid code
5. Contact form successfully sends email with pre-filled message template

**Dependencies:** Phase 5 (assessment tools must be complete for gated access to be meaningful)

---

## Coverage Validation

### v1 Requirements by Category

**Marketing Site:** 4 requirements (MKT-01 to MKT-04) → Phase 6
**Access Control:** 4 requirements (ACC-01 to ACC-04) → Phase 6
**Assessment Tools:** 7 requirements (AST-01 to AST-07) → Phase 2 (3), Phase 3 (4)
**SOP Assessment:** 3 requirements (SOP-01 to SOP-03) → Phase 3
**Planning Tools:** 4 requirements (PLN-01 to PLN-04) → Phase 4
**Synthesis Engine:** 9 requirements (SYN-01 to SYN-09) → Phase 4
**Report Center:** 4 requirements (RPT-01 to RPT-04) → Phase 5
**Workspace Management:** 5 requirements (WRK-01 to WRK-05) → Phase 5
**Contact & Lead Capture:** 3 requirements (CTT-01 to CTT-03) → Phase 6
**Architecture & Extensibility:** 5 requirements (ARC-01 to ARC-05) → Phase 1

### Final Tally

- **Total v1 requirements:** 44
- **Mapped to phases:** 44
- **Unmapped:** 0 ✓

### Requirements Distribution by Phase

| Phase | Requirements | Percentage |
|-------|--------------|------------|
| 1 | 5 | 11% |
| 2 | 3 | 7% |
| 3 | 7 | 16% |
| 4 | 12 | 27% |
| 5 | 9 | 20% |
| 6 | 11 | 25% |

---

## Phase Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (First Tools) ← validates architecture
    ↓
Phase 3 (Core Assessments) ← completes tool suite
    ↓
Phase 4 (Planning & Synthesis) ← requires all tools for cross-tool rules
    ↓
Phase 5 (Reports & Workspace) ← requires synthesis for reports
    ↓
Phase 6 (Marketing & Access) ← requires complete product to gate
```

---

## Estimated Timeline

Based on research recommendations and complexity analysis:

| Phase | Duration | Cumulative | Milestone |
|-------|----------|------------|-----------|
| 1 | 2 weeks | Week 2 | Infrastructure complete |
| 2 | 2 weeks | Week 4 | First tools working |
| 3 | 3 weeks | Week 7 | Core assessments complete |
| 4 | 3 weeks | Week 10 | Synthesis MVP working |
| 5 | 3 weeks | Week 13 | Full feature set complete |
| 6 | 2 weeks | Week 15 | **PRODUCTION LAUNCH** |

**Total timeline:** 15 weeks to production-ready platform

---

## Critical Success Factors

### Technical Quality Gates
- localStorage persistence tested with quota limits
- PDF generation <5 seconds on mobile devices
- Mobile completion rate ≥60% of desktop rate
- Zero data loss scenarios validated

### User Experience Gates
- Assessment completion time <10 minutes
- 70%+ completion rate in user testing
- Synthesis produces ≥3 specific, actionable recommendations per user
- Reports valuable enough to save/share (80%+ download rate)

### Business Strategy Gates
- Value-first approach (no email required for results)
- Clear differentiation (AI Readiness, Leadership DNA, Business EQ)
- Lead generation mechanism (contact form, not hard sell)
- Blog content ready for SEO (5+ posts at launch)

---

*Roadmap created: 2026-02-04*
*Derived from: PROJECT.md, REQUIREMENTS.md, SUMMARY.md*
*Next step: Execute Phase 1 - Foundation & Infrastructure*
