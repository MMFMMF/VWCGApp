import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { sarah } from '../personas/sarah';
import { mike } from '../personas/mike';
import { alex } from '../personas/alex';
import { resetWorkspace } from '../helpers/navigation';
import {
  captureIndividualReportPdf,
  captureUnifiedReportPdf,
  captureAIBriefingPdf,
  seedAllPersonaData,
} from '../helpers/pdf';

// page.pdf() is fast but AI Briefing LLM generation needs generous timeout
test.setTimeout(300_000);

// -----------------------------------------------------------------------
// Sarah Chen -- Scaling Startup Founder
// -----------------------------------------------------------------------
test.describe.serial('PDF Generation: Sarah Chen', () => {
  const pdfPaths: string[] = [];

  test('AI Readiness -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, sarah);

    const p = await captureIndividualReportPdf(page, 'Sarah', 'ai-readiness');
    pdfPaths.push(p);
  });

  test('Leadership DNA -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, sarah);

    const p = await captureIndividualReportPdf(page, 'Sarah', 'leadership-dna');
    pdfPaths.push(p);
  });

  test('SWOT Analysis -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, sarah);

    const p = await captureIndividualReportPdf(page, 'Sarah', 'swot');
    pdfPaths.push(p);
  });

  test('Vision Canvas -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, sarah);

    const p = await captureIndividualReportPdf(page, 'Sarah', 'vision-canvas');
    pdfPaths.push(p);
  });

  test('90-Day Roadmap -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, sarah);

    const p = await captureIndividualReportPdf(page, 'Sarah', 'roadmap');
    pdfPaths.push(p);
  });

  test('Advisor Readiness -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, sarah);

    const p = await captureIndividualReportPdf(page, 'Sarah', 'advisor-readiness');
    pdfPaths.push(p);
  });

  test('Strategic Briefing -- seed data + capture unified report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, sarah);

    const p = await captureUnifiedReportPdf(page, 'Sarah');
    pdfPaths.push(p);
  });

  test('AI-Powered Briefing -- seed data + capture AI briefing PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, sarah);

    const p = await captureAIBriefingPdf(page, 'Sarah');
    pdfPaths.push(p);
  });

  test('Verify all 8 Sarah PDFs exist and are > 1KB', async () => {
    expect(pdfPaths).toHaveLength(8);
    for (const p of pdfPaths) {
      expect(fs.existsSync(p), `PDF missing: ${p}`).toBe(true);
      const stat = fs.statSync(p);
      expect(stat.size, `PDF too small: ${p} (${stat.size} bytes)`).toBeGreaterThan(1024);
    }
  });
});

// -----------------------------------------------------------------------
// Mike Patterson -- Traditional Business Owner
// -----------------------------------------------------------------------
test.describe.serial('PDF Generation: Mike Patterson', () => {
  const pdfPaths: string[] = [];

  test('AI Readiness -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, mike);

    const p = await captureIndividualReportPdf(page, 'Mike', 'ai-readiness');
    pdfPaths.push(p);
  });

  test('Leadership DNA -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, mike);

    const p = await captureIndividualReportPdf(page, 'Mike', 'leadership-dna');
    pdfPaths.push(p);
  });

  test('SWOT Analysis -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, mike);

    const p = await captureIndividualReportPdf(page, 'Mike', 'swot');
    pdfPaths.push(p);
  });

  test('Vision Canvas -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, mike);

    const p = await captureIndividualReportPdf(page, 'Mike', 'vision-canvas');
    pdfPaths.push(p);
  });

  test('90-Day Roadmap -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, mike);

    const p = await captureIndividualReportPdf(page, 'Mike', 'roadmap');
    pdfPaths.push(p);
  });

  test('Advisor Readiness -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, mike);

    const p = await captureIndividualReportPdf(page, 'Mike', 'advisor-readiness');
    pdfPaths.push(p);
  });

  test('Strategic Briefing -- seed data + capture unified report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, mike);

    const p = await captureUnifiedReportPdf(page, 'Mike');
    pdfPaths.push(p);
  });

  test('AI-Powered Briefing -- seed data + capture AI briefing PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, mike);

    const p = await captureAIBriefingPdf(page, 'Mike');
    pdfPaths.push(p);
  });

  test('Verify all 8 Mike PDFs exist and are > 1KB', async () => {
    expect(pdfPaths).toHaveLength(8);
    for (const p of pdfPaths) {
      expect(fs.existsSync(p), `PDF missing: ${p}`).toBe(true);
      const stat = fs.statSync(p);
      expect(stat.size, `PDF too small: ${p} (${stat.size} bytes)`).toBeGreaterThan(1024);
    }
  });
});

// -----------------------------------------------------------------------
// Alex Rivera -- Burned Out COO
// -----------------------------------------------------------------------
test.describe.serial('PDF Generation: Alex Rivera', () => {
  const pdfPaths: string[] = [];

  test('AI Readiness -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, alex);

    const p = await captureIndividualReportPdf(page, 'Alex', 'ai-readiness');
    pdfPaths.push(p);
  });

  test('Leadership DNA -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, alex);

    const p = await captureIndividualReportPdf(page, 'Alex', 'leadership-dna');
    pdfPaths.push(p);
  });

  test('SWOT Analysis -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, alex);

    const p = await captureIndividualReportPdf(page, 'Alex', 'swot');
    pdfPaths.push(p);
  });

  test('Vision Canvas -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, alex);

    const p = await captureIndividualReportPdf(page, 'Alex', 'vision-canvas');
    pdfPaths.push(p);
  });

  test('90-Day Roadmap -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, alex);

    const p = await captureIndividualReportPdf(page, 'Alex', 'roadmap');
    pdfPaths.push(p);
  });

  test('Advisor Readiness -- seed data + capture individual report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, alex);

    const p = await captureIndividualReportPdf(page, 'Alex', 'advisor-readiness');
    pdfPaths.push(p);
  });

  test('Strategic Briefing -- seed data + capture unified report PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, alex);

    const p = await captureUnifiedReportPdf(page, 'Alex');
    pdfPaths.push(p);
  });

  test('AI-Powered Briefing -- seed data + capture AI briefing PDF', async ({ page }) => {
    await page.goto('/');
    await resetWorkspace(page);
    await seedAllPersonaData(page, alex);

    const p = await captureAIBriefingPdf(page, 'Alex');
    pdfPaths.push(p);
  });

  test('Verify all 8 Alex PDFs exist and are > 1KB', async () => {
    expect(pdfPaths).toHaveLength(8);
    for (const p of pdfPaths) {
      expect(fs.existsSync(p), `PDF missing: ${p}`).toBe(true);
      const stat = fs.statSync(p);
      expect(stat.size, `PDF too small: ${p} (${stat.size} bytes)`).toBeGreaterThan(1024);
    }
  });
});
