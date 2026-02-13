# Testing Patterns

**Analysis Date:** 2026-02-13

## Test Framework

**Runner:**
- Playwright 1.58.2 (end-to-end testing)
- Config: `playwright.config.ts`
- No unit test framework (Jest, Vitest, etc.) configured

**Assertion Library:**
- Playwright's built-in expect API

**Run Commands:**
```bash
npm run test:e2e              # Run all E2E tests (headless, serial in CI)
npm run test:e2e:ui          # Run with Playwright UI (local debugging)
npm run test:e2e:headed      # Run in headed mode (visible browser)
npm run test:e2e:generate-pdfs  # Run PDF generation tests with reporter
```

## Test File Organization

**Location:**
- All tests in `tests/` directory at project root
- Separate from source code (`src/`)
- Three subdirectories: `helpers/`, `journeys/`, `personas/`, `smoke/`

**Naming:**
- Spec files: `*.spec.ts` (e.g., `app.spec.ts`, `alex.spec.ts`, `pdf-generation.spec.ts`)
- Helper modules: Named by function (e.g., `navigation.ts`, `forms.ts`, `workspace.ts`)
- Persona data files: Named after persona (e.g., `alex.ts`, `mike.ts`, `sarah.ts`)

**Structure:**
```
tests/
├── helpers/              # Reusable test utilities
│   ├── forms.ts         # Form filling helpers
│   ├── navigation.ts    # Navigation helpers
│   ├── pdf.ts          # PDF utilities
│   └── workspace.ts    # Workspace state helpers
├── journeys/            # User journey/scenario tests
│   ├── alex.spec.ts
│   ├── mike.spec.ts
│   ├── sarah.spec.ts
│   └── pdf-generation.spec.ts
├── personas/            # Test data (persona definitions)
│   ├── alex.ts
│   ├── mike.ts
│   └── sarah.ts
└── smoke/              # Smoke/basic functionality tests
    └── app.spec.ts
```

## Test Structure

**Suite Organization:**
```typescript
test.describe('Persona Journey: Alex — Burned Out COO', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
  });

  test('specific scenario — expected outcome', async ({ page }) => {
    // Arrange: Set up test state
    await navigateToTool(page, 'Tool Name');

    // Act: Perform user actions
    await fillFormData(page, testData);

    // Assert: Verify results
    await expect(page.getByText('Expected text')).toBeVisible();
  });
});
```

**Patterns:**

1. **Setup:** Each test resets workspace to clean state via `test.beforeEach()`
   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.goto('/');
     await resetWorkspace(page);
   });
   ```

2. **Navigation:** Use helper functions for consistent navigation
   ```typescript
   await navigateToTool(page, 'AI Readiness');
   await navigateToDashboard(page);
   ```

3. **Form Filling:** Tool-specific helpers abstract DOM selectors
   ```typescript
   await fillAiReadiness(page, alex.aiReadiness);
   await fillLeadershipDna(page, alex.leadershipDna);
   await fillSwot(page, alex.swot);
   await fillRoadmap(page, alex.roadmap);
   ```

4. **Assertions:** Use semantic locators (roles, text, etc.) for resilience
   ```typescript
   await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
   await expect(page.getByText('Burnout Risk', { exact: false })).toBeVisible();
   await expect(page.getByText('100%')).toBeVisible();
   ```

5. **Waits:** Explicit timeouts after interactions (300-500ms default)
   ```typescript
   await page.waitForTimeout(300);
   await page.waitForTimeout(500);
   await expect(...).toBeVisible({ timeout: 5000 });
   ```

## Mocking

**Framework:** Not applicable — E2E tests run against live application

**What's Tested Live:**
- Actual browser behavior (navigation, form submission, state persistence)
- localStorage persistence (workspace saved and restored correctly)
- Cross-tool data synthesis (insights calculated from multiple tool inputs)
- File I/O (download and load workspace files)
- PDF generation (renders and exports documents)

**What's NOT Mocked:**
- API calls: Optional Gemini API (`VITE_GEMINI_API_KEY`) is real if provided; tests pass without it
- localStorage: Uses real browser storage; reset between tests
- Chart rendering: Tests that canvases are present (visual rendering not asserted)

## Fixtures and Factories

**Test Data:**
- Personas are data objects in `tests/personas/*.ts`, exported as named objects

Example from `tests/personas/alex.ts`:
```typescript
export const alex = {
  meta: {
    name: 'Alex Rivera',
    company: 'Meridian Consulting Group',
    role: 'COO',
    industry: 'Professional Services',
    revenue: '$12M',
    employees: 60,
  },
  aiReadiness: {
    Strategy: 55,
    Data: 50,
    Infrastructure: 45,
    Talent: 40,
    Governance: 35,
    Culture: 60,
  },
  leadershipDna: {
    current_Vision: 7,
    current_Execution: 5,
    // ... more fields
  },
  swot: {
    strengths: [
      { text: 'Strong consulting methodology', confidence: 5 },
      // ... more items
    ],
    // ... other quadrants
  },
  roadmap: [
    { name: 'CRM Migration to Salesforce', owner: 'Sarah', priority: 'high', q: 'Q1' },
    // ... more tasks
  ],
};
```

**Location:**
- Persona definitions: `tests/personas/`
- Used by journey tests: `tests/journeys/`
- Imported as named exports: `import { alex } from '../personas/alex'`

**Data Structure Conventions:**
- Objects match tool data shapes (e.g., `aiReadiness` object has keys matching `DIMENSIONS` in tool)
- Arrays for multi-item tools (SWOT items, roadmap tasks)
- Metadata fields for persona context (`meta: { name, company, role, ... }`)

## Coverage

**Requirements:** No explicit coverage target enforced

**Testing Approach:**
- Smoke tests: Basic app functionality (loading, navigation, routing)
- Journey tests: End-to-end user scenarios (complete workflows for specific personas)
- PDF generation tests: Export/reporting features
- No unit test coverage requirements

**Practical Coverage:**
- Happy paths fully covered (core workflows work as expected)
- Data persistence tested (localStorage survives reload)
- Synthesis rule firing tested (insights appear when conditions met)
- Error states partially tested (file load failures caught)

## Test Types

**Smoke Tests:**
- Location: `tests/smoke/app.spec.ts`
- Scope: Basic app load, navigation, routing, persistence
- Tests run: 8 tests covering app initialization and core navigation
- Example:
  ```typescript
  test('app loads and shows dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('VWCG Unified')).toBeVisible();
  });
  ```

**Journey/Integration Tests:**
- Location: `tests/journeys/`
- Scope: Complete user workflows for specific personas (Alex, Mike, Sarah)
- Multiple tests per persona (3-5 tests each) covering specific scenarios
- Example:
  ```typescript
  test('90-Day Roadmap — overloaded with 17 initiatives', async ({ page }) => {
    await navigateToTool(page, '90-Day Roadmap');
    await fillRoadmap(page, alex.roadmap);
    const taskRows = page.locator('table tbody tr');
    await expect(taskRows).toHaveCount(alex.roadmap.length);
  });
  ```

**Feature Tests:**
- Location: `tests/journeys/pdf-generation.spec.ts`
- Scope: PDF export and generation workflows
- Tests rendering, file download, PDF content validation

**E2E Tests:**
- All tests are E2E; no isolated unit or component tests
- Run against live dev server (`npm run dev` spun up automatically)
- Real browser (Chromium) used

## Common Patterns

**Async Testing:**
```typescript
test('workspace persists across page reload', async ({ page }) => {
  // Navigate and interact
  await page.getByRole('link', { name: 'AI Readiness' }).click();

  // Wait for async updates
  await page.waitForTimeout(300);

  // Reload and verify state restored
  await page.reload();
  await page.waitForTimeout(500);

  // Check persistence
  const slider = page.locator('input[type="range"]').first();
  await expect(slider).toHaveValue('80');
});
```

**File Download Testing:**
```typescript
test('Save Workspace triggers file download', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Save Workspace/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain('.vwcg');
});
```

**Data Seeding:**
```typescript
// Direct localStorage injection for faster test setup
await seedWorkspaceData(page, 'advisor-readiness', alex.advisorReadiness);
await page.reload();
await page.waitForTimeout(500);
```

**Console Error Tracking:**
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

**Synthesis Verification:**
```typescript
// Wait for synthesis engine to complete
await waitForSynthesis(page);

// Navigate to dashboard where insights display
await navigateToDashboard(page);
await page.waitForTimeout(500);

// Check if specific insight fired
await expect(page.getByText(/Burnout.*Risk/i).first()).toBeVisible({ timeout: 5000 });
```

**Persona-Driven Workflow:**
```typescript
test.describe('Persona Journey: Alex — Burned Out COO', () => {
  test('Synthesis — E3 Burnout Risk fires for Alex', async ({ page }) => {
    // Seed data for multiple tools
    await navigateToTool(page, 'Advisor Readiness');
    await fillAdvisorReadiness(page, alex.advisorReadiness);

    await navigateToTool(page, '90-Day Roadmap');
    await fillRoadmap(page, alex.roadmap);

    // Trigger and verify synthesis
    await waitForSynthesis(page);
    await navigateToDashboard(page);

    // Assert E3 rule fired
    await expect(page.getByText(/Burnout.*Risk/i).first()).toBeVisible();
  });
});
```

## Playwright Configuration Details

**Config File:** `playwright.config.ts`

Key settings:
- `testDir: './tests'` — All tests located here
- `fullyParallel: true` — Tests run in parallel locally
- `retries: 2` in CI, `0` locally
- `workers: 1` in CI (serial), undefined locally (auto)
- `baseURL: 'http://localhost:5173'` — Dev server URL
- `trace: 'on-first-retry'` — Capture trace on first retry
- `screenshot: 'only-on-failure'` — Save screenshots on failure
- `downloadsPath: './test-outputs/downloads'` — Download artifacts location
- `reporter: 'html'` — HTML test report generated
- `webServer.command: 'npm run dev'` — Auto-start dev server
- `webServer.reuseExistingServer: !process.env.CI` — Reuse dev server locally

---

*Testing analysis: 2026-02-13*
