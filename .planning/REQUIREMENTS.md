# Requirements: VWCG Report Quality Overhaul (v1.1)

**Defined:** 2026-02-14
**Core Value:** Every deliverable passes the "Holy Cow" Standard — a founder reads it and feels like a senior consultant analyzed their business.

## v1.1 Requirements

Requirements for the report quality overhaul milestone. Each maps to roadmap phases.

### Financial Calculations

- [ ] **CALC-01**: Financial impact subcategories (Founder Bottleneck, Operational Inefficiency, Strategic Risk) must sum exactly to the displayed total — bottom-up calculation with rounding reconciliation
- [ ] **CALC-02**: Rounding rule: nearest $500 under $100K, nearest $1K for $100K-$999K, nearest $5K for $1M+. Strategic Risk absorbs rounding remainder.

### Roadmap Personalization

- [ ] **ROAD-01**: Each roadmap task "Why Now?" must be LLM-generated referencing specific assessment scores, with rule-based fallback if API unavailable
- [ ] **ROAD-02**: Each roadmap task success criterion must be LLM-generated with measurable outcomes specific to the task category, with rule-based fallback
- [ ] **ROAD-03**: Why Now + Success Criteria combined in single LLM call per task (parallel across all tasks via Promise.all)
- [ ] **ROAD-04**: "Not Now" list items must be persona-specific, derived from assessment data, each rationale containing at least one assessment-derived number

### Advisor Readiness Narratives

- [ ] **ADVR-01**: Cultural Readiness narrative must vary by company context (startup vs established vs mid-market), not just score range
- [ ] **ADVR-02**: All dimension narratives must use 6-level granularity (not 4) with company-context variants within each level
- [ ] **ADVR-03**: Improvement actions must reference specific assessment data (scores, SWOT items, leadership gaps)
- [ ] **ADVR-04**: Overall readiness narrative and label must match score: >=80 Mature, 65-79 Advancing, 50-64 Developing, 35-49 Growing, <35 Foundational

### Synthesis Engine

- [ ] **SYNTH-01**: Strategic coherence uses 5-level spectrum: Aligned, Mostly Aligned, Partially Aligned, Misaligned, Severely Misaligned — based on contradiction count, severity, and execution-ambition ratio
- [ ] **SYNTH-02**: Contradiction severity classification added (high/medium/low) used by coherence calculation
- [ ] **SYNTH-03**: Executive Snapshot badges must differentiate across personas (strategic posture, operational posture, change readiness)

### PDF Layout & Polish

- [ ] **PDF-01**: No blank pages in any PDF — CSS break-before: auto on sections, display: none on empty sections
- [ ] **PDF-02**: No sparse orphaned pages (<100 chars excluding footer) — CSS orphans/widows rules, break-before: avoid on methodology notes and disclaimers
- [ ] **PDF-03**: Financial dollar ranges use white-space: nowrap; long ranges use shortened notation ($120K-$180K)
- [ ] **PDF-04**: Benchmark chart labels offset vertically when within 70px of each other to prevent overlap

### Test Coverage

- [ ] **TEST-01**: E2E tests verify financial math (subtotals = total) for all 3 personas
- [ ] **TEST-02**: E2E tests verify no duplicate "Why Now?" text across any persona, each contains assessment data
- [ ] **TEST-03**: E2E tests verify coherence labels differentiate across personas
- [ ] **TEST-04**: E2E tests verify no blank/sparse pages across all PDFs

## v1.0 Requirements (Validated)

All v1.0 requirements shipped. See git history for full v1.0 REQUIREMENTS.md.

## Future Requirements

None — all 11 fixes are in scope for this milestone.

## Out of Scope

| Feature | Reason |
|---------|--------|
| New report types | Quality fixes only, no new deliverables |
| Tool UI changes | Report output only, not input tools |
| Workspace format changes | Must maintain backwards compatibility |
| New LLM provider integration | Reuse existing ChatGPT pipeline |
| Mobile PDF optimization | Desktop/print-first, same as v1.0 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CALC-01 | Phase 11 | Pending |
| CALC-02 | Phase 11 | Pending |
| ROAD-01 | Phase 14 | Pending |
| ROAD-02 | Phase 14 | Pending |
| ROAD-03 | Phase 14 | Pending |
| ROAD-04 | Phase 14 | Pending |
| ADVR-01 | Phase 13 | Pending |
| ADVR-02 | Phase 13 | Pending |
| ADVR-03 | Phase 13 | Pending |
| ADVR-04 | Phase 13 | Pending |
| SYNTH-01 | Phase 12 | Pending |
| SYNTH-02 | Phase 12 | Pending |
| SYNTH-03 | Phase 12 | Pending |
| PDF-01 | Phase 15 | Pending |
| PDF-02 | Phase 15 | Pending |
| PDF-03 | Phase 15 | Pending |
| PDF-04 | Phase 15 | Pending |
| TEST-01 | Phase 16 | Pending |
| TEST-02 | Phase 16 | Pending |
| TEST-03 | Phase 16 | Pending |
| TEST-04 | Phase 16 | Pending |

**Coverage:**
- v1.1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

**Phase breakdown:**
- Phase 11 (Financial Math): 2 requirements
- Phase 12 (Coherence Spectrum): 3 requirements
- Phase 13 (Advisor Narratives): 4 requirements
- Phase 14 (Roadmap Personalization): 4 requirements
- Phase 15 (PDF Layout): 4 requirements
- Phase 16 (Quality Verification): 4 requirements

---
*Requirements defined: 2026-02-14*
*Last updated: 2026-02-14 after roadmap creation*
