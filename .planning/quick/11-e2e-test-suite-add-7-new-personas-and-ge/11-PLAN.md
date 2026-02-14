---
phase: quick-11
plan: 11
type: execute
wave: 1
depends_on: []
files_modified:
  - tests/personas/diana.ts
  - tests/personas/raj.ts
  - tests/personas/carmen.ts
  - tests/personas/david.ts
  - tests/personas/keisha.ts
  - tests/personas/tom.ts
  - tests/personas/lin.ts
  - tests/journeys/pdf-generation-extended.spec.ts
autonomous: true
must_haves:
  truths:
    - "All 7 new persona files follow the exact same schema as sarah.ts/mike.ts/alex.ts"
    - "All 10 personas generate 8 PDFs each (80 total)"
    - "PDF output organized as test-outputs/pdfs/{persona}/"
    - "Delivered as VWCG-Reports-Final.zip on Desktop"
---

<objective>
Add 7 new test personas (Diana, Raj, Carmen, David, Keisha, Tom, Lin) alongside existing 3 (Sarah, Mike, Alex). Create data-driven PDF generation test. Run all 10 × 8 = 80 PDFs and deliver as zip.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Create 7 persona data files</name>
  <files>tests/personas/diana.ts, tests/personas/raj.ts, tests/personas/carmen.ts, tests/personas/david.ts, tests/personas/keisha.ts, tests/personas/tom.ts, tests/personas/lin.ts</files>
  <action>
Map spec data to system schema (aiReadiness 6-dim, leadershipDna current+target, swot with confidence, visionCanvas, roadmap, advisorReadiness s/o/f/c, businessContext).
  </action>
</task>

<task type="auto">
  <name>Task 2: Create data-driven PDF generation test for 7 new personas</name>
  <files>tests/journeys/pdf-generation-extended.spec.ts</files>
  <action>
Data-driven test file that loops over 7 personas, generates all 8 report types each. Follow same pattern as pdf-generation.spec.ts but DRY via loop.
  </action>
</task>

<task type="auto">
  <name>Task 3: Run all tests, zip 80 PDFs</name>
  <action>
Build, run both pdf-generation.spec.ts (existing 3) and pdf-generation-extended.spec.ts (new 7). Zip all 10 persona folders as VWCG-Reports-Final.zip.
  </action>
</task>

</tasks>
