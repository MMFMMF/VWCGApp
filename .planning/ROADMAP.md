# Roadmap: VWCG Assessment Suite — Report Redesign

## Overview

This roadmap transforms the VWCG Assessment Suite from basic quiz-style PDFs to consulting-grade deliverables. Starting with foundational design systems and enhanced data inputs, we rebuild the synthesis engine with 8 new cross-assessment rules and 6 derived metrics. The core deliverable is the Unified Strategic Briefing — a narrative-driven 12-16 page PDF synthesizing all 6 assessments with financial impact analysis and prioritized recommendations. Six individual reports (Advisor Readiness, AI Readiness, Leadership DNA, SWOT, Vision Canvas, 90-Day Roadmap) receive parallel redesigns with Score → Interpretation → Action structure. The journey ends with quality gates ensuring 300 DPI vector graphics, consultant voice, and graceful edge case handling throughout.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Design Foundation** - Design system, typography, chart library, anti-patterns enforcement
- [ ] **Phase 2: Data Enhancement** - Six new user inputs for benchmarking and financial estimates
- [ ] **Phase 3: Synthesis Intelligence** - 6 derived metrics + 8 cross-assessment rules + keyword analysis
- [ ] **Phase 4: Narrative Framework** - Narrative engine with consultant voice, template system, banned phrases enforcement
- [ ] **Phase 5: Unified Strategic Briefing** - Flagship 12-16 page PDF with synthesis, financial impact, recommendations
- [ ] **Phase 6: Individual Reports (Advisor/AI)** - Advisor Readiness + AI Readiness report redesigns
- [ ] **Phase 7: Individual Reports (Leadership/SWOT)** - Leadership DNA + SWOT report redesigns
- [ ] **Phase 8: Individual Reports (Vision/Roadmap)** - Vision Canvas + 90-Day Roadmap report redesigns
- [ ] **Phase 9: PDF Infrastructure** - 300 DPI rendering, SVG vectors, metadata, file naming
- [ ] **Phase 10: Quality & Edge Cases** - All-high/all-low handling, vague input detection, missing module notes

## Phase Details

### Phase 1: Design Foundation
**Goal**: Establish dark navy authority aesthetic with strict chart rules that serve narrative, not decoration
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06
**Success Criteria** (what must be TRUE):
  1. Color system components use Deep Navy #1B2A4A, Charcoal #2D3436, Strategic Blue #2E6EA6, Alert Amber #D4930D, Risk Red #C0392B, Growth Green #27864A, Warm White #F8F7F4
  2. Typography renders with Inter or DM Sans at defined scale (hero 48-64pt, section 24pt, body 11-12pt)
  3. Chart components generate horizontal bars, progress bars with gap visualization, dot plots, and simple gauges only
  4. Charts display narrative titles stating insight (not metric name) and 2-3 sentence interpretations
  5. Radar charts, pie charts, 3D charts, gradient backgrounds, and decorative icons are impossible to render
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

---

### Phase 2: Data Enhancement
**Goal**: Users can provide business context (revenue, industry, employees, founder hours, business age, growth goal) required for benchmarking and financial impact calculations
**Depends on**: Phase 1 (design system for input UI)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06
**Success Criteria** (what must be TRUE):
  1. User can select annual revenue range from 7 brackets (<$1M through $50M+)
  2. User can select industry from 9 options (Professional Services, Manufacturing, Technology/SaaS, Healthcare, Distribution, Construction, Financial Services, Retail, Other)
  3. User can select employee count range, founder weekly hours range, and years in business range
  4. User can select primary growth goal from 6 options (Revenue growth, Profitability improvement, Market expansion, Operational efficiency, Exit/succession prep, Stabilization)
  5. Workspace store persists all 6 new data inputs with provenance tracking
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

---

### Phase 3: Synthesis Intelligence
**Goal**: Synthesis engine generates 6 derived metrics and runs 8 cross-assessment rules with SWOT keyword analysis, replacing E1-E5
**Depends on**: Phase 2 (data inputs required for derived metrics)
**Requirements**: SYNTH-01, SYNTH-02, SYNTH-03, SYNTH-04, SYNTH-05, SYNTH-06, SYNTH-07, SYNTH-08, SYNTH-09, SYNTH-10, SYNTH-11, SYNTH-12, SYNTH-13, SYNTH-14, SYNTH-15
**Success Criteria** (what must be TRUE):
  1. Derived metrics compute automatically: Execution-Ambition Ratio, Founder Dependency Index (0-10), Strategic Coherence Score (Aligned/Partially/Misaligned), Revenue Risk Estimate (range), Readiness-for-Change Score (0-100 with labels), Leadership Archetype (6 types)
  2. Rule 1 (Vision-Execution Mismatch) fires when >3 pillars + Execution <7 + SWOT capacity keywords detected
  3. Rule 2 (Values-Reality Contradiction) fires when balance values present + burnout SWOT keywords + 70+ founder hours
  4. Rule 3 (Technology Ambition Without Readiness) fires when AI vision pillars exist + AI Readiness <40%
  5. Rule 4 (Growth Vision Without Strategic Clarity) fires when north star vague + Vision <6
  6. Rule 5 (Founder Dependency + Succession Risk) fires when FDI >6 + retirement threats + Empowerment gap >2
  7. Rule 6 (Strong Finances + Weak Strategy) fires when Financial Health >80% + Strategic Alignment <50%
  8. Rule 7 (High AI Culture + Low Infrastructure) fires when Culture >60% + Infrastructure <30%
  9. Rule 8 (Execution Gap Dominance) fires when largest gap is Execution + gap >2 + delivery SWOT keywords
  10. SWOT text analysis scans for bottleneck, capacity, burnout, retirement, and technology keywords with frequency scoring
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

---

### Phase 4: Narrative Framework
**Goal**: Narrative generation engine produces consultant-voice content (direct, specific, quantified) with template system and banned phrase enforcement
**Depends on**: Phase 3 (synthesis insights feed narrative content)
**Requirements**: NARR-01, NARR-02, NARR-03, NARR-04, NARR-05
**Success Criteria** (what must be TRUE):
  1. Narratives use consultant voice: direct, specific, quantified, active voice, one idea per paragraph
  2. Narratives reference client's own words from SWOT items, vision statements, and values for personalization
  3. Template system blocks generation containing banned phrases: "leverage" (verb), "synergy", "best practices", "low-hanging fruit", "move the needle", "world-class", "stakeholders", "going forward"
  4. Every metric displayed includes at least 1 sentence of interpretation with business context
  5. Narrative generation applies conditional logic (e.g., cost section only when revenue data available, contradictions only when >=2 flagged)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

---

### Phase 5: Unified Strategic Briefing
**Goal**: Users can generate 12-16 page flagship PDF synthesizing all 6 assessments with headline finding, financial impact analysis, benchmarking context, and prioritized recommendations
**Depends on**: Phase 4 (narrative engine), Phase 3 (synthesis insights), Phase 1 (design system)
**Requirements**: USB-01, USB-02, USB-03, USB-04, USB-05, USB-06, USB-07, USB-08, USB-09, USB-10, USB-11, USB-12
**Success Criteria** (what must be TRUE):
  1. Cover page renders with VWCG logo, "Strategic Business Assessment" title, client name, date, tagline on navy background
  2. Executive Snapshot page shows headline finding (strategic observation, not score), vital signs dashboard (4-5 metrics with one-line interpretations), three-word descriptors
  3. "Where You're Strong" narrative (~1 page) synthesizes strengths across all assessments with strategic value explanation
  4. "Where You're Exposed" narrative (~1-1.5 pages) connects weaknesses, identifies compounding risks, names business consequences
  5. "The Contradictions" section (~0.5-1 page) identifies cross-assessment contradictions with specific evidence and strategic implications
  6. "What This Is Costing You" page displays 3 impact blocks (Founder Bottleneck Cost, Operational Inefficiency Cost, Strategic Risk Exposure) with dollar estimates and methodology
  7. Benchmarking Context page renders dot-plot visualizations for Advisor Readiness, AI Readiness, Leadership DNA, SWOT Risk Profile with stage labels and narrative
  8. Top 3 Prioritized Recommendations (~2 pages) each include Why This First, What It Looks Like, Estimated Impact, First Step
  9. 90-Day Quick Wins page displays 3 time-boxed actions (Week 1-2, Week 3-4, Week 5-8) with specific actions and expected outcomes
  10. Conditional content logic: cost section only when data supports estimates, contradictions section only when >=2 flagged, benchmarking with industry-specific or general SMB data
  11. "How to Use This Briefing" guidance page includes soft advisory engagement bridge
  12. Individual Report Downloads back page lists 6 reports with sharing guidance
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD
- [ ] 05-04: TBD

---

### Phase 6: Individual Reports (Advisor/AI)
**Goal**: Users can generate redesigned Advisor Readiness and AI Readiness individual reports with Score → Interpretation → Action structure
**Depends on**: Phase 4 (narrative engine), Phase 1 (design system)
**Requirements**: ADV-01, ADV-02, ADV-03, ADV-04, AIR-01, AIR-02, AIR-03, AIR-04
**Success Criteria** (what must be TRUE):
  1. Advisor Readiness report renders cover page, overall readiness page with stage label (Emerging/Growing/Advancing/Mature) and horizontal bar with benchmark overlays
  2. Advisor Readiness report shows Category Deep Dive for 4 categories with score, stage label, interpretation (2-3 sentences), improvement actions (1-2 specific)
  3. Advisor Readiness report includes Readiness Implications table assessing strategic moves (Hiring COO, Pursuing acquisition, New service line, Growth capital, Geographic expansion)
  4. AI Readiness report renders cover page, overview with headline stage (Pre-Digital through Leading), adoption curve narrative, horizontal bar chart of 6 dimensions
  5. AI Readiness report shows Dimension Analysis for 6 dimensions with score, one-line label, business-context interpretation (2-3 sentences), priority level (Critical/Important/Monitor)
  6. AI Readiness report includes AI Readiness Roadmap with 3 stages (Months 1-3 Foundation, 4-6 Build, 7-12 Scale) with 2-3 actions per stage based on scores
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

---

### Phase 7: Individual Reports (Leadership/SWOT)
**Goal**: Users can generate redesigned Leadership DNA and SWOT individual reports with Score → Interpretation → Action structure
**Depends on**: Phase 4 (narrative engine), Phase 3 (Leadership Archetype), Phase 1 (design system)
**Requirements**: LDR-01, LDR-02, LDR-03, LDR-04, SWOT-01, SWOT-02, SWOT-03, SWOT-04
**Success Criteria** (what must be TRUE):
  1. Leadership DNA report renders cover page, Leadership Profile with horizontal gap visualization (current bar + target outline + gap highlight), headline callout for biggest gap, narrative characterizing profile
  2. Leadership DNA report shows Gap Analysis for each dimension with gap >1: current/target/gap values, "What's behind this gap" (2-3 sentences), "What closing this gap unlocks" (1-2 sentences), "One thing this week" micro-step
  3. Leadership DNA report includes Leadership Archetype page with archetype assignment, 2-paragraph description, famous leaders comparison, #1 breakthrough action
  4. SWOT report renders cover page, SWOT Summary with 2x2 priority matrix (impact vs. urgency), one-paragraph strategic position summary
  5. SWOT report shows Strategic Connections: Leverage (S+O), Defend (S+T), Watch (W+T), Invest (W+O) with narrative explanations
  6. SWOT report includes SWOT Action Items: 3 prioritized actions — highest-leverage S+O, most urgent W+T, one thing to stop doing
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

---

### Phase 8: Individual Reports (Vision/Roadmap)
**Goal**: Users can generate redesigned Vision Canvas and 90-Day Roadmap individual reports with Score → Interpretation → Action structure
**Depends on**: Phase 4 (narrative engine), Phase 1 (design system)
**Requirements**: VIS-01, VIS-02, VIS-03, VIS-04, RDM-01, RDM-02, RDM-03, RDM-04
**Success Criteria** (what must be TRUE):
  1. Vision Canvas report renders cover page, Vision Assessment with quoted north star, Vision Clarity Rating (Clear/Directional/Vague), explanation paragraph, per-pillar feasibility check and alignment check
  2. Vision Canvas report shows Vision Reality Gap: requirements vs. current state table, gap synthesis paragraph
  3. Vision Canvas report includes Core Values Audit: per-value assessment of whether operationalized or aspirational, with evidence from assessment data
  4. 90-Day Roadmap report renders cover page, Roadmap Philosophy paragraph explaining sequencing rationale (fix foundation → build capabilities → launch initiatives)
  5. 90-Day Roadmap report shows Simplified Roadmap: 3-phase layout (Stabilize Weeks 1-4, Build Weeks 5-8, Launch Weeks 9-12), max 6 items total, each with action/why now/owner role/success outcome
  6. 90-Day Roadmap report includes "What's Not on This Roadmap (And Why)": 2-3 deliberately excluded items with strategic rationale
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

---

### Phase 9: PDF Infrastructure
**Goal**: PDF generation produces 300 DPI vector graphics with proper metadata and branded file naming
**Depends on**: Phase 5, 6, 7, 8 (all PDF outputs)
**Requirements**: PDF-01, PDF-02, PDF-03, PDF-04, PDF-05
**Success Criteria** (what must be TRUE):
  1. PDFs render embedded graphics at 300 DPI minimum resolution
  2. Charts embed as SVG vectors (not raster screenshots) where technically possible
  3. PDF document metadata includes title, author ("World Consulting Group"), subject fields
  4. File naming follows convention: [ClientName]-Strategic-Briefing-[Date].pdf for unified, [ClientName]-[ReportType]-[Date].pdf for individual reports
  5. Body text in generated PDFs measures minimum 11pt font size
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

---

### Phase 10: Quality & Edge Cases
**Goal**: Reports handle edge cases gracefully (all-high scores, all-low scores, vague SWOT entries, missing modules) with appropriate framing
**Depends on**: Phase 5, 6, 7, 8 (all report outputs)
**Requirements**: PDF-06
**Success Criteria** (what must be TRUE):
  1. When all scores are high (>80%), reports frame content as optimization opportunities, not generic praise
  2. When all scores are low (<40%), reports frame content as triage priorities with clear starting point
  3. When SWOT entries are vague or generic, report includes note suggesting specificity for better insights
  4. When assessment modules are incomplete or missing, reports generate with notation explaining limited scope
  5. Edge case detection runs during PDF generation and applies appropriate content transformations
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design Foundation | 0/TBD | Not started | - |
| 2. Data Enhancement | 0/TBD | Not started | - |
| 3. Synthesis Intelligence | 0/TBD | Not started | - |
| 4. Narrative Framework | 0/TBD | Not started | - |
| 5. Unified Strategic Briefing | 0/TBD | Not started | - |
| 6. Individual Reports (Advisor/AI) | 0/TBD | Not started | - |
| 7. Individual Reports (Leadership/SWOT) | 0/TBD | Not started | - |
| 8. Individual Reports (Vision/Roadmap) | 0/TBD | Not started | - |
| 9. PDF Infrastructure | 0/TBD | Not started | - |
| 10. Quality & Edge Cases | 0/TBD | Not started | - |
