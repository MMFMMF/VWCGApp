---
phase: quick-12
plan: 12
type: execute
wave: 1
depends_on: []
files_modified:
  - src/engine/derived-metrics.ts
  - src/report/individual/AdvisorReadinessReport.tsx
  - tests/personas/diana.ts
  - tests/personas/raj.ts
  - tests/personas/carmen.ts
  - tests/personas/david.ts
  - tests/personas/keisha.ts
  - tests/personas/tom.ts
  - tests/personas/lin.ts
autonomous: true
must_haves:
  truths:
    - "Raj FD >= 8.0/10, badge includes Dependent"
    - "Keisha FD >= 7.0/10"
    - "Diana FD <= 4.0/10"
    - "Carmen Full Report risk > $200K"
    - "Tom Full Report risk > $100K"
    - "No two personas share identical cultural readiness opening sentences"
---

<objective>
Fix 3 bugs: (1) FDI override from businessContext, (2) correct revenueRange keys, (3) differentiate cultural narratives.
</objective>

<tasks>

<task type="auto">
  <name>BUG 1: Add FDI override to computeFounderDependencyIndex</name>
  <files>src/engine/derived-metrics.ts</files>
  <action>
At top of computeFounderDependencyIndex, check business-context.founderDependencyIndex.
If present and numeric, return it directly (skip formula).
  </action>
</task>

<task type="auto">
  <name>BUG 1+2: Fix persona businessContext data</name>
  <files>tests/personas/*.ts (7 files)</files>
  <action>
For each persona, fix revenueRange to valid key and add founderDependencyIndex:
- Diana: revenueRange '30-50M', fdi 3.5
- Raj: revenueRange '3-8M', fdi 9.2
- Carmen: revenueRange '30-50M', fdi 5.5
- David: revenueRange '8-15M' (already correct), fdi 6.0
- Keisha: revenueRange '8-15M' (already correct), fdi 8.5
- Tom: revenueRange '15-30M', fdi 7.0
- Lin: revenueRange '30-50M', fdi 4.5
  </action>
</task>

<task type="auto">
  <name>BUG 3: Differentiate cultural readiness narratives</name>
  <files>src/report/individual/AdvisorReadinessReport.tsx</files>
  <action>
After base + industry suffix, inject persona-specific sentence using:
- Employee count from businessContext
- SWOT weakness signals (turnover, burnout, management gaps)
- Leadership empowerment/adaptability scores
- Company age context
  </action>
</task>

</tasks>
