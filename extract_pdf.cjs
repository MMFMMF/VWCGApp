const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('docs/Vwcg Unified App Spec V1.pdf');

pdf(dataBuffer).then(function (data) {
    console.log(data.text);
}).catch(function (error) {
    console.error('Error parsing PDF:', error);
});
