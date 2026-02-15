import { test, expect } from '@playwright/test';
import { sarah } from '../personas/sarah';
import { navigateToTool, navigateToDashboard, resetWorkspace } from '../helpers/navigation';
import { fillAiReadiness, fillLeadershipDna, fillSwot, fillVisionCanvas, fillRoadmap, fillAdvisorReadiness } from '../helpers/forms';
import { waitForSynthesis, collectConsoleErrors } from '../helpers/workspace';

test.describe('Persona Journey: Sarah — Scaling Startup Founder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
  });

  test('AI Readiness — set all 6 dimension sliders', async ({ page }) => {
    await navigateToTool(page, 'AI Readiness');
    await fillAiReadiness(page, sarah.aiReadiness);

    // Verify sliders persisted — check that values appear on screen
    for (const [, val] of Object.entries(sarah.aiReadiness)) {
      await expect(page.getByText(`${val}%`).first()).toBeVisible();
    }

    // Radar chart should render
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('Leadership DNA — set current and target scores', async ({ page }) => {
    await navigateToTool(page, 'Leadership DNA');
    await fillLeadershipDna(page, sarah.leadershipDna);

    // Execution gap should show (current: 4, target: 8 → gap of 4)
    await expect(page.getByText(/Critical Gap/i).first()).toBeVisible();

    // Radar chart should render
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('SWOT Analysis — add items to all 4 quadrants', async ({ page }) => {
    await navigateToTool(page, 'SWOT Analysis');
    await fillSwot(page, sarah.swot);

    // Verify items appear in the matrix (use first() since text may appear in editor + matrix)
    await expect(page.getByText(/Strong AI\/ML expertise/i).first()).toBeVisible();
    await expect(page.getByText(/No documented processes/i).first()).toBeVisible();
    await expect(page.getByText(/Well-funded competitors/i).first()).toBeVisible();
  });

  test('Vision Canvas — set north star, pillars, and values', async ({ page }) => {
    await navigateToTool(page, 'Vision Canvas');
    await fillVisionCanvas(page, sarah.visionCanvas);

    // Pillars should be visible in the pillar list or VisionBoard
    await expect(page.getByText('Product-led growth').first()).toBeVisible();
    await expect(page.getByText('AI-first architecture').first()).toBeVisible();

    // Values should be visible as tags
    await expect(page.getByText('Move fast').first()).toBeVisible();
  });

  test('90-Day Roadmap — add all initiatives', async ({ page }) => {
    await navigateToTool(page, '90-Day Roadmap');
    await fillRoadmap(page, sarah.roadmap);

    // Verify tasks appear (use first() since text appears in timeline + table)
    await expect(page.getByText('Launch V2 Platform').first()).toBeVisible();
    await expect(page.getByText('Series A Preparation').first()).toBeVisible();
  });

  test('Advisor Readiness — complete all 20 diagnostic questions', async ({ page }) => {
    await navigateToTool(page, 'Advisor Readiness');
    await fillAdvisorReadiness(page, sarah.advisorReadiness);

    // Progress should show 100%
    await expect(page.getByText('100%')).toBeVisible();

    // Switch to Analysis tab and verify results render
    await page.getByRole('button', { name: /Analysis/i }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('Synthesis — E1 Execution Gap fires for Sarah', async ({ page }) => {
    // Sarah has high vision (9) + low execution (4) + 5 pillars
    // E1 triggers: executionScore=4 → maxPillars=3, pillarCount=5 > 3

    // Seed Leadership DNA data
    await navigateToTool(page, 'Leadership DNA');
    await fillLeadershipDna(page, sarah.leadershipDna);

    // Seed Vision Canvas data (5 pillars)
    await navigateToTool(page, 'Vision Canvas');
    await fillVisionCanvas(page, sarah.visionCanvas);

    await waitForSynthesis(page);

    // Navigate to dashboard where insights are shown in full widget
    await navigateToDashboard(page);
    await page.waitForTimeout(500);

    // Insight title should be visible in the Strategic Insights section
    await expect(page.getByText(/Execution Capability Gap/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Full journey — all assessments + synthesis verification', async ({ page }) => {
    const errors = collectConsoleErrors(page);

    // 1. AI Readiness
    await navigateToTool(page, 'AI Readiness');
    await fillAiReadiness(page, sarah.aiReadiness);

    // 2. Leadership DNA
    await navigateToTool(page, 'Leadership DNA');
    await fillLeadershipDna(page, sarah.leadershipDna);

    // 3. SWOT
    await navigateToTool(page, 'SWOT Analysis');
    await fillSwot(page, sarah.swot);

    // 4. Vision Canvas
    await navigateToTool(page, 'Vision Canvas');
    await fillVisionCanvas(page, sarah.visionCanvas);

    // 5. Roadmap
    await navigateToTool(page, '90-Day Roadmap');
    await fillRoadmap(page, sarah.roadmap);

    // 6. Advisor Readiness
    await navigateToTool(page, 'Advisor Readiness');
    await fillAdvisorReadiness(page, sarah.advisorReadiness);

    await waitForSynthesis(page);

    // Navigate to dashboard to see full insight widget
    await navigateToDashboard(page);
    await page.waitForTimeout(500);

    // E1: Execution Gap should fire (vision=9, execution=4, 5 pillars)
    await expect(page.getByText(/Execution Capability Gap/i).first()).toBeVisible({ timeout: 5000 });

    // No console errors throughout
    const realErrors = errors.filter(e => !e.includes('[workspaceStore]'));
    expect(realErrors).toHaveLength(0);
  });
});
