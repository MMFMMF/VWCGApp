import { type Page } from '@playwright/test';
import * as path from 'path';

const PDF_OUTPUT_DIR = path.resolve('test-outputs/pdfs');
const DOWNLOAD_TIMEOUT = 15_000; // html2canvas rendering can be slow
const FULL_REPORT_DOWNLOAD_TIMEOUT = 90_000; // unified report at 300 DPI takes much longer
const AI_BRIEFING_GENERATION_TIMEOUT = 180_000; // LLM generation can take 30-120 seconds

/**
 * Click "Export PDF" on the current tool page, wait for download, and save it.
 * The tool must already be navigated to before calling this.
 */
export async function exportToolPdf(page: Page, personaName: string, toolDisplayName: string) {
  const safeTool = toolDisplayName.replace(/\s+/g, '-');
  const safePersona = personaName.toLowerCase();
  const fileName = `${personaName}-${safeTool}.pdf`;
  const destPath = path.join(PDF_OUTPUT_DIR, safePersona, fileName);

  const downloadPromise = page.waitForEvent('download', { timeout: DOWNLOAD_TIMEOUT });
  await page.getByRole('button', { name: /Export PDF/i }).click();
  const download = await downloadPromise;

  await download.saveAs(destPath);
  return destPath;
}

/**
 * Navigate to Report Center, select all tools that have data, show preview,
 * export the combined PDF report, and save it.
 */
export async function exportFullReport(page: Page, personaName: string) {
  const safePersona = personaName.toLowerCase();
  const fileName = `${personaName}-Full-Report.pdf`;
  const destPath = path.join(PDF_OUTPUT_DIR, safePersona, fileName);

  // New ReportCenter defaults to Strategic Briefing mode with preview always visible.
  // Wait for the unified report to render fully.
  await page.waitForTimeout(3000);

  // Click "Download PDF" — use longer timeout for unified report (300 DPI, 12-16 pages)
  const downloadPromise = page.waitForEvent('download', { timeout: FULL_REPORT_DOWNLOAD_TIMEOUT });
  await page.getByRole('button', { name: /Download PDF/i }).click();
  const download = await downloadPromise;

  await download.saveAs(destPath);
  return destPath;
}

/**
 * Click "AI-Powered Briefing" mode, generate the AI narrative, wait for completion,
 * then download the PDF. Data must already be seeded.
 */
export async function exportAIBriefingPdf(page: Page, personaName: string) {
  const safePersona = personaName.toLowerCase();
  const fileName = `${personaName}-AI-Briefing.pdf`;
  const destPath = path.join(PDF_OUTPUT_DIR, safePersona, fileName);

  // Switch to AI-Powered Briefing mode
  await page.getByText('AI-Powered Briefing').click();
  await page.waitForTimeout(500);

  // Click "Generate AI Briefing" button
  await page.getByRole('button', { name: /Generate AI Briefing/i }).click();

  // Wait for the LLM generation to complete — spinner disappears and narrative renders
  await page.waitForSelector('#llm-strategic-briefing', { timeout: AI_BRIEFING_GENERATION_TIMEOUT });
  await page.waitForTimeout(2000); // let the report render fully

  // Download the PDF
  const downloadPromise = page.waitForEvent('download', { timeout: FULL_REPORT_DOWNLOAD_TIMEOUT });
  await page.getByRole('button', { name: /Download PDF/i }).click();
  const download = await downloadPromise;

  await download.saveAs(destPath);
  return destPath;
}

/**
 * Seed all 6 tool datasets for a persona into localStorage in a single call.
 * Avoids filling forms when we only need data present (e.g. for Report Center export).
 */
export async function seedAllPersonaData(
  page: Page,
  persona: {
    meta?: { name?: string; company?: string; industry?: string; revenue?: string };
    aiReadiness: Record<string, number>;
    leadershipDna: Record<string, number>;
    swot: Record<string, Array<{ text: string; confidence: number }>>;
    visionCanvas: { northStar: string; pillars: Array<{ title: string; kpi: string }>; values: string[] };
    roadmap: Array<{ title: string; owner: string; week: number; status: string }>;
    advisorReadiness: Record<string, number>;
    businessContext?: Record<string, string>;
  },
) {
  await page.evaluate((p) => {
    const raw = localStorage.getItem('vwcg-workspace');
    const companyName = p.meta?.company || 'Test';
    const store = raw
      ? JSON.parse(raw)
      : { state: { version: '1.0', metadata: { id: crypto.randomUUID(), name: companyName, schema_version: 'v1', computed_under_logic_version: 'v1.1.0', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() }, tools: {}, provenance: {} } };

    // Set metadata name from persona company
    if (p.meta?.company) {
      store.state.metadata.name = p.meta.company;
    }

    const now = new Date().toISOString();
    const prov = { timestamp: now, logicVersion: 'v1.1.0' };

    // AI Readiness — flat key-value
    store.state.tools['ai-readiness'] = p.aiReadiness;
    store.state.provenance['ai-readiness'] = prov;

    // Leadership DNA — flat key-value
    store.state.tools['leadership-dna'] = p.leadershipDna;
    store.state.provenance['leadership-dna'] = prov;

    // SWOT — items need id field
    const swotData: Record<string, Array<{ id: string; text: string; confidence: number }>> = {};
    for (const [quad, items] of Object.entries(p.swot)) {
      swotData[quad] = items.map((item: { text: string; confidence: number }) => ({
        id: crypto.randomUUID(),
        text: item.text,
        confidence: item.confidence,
      }));
    }
    store.state.tools['swot'] = swotData;
    store.state.provenance['swot'] = prov;

    // Vision Canvas — pillars/values need id field
    store.state.tools['vision-canvas'] = {
      northStar: p.visionCanvas.northStar,
      pillars: p.visionCanvas.pillars.map((pl: { title: string; kpi: string }) => ({
        id: crypto.randomUUID(),
        text: pl.title,
        kpi: pl.kpi,
      })),
      values: p.visionCanvas.values.map((v: string) => ({
        id: crypto.randomUUID(),
        text: v,
      })),
    };
    store.state.provenance['vision-canvas'] = prov;

    // Roadmap — tasks need id field
    store.state.tools['roadmap'] = {
      tasks: p.roadmap.map((t: { title: string; owner: string; week: number; status: string }) => ({
        id: crypto.randomUUID(),
        title: t.title,
        owner: t.owner,
        week: t.week,
        status: t.status,
      })),
    };
    store.state.provenance['roadmap'] = prov;

    // Advisor Readiness — answers wrapper
    store.state.tools['advisor-readiness'] = { answers: p.advisorReadiness };
    store.state.provenance['advisor-readiness'] = prov;

    // Business Context — company name and demographics for report cover pages
    if (p.businessContext || p.meta?.company) {
      store.state.tools['business-context'] = {
        ...(store.state.tools['business-context'] || {}),
        ...(p.businessContext || {}),
        companyName: p.businessContext?.companyName || p.meta?.company || '',
      };
      store.state.provenance['business-context'] = prov;
    }

    localStorage.setItem('vwcg-workspace', JSON.stringify(store));
  }, persona);

  await page.reload();
  await page.waitForTimeout(500);
}
