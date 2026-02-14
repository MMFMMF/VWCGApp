# VWCG Assessment Suite

## What This Is

A React SPA for strategic business assessment. Executives use 12 integrated tools to evaluate organizational readiness and create actionable plans. The report system generates two deliverable types: a Unified Strategic Briefing (narrative-driven cross-tool synthesis) and 6 individual tool reports. Reports are generated as PDFs via Puppeteer print routes. An optional AI Briefing mode uses ChatGPT to generate narrative content. Deployed to Firebase Hosting at vwcgapp.web.app.

## Core Value

Every deliverable must pass the "Holy Cow" Standard: a founder reads it and feels like a senior consultant spent a day analyzing their business — not like a quiz engine spit out charts.

## Current Milestone: v1.1 Report Quality Overhaul

**Goal:** Fix all 11 defects identified by adversarial QA audit across 24 PDFs (8 report types x 3 personas). Every report should be so good that a CEO asks "why is this free?"

**Target fixes:**
- FIX 1: Financial math reconciliation (subtotals must sum to total)
- FIX 2: Roadmap "Why Now?" must be task-specific (LLM-generated with rule-based fallback)
- FIX 3: Roadmap success criteria must be measurable (LLM-generated with rule-based fallback)
- FIX 4: Eliminate blank pages in AI Briefings
- FIX 5: Advisor Readiness narratives must vary by score AND company context
- FIX 6: Strategic coherence must have a real 5-level spectrum
- FIX 7: Advisor Readiness overall narrative must match score
- FIX 8: Benchmark chart label overlap
- FIX 9: Sparse orphaned pages
- FIX 10: AI Briefing financial figure line breaks
- FIX 11: "Not Now" list differentiation across personas

## Requirements

### Validated

- ✓ 12 assessment tools collecting structured data — v1.0
- ✓ Zustand workspace store persisting all tool data to localStorage — v1.0
- ✓ Synthesis Engine v2 with 8 cross-tool rules generating insights — v1.0
- ✓ 6 derived metrics (Execution-Ambition Ratio, Founder Dependency Index, Strategic Coherence, Revenue Risk, Readiness-for-Change, Leadership Archetype) — v1.0
- ✓ L0-L3 validation system with per-tool profiles — v1.0
- ✓ Safe Mode import workflow (stage → validate → commit) — v1.0
- ✓ Dark navy design system with Inter/DM Sans typography — v1.0
- ✓ Unified Strategic Briefing (12-16 page narrative PDF) — v1.0
- ✓ AI-powered Strategic Briefing via ChatGPT (LLMStrategicBriefing) — v1.0
- ✓ 6 redesigned individual reports (Advisor, AI, Leadership, SWOT, Vision, Roadmap) — v1.0
- ✓ Chart system (horizontal bars, progress bars, dot plots, gauges) — v1.0
- ✓ Narrative generation engine with consultant voice — v1.0
- ✓ PDF generation via Puppeteer print route (dedicated /report/print/:reportType) — v1.0
- ✓ Business Context data collection (revenue, industry, employee count, etc.) — v1.0
- ✓ Edge case and vague entry detection — v1.0
- ✓ Playwright E2E test infrastructure with journey tests — v1.0

### Active

- [ ] Financial impact subcategories must sum exactly to total (bottom-up calculation with rounding reconciliation)
- [ ] Roadmap "Why Now?" must be LLM-generated per task with assessment data references, rule-based fallback
- [ ] Roadmap success criteria must be LLM-generated per task with measurable outcomes, rule-based fallback
- [ ] No blank pages in any PDF output (CSS prevention + post-processing safety net)
- [ ] Advisor Readiness dimension narratives must vary by score AND company context (startup vs established)
- [ ] Strategic coherence must use 5-level spectrum (Aligned → Severely Misaligned) not binary
- [ ] Advisor Readiness overall narrative/label must match actual score ranges
- [ ] Benchmark chart labels must not overlap when scores are close to reference markers
- [ ] No sparse orphaned pages (<100 chars of content excluding footer)
- [ ] Financial dollar ranges must not break across lines in AI Briefings
- [ ] "Not Now" list must be persona-specific with assessment data references

### Out of Scope

- Backend/server-side infrastructure — app remains a client-side SPA
- User authentication or multi-user access
- New tool development or tool UI changes
- Changes to workspace save/load format
- New report types beyond existing 8
- Mobile-native app development

## Context

v1.0 (Report Redesign) shipped 10 phases with ~11,000 lines across the report system, synthesis engine v2, narrative framework, and PDF infrastructure. An adversarial QA audit then tested 24 PDFs (8 report types x 3 test personas: Alex/Meridian Consulting, Mike/Patterson Industrial, Sarah/TechFlow Analytics) and found 11 defects ranging from financial math errors to generic templated content that doesn't differentiate between personas.

The existing LLM pipeline (`src/engine/llm/`) uses ChatGPT via native fetch with a generator + QA validator pattern. This pipeline will be extended for roadmap "Why Now?" and success criteria generation (Fixes 2-3), with rule-based fallbacks for when the API is unavailable.

The full spec document with all 11 fixes, pseudocode, expected outputs per persona, test criteria, and dependency chain is at: `C:\Users\Kamyar\Downloads\VWCG-Report-Quality-Fix-Spec_1.md`

## Constraints

- **Tech stack**: Existing React 19 + Vite + Zustand + Puppeteer stack — no new major dependencies
- **LLM strategy**: ChatGPT for Fixes 2-3 with rule-based fallback; existing openai-service.ts pattern
- **Test coverage**: Every fix must be verifiable across all 3 personas (Sarah, Mike, Alex)
- **No regressions**: Existing report functionality must not break
- **Backwards compatibility**: Workspace .vwcg format unchanged

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| LLM with rule-based fallback for Fixes 2-3 | Highest quality personalized text, graceful degradation when API unavailable | — Pending |
| Bottom-up financial calculation (Fix 1 Option A) | Total = sum of parts, never independent. Rounding reconciliation on last category. | — Pending |
| 5-level coherence spectrum (Fix 6) | Binary "Misaligned" gives every company the same diagnosis — defeats the purpose | — Pending |
| CSS-first for PDF layout fixes (4, 9, 10) | Prevent at source rather than post-process; post-processing as safety net only | — Pending |
| Combine Why Now + Success Criteria in single LLM call | Halves API calls — one prompt per task returns both fields as JSON | — Pending |

---
*Last updated: 2026-02-14 after milestone v1.1 initialization*
