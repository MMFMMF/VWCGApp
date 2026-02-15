import { type Page, expect } from '@playwright/test';

/**
 * Verify the Strategic Health widget shows an insight matching the given pattern.
 * The insights are rendered in the sidebar's StrategicHealthWidget or on the dashboard.
 */
export async function expectInsightVisible(page: Page, pattern: RegExp) {
  // Insights may appear in the sidebar widget or on the dashboard
  await expect(page.getByText(pattern).first()).toBeVisible({ timeout: 5000 });
}

/**
 * Verify the Strategic Health widget does NOT show an insight matching the pattern.
 */
export async function expectInsightNotVisible(page: Page, pattern: RegExp) {
  await expect(page.getByText(pattern)).not.toBeVisible({ timeout: 2000 });
}

/**
 * Wait for the synthesis engine to run (happens synchronously on data update,
 * but the DOM needs to re-render).
 */
export async function waitForSynthesis(page: Page) {
  await page.waitForTimeout(500);
}

/**
 * Get the count of insights shown in the sidebar widget.
 */
export async function getInsightCount(page: Page): Promise<number> {
  const text = await page.locator('aside').getByText(/insight/i).textContent();
  const match = text?.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Click "Save Workspace" and verify the download starts.
 */
export async function saveWorkspace(page: Page) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Save Workspace/i }).click();
  return downloadPromise;
}

/**
 * Collect console errors during a test run.
 * Call at test start, check at end.
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}
