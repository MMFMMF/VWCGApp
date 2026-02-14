---
phase: quick-8
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/engine/derived-metrics.ts
  - src/report/individual/RoadmapReport.tsx
  - src/report/individual/AdvisorReadinessReport.tsx
  - src/report/individual/VisionCanvasReport.tsx
  - src/report/charts/DotPlot.tsx
  - src/index.css
autonomous: true
must_haves:
  truths:
    - "Three personas get DIFFERENT coherence levels (not all 'Severely Misaligned')"
    - "Every 'Why Now' text references at least one assessment data point"
    - "No two 'Why Now' entries share the 'depends on the foundations' template"
    - "'Client appreciation event' gets event-category success criteria (attendance, feedback) not product_launch criteria"
    - "Alex (consulting) and Mike (industrial supply) get different Cultural Readiness narratives at same 68% score"
    - "Low FDI (e.g. 1.6/10) produces narrative about LOW dependency, not high"
    - "Vision Canvas p5 (Sarah) has adequate content, not 84 chars"
    - "DotPlot benchmark labels do not visually overlap"
  artifacts:
    - path: "src/engine/derived-metrics.ts"
      provides: "Fixed coherence spectrum thresholds"
    - path: "src/report/individual/RoadmapReport.tsx"
      provides: "Fixed Why Now generator, event category ordering, FD direction check"
    - path: "src/report/individual/AdvisorReadinessReport.tsx"
      provides: "Industry-aware cultural readiness differentiation"
    - path: "src/report/individual/VisionCanvasReport.tsx"
      provides: "Sparse page content expansion"
    - path: "src/report/charts/DotPlot.tsx"
      provides: "Non-overlapping benchmark labels"
    - path: "src/index.css"
      provides: "Print orphan rules for sparse pages"
  key_links:
    - from: "src/engine/derived-metrics.ts"
      to: "src/report/unified/UnifiedStrategicBriefing.tsx"
      via: "computeDerivedMetrics().strategicCoherence"
      pattern: "strategicCoherence"
---

<objective>
Fix 7 report quality issues for v1.2: coherence spectrum producing all-same results, Why Now template repetition, event category misclassification, cultural narrative duplication, Founder Dependency direction contradiction, sparse Vision Canvas page, and DotPlot label overlap.

Purpose: These are QA regressions discovered during persona-based PDF review that undermine the "Holy Cow" standard.
Output: All 7 fixes applied, build passes.
</objective>

<execution_context>
@C:/Users/Kamyar/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kamyar/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/engine/derived-metrics.ts
@src/report/individual/RoadmapReport.tsx
@src/report/individual/AdvisorReadinessReport.tsx
@src/report/individual/VisionCanvasReport.tsx
@src/report/charts/DotPlot.tsx
@src/index.css
@src/report/unified/UnifiedStrategicBriefing.tsx
@src/report/unified/LLMStrategicBriefing.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix coherence spectrum, category ordering, and FD direction</name>
  <files>
    src/engine/derived-metrics.ts
    src/report/individual/RoadmapReport.tsx
  </files>
  <action>
**FIX A — Coherence Spectrum (src/engine/derived-metrics.ts)**

The `computeStrategicCoherence` function at line 326-336 has a threshold bug. The `misaligned` condition (`alignmentRatio >= 0.2 || totalSeverityWeight <= 8`) uses OR instead of AND, meaning almost everything falls into `misaligned` instead of `severely_misaligned`. But more critically, the thresholds are too tight at the top and too wide in the middle, causing all three test personas to land in the same bucket after the `adjustCoherenceForContradictions` post-processing downgrades them.

Fix the thresholds in `computeStrategicCoherence` (lines 326-336):

```typescript
if (alignmentRatio >= 0.85 && totalSeverityWeight === 0) {
    score = 'aligned';
} else if (alignmentRatio >= 0.65 && totalSeverityWeight <= 3) {
    score = 'mostly_aligned';
} else if (alignmentRatio >= 0.45 && totalSeverityWeight <= 6) {
    score = 'partially_aligned';
} else if (alignmentRatio >= 0.25 && totalSeverityWeight <= 10) {
    score = 'misaligned';
} else {
    score = 'severely_misaligned';
}
```

Key changes:
- `mostly_aligned`: widen from `>=0.7, <=2` to `>=0.65, <=3` — lets personas with 1-2 minor issues qualify
- `partially_aligned`: keep `>=0.45` but widen severity to `<=6`
- `misaligned`: change from `>=0.2 || <=8` (OR bug) to `>=0.25 && <=10` (AND logic) — this is the critical fix. The OR meant anything with severity <= 8 was "misaligned" instead of "severely_misaligned"
- `severely_misaligned`: only when both ratio is very low AND severity is very high

Also fix the `adjustCoherenceForContradictions` function (lines 371-392). The current logic is too aggressive — 3+ conflicts immediately jumps to `severely_misaligned` regardless of starting position. Make the downgrade more proportional:

```typescript
// 4+ conflicts → severely misaligned
if (conflictCount >= 4) {
    score = 'severely_misaligned';
    extraIssues.push(`${conflictCount} internal contradictions detected`);
} else if (conflictCount >= 3) {
    // 3 conflicts → downgrade by 2 steps (was: jump to severely_misaligned)
    score = downgradeCoherence(score, 2);
    extraIssues.push(`${conflictCount} internal contradictions detected`);
} else if (conflictCount === 2) {
    score = downgradeCoherence(score, 1);
    extraIssues.push(`${conflictCount} internal contradictions detected`);
} else if (conflictCount === 1) {
    // 1 conflict → only downgrade if currently aligned or mostly_aligned
    if (COHERENCE_ORDER.indexOf(score) < 2) {
        score = downgradeCoherence(score, 1);
    }
    extraIssues.push('1 internal contradiction detected');
}
```

Key changes: 3 conflicts now downgrades by 2 steps instead of jumping to worst. 1 conflict only downgrades if you were doing well. This ensures personas with different starting positions end up at different final levels.

**FIX B — Kill "depends on foundations" template (src/report/individual/RoadmapReport.tsx)**

In the `generateWhyNow` function, the `product_launch` case (line 221) contains the offending template: `"${task.title} depends on the foundations built in earlier phases. With an EAR of X.XX..."`. This gets applied to any task matching the product_launch category.

Replace the `product_launch` case with a version that references specific assessment data rather than using a generic foundation-dependency phrase:

```typescript
case 'product_launch': {
    const avgAi = aiReadiness
        ? Math.round(Object.values(aiReadiness as Record<string, number>)
            .filter((v): v is number => typeof v === 'number')
            .reduce((s, v) => s + v, 0) / 6)
        : null;
    if (avgAi !== null && avgAi < 50) {
        return `Your AI Readiness averages ${avgAi}% — launching ${task.title} without addressing infrastructure and data gaps (Data: ${aiReadiness?.Data ?? 'N/A'}%, Infrastructure: ${aiReadiness?.Infrastructure ?? 'N/A'}%) risks a failed rollout. Sequence technology foundations before launch.`;
    }
    if (ear < 0.7) {
        return `Your Execution-Ambition Ratio of ${ear.toFixed(2)} means the organization is stretched thinner than it can sustain. ${task.title} must wait until Phase 1 stabilization frees capacity — launching now risks both the product and existing operations.`;
    }
    return `${task.title} is sequenced for Phase 3 because your Organizational Readiness score of ${metrics.organizationalReadinessScore}/100 (${metrics.organizationalReadinessLabel}) ${metrics.organizationalReadinessScore >= 60 ? 'supports the change load, but only after operational stability is confirmed' : 'indicates the team cannot absorb a launch alongside active process improvements'}. ${fdi > 5 ? `Founder Dependency at ${fdi.toFixed(1)}/10 adds execution risk until delegation improves.` : ''}`;
}
```

Also update the fallback at the end of `generateWhyNow` (the `default: break;` then phase-specific blocks at lines 237-243). These fallbacks already reference metrics but ensure none use the "depends on foundations" phrasing. They look fine — the issue was specifically the `product_launch` case.

**FIX C — Event category ordering (src/report/individual/RoadmapReport.tsx)**

The `TASK_CATEGORY_MAP` array (lines 170-183) is matched in order. The `product_launch` pattern at line 177 includes `app` which matches the substring "app" inside "appreciation" in "Client appreciation event". The `event` pattern at line 178 never gets a chance.

Fix: Move the `event` pattern BEFORE `product_launch` in the array. Also make the `product_launch` `app` alternative use word boundaries:

```typescript
const TASK_CATEGORY_MAP: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /crm|salesforce|hubspot|migration/i, category: 'technology_migration' },
  { pattern: /hire|recruit|staff|engineer|developer|talent/i, category: 'hiring' },
  { pattern: /soc2|compliance|audit|security|insurance|legal|policy/i, category: 'compliance' },
  { pattern: /marketing|rebrand|campaign|brand/i, category: 'marketing' },
  { pattern: /training|safety|certification/i, category: 'training' },
  { pattern: /office|relocation|facilities|move/i, category: 'facilities' },
  { pattern: /event|appreciation|client.*event/i, category: 'event' },
  { pattern: /platform|product|v2|release|\bapp\b|dashboard|portal/i, category: 'product_launch' },
  { pattern: /service line|expansion|new.*service/i, category: 'new_offering' },
  { pattern: /forklift|equipment|fleet|upgrade|replace/i, category: 'equipment' },
  { pattern: /pilot|enterprise|partnership/i, category: 'market_expansion' },
  { pattern: /process|sop|document|standard/i, category: 'process' },
];
```

Two changes: (1) `event` line moved above `product_launch`. (2) `app` changed to `\bapp\b` (word boundary) in the product_launch pattern so it only matches the standalone word "app", not substrings like "appreciation".

**FIX E — Founder Dependency direction (src/report/individual/RoadmapReport.tsx)**

In the `generateWhyNow` function, the `hiring` case (line 211) always says "key decisions still route through one person" regardless of FDI value. If FDI is low (e.g. 1.6/10), the narrative should reflect LOW dependency.

Replace the `hiring` case:

```typescript
case 'hiring':
    if (fdi > 5) {
        return `With a Founder Dependency Index of ${fdi.toFixed(1)}/10, key decisions still route through one person. ${task.title} creates the delegation capacity needed to ${phase === 'stabilize' ? 'stop the operational bottleneck your assessment flags' : 'execute the strategic initiatives in your roadmap'}.`;
    }
    if (fdi > 3) {
        return `Your Founder Dependency Index of ${fdi.toFixed(1)}/10 shows moderate key-person concentration. ${task.title} adds capacity to ${phase === 'stabilize' ? 'distribute operational load and reduce single-point-of-failure risk' : 'support the execution bandwidth your strategic initiatives require'}.`;
    }
    return `With a Founder Dependency Index of ${fdi.toFixed(1)}/10, the organization already distributes decisions well. ${task.title} is about adding specialized capability — your Organizational Readiness score of ${metrics.organizationalReadinessScore}/100 indicates the team ${metrics.organizationalReadinessScore >= 60 ? 'can absorb new hires effectively' : 'will need structured onboarding to integrate new talent without disruption'}.`;
```

This ensures that low FDI (0-3) produces "distributes decisions well" language, moderate FDI (3-5) uses "moderate concentration" language, and only high FDI (5+) uses the "key decisions route through one person" language.
  </action>
  <verify>
    Run `npm run build` — must pass with zero errors.
    Manually verify the TASK_CATEGORY_MAP order: event before product_launch.
    Verify the coherence OR→AND fix: search for `||` in the misaligned threshold — should now be `&&`.
    Verify the hiring case has 3 branches checking fdi > 5, fdi > 3, and default.
  </verify>
  <done>
    - Coherence thresholds use AND logic for misaligned level; adjustCoherenceForContradictions is proportional not cliff-edge
    - "depends on the foundations" template is replaced with data-specific alternatives
    - "Client appreciation event" matches event category (not product_launch)
    - Low FDI produces "distributes decisions well" narrative; only high FDI says "key decisions route through one person"
    - Build passes
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix cultural narrative, sparse page, and DotPlot labels</name>
  <files>
    src/report/individual/AdvisorReadinessReport.tsx
    src/report/individual/VisionCanvasReport.tsx
    src/report/charts/DotPlot.tsx
    src/index.css
  </files>
  <action>
**FIX D — Cultural readiness narrative differentiation (src/report/individual/AdvisorReadinessReport.tsx)**

The `getCategoryInterpretation` function (line 89) already has a `CompanyContext` parameter (`startup`, `mid-market`, `established`) that differentiates narratives. However, Alex (consulting firm, ~15 employees) and Mike (industrial supply, ~45 employees) both resolve to `mid-market` in `inferCompanyContext` (line 65-77), so they get identical cultural text at the same score.

The fix is to add industry awareness to `getCategoryInterpretation` for the `cultural` category. The function needs access to the industry string.

Step 1: Extend the `getCategoryInterpretation` function signature to accept an optional `industry` parameter:

```typescript
function getCategoryInterpretation(
  catId: string,
  pct: number,
  context: CompanyContext,
  industry?: string,
): string {
```

Step 2: At the end of the function (just before the final return), add an industry-specific override for the `cultural` category. After the standard template lookup (`templates[catId]?.[level]?.[context]`), if catId is `cultural`, append an industry-contextual sentence:

```typescript
const base = templates[catId]?.[level]?.[context] ?? `This category scored ${pct}%.`;

if (catId === 'cultural' && industry) {
    const industryLower = industry.toLowerCase();
    // Service/consulting: culture drives client relationships
    if (/consult|advisory|professional.*service|legal|account/i.test(industryLower)) {
        return `${base} In a professional services environment, cultural readiness directly impacts client-facing quality — team engagement translates to client outcomes.`;
    }
    // Industrial/manufacturing/supply: culture drives safety and retention
    if (/industrial|manufactur|supply|warehouse|logistics|construct|mining/i.test(industryLower)) {
        return `${base} In an industrial environment, cultural readiness is inseparable from safety outcomes and workforce retention — disengaged teams create operational risk.`;
    }
    // Technology: culture drives innovation velocity
    if (/tech|software|saas|digital|startup/i.test(industryLower)) {
        return `${base} In a technology environment, cultural readiness determines innovation velocity — the ability to experiment, fail fast, and iterate depends on psychological safety.`;
    }
    // Healthcare
    if (/health|medical|clinic|dental|pharma/i.test(industryLower)) {
        return `${base} In healthcare, cultural readiness affects patient outcomes and regulatory compliance — team engagement directly correlates with care quality.`;
    }
    // Retail/hospitality
    if (/retail|restaurant|hospitality|food|hotel/i.test(industryLower)) {
        return `${base} In a customer-facing environment, cultural readiness directly impacts the customer experience — frontline engagement determines brand perception.`;
    }
}

return base;
```

Step 3: Update the call site in the component (around line 496) to pass the industry:

```typescript
const businessContext = workspace.tools?.['business-context'] as { industry?: string } | undefined;
// ... (already in scope from workspace)
const interpretation = getCategoryInterpretation(cat.id, cat.percentage, companyContext, businessContext?.industry);
```

Make sure `businessContext` is extracted from workspace tools. It should already be available via the `workspace` variable — just extract `industry` from it.

**FIX F — Sparse Vision Canvas page (src/report/individual/VisionCanvasReport.tsx + src/index.css)**

Sarah's Vision Canvas p5 has only 84 characters because VIS-04 (Core Values Audit) has minimal content for her persona. The fix has two parts:

Part 1 (VisionCanvasReport.tsx): When the Values Audit page has very little content (e.g., few values or all aspirational), add a contextual analysis section that expands the page.

In the VIS-04 section (around line 689-737), after the `valuesSummary` ReportBody, add a conditional "Values-to-Strategy Connection" subsection when the page content is thin (values.length <= 3):

```tsx
{values.length <= 3 && pillars.length > 0 && (
    <div className="mt-8">
        <ReportSubsection>Values-to-Strategy Connection</ReportSubsection>
        <ReportBody className="mb-4">
            With {values.length} stated value{values.length !== 1 ? 's' : ''} supporting {pillars.length} strategic pillar{pillars.length !== 1 ? 's' : ''}, there is a risk that values serve as cultural slogans rather than strategic filters. Effective values guide every hiring decision, resource allocation, and partnership evaluation. The table below maps how each value could function as a decision-making lens.
        </ReportBody>
        <ReportTable>
            <ReportTableHeader>
                <ReportTableRow>
                    <ReportTableCell header>Value</ReportTableCell>
                    <ReportTableCell header>Strategic Question It Should Answer</ReportTableCell>
                </ReportTableRow>
            </ReportTableHeader>
            <tbody>
                {values.map((value, idx) => (
                    <ReportTableRow key={value} variant={idx % 2 === 1 ? 'alternate' : 'default'}>
                        <ReportTableCell className="font-medium">{value}</ReportTableCell>
                        <ReportTableCell>
                            Does this initiative strengthen our commitment to {value.toLowerCase()}? If not, what does pursuing it cost our culture?
                        </ReportTableCell>
                    </ReportTableRow>
                ))}
            </tbody>
        </ReportTable>
    </div>
)}
```

Part 2 (src/index.css): Add a print CSS rule that prevents single-element pages from rendering as standalone sparse pages. After the existing `/* --- PDF-02 ---` rule (line 173-178), add:

```css
/* --- PDF-04: Vision Canvas values section minimum content --- */
/* Prevent orphaned report pages with less than ~200px of content */
.report-page-standard {
    min-height: 200px;
}
```

Actually, this CSS fix alone won't solve it — the real fix is the content expansion above. The CSS already has `orphans: 3` and `widows: 3` rules. The primary fix is adding more content to that page for thin-values personas.

**FIX G — DotPlot benchmark label overlap (src/report/charts/DotPlot.tsx)**

The current `resolveOverlaps` function (line 39-75) uses a single-pass left-to-right approach with fixed 18px offset. When 3+ labels cluster, only adjacent pairs get offset — labels can still overlap with non-adjacent ones.

Replace the overlap resolution with a multi-pass approach and add alternating up/down offsets:

Replace the `resolveOverlaps` function entirely:

```typescript
function resolveOverlaps(
  clientPosition: number,
  benchmarkPositions: number[],
): { userOffset: number; benchmarkOffsets: number[] } {
  // Collect all labels sorted by x-position, tracking original index
  const labels: (PlottedLabel & { origIdx: number })[] = [
    { position: clientPosition, type: 'user', yOffset: 0, origIdx: -1 },
    ...benchmarkPositions.map((p, i) => ({
      position: p,
      type: 'benchmark' as const,
      yOffset: 0,
      origIdx: i,
    })),
  ];
  labels.sort((a, b) => a.position - b.position);

  // Multi-pass: resolve overlaps until stable (max 5 passes)
  for (let pass = 0; pass < 5; pass++) {
    let changed = false;
    for (let i = 1; i < labels.length; i++) {
      if (Math.abs(labels[i].position - labels[i - 1].position) < MIN_LABEL_SPACING_PCT
          && labels[i].yOffset === labels[i - 1].yOffset) {
        // Alternate direction: even conflicts go up, odd go down
        const direction = (i % 2 === 0) ? 1 : -1;
        // Prefer moving benchmark labels; move user label only as fallback
        if (labels[i].type === 'benchmark') {
          labels[i].yOffset = direction * OVERLAP_OFFSET_PX;
        } else if (labels[i - 1].type === 'benchmark') {
          labels[i - 1].yOffset = direction * OVERLAP_OFFSET_PX;
        } else {
          labels[i].yOffset = direction * OVERLAP_OFFSET_PX;
        }
        changed = true;
      }
    }
    if (!changed) break;
  }

  const userLabel = labels.find((l) => l.type === 'user')!;
  const benchmarkOffsets = benchmarkPositions.map((_, i) => {
    const match = labels.find((l) => l.origIdx === i);
    return match?.yOffset ?? 0;
  });

  return { userOffset: userLabel.yOffset, benchmarkOffsets };
}
```

Key improvements:
- Multi-pass resolution (up to 5 passes) handles cascading overlaps
- Check `yOffset === labels[i-1].yOffset` so labels already offset to different levels don't trigger re-offset
- Alternating up/down offsets (even index goes positive/down, odd goes negative/up) instead of always going up
- Uses `origIdx` tracking to properly map back to the original benchmark order (the old code used position matching which could fail with duplicate values)

Also increase `OVERLAP_OFFSET_PX` from 18 to 20 for slightly more breathing room, and increase `MIN_LABEL_SPACING_PCT` from 12 to 14 to trigger overlap detection earlier.
  </action>
  <verify>
    Run `npm run build` — must pass with zero errors.
    Verify `getCategoryInterpretation` has 5 parameters (catId, pct, context, industry).
    Verify VisionCanvasReport.tsx has "Values-to-Strategy Connection" subsection.
    Verify DotPlot.tsx has `origIdx` in the resolveOverlaps function.
  </verify>
  <done>
    - Cultural readiness narrative varies by industry (consulting gets client-quality language, industrial gets safety/retention language)
    - Vision Canvas VIS-04 has additional "Values-to-Strategy Connection" content for thin-values personas
    - DotPlot labels use multi-pass resolution with alternating up/down offsets and origIdx tracking
    - Build passes
  </done>
</task>

</tasks>

<verification>
After both tasks complete:

1. `npm run build` passes with zero TypeScript errors
2. In `src/engine/derived-metrics.ts` line ~332: the misaligned condition uses `&&` not `||`
3. In `src/report/individual/RoadmapReport.tsx`:
   - `event` pattern appears BEFORE `product_launch` in TASK_CATEGORY_MAP
   - `product_launch` pattern uses `\bapp\b` not bare `app`
   - `hiring` case has 3 branches (fdi > 5, fdi > 3, default)
   - `product_launch` case does NOT contain "depends on the foundations"
4. In `src/report/individual/AdvisorReadinessReport.tsx`: `getCategoryInterpretation` accepts `industry` parameter
5. In `src/report/individual/VisionCanvasReport.tsx`: "Values-to-Strategy Connection" text exists
6. In `src/report/charts/DotPlot.tsx`: `origIdx` and multi-pass loop exist in resolveOverlaps
</verification>

<success_criteria>
All 7 fixes (A through G) implemented, build passes, no regressions in existing report structure.
</success_criteria>

<output>
After completion, create `.planning/quick/8-v1-2-fixes-coherence-spectrum-why-now-te/8-SUMMARY.md`
</output>
