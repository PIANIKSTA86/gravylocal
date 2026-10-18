const fs = require('fs');

const content = fs.readFileSync('c:\\Users\\JULIAN\\Desktop\\GravyLocalTABS\\frontend\\src\\modules\\nomina.ts', 'utf8');
const matches = content.match(/dian\/nomina[^\'\"\`\s]*/g) || [];
console.log('Nomina DIAN calls in nomina.ts:', [...new Set(matches)]);

const dsContent = fs.readFileSync('c:\\Users\\JULIAN\\Desktop\\GravyLocalTABS\\frontend\\src\\modules\\doc-soporte.ts', 'utf8');
const dsMatches = dsContent.match(/dian\/[^\'\"\`\s]*/g) || [];
console.log('DS DIAN calls in doc-soporte.ts:', [...new Set(dsMatches)]);
