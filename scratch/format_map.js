const fs = require('fs');
const { daneMap } = JSON.parse(fs.readFileSync('scratch/matias_cities_map.json', 'utf8'));
const entries = Object.entries(daneMap).map(([k, v]) => `"${k}":${v}`).join(',');
console.log('Total entries:', Object.keys(daneMap).length);
console.log('Length in chars:', entries.length);
console.log('Sample:', entries.slice(0, 100));
