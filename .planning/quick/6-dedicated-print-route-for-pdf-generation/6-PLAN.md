---
phase: quick-6
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/App.tsx
  - src/components/print/PrintReport.tsx
  - tests/helpers/pdf.ts
autonomous: true

must_haves:
  truths:
    - "Print route renders reports without AppShell (no sidebar, header, banners)"
    - "E2E tests navigate directly to print routes for PDF generation"
    - "Generated PDFs contain only report content with footer showing page numbers"
  artifacts:
    - path: "src/components/print/PrintReport.tsx"
      provides: "Print-only report renderer with footer"
      min_lines: 80
      exports: ["PrintReport"]
    - path: "src/App.tsx"
      provides: "Print route outside AppShell wrapper"
      contains: "Route path=\"/report/print/"
  key_links:
    - from: "src/App.tsx"
      to: "src/components/print/PrintReport.tsx"
      via: "Route element prop"
      pattern: "element=\\{<PrintReport"
    - from: "tests/helpers/pdf.ts"
      to: "/report/print/:reportType"
      via: "page.goto navigation"
      pattern: "goto.*report/print"
---

<objective>
Create a dedicated print route that renders reports without the AppShell wrapper, and update E2E tests to use this route for cleaner PDF generation. This eliminates sidebar, header, and banner artifacts from PDF output.

Purpose: Produce professional PDFs containing only report content, as specified in client requirements.
Output: Print route component, updated routing, updated E2E helpers with page footer template.
</objective>

<execution_context>
@C:/Users/Kamyar/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/Kamyar/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@C:/Users/Kamyar/Documents/VWCGApp/src/App.tsx
@C:/Users/Kamyar/Documents/VWCGApp/tests/helpers/pdf.ts
@C:/Users/Kamyar/Documents/VWCGApp/src/report/unified/UnifiedStrategicBriefing.tsx
@C:/Users/Kamyar/Documents/VWCGApp/src/report/unified/LLMStrategicBriefing.tsx
@C:/Users/Kamyar/Documents/VWCGApp/src/report/individual/AIReadinessReport.tsx
@C:/Users/Kamyar/Documents/VWCGApp/src/report/individual/LeadershipDNAReport.tsx
@C:/Users/Kamyar/Documents/VWCGApp/src/report/individual/SwotReport.tsx
@C:/Users/Kamyar/Documents/VWCGApp/src/report/individual/VisionCanvasReport.tsx
@C:/Users/Kamyar/Documents/VWCGApp/src/report/individual/AdvisorReadinessReport.tsx
@C:/Users/Kamyar/Documents/VWCGApp/src/report/individual/RoadmapReport.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create PrintReport component for shell-free rendering</name>
  <files>src/components/print/PrintReport.tsx</files>
  <action>
Create `src/components/print/PrintReport.tsx` that:

1. **Route param handling:** Read `:reportType` from useParams() and map to report component:
   - `unified` → UnifiedStrategicBriefing
   - `ai-readiness` → AIReadinessReport
   - `leadership-dna` → LeadershipDNAReport
   - `swot` → SwotReport
   - `vision-canvas` → VisionCanvasReport
   - `advisor-readiness` → AdvisorReadinessReport
   - `roadmap` → RoadmapReport

2. **Report rendering:** Render the selected component in a full-width container with:
   - White background
   - No sidebar, header, or navigation chrome
   - Container id matching report type (e.g., `id="unified-strategic-briefing"` for unified)
   - Full viewport width (no max-width constraints)

3. **Error handling:** If reportType is invalid, show error message

4. **Imports:** Use `import type` for React types per `verbatimModuleSyntax` requirement. Import report components from `@/report/unified` and `@/report/individual`.

Structure:
```tsx
import { useParams } from 'react-router-dom';
import type { FC } from 'react';
import { UnifiedStrategicBriefing } from '@/report/unified/UnifiedStrategicBriefing';
// ... other report imports

export const PrintReport: FC = () => {
  const { reportType } = useParams<{ reportType: string }>();

  // Map reportType to component
  // Render with appropriate container id
  // Handle invalid reportType
};
```

Do NOT add footer here — `page.pdf()` footerTemplate handles that.
  </action>
  <verify>
Build succeeds: `npm run build`
TypeScript has no errors related to the new component
  </verify>
  <done>
PrintReport.tsx exists, exports PrintReport component, maps all 7 report types to components, renders without AppShell
  </done>
</task>

<task type="auto">
  <name>Task 2: Add print route outside AppShell wrapper in App.tsx</name>
  <files>src/App.tsx</files>
  <action>
Update `App.tsx` routing structure:

1. **Restructure Routes:** Move print route OUTSIDE the AppShell wrapper:
   ```tsx
   <Router>
     <Routes>
       {/* Print routes — NO AppShell */}
       <Route path="/report/print/:reportType" element={<PrintReport />} />

       {/* App routes — WITH AppShell */}
       <Route element={<AppShell />}>
         <Route path="/" element={<DashboardTool />} />
         {getTools().map(tool => (
           <Route key={tool.id} path={tool.path} element={<tool.component />} />
         ))}
         <Route path="*" element={<Navigate to="/" replace />} />
       </Route>
     </Routes>
   </Router>
   ```

2. **Import PrintReport:** Add `import { PrintReport } from './components/print/PrintReport';` using default import (not `import type` since it's a component instance).

3. **Preserve existing structure:** Keep all existing routes and AppShell wrapper intact for normal app navigation.
  </action>
  <verify>
Build succeeds: `npm run build`
Dev server shows route working: Navigate to `http://localhost:5173/report/print/unified` and verify NO sidebar/header appears
  </verify>
  <done>
App.tsx contains print route outside AppShell, imports PrintReport, normal app routes still work
  </done>
</task>

<task type="auto">
  <name>Task 3: Update E2E helpers to use print routes with footer template</name>
  <files>tests/helpers/pdf.ts</files>
  <action>
Update `tests/helpers/pdf.ts` functions to navigate directly to print routes:

1. **captureIndividualReportPdf:** Replace Report Center navigation with direct print route:
   ```typescript
   // OLD: Navigate to Report Center, click buttons, wait for selector
   // NEW:
   await page.goto(`/report/print/${toolId}`);
   await page.waitForSelector(`#${toolId}`, { state: 'attached' });
   await page.waitForTimeout(2000);

   await page.pdf({
     path: destPath,
     format: 'A4',
     printBackground: true,
     displayHeaderFooter: true,
     footerTemplate: '<div style="width: 100%; font-size: 9px; padding: 0 18mm; display: flex; justify-content: space-between; color: #64748b;"><span>World Consulting Group | worldconsultinggroup.com</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
     margin: { top: '20mm', right: '18mm', bottom: '25mm', left: '18mm' },
   });
   ```

2. **captureUnifiedReportPdf:** Replace Report Center navigation with direct print route:
   ```typescript
   await page.goto('/report/print/unified');
   await page.waitForSelector('#unified-strategic-briefing', { state: 'attached' });
   await page.waitForTimeout(3000);

   // Same pdf() options with displayHeaderFooter + footerTemplate
   ```

3. **captureAIBriefingPdf:** KEEP using Report Center route (requires interactive LLM generation) but add footer template to pdf() options.

4. **Footer template styling:** Use inline CSS for footer div:
   - Width: 100%, font-size: 9px, padding: 0 18mm to align with page margins
   - Display: flex, justify-content: space-between for left/right alignment
   - Color: #64748b (slate-500) for subtle footer text
   - Left span: "World Consulting Group | worldconsultinggroup.com"
   - Right span: "Page X of Y" using `<span class="pageNumber"></span>` and `<span class="totalPages"></span>` placeholders

5. **Margin adjustment:** Increase bottom margin to 25mm (from 20mm) to accommodate footer space when `displayHeaderFooter: true`.

6. **Remove obsolete mappings:** Delete `INDIVIDUAL_REPORT_LABELS` and `navigateToTool` import since we're navigating directly via URL.
  </action>
  <verify>
TypeScript check passes: `npm run build`
E2E test runs successfully: `npm run test:e2e:generate-pdfs`
Generated PDFs in `test-outputs/pdfs/` contain only report content with footer showing "World Consulting Group | worldconsultinggroup.com" and page numbers
  </verify>
  <done>
E2E helpers use print routes for individual and unified reports, footer template applied to all pdf() calls, generated PDFs are clean with proper footers
  </done>
</task>

</tasks>

<verification>
1. Build completes without TypeScript errors: `npm run build`
2. Dev server shows print route working: Visit `http://localhost:5173/report/print/unified` — NO AppShell visible
3. E2E PDF generation test produces clean PDFs: `npm run test:e2e:generate-pdfs`
4. Inspect generated PDFs in `test-outputs/pdfs/` — verify NO sidebar/header/banner, footer present with page numbers
</verification>

<success_criteria>
- PrintReport component exists and maps all 7 report types to their components
- App.tsx has print route outside AppShell wrapper
- E2E helpers navigate to `/report/print/:reportType` directly
- Generated PDFs contain only report content (no app shell)
- Footer displays "World Consulting Group | worldconsultinggroup.com" and "Page X of Y"
- All E2E PDF generation tests pass
</success_criteria>

<output>
After completion, create `.planning/quick/6-dedicated-print-route-for-pdf-generation/6-SUMMARY.md`
</output>
