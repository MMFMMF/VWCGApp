# Roadmap: VWCG Assessment Suite

## Milestones

- ✅ **v1.0 Report Redesign** - Phases 1-10 (shipped 2026-02-14)
- 🚧 **v1.1 Report Quality Overhaul** - Phases 11-16 (in progress)

## Phases

<details>
<summary>✅ v1.0 Report Redesign (Phases 1-10) - SHIPPED 2026-02-14</summary>

### Phase 1: Design Foundation
**Goal**: Establish dark navy authority aesthetic with strict chart rules that serve narrative, not decoration
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06
**Plans**: 2 plans

Plans:
- [x] 01-01: Design system and typography
- [x] 01-02: Chart library and anti-patterns

### Phase 2: Data Enhancement
**Goal**: Users can provide business context (revenue, industry, employees, founder hours, business age, growth goal) required for benchmarking and financial impact calculations
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06
**Plans**: 2 plans

Plans:
- [x] 02-01: Business context data collection
- [x] 02-02: Workspace persistence

### Phase 3: Synthesis Intelligence
**Goal**: Synthesis engine generates 6 derived metrics and runs 8 cross-assessment rules with SWOT keyword analysis, replacing E1-E5
**Requirements**: SYNTH-01, SYNTH-02, SYNTH-03, SYNTH-04, SYNTH-05, SYNTH-06, SYNTH-07, SYNTH-08, SYNTH-09, SYNTH-10, SYNTH-11, SYNTH-12, SYNTH-13, SYNTH-14, SYNTH-15
**Plans**: 3 plans

Plans:
- [x] 03-01: Derived metrics
- [x] 03-02: Cross-assessment rules
- [x] 03-03: SWOT keyword analysis

### Phase 4: Narrative Framework
**Goal**: Narrative generation engine produces consultant-voice content (direct, specific, quantified) with template system and banned phrase enforcement
**Requirements**: NARR-01, NARR-02, NARR-03, NARR-04, NARR-05
**Plans**: 2 plans

Plans:
- [x] 04-01: Consultant voice engine
- [x] 04-02: Template system

### Phase 5: Unified Strategic Briefing
**Goal**: Users can generate 12-16 page flagship PDF synthesizing all 6 assessments with headline finding, financial impact analysis, benchmarking context, and prioritized recommendations
**Requirements**: USB-01, USB-02, USB-03, USB-04, USB-05, USB-06, USB-07, USB-08, USB-09, USB-10, USB-11, USB-12
**Plans**: 4 plans

Plans:
- [x] 05-01: Executive snapshot and strengths
- [x] 05-02: Weaknesses and contradictions
- [x] 05-03: Financial impact and benchmarking
- [x] 05-04: Recommendations and quick wins

### Phase 6: Individual Reports (Advisor/AI)
**Goal**: Users can generate redesigned Advisor Readiness and AI Readiness individual reports with Score → Interpretation → Action structure
**Requirements**: ADV-01, ADV-02, ADV-03, ADV-04, AIR-01, AIR-02, AIR-03, AIR-04
**Plans**: 2 plans

Plans:
- [x] 06-01: Advisor Readiness report
- [x] 06-02: AI Readiness report

### Phase 7: Individual Reports (Leadership/SWOT)
**Goal**: Users can generate redesigned Leadership DNA and SWOT individual reports with Score → Interpretation → Action structure
**Requirements**: LDR-01, LDR-02, LDR-03, LDR-04, SWOT-01, SWOT-02, SWOT-03, SWOT-04
**Plans**: 2 plans

Plans:
- [x] 07-01: Leadership DNA report
- [x] 07-02: SWOT report

### Phase 8: Individual Reports (Vision/Roadmap)
**Goal**: Users can generate redesigned Vision Canvas and 90-Day Roadmap individual reports with Score → Interpretation → Action structure
**Requirements**: VIS-01, VIS-02, VIS-03, VIS-04, RDM-01, RDM-02, RDM-03, RDM-04
**Plans**: 2 plans

Plans:
- [x] 08-01: Vision Canvas report
- [x] 08-02: 90-Day Roadmap report

### Phase 9: PDF Infrastructure
**Goal**: PDF generation produces 300 DPI vector graphics with proper metadata and branded file naming
**Requirements**: PDF-01, PDF-02, PDF-03, PDF-04, PDF-05
**Plans**: 1 plan

Plans:
- [x] 09-01: PDF quality and metadata

### Phase 10: Quality & Edge Cases
**Goal**: Reports handle edge cases gracefully (all-high scores, all-low scores, vague SWOT entries, missing modules) with appropriate framing
**Requirements**: PDF-06
**Plans**: 1 plan

Plans:
- [x] 10-01: Edge case detection and handling

</details>

### 🚧 v1.1 Report Quality Overhaul (In Progress)

**Milestone Goal:** Fix all 11 defects identified by adversarial QA audit across 24 PDFs. Every report should be so good that a CEO asks "why is this free?"

#### Phase 11: Financial Math Reconciliation
**Goal**: Financial impact calculations produce mathematically correct subcategory totals that sum exactly to displayed total across all personas
**Depends on**: Nothing (first v1.1 phase, builds on v1.0 Phase 5)
**Requirements**: CALC-01, CALC-02
**Success Criteria** (what must be TRUE):
  1. Financial impact total equals exact sum of Founder Bottleneck, Operational Inefficiency, and Strategic Risk subcategories
  2. All financial figures rounded according to rule: nearest $500 under $100K, nearest $1K for $100K-$999K, nearest $5K for $1M+
  3. Rounding reconciliation applied with Strategic Risk absorbing remainder to maintain sum integrity
  4. Math verification passes for all 3 personas (Sarah, Mike, Alex) in generated reports
**Plans**: TBD

Plans:
- [ ] 11-01: TBD

---

#### Phase 12: Strategic Coherence Spectrum
**Goal**: Strategic coherence uses 5-level spectrum differentiating company performance instead of binary aligned/misaligned labels
**Depends on**: Nothing (parallel to Phase 11)
**Requirements**: SYNTH-01, SYNTH-02, SYNTH-03
**Success Criteria** (what must be TRUE):
  1. Coherence calculation uses 5-level spectrum: Aligned, Mostly Aligned, Partially Aligned, Misaligned, Severely Misaligned
  2. Contradiction severity classified as high, medium, or low based on assessment data
  3. Coherence level derived from contradiction count, severity weights, and execution-ambition ratio
  4. Executive Snapshot badges differentiate across personas (strategic posture, operational posture, change readiness)
  5. Sarah, Mike, and Alex receive different coherence labels reflecting their distinct assessment profiles
**Plans**: TBD

Plans:
- [ ] 12-01: TBD

---

#### Phase 13: Advisor Readiness Narratives
**Goal**: Advisor Readiness dimension and overall narratives vary by both score range and company context instead of using generic templates
**Depends on**: Phase 12 (coherence spectrum provides context for improvement actions)
**Requirements**: ADVR-01, ADVR-02, ADVR-03, ADVR-04
**Success Criteria** (what must be TRUE):
  1. Cultural Readiness narrative differentiates by company context (startup vs established vs mid-market), not just score
  2. All 4 dimension narratives use 6-level score granularity with company-context variants within each level
  3. Improvement actions reference specific assessment data (scores, SWOT items, leadership gaps, coherence findings)
  4. Overall readiness narrative and label match score ranges: >=80 Mature, 65-79 Advancing, 50-64 Developing, 35-49 Growing, <35 Foundational
  5. Sarah (startup), Mike (established), and Alex (mid-market) receive distinct narratives even when scores are similar
**Plans**: TBD

Plans:
- [ ] 13-01: TBD

---

#### Phase 14: Roadmap Personalization
**Goal**: Roadmap Why Now and Success Criteria are LLM-generated per task with persona-specific assessment data references and rule-based fallback
**Depends on**: Phase 11 (financial data available for context), Phase 12 (coherence data available for rationales)
**Requirements**: ROAD-01, ROAD-02, ROAD-03, ROAD-04
**Success Criteria** (what must be TRUE):
  1. Each roadmap task Why Now is LLM-generated referencing specific assessment scores, not generic templates
  2. Each roadmap task success criterion is LLM-generated with measurable outcomes specific to task category
  3. Why Now and Success Criteria combined in single LLM call per task, parallelized across all tasks via Promise.all
  4. Rule-based fallback generates acceptable content when ChatGPT API unavailable
  5. Not Now list items are persona-specific with assessment-derived rationales containing at least one numeric reference
  6. No duplicate Why Now text appears across any two tasks for any persona
**Plans**: TBD

Plans:
- [ ] 14-01: TBD

---

#### Phase 15: PDF Layout Polish
**Goal**: PDFs eliminate blank pages, sparse orphaned pages, label overlaps, and line-break issues via CSS prevention and safety nets
**Depends on**: Nothing (layout fixes independent of content generation)
**Requirements**: PDF-01, PDF-02, PDF-03, PDF-04
**Success Criteria** (what must be TRUE):
  1. No blank pages appear in any PDF output (CSS break-before: auto on sections, display: none on empty sections)
  2. No sparse orphaned pages with <100 characters of content excluding footer (CSS orphans/widows rules, break-before: avoid on methodology/disclaimers)
  3. Financial dollar ranges use white-space: nowrap; long ranges use shortened notation ($120K-$180K) to prevent line breaks
  4. Benchmark chart labels offset vertically when within 70px of each other to prevent overlap
  5. All 8 report types render cleanly across all 3 personas (24 PDFs total) with no layout defects
**Plans**: TBD

Plans:
- [ ] 15-01: TBD

---

#### Phase 16: Quality Verification
**Goal**: E2E tests verify financial math, personalization, coherence differentiation, and layout quality across all personas and report types
**Depends on**: Phase 11, 12, 13, 14, 15 (tests verify all fixes)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. E2E tests verify financial subtotals sum exactly to totals for all 3 personas
  2. E2E tests verify no duplicate Why Now text across any persona, each contains assessment data references
  3. E2E tests verify coherence labels differentiate across personas (Sarah ≠ Mike ≠ Alex)
  4. E2E tests verify no blank or sparse pages across all 24 PDFs (8 report types × 3 personas)
  5. Test suite passes on CI with all quality gates green
**Plans**: TBD

Plans:
- [ ] 16-01: TBD

---

## Progress

**Execution Order:**
Phases execute in numeric order: 11 → 12 → 13 → 14 → 15 → 16

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Design Foundation | v1.0 | 2/2 | Complete | 2026-02-14 |
| 2. Data Enhancement | v1.0 | 2/2 | Complete | 2026-02-14 |
| 3. Synthesis Intelligence | v1.0 | 3/3 | Complete | 2026-02-14 |
| 4. Narrative Framework | v1.0 | 2/2 | Complete | 2026-02-14 |
| 5. Unified Strategic Briefing | v1.0 | 4/4 | Complete | 2026-02-14 |
| 6. Individual Reports (Advisor/AI) | v1.0 | 2/2 | Complete | 2026-02-14 |
| 7. Individual Reports (Leadership/SWOT) | v1.0 | 2/2 | Complete | 2026-02-14 |
| 8. Individual Reports (Vision/Roadmap) | v1.0 | 2/2 | Complete | 2026-02-14 |
| 9. PDF Infrastructure | v1.0 | 1/1 | Complete | 2026-02-14 |
| 10. Quality & Edge Cases | v1.0 | 1/1 | Complete | 2026-02-14 |
| 11. Financial Math Reconciliation | v1.1 | 0/TBD | Not started | - |
| 12. Strategic Coherence Spectrum | v1.1 | 0/TBD | Not started | - |
| 13. Advisor Readiness Narratives | v1.1 | 0/TBD | Not started | - |
| 14. Roadmap Personalization | v1.1 | 0/TBD | Not started | - |
| 15. PDF Layout Polish | v1.1 | 0/TBD | Not started | - |
| 16. Quality Verification | v1.1 | 0/TBD | Not started | - |
