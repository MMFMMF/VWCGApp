const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    const pdfPath = 'file:///' + path.join('C:', 'Users', 'Kamyar', 'Downloads', 'VWCG_Executive_Strategic_Report.pdf').replace(/\\/g, '/');
    
    console.log('Opening PDF:', pdfPath);
    
    await page.setViewport({ width: 1200, height: 1600 });
    await page.goto(pdfPath, { waitUntil: 'networkidle0' });
    
    // Take screenshot
    const screenshotPath = path.join('C:', 'Users', 'Kamyar', 'Downloads', 'PDF_Audit_Screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log('Screenshot saved to:', screenshotPath);
    
    await browser.close();
})();
