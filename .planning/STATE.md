# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Every deliverable passes the "Holy Cow" Standard — a founder reads it and feels like a senior consultant analyzed their business.
**Current focus:** Milestone v1.1 — Report Quality Overhaul (11 fixes from adversarial QA audit)

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-02-14 — Milestone v1.1 started

## Performance Metrics

**v1.0 Summary (Report Redesign):**
- 10 phases completed, ~11,070 lines of TypeScript/TSX
- 8 quick tasks completed post-v1.0
- All reports functional: Unified Strategic Briefing, AI Briefing, 6 individual reports

## Accumulated Context

### Decisions

- Template-driven narratives + optional AI-powered briefing (both modes available)
- Replace radar charts with horizontal bars (readability)
- Dark navy authority palette (convey seniority and gravitas)
- 8 synthesis rules v2 replacing v1 E1-E5
- New PDF service via Puppeteer print route (dedicated /report/print/:reportType)
- localStorage bridge for AI Briefing: ReportCenter persists narrative, PrintReport reads it
- Single-source footer: Puppeteer footerTemplate only, no internal footer in ReportPage
- LLM with rule-based fallback for roadmap Why Now + Success Criteria (v1.1)
- Bottom-up financial calculation with rounding reconciliation (v1.1)
- 5-level coherence spectrum replacing binary Misaligned (v1.1)

### Architecture Summary

```
src/engine/llm/                  # LLM-powered narrative generation
├── types.ts                     # BriefingNarrative, QAValidationResult, AssessmentPayload
├── prompts.ts                   # ChatGPT generator + ChatGPT Mini QA validator system prompts
├── openai-service.ts            # Native fetch API calls, generateWithRetry pipeline
├── payload-assembler.ts         # Maps workspace data to spec payload format
└── index.ts                     # Barrel exports

src/report/
├── design.ts                    # Colors, typography, page, chart constants
├── charts/                      # HorizontalBar, ProgressBar, DotPlot, Gauge
├── components/                  # ReportPage, ReportTypography (Hero, Section, Body, etc.)
├── narrative/                   # Voice enforcement, templates, generator
├── unified/                     # UnifiedStrategicBriefing (template) + LLMStrategicBriefing (AI)
├── individual/                  # 6 individual report components
├── pdf/                         # PdfGenerator (300 DPI, metadata, branded naming)
└── quality/                     # EdgeCaseDetector, VagueEntryDetector

src/components/print/
└── PrintReport.tsx              # Print route component (renders reports without AppShell)
```

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-14 (Milestone v1.1 initialization)
Stopped at: Defining requirements for Report Quality Overhaul
Resume file: None
