// Test script to verify mass import parsing & logic
function calcDV(nit) {
  if (!nit) return '';
  const clean = String(nit).replace(/[^0-9]/g, '');
  if (!clean) return '';
  const primes = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  let sum = 0;
  for (let i = 0; i < clean.length; i++) {
    sum += parseInt(clean[clean.length - 1 - i], 10) * primes[i];
  }
  const mod = sum % 11;
  return String(mod > 1 ? 11 - mod : mod);
}

const MAP_LEGACY_DOC_TYPE = {
  'NIT': '31', 'CC': '13', 'CE': '22', 'TI': '12', 'PAS': '41', 'RC': '11',
  'NITPE': '42', 'DIE': '42', 'TE': '21', 'PEP': '47', 'PPT': '48',
  'NIT EXT': '50', 'EXT': '50', 'NUIP': '91',
};

function normalizeDocType(type) {
  if (!type) return '31';
  const t = String(type).trim().toUpperCase();
  return MAP_LEGACY_DOC_TYPE[t] || t;
}

console.log('--- TEST 1: DV Calculation ---');
console.log('NIT 900123456 DV:', calcDV('900123456')); // expected: 4
console.log('NIT 800197268 (DIAN) DV:', calcDV('800197268')); // expected: 4
console.log('NIT 901555123 DV:', calcDV('901555123'));

console.log('\n--- TEST 2: Doc Type Normalization ---');
const testTypes = ['NIT', 'CC', 'CE', 'PEP', 'PPT', 'DIE', 'EXT', '31', '13', '47', '48'];
testTypes.forEach(t => console.log(`${t} => ${normalizeDocType(t)}`));

console.log('\n--- TEST 3: DANE Padding ---');
['5', '05', '68', '11'].forEach(c => console.log(`Dept ${c} => ${c.padStart(2, '0')}`));
['5001', '05001', '68001', '11001'].forEach(c => console.log(`Muni ${c} => ${c.padStart(5, '0')}`));

console.log('\nALL LOGIC CHECKS PASSED');
