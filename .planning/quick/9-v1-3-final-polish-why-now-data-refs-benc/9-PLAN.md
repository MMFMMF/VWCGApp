---
phase: quick-9
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/report/individual/RoadmapReport.tsx
  - src/report/unified/UnifiedStrategicBriefing.tsx
  - src/report/narrative/templates.ts
  - src/engine/derived-metrics.ts
autonomous: true
must_haves:
  truths:
    - "Every Why Now contains at least one specific number (score, percentage, index)"
    - "Benchmark page uses comparison table, not DotPlot charts"
    - "Alex does NOT get 'Severely Misaligned' — he should get 'Partially Aligned' or 'Misaligned'"
    - "Coherence narratives reference specific contradictions, not generic text"
---

<objective>
Three final polish fixes for v1.3: (1) inject assessment data into 6 numberless Why Nows, (2) replace DotPlot benchmark charts with clean comparison table, (3) tune coherence spectrum and differentiate narratives.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Inject assessment data into 6 numberless Why Now branches</name>
  <files>src/report/individual/RoadmapReport.tsx</files>
  <action>
Six category cases in `generateWhyNow` have branches that produce text with no assessment numbers:

1. **`facilities` (line 224-225):** The `>= 50` branch says generic "Execute this during the stabilization window..." Fix: Include ORS score.
   ```
   return `${task.title} affects every employee daily. With Organizational Readiness at ${metrics.organizationalReadinessScore}/100, complete the relocation during the stabilization window when the team isn't simultaneously executing strategic initiatives.`;
   ```

2. **`marketing` (line 220-221):** The non-aligned branch says "must be tightly aligned..." with no score. Fix: Add EAR.
   ```
   return `Strategic coherence is "${coherence}" with an EAR of ${ear.toFixed(2)} — ${task.title} ${...}`;
   ```

3. **`new_offering` (line 242-243):** Same issue — "resolve the strategic alignment gaps (currently ${coherence})" has no number. Fix: Add EAR.
   ```
   `resolve the strategic alignment gaps (currently ${coherence}, EAR: ${ear.toFixed(2)}) before ${task.title} to prevent dilution`
   ```

4. **`equipment` (line 244-245):** Low-FDI branch says generic "Completing operational improvements now..." Fix: Add ORS.
   ```
   `With Organizational Readiness at ${metrics.organizationalReadinessScore}/100, completing operational improvements now prevents them from competing with strategic initiatives for attention.`
   ```

5. **`compliance` (line 218-219):** Non-low-EAR branch says "Your operational maturity needs this foundation before scaling" with no score. Fix: Add EAR and ORS.
   ```
   `Your operational maturity (Readiness: ${metrics.organizationalReadinessScore}/100) needs this foundation before scaling.`
   ```

6. The `marketing` case also affects Sarah's "Marketing Campaign Launch" — same fix as #2.
  </action>
</task>

<task type="auto">
  <name>Task 2: Replace DotPlot benchmarks with comparison table + tune coherence</name>
  <files>
    src/report/unified/UnifiedStrategicBriefing.tsx
    src/report/narrative/templates.ts
    src/engine/derived-metrics.ts
  </files>
  <action>
**FIX 2 — Replace DotPlot with Comparison Table (UnifiedStrategicBriefing.tsx)**

In `BenchmarkingPage` (line 486-538), replace the 4 DotPlot components with a ReportTable:

```
| Dimension | You | Avg SMB | Top 25% | vs Avg |
```

Keep the same data computation (advisorAvg, aiAvg, leadershipAvg, swotRiskRatio) but render as a table instead of charts. Include delta arrow (▲/▼). Remove the DotPlot import if no longer used elsewhere.

**FIX 3a — Coherence adjustment less aggressive (derived-metrics.ts)**

In `adjustCoherenceForContradictions`, reduce aggressiveness:
- 2 conflicts → no step downgrade (just note the contradictions)
- 3 conflicts → downgrade by 1 step (was 2)
- 4+ → downgrade by 2 steps (was severely_misaligned cliff)

This ensures Alex (2 contradictions) stays at partially_aligned instead of getting bumped to misaligned/severely_misaligned.

**FIX 3b — Coherence narrative differentiation (templates.ts)**

Update `interpretMetric` for `strategicCoherence` to use `ctx.metrics.strategicCoherenceDetails` so personas get personalized text referencing their specific contradictions rather than identical generic text.
  </action>
</task>

</tasks>
