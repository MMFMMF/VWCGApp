import { test, expect } from '@playwright/test';
import { resetWorkspace } from '../helpers/navigation';

test.describe('Smoke Tests — App Basics', () => {
  test('app loads and shows dashboard', async ({ page }) => {
    await page.goto('/');
    // Should show the VWCG title in sidebar
    await expect(page.getByText('VWCG Unified')).toBeVisible();
    // Dashboard content should render (topbar heading)
    await expect(page.getByRole('heading', { name: 'My Business Strategy' })).toBeVisible();
  });

  test('sidebar navigation lists all tools', async ({ page }) => {
    await page.goto('/');
    const expectedTools = [
      'AI Readiness',
      'Leadership DNA',
      'SWOT Analysis',
      'Vision Canvas',
      '90-Day Roadmap',
      'Advisor Readiness',
    ];
    for (const tool of expectedTools) {
      await expect(page.getByRole('link', { name: tool })).toBeVisible();
    }
  });

  test('each tool route loads without crash', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);

    const tools = [
      'AI Readiness',
      'Leadership DNA',
      'SWOT Analysis',
      'Vision Canvas',
      '90-Day Roadmap',
      'Advisor Readiness',
    ];

    for (const tool of tools) {
      await page.getByRole('link', { name: tool }).click();
      await page.waitForTimeout(300);
      // Should not show error boundary or blank page
      await expect(page.getByText('VWCG Unified')).toBeVisible();
    }
  });

  test('unknown routes redirect to dashboard', async ({ page }) => {
    await page.goto('/tools/nonexistent-tool');
    // Should redirect to "/" (dashboard)
    await expect(page).toHaveURL('/');
  });

  test('workspace persists across page reload', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);

    // Navigate to AI Readiness and set a slider
    await page.getByRole('link', { name: 'AI Readiness' }).click();
    await page.waitForTimeout(300);

    // Set Strategy slider (first range input) to 80
    const slider = page.locator('input[type="range"][min="0"][max="100"]').first();
    await slider.fill('80');
    await page.waitForTimeout(300);

    // Reload
    await page.reload();
    await page.waitForTimeout(500);

    // Navigate back to AI Readiness
    await page.getByRole('link', { name: 'AI Readiness' }).click();
    await page.waitForTimeout(300);

    // Value should still be 80
    await expect(page.getByText('80%').first()).toBeVisible();
  });

  test('Save Workspace triggers file download', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);

    // Set some data first so export has content
    await page.getByRole('link', { name: 'AI Readiness' }).click();
    await page.waitForTimeout(300);
    await page.locator('input[type="range"][min="0"][max="100"]').first().fill('50');
    await page.waitForTimeout(300);

    // Click save
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Save Workspace/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.vwcg');
  });

  test('no console errors on fresh app load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    expect(errors).toHaveLength(0);
  });

  test('dashboard shows getting started checklist', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);

    // Should show checklist items
    await expect(page.getByText(/Leadership DNA/i).first()).toBeVisible();
    await expect(page.getByText(/Vision Canvas/i).first()).toBeVisible();
    await expect(page.getByText(/SWOT/i).first()).toBeVisible();
  });
});
