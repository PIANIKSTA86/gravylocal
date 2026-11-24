const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const db = new DatabaseSync('pb_data/data.db');

console.log('=== 1. VERIFICACIÓN DE EMPRESA ===');
try {
  const companySetting = db.prepare("SELECT value FROM settings WHERE key = 'company_name' OR key = 'general_company_name'").all();
  console.log('Company setting:', companySetting);
} catch (e) {
  console.log('Error reading company setting:', e.message);
}

console.log('\n=== 2. FORMATO DE FECHAS EN TRANSACTIONS ===');
const withTime = db.prepare("SELECT COUNT(*) as cnt FROM transactions WHERE date LIKE '% %' OR date LIKE '%T%'").get();
const totalTx = db.prepare("SELECT COUNT(*) as cnt FROM transactions").get();
console.log(`Total tx: ${totalTx.cnt}, Con hora: ${withTime.cnt}`);

const dateSamples = db.prepare("SELECT date FROM transactions WHERE date LIKE '% %' LIMIT 5").all();
console.log('Ejemplos con hora:', dateSamples);

console.log('\n=== 3. CUENTAS CONTABLES Y SUS TIPOS/PADRES ===');
const accountsSummary = db.prepare(`
  SELECT 
    SUBSTR(code, 1, 1) as clase, 
    COUNT(*) as total_cuentas,
    SUM(CASE WHEN parent_code IS NULL OR parent_code = '' THEN 1 ELSE 0 END) as sin_padre,
    MIN(LENGTH(code)) as min_len,
    MAX(LENGTH(code)) as max_len
  FROM accounts
  GROUP BY SUBSTR(code, 1, 1)
  ORDER BY clase
`).all();
console.log('Resumen de cuentas por clase:', accountsSummary);

console.log('\n=== 4. ASIGNACIÓN EN TX_LINES: ¿A QUÉ NIVEL SE REGISTRA? ===');
const linesLevel = db.prepare(`
  SELECT 
    LENGTH(a.code) as code_len,
    COUNT(*) as cnt,
    SUM(l.debit) as total_debit,
    SUM(l.credit) as total_credit
  FROM tx_lines l
  JOIN accounts a ON a.id = l.account_id
  GROUP BY LENGTH(a.code)
  ORDER BY code_len
`).all();
console.log('tx_lines agrupadas por longitud de código de cuenta:', linesLevel);

console.log('\n=== 5. PERIODOS DE CIERRE REGISTRADOS EN SETTINGS ===');
const periodosSetting = db.prepare("SELECT value FROM settings WHERE key = 'periodos_cierre'").all();
console.log('periodos_cierre:', periodosSetting);

console.log('\n=== 6. ASIENTOS DE CIERRE EN TRANSACTIONS ===');
const cierreTx = db.prepare(`
  SELECT t.id, t.number, t.date, t.description, t.status, tt.name as type_name, tt.prefix
  FROM transactions t
  LEFT JOIN tx_types tt ON tt.id = t.tx_type_id
  WHERE t.description LIKE '%cierre%' OR tt.prefix = 'CM' OR tt.name LIKE '%cierre%'
`).all();
console.log('Transacciones de cierre encontradas:', cierreTx);
