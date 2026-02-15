const pdf = require('pdf-parse');
console.log('Type of pdf:', typeof pdf);
console.log('Keys:', Object.keys(pdf));
console.log('Is valid function:', typeof pdf === 'function');
if (typeof pdf === 'object') {
    console.log('default export:', pdf.default);
}
