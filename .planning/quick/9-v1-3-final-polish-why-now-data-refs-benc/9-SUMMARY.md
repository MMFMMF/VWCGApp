# Quick Task #9 Summary — v1.3 Final Polish

## What Changed

### FIX 1: Data refs in 6 numberless Why Now branches (RoadmapReport.tsx)
- `compliance` non-low-EAR: added ORS score
- `marketing` non-aligned: added EAR + ORS
- `facilities` >=50: added ORS score
- `new_offering` non-aligned: added EAR
- `equipment` low-FDI: added ORS score
- All 6 branches now contain at least one specific assessment number

### FIX 2: DotPlot → comparison table (UnifiedStrategicBriefing.tsx)
- Replaced 4 DotPlot chart components with a single ReportTable
- Table columns: Dimension | You | Avg SMB | Top 25% | vs Avg
- Delta arrows (▲/▼) with green/red coloring
- Removed unused `smBenchmarks` constant and `DotPlot` import

### FIX 3a: Coherence adjustment less aggressive (derived-metrics.ts)
- 2 conflicts → note only (no downgrade) — was 1-step downgrade
- 3 conflicts → 1-step downgrade — was 2-step
- 4+ conflicts → 2-step downgrade — was severely_misaligned cliff
- Alex (2 contradictions) now stays at partially_aligned

### FIX 3b: Coherence narrative differentiation (templates.ts)
- `interpretMetric` for `strategicCoherence` now reads `ctx.metrics.strategicCoherenceDetails`
- Appends persona-specific contradiction findings instead of generic text
- Each persona gets unique narrative referencing their specific issues

## Files Modified
1. `src/report/individual/RoadmapReport.tsx` — 6 Why Now branches
2. `src/report/unified/UnifiedStrategicBriefing.tsx` — benchmark table + cleanup
3. `src/engine/derived-metrics.ts` — coherence adjustment thresholds
4. `src/report/narrative/templates.ts` — coherence narrative detail suffix

## Verification
- Build: clean (0 errors)
- Commit: af9b39a
