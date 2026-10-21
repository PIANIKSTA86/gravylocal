const fs = require('fs');
const { daneMap, nameMap } = JSON.parse(fs.readFileSync('scratch/matias_cities_map.json', 'utf8'));

console.log('Testing resolution:');
function resolve(cityCode, cityName) {
  const code = String(cityCode || '').trim();
  if (daneMap[code]) return daneMap[code];
  const normName = String(cityName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (nameMap[normName]) return nameMap[normName];
  if (normName.includes('cali')) return 1006;
  if (normName.includes('bogot')) return 149;
  if (normName.includes('medell')) return 1;
  return 1006;
}

console.log('76001 ->', resolve('76001', 'CALI')); // 1006
console.log('CALI without code ->', resolve('', 'CALI')); // 1006
console.log('11001 ->', resolve('11001', 'BOGOTA')); // 149
console.log('05001 ->', resolve('05001', 'MEDELLIN')); // 1
console.log('Empty ->', resolve('', '')); // 1006
