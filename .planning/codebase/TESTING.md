# Testing Patterns

**Analysis Date:** 2025-02-14

## Test Framework

**Runner:**
- Playwright 1.58.2 (browser automation)
- Config: `playwright.config.ts`

**Assertion Library:**
- Playwright's built-in `expect()` API (integrates Chai assertions)

**Run Commands:**
```bash
npm run test:e2e                      # Run all E2E tests in headless mode
npm run test:e2e:ui                   # Run with interactive UI mode
npm run test:e2e:headed               # Run in headed browser (visible)
npm run test:e2e:generate-pdfs        # Run PDF generation journey test
npx playwright test tests/journeys/alex.spec.ts  # Run single file
npx playwright test -g "pattern"      # Run tests matching pattern
```

**Browser:**
- Chromium only (single project in `playwright.config.ts`)
- Desktop Chrome device (1280x720 resolution default)
- Auto-starts dev server at `http://localhost:5173` (Vite dev server)

## Test File Organization

**Location:**
- Tests live in `/tests/` directory at project root
- Structure: `tests/` contains `journeys/`, `smoke/`, `helpers/`, `personas/`
- Co-located with source (not in `src/`)

**Naming:**
- Test files: `.spec.ts` extension (e.g., `alex.spec.ts`, `app.spec.ts`)
- Test suites: Per-persona journey tests (e.g., `alex.spec.ts` for "Persona Journey: Alex")
- Smoke tests: Basic functionality tests (e.g., `smoke/app.spec.ts`)

**Directory structure:**
```
tests/
├── journeys/           # E2E user journey tests (per persona)
│   ├── alex.spec.ts
│   ├── mike.spec.ts
│   ├── sarah.spec.ts
│   └── pdf-generation.spec.ts
├── smoke/              # Basic app functionality smoke tests
│   └── app.spec.ts
├── helpers/            # Reusable test utilities
│   ├── forms.ts        # Form filling helpers (fillAiReadiness, fillLeadershipDna, etc.)
│   ├── navigation.ts   # Navigation helpers (navigateToTool, resetWorkspace, etc.)
│   ├── workspace.ts    # Workspace/store helpers (waitForSynthesis, expectInsightVisible, etc.)
│   └── pdf.ts          # PDF-specific helpers
└── personas/           # Test data (persona definitions)
    ├── alex.ts
    ├── mike.ts
    └── sarah.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { test, expect } from '@playwright/test';
import { alex } from '../personas/alex';
import { navigateToTool, resetWorkspace } from '../helpers/navigation';
import { fillAiReadiness } from '../helpers/forms';
import { waitForSynthesis } from '../helpers/workspace';

test.describe('Persona Journey: Alex — Burned Out COO', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
  });

  test('AI Readiness — set all 6 dimension sliders', async ({ page }) => {
    await navigateToTool(page, 'AI Readiness');
    await fillAiReadiness(page, alex.aiReadiness);
    await expect(page.locator('canvas').first()).toBeVisible();
  });
});
```

**Patterns:**
- **Setup** (`beforeEach`): Navigate to home, reset workspace to clean state
- **Action**: Use helper functions to fill forms (e.g., `fillAiReadiness`)
- **Wait**: Call `waitForSynthesis()` if test depends on synthesis results
- **Assert**: Use `expect()` with specific locators (buttons, text, canvases)

**Test Naming Convention:**
- Format: `"{Feature} — {Scenario}"` (em dash separates feature and specific test case)
- Examples: "AI Readiness — set all 6 dimension sliders", "Synthesis — E3 Burnout Risk fires for Alex"
- Makes test output human-readable and groupable by feature

## Mocking

**Framework:** Playwright's built-in mocking (via `page.route()` and `page.on()`)

**Patterns:**

**Console error collection:**
```typescript
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}
```

**File download mocking:**
```typescript
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: /Save Workspace/i }).click();
const download = await downloadPromise;
expect(download.suggestedFilename()).toContain('.vwcg');
```

**What to Mock:**
- File system events (downloads, file selections)
- Console messages (for error verification)
- Network requests (if needed; not currently used)

**What NOT to Mock:**
- UI interactions (clicks, form fills) — test real interactions
- localStorage — test real persistence (tests naturally use localStorage through Zustand)
- Synthesis engine — test real synthesis results (E2E tests should use real rules)

## Fixtures and Factories

**Test Data:**

Personas define complete test datasets in `/tests/personas/`:

```typescript
// tests/personas/alex.ts
export const alex = {
  meta: {
    name: 'Alex Rivera',
    company: 'Meridian Consulting Group',
    role: 'COO',
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
    current_Empowerment: 6,
    // ... 16 fields total (6 dimensions × 2 current/target)
  },
  swot: {
    strengths: [
      { text: 'Strong consulting methodology', confidence: 5 },
    ],
    weaknesses: [
      { text: 'Leadership team burnout', confidence: 5 },
    ],
    // ... opportunities, threats
  },
  roadmap: [
    { title: 'CRM Migration to Salesforce', priority: 'high' },
    // ... 17 tasks total (overload scenario)
  ],
  advisorReadiness: {
    // 20 diagnostic questions
  },
};
```

**Location:**
- `/tests/personas/` contains three personas: Alex, Mike, Sarah
- Each persona represents a distinct archetype and triggers different synthesis rules
- Used across multiple test files to drive consistent scenarios

## Coverage

**Requirements:** No hard coverage targets enforced

**View Coverage:** No coverage reporting configured

**Coverage Gap:**
- Unit tests not present; all testing is E2E via Playwright
- Synthesis rules (8 in v2) are tested indirectly through persona journeys
- No isolated component tests; UI components tested in integration

**Test scope:**
- Smoke tests: App loading, navigation, persistence (7 tests in `smoke/app.spec.ts`)
- Journey tests: Multi-tool workflows per persona (16+ tests across `journeys/*.spec.ts`)
- PDF generation: End-to-end PDF export test (`pdf-generation.spec.ts`)

## Test Types

**Smoke Tests:**
- Location: `tests/smoke/app.spec.ts`
- Scope: Basic app functionality (load, nav, persistence, download)
- Runs: Part of standard `npm run test:e2e`
- Count: 7 tests

**Integration/Journey Tests:**
- Location: `tests/journeys/*.spec.ts` (alex, mike, sarah, pdf-generation)
- Scope: Multi-step user workflows (fill form → navigate → verify synthesis)
- Triggers: Test real business logic (e.g., "burnout risk fires when maturity < 70%")
- Count: 16+ tests

**E2E Tests:**
- All tests are E2E (no unit tests in codebase)
- Start from browser landing on `/`
- Use real synthesis engine, real store persistence, real PDF generation
- No mocks of business logic

## Common Patterns

**Async Testing:**
```typescript
// Wait for synthesis to complete
await waitForSynthesis(page);

// Wait for specific UI element
await expect(page.getByText(/Burnout.*Risk/i).first()).toBeVisible({ timeout: 5000 });

// Manual wait for render/paint
await page.waitForTimeout(300);
```

**Error Testing:**
```typescript
// Collect console errors during test
const errors = collectConsoleErrors(page);

// Verify no errors occurred
await page.goto('/');
await page.waitForTimeout(1000);
expect(errors).toHaveLength(0);
```

**Navigation Testing:**
```typescript
// Use helper for tool navigation
await navigateToTool(page, 'AI Readiness');

// Or direct route
await page.goto('/tools/ai-readiness');

// Verify URL after redirect
await expect(page).toHaveURL('/');
```

**Form Filling:**
```typescript
// Use parameterized helpers from /tests/helpers/forms.ts
await fillAiReadiness(page, alex.aiReadiness);           // 6 sliders
await fillLeadershipDna(page, alex.leadershipDna);       // 12 inputs (6 dims × 2)
await fillSwot(page, alex.swot);                          // SWOT quadrants
await fillVisionCanvas(page, alex.visionCanvas);         // Pillars + values
await fillRoadmap(page, alex.roadmap);                   // Task list
await fillAdvisorReadiness(page, alex.advisorReadiness); // 20 diagnostic Qs
```

**Insight Verification:**
```typescript
// Expect insight visible
await expectInsightVisible(page, /Burnout.*Risk|Failure Risk/i);

// Expect insight NOT visible
await expectInsightNotVisible(page, /pattern/i);

// Check insight count
const count = await getInsightCount(page);
expect(count).toBeGreaterThan(0);
```

## Test Data Flow

**Persona-driven testing:**
1. Load persona data (`alex`, `mike`, `sarah`) from `/tests/personas/*.ts`
2. Use reusable form helpers to populate tool UIs with persona data
3. Synthesis engine runs automatically on data update
4. Verify insights appear on dashboard or sidebar
5. Assert specific insights fire based on persona archetype

**Example journey:**
```typescript
// Alex: "Burned Out COO" with overloaded roadmap
test('Synthesis — E3 Burnout Risk fires for Alex', async ({ page }) => {
  // Setup advisor readiness (affects maturity % calculation)
  await navigateToTool(page, 'Advisor Readiness');
  await fillAdvisorReadiness(page, alex.advisorReadiness); // ~70% maturity

  // Add overloaded roadmap (17 tasks > safe capacity 16)
  await navigateToTool(page, '90-Day Roadmap');
  await fillRoadmap(page, alex.roadmap);

  // Synthesis runs automatically; E3 rule checks maturity < 70% → triggers
  await waitForSynthesis(page);

  // Verify insight appears
  await navigateToDashboard(page);
  await expect(page.getByText(/Burnout.*Risk/i).first()).toBeVisible({ timeout: 5000 });
});
```

## Configuration Details

**Playwright Config (`playwright.config.ts`):**
- `testDir`: `./tests`
- `fullyParallel`: `true` (run tests in parallel)
- `forbidOnly`: Enforced in CI (fail if `.only` or `.skip` left in code)
- `retries`: 2 in CI, 0 locally
- `workers`: 1 in CI (serialize), undefined locally (use default)
- `reporter`: HTML (outputs to `test-results/`)
- `baseURL`: `http://localhost:5173` (Vite dev server)
- `trace`: `on-first-retry` (record trace for failed tests)
- `screenshot`: `only-on-failure` (save screenshots only on failure)
- `downloadsPath`: `./test-outputs/downloads`

**Dev Server:**
- Auto-starts: `npm run dev` (Vite)
- Reuses existing: `reuseExistingServer: !process.env.CI`
- Health check: Polls `http://localhost:5173` before running tests

---

*Testing analysis: 2025-02-14*
