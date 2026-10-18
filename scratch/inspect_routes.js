const fs = require('fs');

const content = fs.readFileSync('c:\\Users\\JULIAN\\Desktop\\GravyLocalTABS\\pb_hooks\\dian.pb.js', 'utf8');
const routes = content.match(/routerAdd\(['"][A-Z]+['"],\s*['"][^'"]+['"]/g) || [];
console.log('Routes in dian.pb.js:', routes);

// Check einvoice_method usages
const matches = content.match(/einvoice_method/g) || [];
console.log('einvoice_method occurrences:', matches.length);
