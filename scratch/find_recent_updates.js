const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

console.log('=== VERIFICANDO ÚLTIMAS ACTUALIZACIONES EN PB_DATA/DATA.DB ===');

// 1. Cuentas creadas o actualizadas recientemente
try {
  const recentAcc = db.prepare("SELECT id, code, name, parent_code, level, created, updated FROM accounts ORDER BY updated DESC LIMIT 10").all();
  console.log('Cuentas recientemente actualizadas:');
  console.log(recentAcc);
} catch (e) {
  console.log('Error accounts:', e.message);
}

// 2. Transacciones creadas o actualizadas recientemente
try {
  const recentTx = db.prepare("SELECT id, number, date, description, created, updated FROM transactions ORDER BY updated DESC LIMIT 5").all();
  console.log('\nTransacciones recientemente actualizadas:');
  console.log(recentTx);
} catch (e) {
  console.log('Error transactions:', e.message);
}

// 3. Settings actualizadas recientemente
try {
  const recentSet = db.prepare("SELECT key, updated FROM settings ORDER BY updated DESC LIMIT 5").all();
  console.log('\nSettings recientemente actualizadas:');
  console.log(recentSet);
} catch (e) {
  console.log('Error settings:', e.message);
}

// 4. Ver si hay alguna otra base de datos de DOMESTIKO SAS o en empresas/
const empresasTxt = require('fs').readFileSync('empresas/empresas.txt', 'utf8');
console.log('\nEmpresas configuradas:\n' + empresasTxt);
