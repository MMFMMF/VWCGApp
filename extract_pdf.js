import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('docs/Vwcg Unified App Spec V1.pdf');

// Check if pdf is a function or if it has a default property
const parse = pdf.default || pdf;

parse(dataBuffer).then(function (data) {
    console.log(data.text);
});
