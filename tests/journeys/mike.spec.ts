import { test, expect } from '@playwright/test';
import { mike } from '../personas/mike';
import { navigateToTool, navigateToDashboard, resetWorkspace, seedWorkspaceData } from '../helpers/navigation';
import { fillAiReadiness, fillLeadershipDna, fillSwot, fillVisionCanvas, fillRoadmap, fillAdvisorReadiness } from '../helpers/forms';
import { waitForSynthesis, collectConsoleErrors } from '../helpers/workspace';

test.describe('Persona Journey: Mike — Traditional Business Owner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
  });

  test('AI Readiness — expect LOW scores across the board', async ({ page }) => {
    await navigateToTool(page, 'AI Readiness');
    await fillAiReadiness(page, mike.aiReadiness);

    // Verify low scores are displayed
    await expect(page.getByText('20%').first()).toBeVisible();
    await expect(page.getByText('10%').first()).toBeVisible();
  });

  test('Leadership DNA — strong execution, weak vision', async ({ page }) => {
    await navigateToTool(page, 'Leadership DNA');
    await fillLeadershipDna(page, mike.leadershipDna);

    // Execution should show as a strength (current: 8, target: 9 → gap of 1)
    // Vision should show improvement needed (current: 3, target: 5 → gap of 2)
    await expect(page.getByText(/Improvement Needed/i).first()).toBeVisible();
  });

  test('SWOT — high-confidence threats present', async ({ page }) => {
    await navigateToTool(page, 'SWOT Analysis');
    await fillSwot(page, mike.swot);

    // Supply chain threat should be visible
    await expect(page.getByText(/Supply Chain Disruption/i).first()).toBeVisible();
    await expect(page.getByText(/Amazon Business/i).first()).toBeVisible();
  });

  test('Vision Canvas — minimal/weak vision', async ({ page }) => {
    await navigateToTool(page, 'Vision Canvas');
    await fillVisionCanvas(page, mike.visionCanvas);

    // Only 2 pillars (vs Sarah's 5)
    await expect(page.getByText('Quality products').first()).toBeVisible();
    await expect(page.getByText('Good customer service').first()).toBeVisible();
  });

  test('Synthesis — E2 Unmitigated Threat fires for Mike', async ({ page }) => {
    // Mike has high-confidence threat "Supply Chain Disruption" with no matching roadmap task
    // This should trigger E2

    // Seed SWOT data with threats
    await navigateToTool(page, 'SWOT Analysis');
    await fillSwot(page, mike.swot);

    // Seed roadmap (no tasks addressing supply chain)
    await navigateToTool(page, '90-Day Roadmap');
    await fillRoadmap(page, mike.roadmap);

    await waitForSynthesis(page);

    // Navigate to dashboard where insights are shown in full widget
    await navigateToDashboard(page);
    await page.waitForTimeout(500);

    // E2 insight should appear
    await expect(page.getByText(/Unmitigated Threat/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Synthesis — E4 Strength Leverage does NOT fire for Mike', async ({ page }) => {
    // Mike's Innovation score is low (not tracked directly, but his current_Vision is 3)
    // E4 requires Innovation >= 8 which Mike doesn't have

    await navigateToTool(page, 'Leadership DNA');
    await fillLeadershipDna(page, mike.leadershipDna);

    await navigateToTool(page, '90-Day Roadmap');
    await fillRoadmap(page, mike.roadmap);

    await waitForSynthesis(page);

    // Navigate to dashboard where insights are shown in full widget
    await navigateToDashboard(page);
    await page.waitForTimeout(500);

    // E4 should NOT appear
    await expect(page.getByText(/Strength Leveraged/i)).not.toBeVisible({ timeout: 2000 });
  });

  test('Full journey — all assessments without errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);

    await navigateToTool(page, 'AI Readiness');
    await fillAiReadiness(page, mike.aiReadiness);

    await navigateToTool(page, 'Leadership DNA');
    await fillLeadershipDna(page, mike.leadershipDna);

    await navigateToTool(page, 'SWOT Analysis');
    await fillSwot(page, mike.swot);

    await navigateToTool(page, 'Vision Canvas');
    await fillVisionCanvas(page, mike.visionCanvas);

    await navigateToTool(page, '90-Day Roadmap');
    await fillRoadmap(page, mike.roadmap);

    await navigateToTool(page, 'Advisor Readiness');
    await fillAdvisorReadiness(page, mike.advisorReadiness);

    await waitForSynthesis(page);

    // Navigate to dashboard where insights are shown in full widget
    await navigateToDashboard(page);
    await page.waitForTimeout(500);

    // Verify E2 fires
    await expect(page.getByText(/Unmitigated Threat/i).first()).toBeVisible({ timeout: 5000 });

    const realErrors = errors.filter(e => !e.includes('[workspaceStore]'));
    expect(realErrors).toHaveLength(0);
  });
});
