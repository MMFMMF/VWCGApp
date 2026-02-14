import { type Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { navigateToTool } from './navigation';

const PDF_OUTPUT_DIR = path.resolve('test-outputs/pdfs');
const AI_BRIEFING_GENERATION_TIMEOUT = 180_000; // LLM generation can take 30-120 seconds

/** Map toolId to PDF filename suffix */
const TOOL_FILENAME_MAP: Record<string, string> = {
  'ai-readiness': 'AI-Readiness',
  'leadership-dna': 'Leadership-DNA',
  'swot': 'SWOT-Analysis',
  'vision-canvas': 'Vision-Canvas',
  'advisor-readiness': 'Advisor-Readiness',
  'roadmap': '90-Day-Roadmap',
};

/** Footer template for page.pdf() — displays company name and page numbers */
const FOOTER_TEMPLATE = '<div style="width: 100%; font-size: 9px; padding: 0 18mm; display: flex; justify-content: space-between; color: #64748b;"><span>World Consulting Group | worldconsultinggroup.com</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>';

/** Empty header template to suppress default Chromium header */
const HEADER_TEMPLATE = '<div></div>';

/**
 * Ensure the persona output directory exists.
 */
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Navigate directly to print route for individual report and capture PDF via page.pdf().
 */
export async function captureIndividualReportPdf(
  page: Page,
  personaName: string,
  toolId: string,
) {
  const safePersona = personaName.toLowerCase();
  const toolSuffix = TOOL_FILENAME_MAP[toolId];
  if (!toolSuffix) throw new Error(`Unknown toolId for PDF filename: ${toolId}`);
  const fileName = `${personaName}-${toolSuffix}.pdf`;
  const destDir = path.join(PDF_OUTPUT_DIR, safePersona);
  ensureDir(destDir);
  const destPath = path.join(destDir, fileName);

  // Navigate directly to print route (no AppShell)
  await page.goto(`/report/print/${toolId}`);
  await page.waitForSelector(`#${toolId}`, { state: 'attached' });
  await page.waitForTimeout(2000); // let charts/fonts settle

  // Capture PDF with footer
  await page.pdf({
    path: destPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: HEADER_TEMPLATE,
    footerTemplate: FOOTER_TEMPLATE,
    margin: { top: '20mm', right: '18mm', bottom: '25mm', left: '18mm' },
  });

  return destPath;
}

/**
 * Navigate directly to print route for unified report and capture PDF via page.pdf().
 */
export async function captureUnifiedReportPdf(page: Page, personaName: string) {
  const safePersona = personaName.toLowerCase();
  const fileName = `${personaName}-Full-Report.pdf`;
  const destDir = path.join(PDF_OUTPUT_DIR, safePersona);
  ensureDir(destDir);
  const destPath = path.join(destDir, fileName);

  // Navigate directly to print route (no AppShell)
  await page.goto('/report/print/unified');
  await page.waitForSelector('#unified-strategic-briefing', { state: 'attached' });
  await page.waitForTimeout(3000); // let all charts/data settle

  // Capture PDF with footer
  await page.pdf({
    path: destPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: HEADER_TEMPLATE,
    footerTemplate: FOOTER_TEMPLATE,
    margin: { top: '20mm', right: '18mm', bottom: '25mm', left: '18mm' },
  });

  return destPath;
}

/**
 * Navigate to Report Center, switch to AI-Powered Briefing mode,
 * generate AI briefing, then navigate to the clean print route and capture PDF via page.pdf().
 *
 * The generation step still uses Report Center UI (button click triggers LLM call).
 * ReportCenter persists the narrative to localStorage, so after generation we
 * navigate to /report/print/ai-briefing which reads it back — producing a clean
 * PDF without Report Center UI chrome (mode selector, QA banners, sidebar).
 */
export async function captureAIBriefingPdf(page: Page, personaName: string) {
  const safePersona = personaName.toLowerCase();
  const fileName = `${personaName}-AI-Briefing.pdf`;
  const destDir = path.join(PDF_OUTPUT_DIR, safePersona);
  ensureDir(destDir);
  const destPath = path.join(destDir, fileName);

  // Navigate to Report Center
  await navigateToTool(page, 'Report Center');
  await page.waitForTimeout(500);

  // Switch to AI-Powered Briefing mode
  await page.getByText('AI-Powered Briefing').click();
  await page.waitForTimeout(500);

  // Click "Generate AI Briefing" button
  await page.getByRole('button', { name: /Generate AI Briefing/i }).click();

  // Wait for the LLM generation to complete — spinner disappears and narrative renders
  await page.waitForSelector('#llm-strategic-briefing', { timeout: AI_BRIEFING_GENERATION_TIMEOUT });
  await page.waitForTimeout(3000); // let the report render fully

  // Navigate to clean print route for capture (no Report Center chrome)
  await page.goto('/report/print/ai-briefing');
  await page.waitForSelector('#llm-strategic-briefing', { state: 'attached' });
  await page.waitForTimeout(3000); // let charts/fonts settle

  // Capture PDF with footer
  await page.pdf({
    path: destPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: HEADER_TEMPLATE,
    footerTemplate: FOOTER_TEMPLATE,
    margin: { top: '20mm', right: '18mm', bottom: '25mm', left: '18mm' },
  });

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
