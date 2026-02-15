import { test, expect } from '@playwright/test';
import { alex } from '../personas/alex';
import { navigateToTool, navigateToDashboard, resetWorkspace, seedWorkspaceData } from '../helpers/navigation';
import { fillAiReadiness, fillLeadershipDna, fillSwot, fillVisionCanvas, fillRoadmap, fillAdvisorReadiness } from '../helpers/forms';
import { waitForSynthesis, collectConsoleErrors } from '../helpers/workspace';

test.describe('Persona Journey: Alex — Burned Out COO', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
  });

  test('90-Day Roadmap — overloaded with 17 initiatives', async ({ page }) => {
    await navigateToTool(page, '90-Day Roadmap');
    await fillRoadmap(page, alex.roadmap);

    // Verify all tasks were added
    await expect(page.getByText('CRM Migration to Salesforce').first()).toBeVisible();
    await expect(page.getByText('Knowledge Management System').first()).toBeVisible();

    // Count tasks in the table
    const taskRows = page.locator('table tbody tr');
    await expect(taskRows).toHaveCount(alex.roadmap.length);
  });

  test('Advisor Readiness — good scores reflecting openness to help', async ({ page }) => {
    await navigateToTool(page, 'Advisor Readiness');
    await fillAdvisorReadiness(page, alex.advisorReadiness);

    // Progress should show 100%
    await expect(page.getByText('100%')).toBeVisible();

    // Switch to Analysis tab
    await page.getByRole('button', { name: /Analysis/i }).click();
    await page.waitForTimeout(300);

    // Alex's overall score should be moderate-to-good
    // (avg ~3.5/5 = 70%) — check radar chart renders
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('Synthesis — E3 Burnout Risk fires for Alex', async ({ page }) => {
    // Alex: 17 roadmap tasks + advisor readiness showing moderate maturity (~70%)
    // E3 triggers when: maturity < 70% → safe capacity = 16, and tasks > 16
    // With 17 tasks and ~70% maturity, this should trigger.

    // First, seed advisor readiness for maturity calculation
    await navigateToTool(page, 'Advisor Readiness');
    await fillAdvisorReadiness(page, alex.advisorReadiness);

    // Then add the overloaded roadmap
    await navigateToTool(page, '90-Day Roadmap');
    await fillRoadmap(page, alex.roadmap);

    await waitForSynthesis(page);

    // Navigate to dashboard where insights are shown in full widget
    await navigateToDashboard(page);
    await page.waitForTimeout(500);

    // E3 Burnout Risk should fire
    await expect(page.getByText(/Burnout.*Risk|Failure Risk/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Leadership DNA — competent but stretched thin', async ({ page }) => {
    await navigateToTool(page, 'Leadership DNA');
    await fillLeadershipDna(page, alex.leadershipDna);

    // Multiple gaps should show (3 point gaps on Execution, Empowerment)
    await expect(page.getByText(/Improvement Needed/i).first()).toBeVisible();
  });

  test('SWOT — burnout and overcommitment weaknesses visible', async ({ page }) => {
    await navigateToTool(page, 'SWOT Analysis');
    await fillSwot(page, alex.swot);

    await expect(page.getByText(/burnout/i)).toBeVisible();
    await expect(page.getByText(/concurrent strategic initiatives/i)).toBeVisible();
  });

  test('Full journey — all assessments + burnout synthesis', async ({ page }) => {
    const errors = collectConsoleErrors(page);

    // 1. AI Readiness
    await navigateToTool(page, 'AI Readiness');
    await fillAiReadiness(page, alex.aiReadiness);

    // 2. Leadership DNA
    await navigateToTool(page, 'Leadership DNA');
    await fillLeadershipDna(page, alex.leadershipDna);

    // 3. SWOT
    await navigateToTool(page, 'SWOT Analysis');
    await fillSwot(page, alex.swot);

    // 4. Vision Canvas
    await navigateToTool(page, 'Vision Canvas');
    await fillVisionCanvas(page, alex.visionCanvas);

    // 5. Advisor Readiness (needed for burnout rule)
    await navigateToTool(page, 'Advisor Readiness');
    await fillAdvisorReadiness(page, alex.advisorReadiness);

    // 6. Roadmap (overloaded — triggers burnout)
    await navigateToTool(page, '90-Day Roadmap');
    await fillRoadmap(page, alex.roadmap);

    await waitForSynthesis(page);

    // Navigate to dashboard where insights are shown in full widget
    await navigateToDashboard(page);
    await page.waitForTimeout(500);

    // E3 Burnout Risk should fire
    await expect(page.getByText(/Burnout.*Risk|Failure Risk/i).first()).toBeVisible({ timeout: 5000 });

    const realErrors = errors.filter(e => !e.includes('[workspaceStore]'));
    expect(realErrors).toHaveLength(0);
  });
});
