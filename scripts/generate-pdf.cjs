const puppeteer = require('puppeteer');
const path = require('path');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Use a taller viewport to see more content
    await page.setViewport({ width: 1920, height: 2400 });
    
    console.log('Loading application...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
    await delay(1000);
    
    // Navigate to AI Readiness via sidebar click
    console.log('Setting AI Readiness data...');
    await page.click('a[href="/tools/ai-readiness"]');
    await delay(1000);
    
    // Set all sliders to 85
    await page.evaluate(() => {
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.value = 85;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
            slider.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
    console.log('  ✓ Set all 6 sliders to 85%');
    await delay(500);
    
    // Navigate to SWOT via sidebar
    console.log('Setting SWOT data...');
    await page.click('a[href="/tools/swot"]');
    await delay(1000);
    
    // Type in textarea and add strength
    await page.evaluate(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
            textarea.value = 'Strong leadership team';
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    await delay(300);
    
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const addBtn = btns.find(b => b.textContent.includes('Add'));
        if (addBtn) addBtn.click();
    });
    console.log('  ✓ Added strength entry');
    await delay(500);
    
    // Navigate to Advisor Readiness
    console.log('Setting Advisor Readiness data...');
    await page.click('a[href="/tools/advisor-readiness"]');
    await delay(1000);
    
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const autoFill = btns.find(b => b.textContent.includes('Auto-fill'));
        if (autoFill) autoFill.click();
    });
    console.log('  ✓ Auto-filled answers');
    await delay(500);
    
    // Navigate to Report Center
    console.log('Navigating to Report Center...');
    await page.click('a[href="/tools/report"]');
    await delay(1000);
    
    // Select the checkboxes for tools with data
    await page.evaluate(() => {
        const items = document.querySelectorAll('.cursor-pointer:not(.cursor-not-allowed)');
        items.forEach(item => {
            if (!item.classList.contains('opacity-60')) {
                item.click();
            }
        });
    });
    console.log('  ✓ Selected report sections');
    await delay(500);
    
    // Click Show Print Preview
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const previewBtn = btns.find(b => b.textContent.includes('Show Print Preview'));
        if (previewBtn) previewBtn.click();
    });
    console.log('  ✓ Showing print preview');
    await delay(3000);
    
    // Find the preview container
    const previewContainer = await page.$('#report-preview-container');
    
    if (previewContainer) {
        console.log('Found report preview, getting full dimensions...');
        
        // Get the actual scroll height of the container
        const dimensions = await page.evaluate(() => {
            const container = document.getElementById('report-preview-container');
            return {
                width: container.offsetWidth,
                height: container.scrollHeight,
                viewportHeight: container.offsetHeight
            };
        });
        
        console.log(`  Preview dimensions: ${dimensions.width}x${dimensions.height}`);
        
        // Scroll the preview container to get all content visible
        await page.evaluate(() => {
            const container = document.getElementById('report-preview-container');
            const parent = container.parentElement;
            parent.style.height = 'auto';
            parent.style.maxHeight = 'none';
            parent.style.overflow = 'visible';
        });
        await delay(1000);
        
        // Now screenshot the full container
        const imageBuffer = await previewContainer.screenshot({
            type: 'png',
            omitBackground: false
        });
        
        console.log(`  Captured ${imageBuffer.length} bytes`);
        
        // Create PDF with the image
        const pdfPage = await browser.newPage();
        const base64Image = imageBuffer.toString('base64');
        
        await pdfPage.setContent(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @page { margin: 0; size: A4; }
                    body { 
                        margin: 0; 
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        background: white;
                    }
                    img {
                        width: 100%;
                        height: auto;
                    }
                </style>
            </head>
            <body>
                <img src="data:image/png;base64,${base64Image}" />
            </body>
            </html>
        `, { waitUntil: 'networkidle0' });
        
        await delay(500);
        
        const outputPath = path.join('C:', 'Users', 'Kamyar', 'Downloads', 'VWCG_Executive_Strategic_Report.pdf');
        await pdfPage.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '5mm', bottom: '5mm', left: '5mm', right: '5mm' }
        });
        
        console.log(`\n✅ PDF saved to: ${outputPath}`);
        await pdfPage.close();
    } else {
        console.log('ERROR: Preview container not found!');
    }
    
    await browser.close();
    console.log('Done!');
})();
