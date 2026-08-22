const fs = require('fs');
const XLSX = require('xlsx');

const filePath = 'c:\\Users\\JULIAN\\Desktop\\GravyLocalTABS\\DatosReferencia\\TERCEROS_JED.xlsx';
const buf = fs.readFileSync(filePath);
const wb = XLSX.read(buf, { type: 'buffer' });

console.log('Sheet Names:', wb.SheetNames);
wb.SheetNames.forEach(sheetName => {
  const ws = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
  console.log(`\n--- Sheet: ${sheetName} (${json.length} rows) ---`);
  if (json.length > 0) {
    console.log('Headers:', Object.keys(json[0]));
    console.log('First 3 rows:', json.slice(0, 3));
  }
});
