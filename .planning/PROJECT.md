# VWCG Assessment Suite — Report Redesign

## What This Is

A complete redesign of the VWCG Assessment Suite's report output system. The existing React SPA collects data across 6 assessment tools (Advisor Readiness, AI Readiness, Leadership DNA, SWOT, Vision Canvas, 90-Day Roadmap) and currently generates basic PDF reports that read like quiz results. This project transforms that output into two deliverable types: a flagship Unified Strategic Briefing that synthesizes all assessments into a narrative-driven consulting document, and 6 redesigned individual reports with interpretation, benchmarking, and actionable recommendations. The target audience is founders/executives at $5M-$50M revenue companies.

## Core Value

Every deliverable must pass the "Holy Cow" Standard: a founder reads it and feels like a senior consultant spent a day analyzing their business — not like a quiz engine spit out charts.

## Requirements

### Validated

<!-- Shipped and confirmed valuable — existing capabilities in the codebase. -->

- ✓ 6 assessment tools collecting structured data (AI Readiness, Leadership DNA, BEI, Vision Canvas, SWOT, 90-Day Roadmap, Advisor Readiness, SOP tools) — existing
- ✓ Zustand workspace store persisting all tool data to localStorage — existing
- ✓ Synthesis Engine with 5 cross-tool rules (E1-E5) generating insights — existing
- ✓ L0-L3 validation system with per-tool profiles — existing
- ✓ Safe Mode import workflow (stage → validate → commit) — existing
- ✓ Basic PDF generation via jsPDF + html2canvas in Report Center — existing
- ✓ Optional AI consultation via Gemini 1.5 Flash API — existing
- ✓ Workspace save/load with .vwcg file format — existing
- ✓ Dynamic tool registry with auto-routing and sidebar navigation — existing
- ✓ Dashboard with strategic health widget and insights display — existing
- ✓ Playwright E2E test infrastructure with journey tests — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Unified Strategic Briefing — 12-16 page narrative PDF synthesizing all 6 assessments
- [ ] New design system: dark navy palette (#1B2A4A), Inter/DM Sans typography, authority aesthetic
- [ ] Executive Snapshot page with headline finding, vital signs dashboard, three-word descriptors
- [ ] "What Your Assessment Reveals" narrative synthesis (strengths, exposures, contradictions)
- [ ] "What This Is Costing You" financial impact page with revenue-at-risk estimates
- [ ] Benchmarking context page with dot-plot/range-bar visualizations
- [ ] Top 3 prioritized recommendations with rationale, impact, and first steps
- [ ] 90-Day Quick Wins section (3 concrete actions by timeframe)
- [ ] 6 redesigned individual reports with Score → Interpretation → Action structure
- [ ] Advisor Readiness report: stage labels, benchmark overlays, readiness implications table
- [ ] AI Readiness report: adoption curve placement, dimension analysis, 3-stage AI roadmap
- [ ] Leadership DNA report: horizontal gap visualization, gap analysis, leadership archetypes
- [ ] SWOT report: 2x2 priority matrix, strategic connections (Leverage/Defend/Watch/Invest)
- [ ] Vision Canvas report: vision evaluation (not restatement), feasibility checks, values audit
- [ ] 90-Day Roadmap report: 3-phase layout (Stabilize/Build/Launch), "What's Not Here" section
- [ ] 8 new cross-assessment synthesis rules replacing current E1-E5
- [ ] 6 new derived metrics: Execution-Ambition Ratio, Founder Dependency Index, Strategic Coherence Score, Revenue Risk Estimate, Readiness-for-Change Score, Leadership Archetype
- [ ] New data collection: revenue range, industry, employee count, founder hours, years in business, growth goal
- [ ] Contradiction detection engine scanning cross-assessment data
- [ ] Chart system overhaul: horizontal bars, progress bars, dot plots (ban radar/pie/3D)
- [ ] Narrative generation engine with consultant voice (direct, specific, quantified)
- [ ] Dynamic content rules (conditional sections based on data availability)
- [ ] Edge case handling (all-high, all-low, vague inputs, missing modules)
- [ ] PDF improvements: vector charts (SVG), 300 DPI, document metadata, branded naming convention

### Out of Scope

- Backend/server-side infrastructure — app remains a client-side SPA
- User authentication or multi-user access
- Real-time collaboration features
- Payment processing or subscription management
- Mobile-native app development
- AI-generated narrative via LLM at runtime (narratives are template-driven with data interpolation, not live AI calls) — the existing Gemini consultation remains optional/separate

## Context

The existing VWCG app is a React 19 + TypeScript 5.9 + Vite 7.2 SPA deployed to Firebase Hosting. It has 11 registered tools, a Zustand store with localStorage persistence, a synthesis engine with 5 rules, and basic PDF export via jsPDF + html2canvas. The Report Center currently captures HTML elements as raster images — this needs to evolve to support the new design system's vector charts and precise typography.

The spec document provides 3 complete sample client profiles (Alex, Mike, Sarah) with full narrative content for every section of the Unified Strategic Briefing and individual reports. These serve as the reference implementation for narrative tone, data interpretation patterns, and content structure.

The current synthesis rules (E1-E5) will be replaced/expanded to 8 rules covering: Vision-Execution Mismatch, Values-Reality Contradiction, Technology Ambition Without Readiness, Growth Vision Without Strategic Clarity, Founder Dependency + Succession Risk, Strong Finances + Weak Strategy, High AI Culture + Low Infrastructure, Execution Gap Dominance.

Key design reference: dark navy (#1B2A4A) authority palette, Inter/DM Sans typography, horizontal bar charts replacing radar charts, generous whitespace, narrative-first layout with charts supporting story (never standalone).

## Constraints

- **Tech stack**: Must build within existing React 19 + Vite + Zustand + jsPDF stack — no backend services
- **PDF quality**: 300 DPI graphics, vector SVG charts where possible, minimum 11pt body text
- **Design system**: Strict adherence to color palette, typography scale, and chart guidelines from spec
- **Narrative voice**: Senior consultant tone — direct, specific, quantified, never generic or sycophantic
- **Data availability**: Financial estimates must degrade gracefully when revenue/industry data is missing
- **Compatibility**: Must maintain existing workspace save/load (.vwcg) backwards compatibility
- **Performance**: PDF generation must complete in reasonable time for 12-16 page documents

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Template-driven narratives, not runtime LLM | Predictability, no API dependency, consistent quality, offline capability | — Pending |
| Replace radar charts with horizontal bars | Radar charts "look cool, impossible to read, don't convey insight" per spec | — Pending |
| Dark navy authority palette over current light/airy | Convey seniority and gravitas — "Think McKinsey, not Canva" | — Pending |
| 8 synthesis rules replacing 5 | Broader cross-assessment coverage including financial impact and contradiction detection | — Pending |
| New data inputs (revenue, industry, etc.) | Required for financial impact calculations and benchmarking context | — Pending |
| Leadership archetypes based on DNA patterns | Adds relatability and actionable self-identification for founders | — Pending |

---
*Last updated: 2026-02-13 after initialization*
