# Testing Patterns

**Analysis Date:** 2026-02-14

## Test Framework

**Runner:**
- Playwright v1.58.2 (end-to-end testing)
- Config: `playwright.config.ts`
- Single browser: Chromium only (desktop)

**Assertion Library:**
- Playwright's built-in expect API (`@playwright/test`)

**Run Commands:**
```bash
npm run test:e2e                      # Run all Playwright tests
npm run test:e2e:ui                   # Interactive UI mode
npm run test:e2e:headed               # Run in headed (visible) browser
npm run test:e2e:generate-pdfs        # Run PDF generation journey test
```

**Configuration Details** (`playwright.config.ts`):
- Base URL: `http://localhost:5173`
- Auto-start dev server via `webServer` config
- Trace: `on-first-retry` (debug failed tests)
- Screenshots: `only-on-failure`
- Downloads path: `./test-outputs/downloads`
- Parallel execution enabled (`fullyParallel: true`)
- CI mode: 2 retries, single worker
- Dev mode: 0 retries, default workers

## Test File Organization

**Location:**
- Test files co-located in `tests/` directory (separate from source)
- Subdirectories: `smoke/`, `journeys/`, `personas/`, `helpers/`

**Structure:**
```
tests/
├── smoke/
│   └── app.spec.ts              # Basic app functionality
├── journeys/
│   ├── alex.spec.ts             # Persona journey: Alex
│   ├── mike.spec.ts             # Persona journey: Mike
│   ├── sarah.spec.ts            # Persona journey: Sarah
│   └── pdf-generation.spec.ts   # PDF report generation
├── personas/
│   ├── alex.ts                  # Test data for Alex persona
│   ├── mike.ts                  # Test data for Mike persona
│   └── sarah.ts                 # Test data for Sarah persona
└── helpers/
    ├── navigation.ts            # Route and UI navigation helpers
    ├── forms.ts                 # Form filling helpers (6 tools)
    ├── workspace.ts             # Workspace state helpers
    └── pdf.ts                   # PDF capture and seeding helpers
```

**Naming:**
- Test files: `*.spec.ts` (Playwright convention)
- Test data: matching persona name lowercase (e.g., `sarah.ts`)
- Helper files: descriptive function names

## Test Structure

**Suite Organization:**
```typescript
test.describe('Persona Journey: Alex — Burned Out COO', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
  });

  test('90-Day Roadmap — overloaded with 17 initiatives', async ({ page }) => {
    // Setup
    await navigateToTool(page, '90-Day Roadmap');
    await fillRoadmap(page, alex.roadmap);

    // Assert
    await expect(page.getByText('CRM Migration to Salesforce').first()).toBeVisible();
  });

  test.describe.serial('PDF Generation: Sarah Chen', () => {
    // Serial suite for PDF tests (no parallel execution)
    const pdfPaths: string[] = [];
    // Individual tests accumulate results in pdfPaths
  });
});
```

**Patterns:**
- **Setup:** Use `beforeEach` to reset workspace and navigate to `/`
- **Execution:** Use helper functions from `tests/helpers/`
- **Assertion:** Playwright's `expect()` API with visibility and timeout checks
- **Teardown:** No explicit teardown; Playwright cleans up between tests

**Timeout Handling:**
- Default Playwright timeout: 30s
- Extended for LLM operations: `test.setTimeout(300_000)` for AI Briefing generation (300s)
- Explicit waits: `await page.waitForTimeout(300)` for route transitions, `await page.waitForTimeout(500)` for DOM settling

## Test Types

**Smoke Tests** (`tests/smoke/app.spec.ts`):
- **Scope:** Basic app load, routing, persistence, file export
- **Approach:** Start fresh, verify core functionality works
- 8 tests covering: app load, sidebar nav, tool routes, 404 handling, workspace persistence, file downloads, error logging, dashboard checklist

**Journey Tests** (`tests/journeys/alex.spec.ts`, `mike.spec.ts`, `sarah.spec.ts`):
- **Scope:** Multi-tool workflows simulating real user personas
- **Approach:** Fill forms across multiple tools, verify synthesis rules fire, check persisted state
- Persona-specific test cases (e.g., Alex's 17 roadmap tasks, Sarah's startup context)
- Each persona has 4-8 test cases exercising different tools and synthesis conditions

**PDF Generation Tests** (`tests/journeys/pdf-generation.spec.ts`):
- **Scope:** Report Center exports across all report types (individual, unified, AI briefing)
- **Approach:** Seed persona data, navigate to Report Center, capture PDFs via `page.pdf()`, verify file existence
- 3 personas (Sarah, Mike, Alex) × 8 report types = 24 PDF captures total
- Uses `test.describe.serial()` to run persona suites sequentially (no parallel PDF generation)
- Verifies PDF files exist and exceed 1KB size

**E2E vs. Unit:**
- **No unit tests** — focus is entirely on E2E workflows
- No Jest, Vitest, or similar for component testing
- Validation and business logic tested indirectly through E2E flows

## Test Data & Fixtures

**Persona Objects** (`tests/personas/`:
Each persona exports a named constant with full test data:

```typescript
export const alex = {
  meta: { company: 'TechCorp', industry: '...', revenue: '...' },
  aiReadiness: { Strategy: 40, Data: 35, Infrastructure: 50, ... },
  leadershipDna: { current_Vision: 6, target_Vision: 8, ... },
  swot: {
    strengths: [{ text: '...', confidence: 80 }, ...],
    weaknesses: [...],
    opportunities: [...],
    threats: [...]
  },
  visionCanvas: {
    northStar: '...',
    pillars: [{ title: '...', kpi: '...' }, ...],
    values: ['...', ...]
  },
  roadmap: [{ title: '...', owner: '...', week: 2, status: 'pending' }, ...],
  advisorReadiness: { s1: 4, s2: 3, o1: 5, ... }
};
```

**Seed Pattern** (`tests/helpers/pdf.ts:215-309`):
```typescript
export async function seedAllPersonaData(
  page: Page,
  persona: { meta?, aiReadiness, leadershipDna, swot, visionCanvas, roadmap, advisorReadiness, businessContext? },
) {
  await page.evaluate((p) => {
    const store = localStorage.getItem('vwcg-workspace') ? JSON.parse(...) : { state: { ... } };
    // Set each tool's data into store.state.tools[toolId]
    store.state.tools['ai-readiness'] = p.aiReadiness;
    store.state.tools['leadership-dna'] = p.leadershipDna;
    // ... etc for all 6-7 tools
    localStorage.setItem('vwcg-workspace', JSON.stringify(store));
  }, persona);
  await page.reload();
}
```

**Fixture Location:**
- Personas live in `tests/personas/` — imported directly, no separate fixture files
- Persona data is JavaScript objects (not YAML/JSON files)
- Data structure mirrors the Zustand store's `tools[toolId]` shape

## Mocking & Test Helpers

**No Mocking Framework:**
- No MSW, Vitest mocks, or Jest mocks
- All API calls hit real services (Gemini API optional via `VITE_GEMINI_API_KEY`)
- Tests run against real app state in localStorage

**Test Helpers** (`tests/helpers/`):

### Navigation (`tests/helpers/navigation.ts`)
```typescript
export async function navigateToTool(page: Page, toolName: string)
export async function navigateToDashboard(page: Page)
export async function resetWorkspace(page: Page)
export async function seedWorkspaceData(page: Page, toolId: string, data: Record<string, unknown>)
```

### Forms (`tests/helpers/forms.ts`)
One function per tool for filling UI:
- `fillAiReadiness()` — 6 range sliders (0-100)
- `fillLeadershipDna()` — 6 dimensions × 2 inputs (current/target, 0-10)
- `fillSwot()` → `fillSwotQuadrant()` — quadrant tabs, textarea, confidence slider, add button
- `fillVisionCanvas()` — north star textarea, pillars (name + KPI), values (enter-to-add)
- `fillRoadmap()` — task title, owner, week number, status dropdown, add button
- `fillAdvisorReadiness()` — 20 questions with 5 radio buttons each (1-5 scores)

**Form Helper Pattern:**
```typescript
export async function fillAiReadiness(page: Page, data: Record<string, number>) {
  const sliders = page.locator('input[type="range"][min="0"][max="100"]');
  for (const [dim, val] of Object.entries(data)) {
    const idx = AI_DIMENSIONS.indexOf(dim);
    if (idx === -1) throw new Error(`Unknown AI dimension: ${dim}`);
    await sliders.nth(idx).fill(String(val));
  }
}
```

### Workspace State (`tests/helpers/workspace.ts`)
```typescript
export async function expectInsightVisible(page: Page, pattern: RegExp)
export async function expectInsightNotVisible(page: Page, pattern: RegExp)
export async function waitForSynthesis(page: Page)
export async function getInsightCount(page: Page): Promise<number>
export async function saveWorkspace(page: Page)
export function collectConsoleErrors(page: Page): string[]
```

### PDF Capture (`tests/helpers/pdf.ts`)
```typescript
export async function captureIndividualReportPdf(page: Page, personaName: string, toolId: string)
export async function captureUnifiedReportPdf(page: Page, personaName: string)
export async function captureAIBriefingPdf(page: Page, personaName: string)
export async function seedAllPersonaData(page: Page, persona: {...})
```

**PDF Helper Pattern:**
```typescript
async function prepareDomForPdf(page: Page) {
  await page.evaluate(() => {
    // Hide panels, expand scroll containers, remove transforms
    const leftPanel = document.querySelector('.lg\\:col-span-1');
    if (leftPanel) (leftPanel as HTMLElement).style.display = 'none';
    // ... etc
  });
}

export async function captureIndividualReportPdf(page: Page, personaName: string, toolId: string) {
  const destPath = path.join(PDF_OUTPUT_DIR, safePersona, fileName);
  await navigateToTool(page, 'Report Center');
  await page.getByText('Individual Report').first().click();
  await page.getByRole('button', { name: toolLabel }).click();
  await page.waitForSelector('#report-preview-container', { state: 'attached' });
  await prepareDomForPdf(page);
  await page.pdf({
    path: destPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '20mm', right: '18mm', bottom: '20mm', left: '18mm' },
  });
  return destPath;
}
```

## Common Test Patterns

**Fresh State Setup:**
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await resetWorkspace(page);  // Clears localStorage, reloads
});
```

**Form Filling with Verification:**
```typescript
test('AI Readiness — fill sliders', async ({ page }) => {
  await navigateToTool(page, 'AI Readiness');
  await fillAiReadiness(page, { Strategy: 80, Data: 60, ... });

  await expect(page.getByText('80%')).toBeVisible();
});
```

**Data Seeding for Report Tests:**
```typescript
test('Generate PDF reports', async ({ page }) => {
  await page.goto('/');
  await resetWorkspace(page);
  await seedAllPersonaData(page, sarah);  // Load all tool data at once

  const p = await captureIndividualReportPdf(page, 'Sarah', 'ai-readiness');
  expect(fs.existsSync(p)).toBe(true);
});
```

**Synthesis Rule Verification:**
```typescript
test('Synthesis — E3 Burnout Risk fires', async ({ page }) => {
  // Setup conditions for rule firing
  await fillAdvisorReadiness(page, alex.advisorReadiness);  // ~70% maturity
  await fillRoadmap(page, alex.roadmap);  // 17 tasks > 16 safe capacity

  await waitForSynthesis(page);  // Let engine run
  await navigateToDashboard(page);

  await expect(page.getByText(/Burnout.*Risk/i).first()).toBeVisible({ timeout: 5000 });
});
```

**Async Operation Timeouts:**
```typescript
// For AI Briefing generation (LLM call can take 30-120s)
test.setTimeout(300_000);

test('AI-Powered Briefing generation', async ({ page }) => {
  await seedAllPersonaData(page, sarah);
  await navigateToTool(page, 'Report Center');
  await page.getByText('AI-Powered Briefing').click();
  await page.getByRole('button', { name: /Generate AI Briefing/i }).click();

  // Wait up to 3min for LLM generation + DOM render
  await page.waitForSelector('#llm-strategic-briefing', { timeout: AI_BRIEFING_GENERATION_TIMEOUT });
});
```

## Async Testing

All E2E tests are async (Playwright's async/await model):
```typescript
test('test name', async ({ page }) => {
  // page is provided by Playwright fixture
  await page.goto('/');
  await page.waitForTimeout(500);
  const result = await page.evaluate(() => { /* ... */ });
});
```

No explicit Promise handling — rely on async/await and Playwright's auto-waiting.

## Error Testing

Console error collection pattern:
```typescript
test('no console errors on fresh app load', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.waitForTimeout(1000);

  expect(errors).toHaveLength(0);
});
```

## Coverage

**Requirements:** No enforced coverage targets

**View Coverage:** Not configured — Playwright doesn't generate coverage reports by default

**What's Tested:**
- E2E user flows across all 6+ tools
- Workspace persistence (localStorage)
- Synthesis rule firing conditions
- PDF export across 3 report types
- Navigation and routing
- Basic error conditions (4xx routes, missing files)

**What's NOT Tested:**
- Unit tests for individual functions
- Component rendering in isolation
- Validation profiles
- API error handling (no mocked API failures)
- Performance/load testing

## Test Organization Recommendations

**When Adding New Test:**
1. **Smoke test:** Add to `tests/smoke/app.spec.ts` for basic functionality
2. **Journey test:** Create persona-specific test in `tests/journeys/{persona}.spec.ts`
3. **Helper function:** Add to appropriate `tests/helpers/*.ts` file
4. **Test data:** Update persona objects in `tests/personas/*.ts`

**Sequential vs. Parallel:**
- PDF tests: use `test.describe.serial()` to avoid concurrent browser instances
- Smoke tests: run in parallel (default)
- Journey tests: run in parallel per persona

**Timeout Guidance:**
- Default: 30s (Playwright)
- Form filling: add 100-300ms `waitForTimeout` between interactions
- DOM rendering: 500ms for route transitions, 2-3s for chart rendering
- LLM operations: 300s (5min) for AI Briefing generation

---

*Testing analysis: 2026-02-14*
