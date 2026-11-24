const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db');

// Verificar si ya existe
const existing = db.prepare("SELECT * FROM niif_assets WHERE code = '15280506' OR invoice_number = 'X767-4010516'").get();
if (existing) {
  console.log('El activo ya existe en la base de datos:', existing);
  process.exit(0);
}

// Generar id de 15 caracteres en formato pocketbase
function genId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  for (let i = 0; i < 15; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

const id = genId();

const asset = {
  id,
  code: '15280506',
  name: 'CEL5G SAMSUNG S25ULT 256GB',
  cost: 3999990,
  useful_life_niif: 120,
  useful_life_fiscal: 120,
  depreciation_method: 'linea_recta',
  residual_value: 0,
  impairment: 0,
  revaluation: 0,
  location: 'OFICINA',
  active: 1,
  cost_center_id: '',
  owner_id: '',
  category_id: 'guutxjjf4a7oyy5', // PRO - EQUIPOS PROCESAMIENTO DE DATOS
  parent_asset_id: '',
  status: 'active',
  brand: 'SAMSUNG',
  model: 'EJ3200/5-45678',
  serial_number: '',
  color: '',
  manufacturer: 'SAMSUNG',
  provider_id: 'jc05bf259hm5t3l', // COLOMBIANA DE COMERCIO S.A
  invoice_number: 'X767-4010516',
  invoice_date: '2026-11-13',
  purchase_date: '2026-11-13',
  start_service_date: '2026-11-13',
  qr_code: '15280506',
  photo_url: '',
  is_depreciable: 1,
  initial_depreciation_niif: 0,
  initial_depreciation_fiscal: 0,
  accumulated_depreciation_niif: 0,
  accumulated_depreciation_fiscal: 0,
  last_depreciation_period: '2025-12',
  is_immediate_depreciation: 0
};

const keys = Object.keys(asset);
const placeholders = keys.map(() => '?').join(', ');
const values = keys.map(k => asset[k]);

const stmt = db.prepare(`INSERT INTO niif_assets (${keys.join(', ')}) VALUES (${placeholders})`);
stmt.run(...values);

console.log('Activo registrado con éxito en DOMESTIKO SAS (pb_data/data.db):', {
  id: asset.id,
  code: asset.code,
  name: asset.name,
  cost: asset.cost,
  invoice: asset.invoice_number,
  provider: 'COLOMBIANA DE COMERCIO S.A'
});

db.close();
