import { type Page } from '@playwright/test';

/**
 * Navigate to a tool by clicking its sidebar link.
 * Tool names match the sidebar text from the registry.
 */
export async function navigateToTool(page: Page, toolName: string) {
  await page.getByRole('link', { name: toolName }).click();
  // Wait for the route transition
  await page.waitForTimeout(300);
}

/** Navigate to Dashboard (home route) */
export async function navigateToDashboard(page: Page) {
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.waitForTimeout(300);
}

/**
 * Clear workspace by removing localStorage and reloading.
 * Ensures each test starts fresh.
 */
export async function resetWorkspace(page: Page) {
  await page.evaluate(() => localStorage.removeItem('vwcg-workspace'));
  await page.reload();
  await page.waitForTimeout(500);
}

/**
 * Inject workspace data directly into localStorage and reload.
 * Useful for setting up state without clicking through forms.
 */
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
