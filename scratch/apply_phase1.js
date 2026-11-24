const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const crypto = require('crypto');

// 1. Respaldo de seguridad previo
fs.copyFileSync('pb_data/data.db', `pb_data/data.db.bak_pre_phase1_${Date.now()}`);
console.log('Respaldo de seguridad creado con éxito.');

const db = new DatabaseSync('pb_data/data.db');

function randomId(len = 15) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  for (let i = 0; i < len; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

const accountsToInsert = [
  {
    code: '47',
    name: 'CORRECCION MONETARIA',
    level: 2,
    parent_code: '4',
    account_type_id: 'u4dsw8qlzs6847q',
    nature: 'credit'
  },
  {
    code: '236701',
    name: 'A PERSONAS DEL REGIMEN SIMPLE',
    level: 4,
    parent_code: '2367',
    account_type_id: 'byvj9nwnj8e3x9y',
    nature: 'credit'
  },
  {
    code: '423580',
    name: 'FLETES',
    level: 4,
    parent_code: '4235',
    account_type_id: 'u4dsw8qlzs6847q',
    nature: 'credit'
  },
  {
    code: '519521',
    name: 'GASTOS DE REPRESENTACION Y ATENCIONES',
    level: 4,
    parent_code: '5195',
    account_type_id: 'e4elefsrrzv2e3a',
    nature: 'debit'
  },
  {
    code: '620535',
    name: 'MERCANCIAS NO FABRICADAS POR LA EMPRESA',
    level: 4,
    parent_code: '6205',
    account_type_id: 'sb4ux00heqcxiuy',
    nature: 'debit'
  },
  {
    code: '622535',
    name: 'DEVOLUCIONES EN COMPRAS (CR)',
    level: 4,
    parent_code: '6225',
    account_type_id: 'sb4ux00heqcxiuy',
    nature: 'debit'
  }
];

const insertStmt = db.prepare(`
  INSERT INTO accounts (
    id, code, name, level, parent_code, account_type_id, active, nature,
    requires_third_party, maneja_cruce, maneja_retenciones, tipos_retencion,
    ret_rate_reterenta, ret_rate_reteiva, ret_rate_reteica,
    niif_classification, niif_standard, niif_statement, niif_cf_category
  ) VALUES (
    ?, ?, ?, ?, ?, ?, 1, ?,
    0, 0, 0, '',
    0, 0, 0,
    '', '', '', ''
  )
`);

for (const acc of accountsToInsert) {
  const existing = db.prepare('SELECT id FROM accounts WHERE code = ?').get(acc.code);
  if (existing) {
    console.log(`Cuenta ${acc.code} ya existe.`);
  } else {
    const id = randomId(15);
    insertStmt.run(id, acc.code, acc.name, acc.level, acc.parent_code, acc.account_type_id, acc.nature);
    console.log(`Cuenta ${acc.code} (${acc.name}) insertada con ID: ${id}`);
  }
}

// 2. Limpieza de cuentas test residuales que no tienen movimiento (ej: 9999999, 9993732 si no tienen líneas)
const testAccounts = ['9551094', '9681943', '9842841', '9973449', '9993732', '9999999'];
for (const tc of testAccounts) {
  const lines = db.prepare('SELECT COUNT(*) as cnt FROM tx_lines l JOIN accounts a ON a.id = l.account_id WHERE a.code = ?').get(tc);
  if (lines.cnt === 0) {
    db.prepare('DELETE FROM accounts WHERE code = ?').run(tc);
    console.log(`Cuenta test sin movimientos eliminada: ${tc}`);
  }
}

console.log('Fase 1 completada con éxito en la base de datos.');
