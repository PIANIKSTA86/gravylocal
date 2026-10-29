const fs = require('fs');
const path = require('path');

const bundleDir = path.join(__dirname, '..', 'pb_public', 'assets');
const files = fs.readdirSync(bundleDir);
const mainFile = files.find(f => f.startsWith('main-') && f.endsWith('.js'));
if (!mainFile) {
  console.error('No main bundle found');
  process.exit(1);
}

const content = fs.readFileSync(path.join(bundleDir, mainFile), 'utf8');

// Check if renderAgendaPagos exists in bundle
console.log('Main bundle:', mainFile);
console.log('Contains renderAgendaPagos:', content.includes('renderAgendaPagos'));
console.log('Contains agenda-calendar-container:', content.includes('agenda-calendar-container'));
console.log('Contains cal-month-title:', content.includes('cal-month-title'));
console.log('Search for calTitle occurrences:', (content.match(/calTitle/g) || []).length);
