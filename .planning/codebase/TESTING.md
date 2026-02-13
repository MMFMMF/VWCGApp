# Testing Patterns

**Analysis Date:** 2026-02-13

## Test Framework

**Runner:**
- Playwright 1.58.2
- Config: `playwright.config.ts`
- Only Chromium browser tested (Desktop Chrome)

**Assertion Library:**
- Playwright's built-in expect (`import { test, expect } from '@playwright/test'`)

**Run Commands:**
```bash
npm run test:e2e                    # Run all Playwright tests
npm run test:e2e:ui                # Open interactive test UI
npm run test:e2e:headed            # Run with visible browser
npm run test:e2e:generate-pdfs    # Run PDF generation journey test
```

**Configuration Details:**
- Base URL: `http://localhost:5173` (Vite dev server)
- Test directory: `tests/`
- Test output: `test-outputs/` (downloads, traces, screenshots)
- Trace: `on-first-retry` (captures full execution trace if test fails)
- Screenshots: `only-on-failure`
- Parallel execution: `fullyParallel: true` (all tests run in parallel unless serialized)
- Retries: 0 in local mode, 2 in CI environment
- Auto-starts dev server via `webServer` config before tests run

## Test File Organization

**Location:**
- All tests in `tests/` directory (mirrors test organization, not source)
- No co-located tests in source directories

**Naming:**
- `*.spec.ts` extension
- Descriptive names matching test suite: `app.spec.ts`, `sarah.spec.ts`, `pdf-generation.spec.ts`

**Structure:**
```
tests/
├── smoke/
│   └── app.spec.ts                 # Basic app functionality
├── journeys/
│   ├── sarah.spec.ts               # Persona: Sarah Chen journey
│   ├── alex.spec.ts                # Persona: Alex Rodriguez journey
│   ├── mike.spec.ts                # Persona: Mike Thompson journey
│   └── pdf-generation.spec.ts      # PDF export journey
├── personas/
│   ├── sarah.ts                    # Test data for Sarah
│   ├── alex.ts                     # Test data for Alex
│   └── mike.ts                     # Test data for Mike
└── helpers/
    ├── navigation.ts               # Navigation utilities
    ├── forms.ts                    # Form-filling utilities
    ├── workspace.ts                # Workspace/synthesis helpers
    └── pdf.ts                      # PDF verification helpers
```

## Test Structure

**Suite Organization:**
```typescript
test.describe('Smoke Tests — App Basics', () => {
  test('app loads and shows dashboard', async ({ page }) => {
    // Test body
  });

  test('sidebar navigation lists all tools', async ({ page }) => {
    // Test body
  });
});
```

**Patterns:**

1. **Setup/Teardown:**
   - Use `test.beforeEach()` to reset state before each test
   - Example in `tests/journeys/sarah.spec.ts`:
     ```typescript
     test.beforeEach(async ({ page }) => {
       await page.goto('/');
       await resetWorkspace(page);
     });
     ```
   - No `test.afterEach()` needed (Playwright isolates each test)

2. **Assertions:**
   - Playwright expect with visibility checks: `await expect(page.getByText('AI Readiness')).toBeVisible()`
   - URL assertions: `await expect(page).toHaveURL('/')`
   - Wait with timeout: `await expect(...).toBeVisible({ timeout: 5000 })`
   - Negative assertions: `await expect(page.getByText(pattern)).not.toBeVisible()`

3. **Navigation:**
   - Use role selectors: `page.getByRole('link', { name: 'AI Readiness' })`
   - Use text selectors: `page.getByText('Dashboard')`
   - Wait for route transitions: `await page.waitForTimeout(300)`

4. **Data Entry:**
   - Locators by type and range: `page.locator('input[type="range"][min="0"][max="100"]')`
   - Fill method: `await slider.fill(String(value))`
   - Textarea fill: `await page.locator('textarea').fill(text)`
   - Button click: `await page.getByRole('button', { name: /pattern/i }).click()`

5. **Event Monitoring:**
   - Download events: `const downloadPromise = page.waitForEvent('download')`
   - Console errors: `page.on('console', msg => if (msg.type() === 'error') ...)`
   - No screenshot/trace assertions; reliance on visual assertions instead

## Helpers and Utilities

**Navigation Helpers** (`tests/helpers/navigation.ts`):
```typescript
/**
 * Navigate to a tool by clicking its sidebar link.
 */
export async function navigateToTool(page: Page, toolName: string) {
  await page.getByRole('link', { name: toolName }).click();
  await page.waitForTimeout(300);
}

/**
 * Clear workspace by removing localStorage and reloading.
 */
export async function resetWorkspace(page: Page) {
  await page.evaluate(() => localStorage.removeItem('vwcg-workspace'));
  await page.reload();
  await page.waitForTimeout(500);
}

/**
 * Inject workspace data directly into localStorage.
 */
export async function seedWorkspaceData(page: Page, toolId: string, data: Record<string, unknown>) {
  await page.evaluate(({ toolId, data }) => {
    const raw = localStorage.getItem('vwcg-workspace');
    const store = raw ? JSON.parse(raw) : { state: { version: '1.0', metadata: {}, tools: {}, provenance: {} } };
    store.state.tools[toolId] = data;
    store.state.provenance[toolId] = { timestamp: new Date().toISOString(), logicVersion: 'v1.1.0' };
    localStorage.setItem('vwcg-workspace', JSON.stringify(store));
  }, { toolId, data });
  await page.reload();
  await page.waitForTimeout(500);
}
```

**Form-Filling Helpers** (`tests/helpers/forms.ts`):
```typescript
// Fills AI Readiness sliders
export async function fillAiReadiness(page: Page, data: Record<string, number>) {
  const sliders = page.locator('input[type="range"][min="0"][max="100"]');
  for (const [dim, val] of Object.entries(data)) {
    const idx = AI_DIMENSIONS.indexOf(dim);
    await sliders.nth(idx).fill(String(val));
  }
}

// Fills Leadership DNA number inputs
export async function fillLeadershipDna(page: Page, data: Record<string, number>) {
  const inputs = page.locator('input[type="number"][min="0"][max="10"]');
  for (const dim of DNA_DIMENSIONS) {
    const idx = DNA_DIMENSIONS.indexOf(dim);
    const currentVal = data[`current_${dim}`];
    const targetVal = data[`target_${dim}`];
    if (currentVal !== undefined) await inputs.nth(idx * 2).fill(String(currentVal));
    if (targetVal !== undefined) await inputs.nth(idx * 2 + 1).fill(String(targetVal));
  }
}

// Fills SWOT quadrants
export async function fillSwot(page: Page, data: Record<string, Array<{ text: string; confidence: number }>>) {
  for (const [quadrant, items] of Object.entries(data)) {
    await fillSwotQuadrant(page, quadrant, items);
  }
}
```

**Workspace Helpers** (`tests/helpers/workspace.ts`):
```typescript
// Wait for synthesis engine
export async function waitForSynthesis(page: Page) {
  await page.waitForTimeout(500);
}

// Check if insight is visible
export async function expectInsightVisible(page: Page, pattern: RegExp) {
  await expect(page.getByText(pattern).first()).toBeVisible({ timeout: 5000 });
}

// Collect console errors
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}
```

## Mocking

**Framework:** No dedicated mocking library (Playwright uses real browser)

**Patterns:**
- No unit test mocking; E2E tests exercise real DOM and localStorage
- Test data seeded via `seedWorkspaceData()` helper (injects into localStorage)
- API calls not mocked; app works offline (no backend dependency in scope)

**What to Mock (if extending):**
- External APIs (Gemini Cloud API gated by `VITE_GEMINI_API_KEY`)
- File downloads via `page.waitForEvent('download')`
- Console messages via `page.on('console', ...)`

**What NOT to Mock:**
- localStorage (use real storage via `page.evaluate()`)
- DOM interactions (let Playwright manipulate real DOM)
- React component rendering (test full component hierarchy)

## Fixtures and Factories

**Test Data:**
Persona files in `tests/personas/` define complete test dataset:

**Example: Sarah Chen persona** (`tests/personas/sarah.ts`):
```typescript
export const sarah = {
  meta: {
    name: 'Sarah Chen',
    company: 'TechFlow Analytics',
    role: 'CEO/Founder',
    industry: 'SaaS',
    revenue: '$3M ARR',
    employees: 15,
  },
  aiReadiness: {
    Strategy: 85,
    Data: 70,
    Infrastructure: 75,
    Talent: 65,
    Governance: 40,
    Culture: 90,
  },
  leadershipDna: {
    current_Vision: 9,
    current_Execution: 4,
    target_Vision: 10,
    target_Execution: 8,
    // ... 10 more dimensions
  },
  swot: {
    strengths: [{ text: 'Strong AI/ML expertise...', confidence: 5 }, ...],
    weaknesses: [...],
    opportunities: [...],
    threats: [...]
  },
  visionCanvas: {
    northStar: 'Democratize AI analytics...',
    pillars: [{ title: 'Product-led growth', kpi: '10K free users → 500 paid' }, ...],
    values: ['Move fast', 'Data-driven decisions', 'Customer obsession']
  },
  roadmap: { initiatives: [...] },
  advisorReadiness: { responses: [...] }
};
```

**Location:** `tests/personas/`

**Usage:**
- Import into journey tests
- Pass to form helpers: `await fillAiReadiness(page, sarah.aiReadiness)`
- Each persona tests different business archetype and triggers different synthesis rules

## Coverage

**Requirements:** No coverage targets enforced (not configured in `playwright.config.ts`)

**View Coverage:** Not available (Playwright E2E tests don't have built-in coverage reporting)

**Test Categories:**

1. **Smoke Tests** (`tests/smoke/app.spec.ts`):
   - App loads and shows dashboard
   - Sidebar navigation lists all tools
   - Each tool route loads without crash
   - Unknown routes redirect to dashboard
   - Workspace persists across reload
   - Save Workspace triggers download
   - No console errors on fresh load
   - Dashboard shows getting started checklist

2. **Persona Journeys** (`tests/journeys/sarah|alex|mike.spec.ts`):
   - Per-tool tests: `fillAiReadiness`, `fillLeadershipDna`, `fillSwot`, `fillVisionCanvas`, `fillRoadmap`, `fillAdvisorReadiness`
   - Cross-tool synthesis: `E1 Execution Gap fires for Sarah`
   - Full journey: all assessments + synthesis verification

3. **PDF Generation** (`tests/journeys/pdf-generation.spec.ts`):
   - Navigate to Report Center
   - Generate unified report PDF
   - Verify PDF contains expected sections

## Test Types

**E2E Tests:**
- **Scope:** Full user journeys from app load through data entry to export
- **Approach:** Use Playwright Page Fixtures to interact with real browser, localStorage, and DOM
- **Coverage:** End-to-end flows; not granular unit coverage
- **Examples:**
  - Sarah persona completes all 6 assessments, synthesis fires, insights appear on dashboard
  - User saves workspace to file, reloads, data persists
  - PDF export generates multi-page document

**Unit Tests:** Not present (no Jest, Vitest, or similar configured)

**Integration Tests:** E2E tests serve as integration tests (cross-tool synthesis verification)

**No Mocking Needed:** App is offline-first with localStorage; no backend API calls in scope

## Common Patterns

**Async Testing:**
```typescript
test('AI Readiness — set all 6 dimension sliders', async ({ page }) => {
  await navigateToTool(page, 'AI Readiness');
  await fillAiReadiness(page, sarah.aiReadiness);

  // Verify sliders persisted
  for (const [, val] of Object.entries(sarah.aiReadiness)) {
    await expect(page.getByText(`${val}%`).first()).toBeVisible();
  }
});
```

**Error Testing:**
```typescript
test('no console errors on fresh app load', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await page.waitForTimeout(1000);

  expect(errors).toHaveLength(0);
});
```

**Synthesis Verification:**
```typescript
test('Synthesis — E1 Execution Gap fires for Sarah', async ({ page }) => {
  // Seed data
  await navigateToTool(page, 'Leadership DNA');
  await fillLeadershipDna(page, sarah.leadershipDna);

  await navigateToTool(page, 'Vision Canvas');
  await fillVisionCanvas(page, sarah.visionCanvas);

  await waitForSynthesis(page);
  await navigateToDashboard(page);

  // Verify insight
  await expect(page.getByText(/Execution Capability Gap/i).first()).toBeVisible({ timeout: 5000 });
});
```

**Data Persistence:**
```typescript
test('workspace persists across page reload', async ({ page }) => {
  await page.goto('/');
  await resetWorkspace(page);

  // Set data
  await page.getByRole('link', { name: 'AI Readiness' }).click();
  await page.waitForTimeout(300);
  const slider = page.locator('input[type="range"][min="0"][max="100"]').first();
  await slider.fill('80');
  await page.waitForTimeout(300);

  // Reload and verify
  await page.reload();
  await page.waitForTimeout(500);
  await page.getByRole('link', { name: 'AI Readiness' }).click();
  await page.waitForTimeout(300);
  await expect(page.getByText('80%').first()).toBeVisible();
});
```

**File Download:**
```typescript
test('Save Workspace triggers file download', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Save Workspace/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain('.vwcg');
});
```

---

*Testing analysis: 2026-02-13*
