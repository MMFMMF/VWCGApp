---
phase: quick-10
plan: 10
type: execute
wave: 1
depends_on: []
files_modified:
  - src/index.css
autonomous: true

must_haves:
  truths:
    - "Cards/callouts never create orphaned pages with mostly blank space above them"
    - "Page breaks prefer to occur before card groups, not between individual cards"
    - "Vertical spacing on print pages is tighter to pack more content per page"
  artifacts:
    - path: "src/index.css"
      provides: "Print media query with break-before: avoid for cards"
      contains: "break-before: avoid"
  key_links:
    - from: "src/index.css @media print"
      to: "All card/callout components in reports"
      via: "CSS class selectors"
      pattern: "(border-l-4|rounded-lg.*p-|bg-white.*border.*rounded)"
---

<objective>
Fix orphaned cards in print layout by preventing page breaks immediately before cards and tightening vertical spacing.

**Purpose:** Sarah's PDF shows cards (succession plan bullet, SOC2 Compliance card) pushed to mostly-empty pages even when there's room on the prior page. This is a CSS orphan issue — `break-inside: avoid` keeps cards intact, but there's no rule preventing a break *before* a card.

**Output:** Print media query rules that prevent cards from being orphaned on new pages, plus tighter bottom margins to pack content.
</objective>

<execution_context>
@C:/Users/Kamyar/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kamyar/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/index.css
@src/report/individual/AIReadinessReport.tsx
@src/report/individual/LeadershipDNAReport.tsx
@src/report/individual/RoadmapReport.tsx
@src/report/unified/UnifiedStrategicBriefing.tsx
@src/components/print/PrintReport.tsx
</context>

<tasks>

<task type="auto">
  <name>Add break-before: avoid rules to print stylesheet for all card patterns</name>
  <files>src/index.css</files>
  <action>
**Target location:** `src/index.css` line 184 (end of `@media print` block, before closing brace)

**Card/callout patterns identified in codebase:**
1. **Border-left accent cards** (unified briefing cost blocks, roadmap phases):
   - Pattern: `className="p-6 rounded-lg border-l-4"`
   - Also: `className="rounded-lg p-5 border-l-4"`

2. **White bordered cards** (AI Readiness phases, Leadership DNA recommendations):
   - Pattern: `className="bg-white border border-report-warm rounded-lg p-5"`
   - Also: `className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"`

3. **Simple bordered cards** (Roadmap task cards, Vision Canvas value cards):
   - Pattern: `className="border rounded-md p-4"`
   - Also: `className="border border-report-warm rounded-md p-4"`

4. **Background callout boxes** (Roadmap methodology notes):
   - Pattern: `className="mt-8 p-4 rounded-md bg-report-warm"`

5. **ReportCallout component** (blockquote with left border):
   - Pattern: `className="...pl-6 border-l-4 border-report-blue py-2"`

**Add these rules at line 184 (before the closing `}` of `@media print`):**

```css
  /* --- PDF-04: Prevent orphaned cards on new pages --- */
  /* Cards with border-left accent (cost blocks, roadmap phases, callouts) */
  .border-l-4,
  [class*="border-l-4"] {
    break-before: avoid !important;
    page-break-before: avoid !important;
  }

  /* White bordered cards (AI readiness phases, leadership recommendations) */
  .bg-white.border.rounded-lg,
  .rounded-lg.border.bg-white {
    break-before: avoid !important;
    page-break-before: avoid !important;
  }

  /* Simple bordered cards (roadmap tasks, vision canvas values) */
  .border.rounded-md,
  [class*="border"][class*="rounded-md"] {
    break-before: avoid !important;
    page-break-before: avoid !important;
  }

  /* Background callout boxes */
  .bg-report-warm.rounded-md,
  .rounded-md.bg-report-warm {
    break-before: avoid !important;
    page-break-before: avoid !important;
  }

  /* Tighten vertical spacing to pack more content per page */
  /* Reduce space-y utilities in print */
  .space-y-8 > * + * {
    margin-top: 1.25rem !important; /* was 2rem (32px) → now 1.25rem (20px) */
  }

  .space-y-6 > * + * {
    margin-top: 1rem !important; /* was 1.5rem (24px) → now 1rem (16px) */
  }

  /* Reduce bottom margins on sections */
  .mb-8 {
    margin-bottom: 1.25rem !important; /* was 2rem → now 1.25rem */
  }

  .mb-6 {
    margin-bottom: 1rem !important; /* was 1.5rem → now 1rem */
  }
```

**Rationale:**
- `break-before: avoid` prevents page breaks immediately before these elements
- Combined with existing `break-inside: avoid` (line 199) keeps cards intact AND prevents them from being orphaned
- Spacing reductions allow more content to fit on same page, reducing likelihood of orphans
- `!important` needed to override inline Tailwind utilities
- Both prefixed (`page-break-before`) and modern (`break-before`) syntax for browser compatibility
  </action>
  <verify>
```bash
# Verify CSS syntax is valid
npm run build

# Verify all 3 personas' PDFs regenerate cleanly
npm run test:e2e:generate-pdfs
```

**Expected output:**
- Build succeeds with no CSS errors
- All 24 PDFs regenerate (3 personas × 8 reports each)
- Sarah's Full Report page 11 should now show SOC2 card WITH the content above it (no orphaned page 12)
- Succession plan bullet should have more content on same page due to tighter spacing
  </verify>
  <done>
- Print media query at line 184+ contains PDF-04 comment block
- 5 card/callout pattern selectors have `break-before: avoid`
- 4 spacing reduction rules reduce `space-y-8`, `space-y-6`, `mb-8`, `mb-6`
- `npm run build` passes
- `npm run test:e2e:generate-pdfs` generates 24 PDFs
- Visual inspection shows no orphaned cards with large blank spaces above them
  </done>
</task>

</tasks>

<verification>
**Cross-persona check:**
- Alex (startup): Check Strategic Briefing for card spacing
- Mike (mid-market): Check Full Report for roadmap phase cards
- Sarah (established): Verify page 11-12 no longer shows SOC2 orphan

**Layout integrity:**
- No cards broken across page boundaries (break-inside still working)
- No excessive whitespace on pages (spacing reductions effective)
- Footer still at bottom of each page (not affected by spacing changes)
</verification>

<success_criteria>
- All card/callout components have `break-before: avoid` in print media query
- Vertical spacing reduced by ~25-35% (2rem→1.25rem, 1.5rem→1rem)
- Build passes with no CSS errors
- 24 PDFs regenerate successfully
- Sarah's Full Report page 11-12 orphan issue resolved
- No new layout issues introduced in other personas/reports
</success_criteria>

<output>
After completion, create `.planning/quick/10-v1-3-hotfix-fix-orphaned-cards-in-print-/10-SUMMARY.md`
</output>
