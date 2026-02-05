---
phase: 04-planning-synthesis-engine
plan: 02
subsystem: synthesis-engine
tags: [typescript, synthesis-rules, cross-tool-analysis, insights]

# Dependency graph
requires:
  - phase: 01-foundation-infrastructure
    provides: Synthesis rule registry pattern, types, and self-registration system
  - phase: 02-first-assessment-tools
    provides: Leadership DNA, AI Readiness, Business EQ assessment data
  - phase: 03-core-strategic-assessments
    provides: SWOT Analysis, Vision Canvas, Advisor Readiness, SOP Maturity data
  - phase: 04-planning-synthesis-engine (plan 01)
    provides: 90-Day Roadmap tool data for task tracking

provides:
  - 7 synthesis rules analyzing cross-tool data patterns (E1, E2, E3, E4, E5, E10, E11)
  - Execution capability gap detection (leadership vs strategy)
  - Threat mitigation gap analysis (SWOT vs roadmap)
  - Burnout risk detection (readiness vs task load)
  - Strength leverage opportunities (SWOT vs vision)
  - SOP metric reliability warnings (process maturity vs metrics)
  - Opportunity-capability matching (strength-opportunity alignment)
  - Compounding advantage detection (multi-dimensional strengths)

affects: [04-03-synthesis-integration, phase-05-reports]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Cross-tool data synthesis with keyword matching
    - Dynamic severity calculation based on confidence levels
    - Safe capacity calculation for burnout prevention
    - Multi-dimensional strength detection

key-files:
  created:
    - src/lib/synthesis/rules/E1-execution-gap.ts
    - src/lib/synthesis/rules/E2-unmitigated-threat.ts
    - src/lib/synthesis/rules/E3-burnout-risk.ts
    - src/lib/synthesis/rules/E4-strength-leverage.ts
    - src/lib/synthesis/rules/E5-sop-metric-missing.ts
    - src/lib/synthesis/rules/E10-opportunity-match.ts
    - src/lib/synthesis/rules/E11-strength-multiplication.ts
    - src/lib/synthesis/rules/index.ts
  modified:
    - src/lib/synthesis/index.ts

key-decisions:
  - "E1: Dynamic pillar capacity = execution score × 0.6 (scales with leadership capability)"
  - "E2: High-confidence threshold = 4+ for threat warnings (critical threats only)"
  - "E3: Safe capacity = (readiness% / 100) × 5 tasks/week (linear scaling)"
  - "E4/E2: Keyword matching with 4+ char words for semantic similarity"
  - "E5: Critical immature SOPs = importance ≥ 4 AND maturity < 3"
  - "E10: Overlap detection using substring matching for flexibility"
  - "E11: Strength multiplication threshold = 5+ high-scoring dimensions"

patterns-established:
  - "Self-registering synthesis rules via synthesisRuleRegistry.register()"
  - "generateInsightId() pattern: rulePrefix-timestamp-random"
  - "Keyword extraction: split on whitespace, filter length > 3-4 chars"
  - "Severity calculation: severity 5 for critical (readiness < 30%, confidence = 5), severity 4 for high, severity 3 for moderate, severity 2 for low, severity 1 for positive strengths"

# Metrics
duration: 2min 36s
completed: 2026-02-05
---

# Phase 4 Plan 2: Synthesis Rules (E1-E5, E10-E11) Summary

**Seven cross-tool synthesis rules detecting execution gaps, unmitigated threats, burnout risks, untapped strengths, unreliable metrics, strategic alignments, and compounding advantages**

## Performance

- **Duration:** 2 min 36 sec
- **Started:** 2026-02-05T13:10:05Z
- **Completed:** 2026-02-05T13:12:41Z
- **Tasks:** 10 (7 rule implementations + index + main integration + build verification)
- **Files modified:** 9 (7 rule files + 2 index files)

## Accomplishments

- **E1 Execution Capability Gap:** Detects when leadership execution score < 6 and strategic pillars exceed calculated capacity (execution × 0.6)
- **E2 Unmitigated Threat:** Identifies high-confidence threats (4-5) without corresponding roadmap action items via keyword matching
- **E3 Burnout Risk:** Warns when advisor readiness < 50% and task density exceeds safe capacity formula
- **E4 Strength Leverage:** Finds high-confidence strengths not reflected in strategic pillars or core values
- **E5 SOP Metric Missing:** Flags metrics being tracked when critical processes (importance ≥ 4) have immature SOPs (< 3)
- **E10 Opportunity-Capability Match:** Identifies strategic alignments between high-confidence opportunities and existing strengths
- **E11 Strength Multiplication:** Detects compounding advantages when 5+ dimensions score in top tier across assessments
- **Build Success:** All rules compile and integrate cleanly, build completes in 3.59s

## Task Commits

**Note:** Git repository not initialized. Tasks completed but commits not created. See STATE.md blocker for git initialization requirement.

Task sequence completed:
1. **Task 1: Create E1 - Execution Capability Gap Rule**
2. **Task 2: Create E2 - Unmitigated Threat Rule**
3. **Task 3: Create E3 - Burnout Risk Rule**
4. **Task 4: Create E4 - Strength Leverage Rule**
5. **Task 5: Create E5 - SOP Metric Missing Rule**
6. **Task 6: Create E10 - Opportunity-Capability Match Rule**
7. **Task 7: Create E11 - Strength Multiplication Rule**
8. **Task 8: Create Rules Index** (`src/lib/synthesis/rules/index.ts`)
9. **Task 9: Update Main Synthesis Index** (`src/lib/synthesis/index.ts`)
10. **Task 10: Verify Build** (npm run build - successful, 3.59s)

## Files Created/Modified

### Created Files
- `src/lib/synthesis/rules/E1-execution-gap.ts` - Execution capability vs strategic pillar count analysis
- `src/lib/synthesis/rules/E2-unmitigated-threat.ts` - SWOT threats vs roadmap task matching
- `src/lib/synthesis/rules/E3-burnout-risk.ts` - Advisor readiness vs task load capacity calculation
- `src/lib/synthesis/rules/E4-strength-leverage.ts` - SWOT strengths vs strategic pillar alignment
- `src/lib/synthesis/rules/E5-sop-metric-missing.ts` - SOP maturity vs North Star metric reliability
- `src/lib/synthesis/rules/E10-opportunity-match.ts` - SWOT opportunity-strength keyword overlap detection
- `src/lib/synthesis/rules/E11-strength-multiplication.ts` - Multi-dimensional strength aggregation across Leadership DNA, AI Readiness, Business EQ
- `src/lib/synthesis/rules/index.ts` - Aggregates all production rules, exports registry

### Modified Files
- `src/lib/synthesis/index.ts` - Added import of production rules via `import './rules'`

## Decisions Made

### E1 - Execution Capability Gap
- **Dynamic capacity formula:** `pillarLimit = max(1, floor(executionScore × 0.6))`
- **Rationale:** Scales pillar capacity with leadership execution (score 10 → 6 pillars, score 5 → 3 pillars, score 1 → 1 pillar)
- **Threshold:** Triggers only when execution < 6 to focus on genuinely low capability

### E2 - Unmitigated Threat
- **High-confidence threshold:** confidence ≥ 4 (out of 5)
- **Keyword matching:** Extract words > 4 chars, check if any appear in roadmap task titles/notes
- **Severity mapping:** Confidence 5 → severity 5, confidence 4 → severity 4
- **Rationale:** Focus on truly critical threats that need immediate attention

### E3 - Burnout Risk
- **Safe capacity formula:** `safeCapacity = (readinessPercentage / 100) × 5`
- **Rationale:** 100% readiness → 5 tasks/week, 50% readiness → 2.5 tasks/week (linear scaling)
- **Severity threshold:** readiness < 30% → severity 5, otherwise severity 4
- **Task density calculation:** Average tasks per active week (not all 12 weeks)

### E4 - Strength Leverage
- **Keyword length:** > 4 chars for semantic significance
- **Strategy text sources:** Pillar titles + descriptions + core values
- **Severity:** Moderate (3) for opportunities, not critical gaps
- **Rationale:** Untapped strengths are opportunities for improvement, not urgent issues

### E5 - SOP Metric Missing
- **Critical criteria:** importance ≥ 4 AND maturity < 3
- **Maturity scale:** 0-5 (0=non-existent, 1=ad-hoc, 2=documented, 3=standardized, 4=measured, 5=automated)
- **Severity:** High (4) because unreliable metrics lead to bad decisions
- **Scope:** Checks only North Star metric (most critical)

### E10 - Opportunity-Capability Match
- **Keyword length:** > 3 chars (slightly lower threshold for more matches)
- **Matching strategy:** Substring matching with `includes()` for flexibility (handles "technology" matching "tech")
- **Severity:** Low (2) for positive opportunities
- **Rationale:** Strength-opportunity alignments are strategic wins, not problems

### E11 - Strength Multiplication
- **Thresholds:** Leadership ≥ 7, AI Readiness ≥ 70, Business EQ ≥ 70
- **Trigger:** 5+ high-scoring dimensions across all assessments
- **Severity:** Very low (1) for positive strengths
- **Rationale:** Compounding advantages are rare and highly valuable

## Deviations from Plan

None - plan executed exactly as written. All 7 rules implemented according to specifications in PLAN.md.

## Issues Encountered

None. Build successful on first attempt, all TypeScript types properly aligned with existing interfaces.

## User Setup Required

None - no external service configuration required. Rules are self-contained and operate on existing tool data.

## Next Phase Readiness

**Ready for Phase 4 Plan 3:** Synthesis Integration (SYN-08, SYN-09)
- All 7 synthesis rules created and registered
- Rules automatically trigger when required tools have data
- Ready to integrate auto-synthesis on state updates
- Ready to create Insights Dashboard UI component

**No blockers identified.**

**Verification readiness:**
- E1 can be tested with low execution score + multiple pillars
- E2 can be tested with high-confidence threats + empty roadmap
- E3 can be tested with low readiness score + high task density
- E4 can be tested with high-confidence strengths + unrelated pillars
- E5 can be tested with North Star metric + immature critical SOPs
- E10 can be tested with aligned strength-opportunity keywords
- E11 can be tested with high scores across multiple assessments

---
*Phase: 04-planning-synthesis-engine*
*Completed: 2026-02-05*
