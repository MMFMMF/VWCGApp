/**
 * generate-print-pdf.cjs — Puppeteer print-ready PDF generation for VWCG reports
 *
 * Uses Puppeteer's page.pdf() which invokes the same Chromium print engine
 * as window.print(), producing output identical to the browser print experience.
 *
 * Usage:
 *   node scripts/generate-print-pdf.cjs
 *   node scripts/generate-print-pdf.cjs --report=strategic-briefing
 *   node scripts/generate-print-pdf.cjs --output=./my-report.pdf
 *   node scripts/generate-print-pdf.cjs --url=http://localhost:5174 --wait=8000
 *
 * Prerequisites:
 *   - Dev server running: npm run dev
 *   - For AI Briefing: narrative must be generated in browser first (requires API key)
 *   - puppeteer installed (already in devDependencies)
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Parse CLI args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const match = arg.match(/^--(\w+)=(.+)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const BASE_URL = args.url || 'http://localhost:5173';
const REPORT_MODE = args.report || 'strategic-briefing'; // 'strategic-briefing' | 'ai-briefing'
const WAIT_MS = parseInt(args.wait || '5000', 10);

// Build default output filename
const dateStamp = new Date().toISOString().split('T')[0];
const defaultOutput = path.resolve(
  `VWCG-${REPORT_MODE === 'ai-briefing' ? 'AI-Briefing' : 'Strategic-Briefing'}-${dateStamp}.pdf`
);
const OUTPUT_PATH = args.output ? path.resolve(args.output) : defaultOutput;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  console.log(`[generate-print-pdf] Starting...`);
  console.log(`  URL:    ${BASE_URL}`);
  console.log(`  Mode:   ${REPORT_MODE}`);
  console.log(`  Output: ${OUTPUT_PATH}`);
  console.log(`  Wait:   ${WAIT_MS}ms`);
  console.log();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // Navigate to the app
    console.log('[1/6] Loading application...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(1000);

    // Navigate to Report Center
    console.log('[2/6] Navigating to Report Center...');
    await page.goto(`${BASE_URL}/tools/report`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(2000);

    // Select report mode
    console.log(`[3/6] Selecting report mode: ${REPORT_MODE}...`);
    if (REPORT_MODE === 'ai-briefing') {
      // Click the AI-Powered Briefing mode button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const aiBtn = buttons.find((b) => b.textContent.includes('AI-Powered Briefing'));
        if (aiBtn) aiBtn.click();
      });
      await delay(1000);
    }
    // strategic-briefing is the default mode, no click needed

    // Determine which report element to wait for
    const reportSelector =
      REPORT_MODE === 'ai-briefing'
        ? '#llm-strategic-briefing'
        : '#unified-strategic-briefing';

    // Wait for the report to render
    console.log(`[4/6] Waiting for report to render (${reportSelector})...`);
    try {
      await page.waitForSelector(reportSelector, { timeout: 15000 });
    } catch {
      console.error(
        `ERROR: Report element ${reportSelector} not found within 15s.`
      );
      if (REPORT_MODE === 'ai-briefing') {
        console.error(
          'For AI Briefing, the narrative must be generated in the browser first.'
        );
        console.error(
          'Load the app, go to Report Center, generate the AI briefing, then run this script.'
        );
      }
      process.exit(1);
    }

    // Expand the preview container to show all content (remove scroll constraints)
    console.log('[5/6] Preparing content for print...');
    await page.evaluate((selector) => {
      // Find the report element and ensure its scroll parents are fully expanded
      const report = document.querySelector(selector);
      if (!report) return;

      let el = report.parentElement;
      while (el && el !== document.body) {
        el.style.height = 'auto';
        el.style.maxHeight = 'none';
        el.style.overflow = 'visible';
        el = el.parentElement;
      }

      // Remove scaling transforms from the preview container
      const previewContainer = report.closest('[class*="transform"]');
      if (previewContainer) {
        previewContainer.style.transform = 'none';
        previewContainer.style.width = '100%';
        previewContainer.style.maxWidth = 'none';
      }
    }, reportSelector);

    // Wait for fonts and charts to settle
    await delay(WAIT_MS);

    // Generate PDF using Chromium's print engine
    console.log('[6/6] Generating PDF...');
    await page.pdf({
      path: OUTPUT_PATH,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: {
        top: '20mm',
        right: '18mm',
        bottom: '20mm',
        left: '18mm',
      },
    });

    console.log();
    console.log(`PDF saved to: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('PDF generation failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
