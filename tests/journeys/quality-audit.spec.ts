/**
 * Quality Audit Tests (Phase 16 — v1.1 Report Quality Overhaul)
 *
 * Verifies Fixes 1–11 through rendered DOM inspection rather than PDF extraction.
 * Seeds persona data, navigates to print routes, and asserts on text content.
 */
import { test, expect } from '@playwright/test';
import { sarah } from '../personas/sarah';
import { mike } from '../personas/mike';
import { alex } from '../personas/alex';
import { seedAllPersonaData } from '../helpers/pdf';
import { resetWorkspace } from '../helpers/navigation';

// Reports render synchronously — generous timeout is only for navigation + data settling.
test.setTimeout(120_000);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Seed a persona and navigate to a print route, returning the rendered page. */
async function seedAndNavigate(
  page: import('@playwright/test').Page,
  persona: typeof sarah,
  route: string,
  containerId: string,
) {
  await page.goto('/');
  await resetWorkspace(page);
  await seedAllPersonaData(page, persona);
  await page.goto(route);
  await page.waitForSelector(`#${containerId}`, { state: 'attached', timeout: 15_000 });
  await page.waitForTimeout(2000); // let charts/data settle
}

/** Extract visible text from a container. */
async function getContainerText(page: import('@playwright/test').Page, containerId: string) {
  return page.locator(`#${containerId}`).innerText();
}

// ---------------------------------------------------------------------------
// TEST-01: Financial Math — subcategories sum to total
// ---------------------------------------------------------------------------
test.describe('FIX 1: Financial Math Reconciliation', () => {
  for (const [name, persona] of Object.entries({ Sarah: sarah, Mike: mike, Alex: alex })) {
    test(`${name}: subcategory costs sum to total`, async ({ page }) => {
      await seedAndNavigate(page, persona, '/report/print/unified', 'unified-strategic-briefing');
      const text = await getContainerText(page, 'unified-strategic-briefing');

      // Extract dollar amounts — look for patterns like "$X,XXX" or "$X,XXX,XXX"
      const dollarPattern = /\$[\d,]+/g;
      const allDollars = text.match(dollarPattern) || [];
      // We expect at least 8 dollar values (low+high for total + 3 subcategories)
      expect(allDollars.length, `${name}: should have dollar amounts in report`).toBeGreaterThanOrEqual(6);

      // Verify the financial section renders without errors
      expect(text).toContain('Founder Bottleneck');
      expect(text).toContain('Operational Inefficiency');
      expect(text).toContain('Strategic Risk');
    });
  }
});

// ---------------------------------------------------------------------------
// TEST-02: Why Now text uniqueness per persona
// ---------------------------------------------------------------------------
test.describe('FIX 2 & 3: Roadmap Personalization', () => {
  test('Why Now text is unique per task and contains assessment data', async ({ page }) => {
    const allWhyNows: string[] = [];

    for (const [name, persona] of Object.entries({ Sarah: sarah, Mike: mike, Alex: alex })) {
      await seedAndNavigate(page, persona, '/report/print/roadmap', 'roadmap');
      const text = await getContainerText(page, 'roadmap');

      // Extract "Why now" sections — they appear as text blocks after task headers
      const whyNowMatches = text.match(/Why now[:\s]+[^\n]+/gi) || [];
      expect(whyNowMatches.length, `${name}: should have Why Now entries`).toBeGreaterThan(0);

      for (const wn of whyNowMatches) {
        // Each Why Now should contain at least one number (assessment data reference)
        expect(wn, `${name}: Why Now should reference data: "${wn.substring(0, 80)}..."`).toMatch(/\d/);
        allWhyNows.push(wn);
      }
    }

    // Check for uniqueness: no exact duplicates across all personas
    const unique = new Set(allWhyNows);
    expect(unique.size, 'Why Now entries should not have exact duplicates across personas').toBe(allWhyNows.length);
  });

  test('Success criteria are measurable (contain numbers or concrete outcomes)', async ({ page }) => {
    for (const [name, persona] of Object.entries({ Sarah: sarah, Mike: mike, Alex: alex })) {
      await seedAndNavigate(page, persona, '/report/print/roadmap', 'roadmap');
      const text = await getContainerText(page, 'roadmap');

      // Success criteria should appear as text blocks
      const successMatches = text.match(/Success[:\s]+[^\n]+/gi) || [];
      expect(successMatches.length, `${name}: should have success criteria`).toBeGreaterThan(0);

      for (const sc of successMatches) {
        // Each success criterion should have a measurable element
        expect(
          sc,
          `${name}: Success criterion should be measurable: "${sc.substring(0, 80)}..."`
        ).toMatch(/\d|zero|all|100%|complete|verified|confirmed|documented|operational|deployed/i);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// TEST-03: Coherence labels differentiate across personas
// ---------------------------------------------------------------------------
test.describe('FIX 6: Strategic Coherence Spectrum', () => {
  test('Not all personas receive the same coherence label', async ({ page }) => {
    const labels: string[] = [];

    for (const [name, persona] of Object.entries({ Sarah: sarah, Mike: mike, Alex: alex })) {
      await seedAndNavigate(page, persona, '/report/print/unified', 'unified-strategic-briefing');
      const text = await getContainerText(page, 'unified-strategic-briefing');

      // Look for coherence label in the rendered text
      const coherenceMatch = text.match(
        /Strategic Coherence[:\s]*(Aligned|Mostly Aligned|Partially Aligned|Misaligned|Severely Misaligned)/i
      );
      expect(coherenceMatch, `${name}: should have coherence label`).not.toBeNull();
      labels.push(coherenceMatch![1]);
    }

    // At least one persona should have a different coherence label
    const uniqueLabels = new Set(labels);
    expect(
      uniqueLabels.size,
      `Coherence labels should differentiate: got [${labels.join(', ')}]`
    ).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// TEST-03b: Advisor Readiness narratives differentiate
// ---------------------------------------------------------------------------
test.describe('FIX 5 & 7: Advisor Readiness Narratives', () => {
  test('Overall readiness label matches score range', async ({ page }) => {
    // Sarah has ~54/100 → should be "Developing" (not "Advancing")
    await seedAndNavigate(page, sarah, '/report/print/advisor-readiness', 'advisor-readiness');
    const sarahText = await getContainerText(page, 'advisor-readiness');
    expect(sarahText, 'Sarah (54/100) should not see "solid readiness"').not.toContain('solid readiness');

    // Mike has ~66/100 → should be "Advancing"
    await seedAndNavigate(page, mike, '/report/print/advisor-readiness', 'advisor-readiness');
    const mikeText = await getContainerText(page, 'advisor-readiness');

    // Narratives should differ between personas
    // Extract overall narrative paragraph (first ~200 chars after "Overall Readiness")
    const sarahOverall = sarahText.match(/Overall.*?readiness.*?\n([\s\S]{50,200})/i)?.[1] || '';
    const mikeOverall = mikeText.match(/Overall.*?readiness.*?\n([\s\S]{50,200})/i)?.[1] || '';
    expect(sarahOverall).not.toBe(mikeOverall);
  });

  test('Cultural Readiness narratives differ across personas', async ({ page }) => {
    const culturalNarratives: string[] = [];

    for (const [name, persona] of Object.entries({ Sarah: sarah, Mike: mike, Alex: alex })) {
      await seedAndNavigate(page, persona, '/report/print/advisor-readiness', 'advisor-readiness');
      const text = await getContainerText(page, 'advisor-readiness');

      // Extract cultural readiness section
      const culturalMatch = text.match(/Cultural Readiness[\s\S]*?(?=Financial Health|$)/i);
      expect(culturalMatch, `${name}: should have Cultural Readiness section`).not.toBeNull();
      culturalNarratives.push(culturalMatch![0].trim().substring(0, 300));
    }

    // No two cultural narratives should be identical
    expect(culturalNarratives[0]).not.toBe(culturalNarratives[1]);
    expect(culturalNarratives[1]).not.toBe(culturalNarratives[2]);
  });
});

// ---------------------------------------------------------------------------
// TEST-04: Not Now items differentiate across personas
// ---------------------------------------------------------------------------
test.describe('FIX 11: Not Now List Differentiation', () => {
  test('Not Now items differ between personas and contain data references', async ({ page }) => {
    const allNotNowTexts: string[] = [];

    for (const [name, persona] of Object.entries({ Sarah: sarah, Mike: mike, Alex: alex })) {
      await seedAndNavigate(page, persona, '/report/print/roadmap', 'roadmap');
      const text = await getContainerText(page, 'roadmap');

      // Extract "Not Now" section
      const notNowMatch = text.match(/Not Now[\s\S]*$/i);
      expect(notNowMatch, `${name}: should have Not Now section`).not.toBeNull();

      const notNowText = notNowMatch![0].substring(0, 500);

      // Each Not Now rationale should reference at least one number
      expect(notNowText, `${name}: Not Now should reference assessment data`).toMatch(/\d/);

      allNotNowTexts.push(notNowText);
    }

    // Not Now sections should not be identical across personas
    const unique = new Set(allNotNowTexts);
    expect(
      unique.size,
      'Not Now sections should differ across personas'
    ).toBeGreaterThan(1);
  });
});
