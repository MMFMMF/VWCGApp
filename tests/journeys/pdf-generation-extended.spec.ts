import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { diana } from '../personas/diana';
import { raj } from '../personas/raj';
import { carmen } from '../personas/carmen';
import { david } from '../personas/david';
import { keisha } from '../personas/keisha';
import { tom } from '../personas/tom';
import { lin } from '../personas/lin';
import { resetWorkspace } from '../helpers/navigation';
import {
  captureIndividualReportPdf,
  captureUnifiedReportPdf,
  captureAIBriefingPdf,
  seedAllPersonaData,
} from '../helpers/pdf';

// AI Briefing LLM generation needs generous timeout
test.setTimeout(300_000);

const INDIVIDUAL_REPORTS = [
  { toolId: 'ai-readiness', label: 'AI Readiness' },
  { toolId: 'leadership-dna', label: 'Leadership DNA' },
  { toolId: 'swot', label: 'SWOT Analysis' },
  { toolId: 'vision-canvas', label: 'Vision Canvas' },
  { toolId: 'roadmap', label: '90-Day Roadmap' },
  { toolId: 'advisor-readiness', label: 'Advisor Readiness' },
] as const;

const personas = [
  { firstName: 'Diana', fullName: 'Diana Okafor', data: diana },
  { firstName: 'Raj', fullName: 'Raj Mehta', data: raj },
  { firstName: 'Carmen', fullName: 'Carmen Villarreal', data: carmen },
  { firstName: 'David', fullName: 'David Park', data: david },
  { firstName: 'Keisha', fullName: 'Keisha Williams', data: keisha },
  { firstName: 'Tom', fullName: 'Tom Brennan', data: tom },
  { firstName: 'Lin', fullName: 'Lin Zhang', data: lin },
] as const;

for (const persona of personas) {
  test.describe.serial(`PDF Generation: ${persona.fullName}`, () => {
    const pdfPaths: string[] = [];

    for (const report of INDIVIDUAL_REPORTS) {
      test(`${report.label} -- seed data + capture individual report PDF`, async ({ page }) => {
        await page.goto('/');
        await resetWorkspace(page);
        await seedAllPersonaData(page, persona.data);

        const p = await captureIndividualReportPdf(page, persona.firstName, report.toolId);
        pdfPaths.push(p);
      });
    }

    test('Strategic Briefing -- seed data + capture unified report PDF', async ({ page }) => {
      await page.goto('/');
      await resetWorkspace(page);
      await seedAllPersonaData(page, persona.data);

      const p = await captureUnifiedReportPdf(page, persona.firstName);
      pdfPaths.push(p);
    });

    test('AI-Powered Briefing -- seed data + capture AI briefing PDF', async ({ page }) => {
      await page.goto('/');
      await resetWorkspace(page);
      await seedAllPersonaData(page, persona.data);

      const p = await captureAIBriefingPdf(page, persona.firstName);
      pdfPaths.push(p);
    });

    test(`Verify all 8 ${persona.firstName} PDFs exist and are > 1KB`, async () => {
      expect(pdfPaths).toHaveLength(8);
      for (const p of pdfPaths) {
        expect(fs.existsSync(p), `PDF missing: ${p}`).toBe(true);
        const stat = fs.statSync(p);
        expect(stat.size, `PDF too small: ${p} (${stat.size} bytes)`).toBeGreaterThan(1024);
      }
    });
  });
}
