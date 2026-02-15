import { type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// AI Readiness — 6 range sliders (0–100)
// ---------------------------------------------------------------------------

// Slider order matches DIMENSIONS constant in AiReadinessTool.tsx
const AI_DIMENSIONS = ['Strategy', 'Data', 'Infrastructure', 'Talent', 'Governance', 'Culture'];

/** Fill all 6 AI Readiness sliders from a data object. Sliders are in fixed DOM order. */
export async function fillAiReadiness(page: Page, data: Record<string, number>) {
  const sliders = page.locator('input[type="range"][min="0"][max="100"]');
  for (const [dim, val] of Object.entries(data)) {
    const idx = AI_DIMENSIONS.indexOf(dim);
    if (idx === -1) throw new Error(`Unknown AI dimension: ${dim}`);
    await sliders.nth(idx).fill(String(val));
  }
}

// ---------------------------------------------------------------------------
// Leadership DNA — 6 dimensions × 2 inputs (current + target), 0–10
// ---------------------------------------------------------------------------

// Dimension order matches DIMENSIONS in LeadershipDnaTool.tsx
const DNA_DIMENSIONS = ['Vision', 'Execution', 'Empowerment', 'Decisiveness', 'Adaptability', 'Integrity'];

/**
 * Fill Leadership DNA number inputs.
 * Each dimension row has 2 number inputs (current, target) in DOM order.
 */
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

// ---------------------------------------------------------------------------
// SWOT — quadrant selection + add items
// ---------------------------------------------------------------------------

const QUADRANT_LABELS: Record<string, string> = {
  strengths: 'Strengths',
  weaknesses: 'Weaknesses',
  opportunities: 'Opportunities',
  threats: 'Threats',
};

/**
 * Add items to a SWOT quadrant.
 * UI: select quadrant tab → fill textarea → set confidence slider → click add button.
 */
export async function fillSwotQuadrant(
  page: Page,
  quadrant: string,
  items: Array<{ text: string; confidence: number }>,
) {
  const label = QUADRANT_LABELS[quadrant];
  // Click the quadrant selector button (exact match to avoid "Add to Strengths" etc.)
  await page.getByRole('button', { name: label, exact: true }).click();
  await page.waitForTimeout(200);

  for (const item of items) {
    // Fill the description textarea
    const textarea = page.locator('textarea');
    await textarea.fill(item.text);

    // Set confidence slider
    const slider = page.locator('input[type="range"]');
    await slider.fill(String(item.confidence));

    // Click the "Add to {Quadrant}" button
    await page.getByRole('button', { name: new RegExp(`Add to ${label}`, 'i') }).click();
    await page.waitForTimeout(200);
  }
}

/** Fill all 4 SWOT quadrants. */
export async function fillSwot(
  page: Page,
  data: Record<string, Array<{ text: string; confidence: number }>>,
) {
  for (const [quadrant, items] of Object.entries(data)) {
    await fillSwotQuadrant(page, quadrant, items);
  }
}

// ---------------------------------------------------------------------------
// Vision Canvas — north star + pillars + values
// ---------------------------------------------------------------------------

export async function fillVisionCanvas(
  page: Page,
  data: {
    northStar: string;
    pillars: Array<{ title: string; kpi: string }>;
    values: string[];
  },
) {
  // North Star textarea
  const northStarInput = page.locator('textarea').first();
  await northStarInput.fill(data.northStar);

  // Add pillars: fill name + KPI inputs, then click "Add Pillar" button
  // There is one pair of inputs that clears after each add.
  for (const pillar of data.pillars) {
    await page.getByPlaceholder(/Pillar Name/i).fill(pillar.title);
    await page.getByPlaceholder(/Key Result/i).fill(pillar.kpi);
    await page.getByRole('button', { name: /Add Pillar/i }).click();
    await page.waitForTimeout(200);
  }

  // Add values: fill value input + press Enter
  for (const value of data.values) {
    await page.getByPlaceholder(/Radical Transparency/i).fill(value);
    await page.getByPlaceholder(/Radical Transparency/i).press('Enter');
    await page.waitForTimeout(100);
  }
}

// ---------------------------------------------------------------------------
// 90-Day Roadmap — add tasks
// ---------------------------------------------------------------------------

export async function fillRoadmap(
  page: Page,
  tasks: Array<{ title: string; owner: string; week: number; status: string }>,
) {
  for (const task of tasks) {
    // Fill task title
    await page.getByPlaceholder(/Hire VP/i).fill(task.title);
    // Fill owner
    await page.getByPlaceholder(/CEO/i).fill(task.owner);
    // Fill week
    const weekInput = page.locator('input[type="number"][min="1"][max="12"]');
    await weekInput.fill(String(task.week));
    // Select status
    await page.locator('select').selectOption(task.status);

    // Click the add button (Plus icon button)
    const addBtn = page.locator('button').filter({ has: page.locator('svg.lucide-plus') }).first();
    await addBtn.click();
    await page.waitForTimeout(150);
  }
}

// ---------------------------------------------------------------------------
// Advisor Readiness — 20 questions, radio buttons 1-5
// ---------------------------------------------------------------------------

/**
 * Answer all Advisor Readiness diagnostic questions.
 * Each question has 5 buttons labeled 1-5.
 * `answers` maps question ID (s1, o1, f1, c1, etc.) to a score.
 */
export async function fillAdvisorReadiness(page: Page, answers: Record<string, number>) {
  // Click the Diagnostic tab to ensure it's active
  await page.getByRole('button', { name: /Diagnostic/i }).click();
  await page.waitForTimeout(300);

  // Questions are rendered in category sections.
  // Each question block has the question text then 5 numbered buttons.
  // We identify questions by their text and click the Nth button.
  // For efficiency, we'll use the question order which maps to the answers object.

  const questionIds = [
    's1', 's2', 's3', 's4', 's5',
    'o1', 'o2', 'o3', 'o4', 'o5',
    'f1', 'f2', 'f3', 'f4', 'f5',
    'c1', 'c2', 'c3', 'c4', 'c5',
  ];

  // Each question block has 5 buttons in a flex row
  const questionBlocks = page.locator('.divide-y > div');

  for (let i = 0; i < questionIds.length; i++) {
    const qId = questionIds[i];
    const score = answers[qId];
    if (score === undefined) continue;

    const block = questionBlocks.nth(i);
    // The score buttons are inside a flex row, each with text 1-5
    const scoreBtn = block.getByRole('button', { name: String(score), exact: true });
    await scoreBtn.click();
  }
}
