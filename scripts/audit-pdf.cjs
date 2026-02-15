const fs = require('fs');
const path = require('path');

(async () => {
    const pdf = (await import('pdf-parse')).default;
    
    const pdfPath = path.join('C:', 'Users', 'Kamyar', 'Downloads', 'VWCG_Executive_Strategic_Report.pdf');
    const dataBuffer = fs.readFileSync(pdfPath);
    
    const data = await pdf(dataBuffer);
    
    console.log('=== PDF AUDIT ===\n');
    console.log('Number of pages:', data.numpages);
    console.log('PDF Version:', data.info?.PDFFormatVersion || 'Unknown');
    console.log('\n=== TEXT CONTENT ===\n');
    console.log(data.text);
})();
