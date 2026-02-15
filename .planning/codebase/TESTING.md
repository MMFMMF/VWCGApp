# Testing Patterns

**Analysis Date:** 2026-02-15

## Test Framework

**Runner:**
- Playwright 1.58.2 (headless browser automation)
- Config: `playwright.config.ts`
- Only Chromium browser target (single browser, no multi-browser matrix)

**Assertion Library:**
- Playwright Test built-in assertions (e.g., `expect(page.getByText(...)).toBeVisible()`)
- No external assertion library

**Run Commands:**
```bash
npm run test:e2e              # Run all tests (auto-starts dev server via webServer config)
npm run test:e2e:ui          # Interactive UI mode (can pause, step through tests)
npm run test:e2e:headed      # Run in headed browser (see browser window)
npm run test:e2e:generate-pdfs  # Run PDF generation journey test only
npx playwright test tests/journeys/alex.spec.ts  # Single test file
npx playwright test -g "pattern"  # Tests matching grep pattern
```

## Test File Organization

**Location:**
- Test files in `tests/` directory (separate from `src/`)
- Subdirectories: `smoke/`, `journeys/`, `helpers/`, `personas/`

**Naming:**
- Test files: `*.spec.ts` (e.g., `alex.spec.ts`, `app.spec.ts`)
- Helper files: `*.ts` in `helpers/` (e.g., `forms.ts`, `navigation.ts`, `workspace.ts`)
- Persona files: `*.ts` in `personas/` (e.g., `alex.ts`, `sarah.ts`)

**Structure:**
```
tests/
├── smoke/
│   └── app.spec.ts           # Basic smoke tests (8 tests)
├── journeys/
│   ├── alex.spec.ts          # Alex persona journey
│   ├── sarah.spec.ts         # Sarah persona journey
│   ├── mike.spec.ts          # Mike persona journey
│   ├── pdf-generation.spec.ts
│   ├── pdf-generation-extended.spec.ts
│   └── quality-audit.spec.ts
├── helpers/
│   ├── forms.ts              # Form filling functions (AI Readiness, Leadership DNA, SWOT, etc.)
│   ├── navigation.ts         # Navigation helpers (navigateToTool, resetWorkspace, etc.)
│   ├── workspace.ts          # Workspace queries (expectInsightVisible, waitForSynthesis, etc.)
│   └── pdf.ts                # PDF assertions and checking
└── personas/
    ├── alex.ts               # Alex persona data + expected insights
    ├── sarah.ts              # Sarah persona data
    ├── mike.ts               # Mike persona data
    └── ... (7 more personas)
```

## Test Structure

**Suite Organization:**

```typescript
test.describe('Persona Journey: Alex — Burned Out COO', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
  });

  test('90-Day Roadmap — overloaded with 17 initiatives', async ({ page }) => {
    // Test body
  });

  test('Full journey — all assessments + burnout synthesis', async ({ page }) => {
    // Test body
  });
});
```

**Patterns:**

1. **Setup:** `test.beforeEach()` loads app and clears workspace
2. **Navigation:** Use helpers like `navigateToTool(page, 'Tool Name')`
3. **Form filling:** Use helpers like `fillAiReadiness(page, alex.aiReadiness)`
4. **Waits:** `await page.waitForTimeout(300)` after DOM interactions (Playwright does NOT auto-wait)
5. **Assertions:** Chain with `.toBeVisible()`, `.toHaveCount()`, `.toHaveURL()`
6. **Error collection:** `collectConsoleErrors(page)` at test start, check at end

**Example - Full Journey Test:**
```typescript
test('Full journey — all assessments + burnout synthesis', async ({ page }) => {
  const errors = collectConsoleErrors(page);

  // Fill all 6 tools in sequence
  await navigateToTool(page, 'AI Readiness');
  await fillAiReadiness(page, alex.aiReadiness);

  await navigateToTool(page, 'Leadership DNA');
  await fillLeadershipDna(page, alex.leadershipDna);

  // ... continue for other tools

  await waitForSynthesis(page);
  await navigateToDashboard(page);
  await page.waitForTimeout(500);

  // Verify synthesis triggered
  await expect(page.getByText(/Burnout.*Risk|Failure Risk/i).first()).toBeVisible({ timeout: 5000 });

  // Verify no console errors (filter workspaceStore logs)
  const realErrors = errors.filter(e => !e.includes('[workspaceStore]'));
  expect(realErrors).toHaveLength(0);
});
```

## Mocking

**Framework:** Playwright page evaluation — not traditional mocking

**Pattern - localStorage manipulation:**
```typescript
// In tests/helpers/workspace.ts
export async function seedWorkspaceData(page: Page, toolId: string, data: Record<string, unknown>) {
  await page.evaluate(
    ({ toolId, data }) => {
      const raw = localStorage.getItem('vwcg-workspace');
      const store = raw ? JSON.parse(raw) : { state: { version: '1.0', metadata: {}, tools: {}, provenance: {} } };
      store.state.tools[toolId] = data;
      store.state.provenance[toolId] = { timestamp: new Date().toISOString(), logicVersion: 'v1.1.0' };
      localStorage.setItem('vwcg-workspace', JSON.stringify(store));
    },
    { toolId, data },
  );
  await page.reload();
  await page.waitForTimeout(500);
}
```

**What to Mock:**
- localStorage for workspace state (allows setup without UI clicks)
- No mocking of HTTP requests (no external APIs called in tests)

**What NOT to Mock:**
- DOM elements — always interact via Playwright locators
- Timing — use `waitForTimeout()` and Playwright's built-in waits (`toBeVisible()`, `toHaveURL()`)
- Synthesis engine — let it run (synchronous, no delay needed)

## Fixtures and Factories

**Test Data:**

Personas are structured data objects in `tests/personas/*.ts`:
```typescript
export const alex = {
  meta: { name: 'Alex Rivera', company: 'Meridian Consulting Group', ... },
  aiReadiness: { Strategy: 55, Data: 50, ... },
  leadershipDna: { current_Vision: 7, target_Vision: 8, ... },
  swot: { strengths: [...], weaknesses: [...], ... },
  visionCanvas: { northStar: '...', pillars: [...], values: [...] },
  roadmap: [{ title: '...', owner: '...', week: 1, status: 'planned' }, ...],
  advisorReadiness: { s1: 4, s2: 4, ... },
  businessContext: { companyName: '...', revenueRange: '...' },
  expectedInsights: { burnoutRisk: true, executionGap: false, ... },
};
```

**Form Filling Helpers:**

Located in `tests/helpers/forms.ts` — each tool has a helper function:
- `fillAiReadiness(page, data)` — 6 sliders (0–100)
- `fillLeadershipDna(page, data)` — 6 dimensions × 2 inputs (current + target, 0–10)
- `fillSwot(page, data)` — 4 quadrants with items, each item has text + confidence
- `fillVisionCanvas(page, data)` — north star textarea + pillars + values
- `fillRoadmap(page, tasks)` — add multiple tasks with title, owner, week, status
- `fillAdvisorReadiness(page, answers)` — 20 questions with radio buttons (1–5)

**Navigation Helpers:**

Located in `tests/helpers/navigation.ts`:
- `navigateToTool(page, toolName)` — click sidebar link, wait 300ms
- `navigateToDashboard(page)` — navigate to home
- `resetWorkspace(page)` — remove localStorage, reload, wait 500ms
- `seedWorkspaceData(page, toolId, data)` — inject data directly, reload

**Workspace Assertion Helpers:**

Located in `tests/helpers/workspace.ts`:
- `expectInsightVisible(page, pattern)` — verify insight text appears
- `expectInsightNotVisible(page, pattern)` — verify insight NOT shown
- `waitForSynthesis(page)` — wait 500ms for synthesis to run (it's synchronous)
- `getInsightCount(page)` — extract count from widget text
- `saveWorkspace(page)` — trigger download, return Promise
- `collectConsoleErrors(page)` — track errors during test run

## Coverage

**Requirements:** No explicit coverage threshold enforced

**Current Coverage:**
- Smoke tests: 8 tests covering basic app functionality (`tests/smoke/app.spec.ts`)
- Journey tests: 3 personas (Alex, Sarah, Mike) with multi-tool journeys
- Quality audit: Dedicated test for report quality checks
- PDF generation: Extended journey for PDF export

**View Coverage:**
```bash
# Playwright does not generate coverage reports out of box
# Tests are E2E UI tests, not unit tests
# No coverage thresholds configured
```

## Test Types

**Smoke Tests:**
- Location: `tests/smoke/app.spec.ts` (8 tests)
- Scope: App loads, sidebar navigation, routing, persistence, downloads, console errors
- No data setup — just basic navigation and state checks

**Journey Tests (Persona-Based):**
- Location: `tests/journeys/*.spec.ts` (5 journey files)
- Scope: Fill 2-6 tools for a specific persona, verify synthesis insights fire
- Setup: Use persona data from `tests/personas/*.ts`
- Pattern: Navigate → fill forms → assert insights → check console errors

**Quality Audit Test:**
- Location: `tests/journeys/quality-audit.spec.ts`
- Scope: Run full journey then validate report content quality
- Checks: Vague entries, edge cases, narrative accuracy

**PDF Generation Tests:**
- Location: `tests/journeys/pdf-generation.spec.ts`, `pdf-generation-extended.spec.ts`
- Scope: Export workspace to PDF, validate file generated
- Helpers: `tests/helpers/pdf.ts` for PDF assertions

## Common Patterns

**Async Testing:**

All test functions are async. Use `await` for:
- Page navigation: `await page.goto('/'), await page.getByRole(...).click()`
- Waits: `await page.waitForTimeout(300)`
- Assertions: `await expect(page.getByText(...)).toBeVisible()`

```typescript
test('example', async ({ page }) => {
  // All operations must be awaited
  await page.goto('/');
  await resetWorkspace(page);
  await expect(page.getByText('Dashboard')).toBeVisible();
});
```

**Error Testing:**

No dedicated error testing (app uses React ErrorBoundary). Instead:
- Verify no console errors during normal operations: `const errors = collectConsoleErrors(page); expect(errors).toHaveLength(0)`
- Filter out known non-error logs: `errors.filter(e => !e.includes('[workspaceStore]'))`

**Timing and Waiting:**

```typescript
// Fixed waits after interactions (Playwright does not auto-wait for custom JS)
await page.waitForTimeout(300);  // After navigation
await page.waitForTimeout(500);  // After data updates (synthesis runs synchronously)

// Playwright built-in waits for visibility/state
await expect(page.getByText(/pattern/i)).toBeVisible({ timeout: 5000 });
await expect(page).toHaveURL('/');
```

**Locator Strategies:**

```typescript
// Preferred: Accessible queries
page.getByRole('button', { name: 'Save' })
page.getByRole('link', { name: 'AI Readiness' })
page.getByText('Dashboard')

// Fallback: CSS selectors for inputs
page.locator('input[type="range"][min="0"][max="100"]')
page.locator('input[type="number"][min="0"][max="10"]')
page.locator('select')

// Chaining for specificity
page.locator('.divide-y > div').nth(5).getByRole('button', { name: '4' })
```

## Configuration Details

**Playwright Config (`playwright.config.ts`):**
```typescript
testDir: './tests'           // Root test directory
fullyParallel: true          // Run tests in parallel (except CI which uses 1 worker)
forbidOnly: !!process.env.CI // Prevent test.only in CI
retries: process.env.CI ? 2 : 0  // Retry failed tests in CI only
reporter: 'html'             // Generate HTML report
baseURL: 'http://localhost:5173'  // App base URL
trace: 'on-first-retry'      // Capture trace on retry
screenshot: 'only-on-failure'    // Screenshot failures only
downloadsPath: './test-outputs/downloads'

webServer:
  command: 'npm run dev'     // Start Vite dev server
  url: 'http://localhost:5173'
  reuseExistingServer: !process.env.CI  // Reuse server if already running
```

**Test Output:**
- HTML report: `playwright-report/`
- Downloads: `test-outputs/downloads/`
- Traces: Attached to HTML report

## CI/CD Integration

**Environment:**
- `process.env.CI` controls: retries (2), workers (1), forbidOnly (true)
- Tests run headless (default)
- Dev server auto-starts via `webServer` config

**Running Tests Locally:**
```bash
npm run test:e2e              # Starts dev server, runs all tests
npm run test:e2e:ui          # Interactive Playwright UI
npm run test:e2e:headed      # See browser (good for debugging)
```

---

*Testing analysis: 2026-02-15*
