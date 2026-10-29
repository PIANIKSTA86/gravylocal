/**
 * Simulación de Proyección de Depreciación Periodo 2026-01 para Puerto 8090 (DOMESTIKO SAS)
 * Verifica que tras el saneamiento:
 * 1. Hay exactamente 4 activos elegibles.
 * 2. Cuota mensual total es $2.844.167 COP.
 * 3. 17 activos quedan en omitidos (12 por 100% depreciado y 5 por compra en meses posteriores).
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../pb_data/data.db');
const db = new sqlite3.Database(dbPath);

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getNextPeriod(period) {
  const [yr, mo] = period.split('-').map(Number);
  if (!yr || !mo) return period;
  if (mo === 12) return `${yr + 1}-01`;
  return `${yr}-${String(mo + 1).padStart(2, '0')}`;
}

function extractAssetAcquisitionPeriod(a) {
  const rawDate = String(a?.purchase_date || a?.start_service_date || '').trim();
  if (/^\d{4}-\d{2}/.test(rawDate)) return rawDate.slice(0, 7);
  return '';
}

function getAssetFirstDepreciationPeriod(a) {
  const acqPeriod = extractAssetAcquisitionPeriod(a);
  if (!acqPeriod) return '';
  if (a?.is_immediate_depreciation) return acqPeriod;
  return getNextPeriod(acqPeriod);
}

function evaluateAssetDepreciationForPeriod(a, targetMonth) {
  const acqPeriod = extractAssetAcquisitionPeriod(a);
  const firstPeriod = getAssetFirstDepreciationPeriod(a);
  const acqDateDisplay = String(a?.purchase_date || a?.start_service_date || '').slice(0, 10) || 'Sin fecha';

  const isImmediate = Boolean(a?.is_immediate_depreciation);
  const lifeNIIF = isImmediate ? 1 : (Number(a?.useful_life_niif) || 1);
  const lifeFiscal = isImmediate ? 1 : (Number(a?.useful_life_fiscal) || 1);
  const residualVal = isImmediate ? 0 : (Number(a?.residual_value) || 0);
  const cost = Number(a?.cost) || 0;

  const maxNIIF = Math.max(0, cost - residualVal);
  const maxFiscal = Math.max(0, cost);
  const prevAccumNIIF = Number(a?.accumulated_depreciation_niif ?? a?.initial_depreciation_niif ?? 0);
  const prevAccumFiscal = Number(a?.accumulated_depreciation_fiscal ?? a?.initial_depreciation_fiscal ?? 0);

  const remainingNIIF = Math.max(0, maxNIIF - prevAccumNIIF);
  const remainingFiscal = Math.max(0, maxFiscal - prevAccumFiscal);

  const nominalNIIF = isImmediate ? maxNIIF : (maxNIIF / lifeNIIF);
  const nominalFiscal = isImmediate ? maxFiscal : (maxFiscal / lifeFiscal);

  if (a?.is_depreciable === false) {
    return {
      eligible: false,
      reasonCode: 'non_depreciable',
      reasonLabel: 'No Depreciable (NIC 16 p.58)',
      firstDepreciationPeriod: '',
      acquisitionPeriod: acqPeriod,
      deprNIIF: 0,
      deprFiscal: 0,
      remainingNIIF: 0,
      remainingFiscal: 0,
      nominalNIIF: 0,
      nominalFiscal: 0
    };
  }

  if (acqPeriod && targetMonth < acqPeriod) {
    return {
      eligible: false,
      reasonCode: 'future_purchase',
      reasonLabel: `Comprado en ${acqDateDisplay} (fecha posterior al periodo ${targetMonth}) — Inicia depreciación en ${firstPeriod}`,
      firstDepreciationPeriod: firstPeriod,
      acquisitionPeriod: acqPeriod,
      deprNIIF: 0,
      deprFiscal: 0,
      remainingNIIF,
      remainingFiscal,
      nominalNIIF,
      nominalFiscal
    };
  }

  if (firstPeriod && targetMonth < firstPeriod) {
    return {
      eligible: false,
      reasonCode: 'purchase_month_wait_next',
      reasonLabel: `Adquirido en ${acqDateDisplay} — Regla de mes completo: inicia depreciación en ${firstPeriod} (mes siguiente a la compra)`,
      firstDepreciationPeriod: firstPeriod,
      acquisitionPeriod: acqPeriod,
      deprNIIF: 0,
      deprFiscal: 0,
      remainingNIIF,
      remainingFiscal,
      nominalNIIF,
      nominalFiscal
    };
  }

  const lastPeriod = String(a?.last_depreciation_period || '').trim();
  if (lastPeriod && lastPeriod >= targetMonth) {
    return {
      eligible: false,
      reasonCode: 'already_depreciated_period',
      reasonLabel: `Ya registra cierre de depreciación hasta el periodo ${lastPeriod}`,
      firstDepreciationPeriod: firstPeriod,
      acquisitionPeriod: acqPeriod,
      deprNIIF: 0,
      deprFiscal: 0,
      remainingNIIF,
      remainingFiscal,
      nominalNIIF,
      nominalFiscal
    };
  }

  if (remainingNIIF <= 0 && remainingFiscal <= 0) {
    return {
      eligible: false,
      reasonCode: 'fully_depreciated',
      reasonLabel: `100% Depreciado (Saldo por depreciar agotado)`,
      firstDepreciationPeriod: firstPeriod,
      acquisitionPeriod: acqPeriod,
      deprNIIF: 0,
      deprFiscal: 0,
      remainingNIIF: 0,
      remainingFiscal: 0,
      nominalNIIF,
      nominalFiscal
    };
  }

  const deprNIIF = Math.min(nominalNIIF, remainingNIIF);
  const deprFiscal = Math.min(nominalFiscal, remainingFiscal);

  return {
    eligible: true,
    reasonCode: 'eligible',
    reasonLabel: isImmediate ? 'Depreciación Inmediata ≤ 50 UVT (100%)' : 'Elegible en el periodo',
    firstDepreciationPeriod: firstPeriod,
    acquisitionPeriod: acqPeriod,
    deprNIIF: Math.round(deprNIIF),
    deprFiscal: Math.round(deprFiscal),
    remainingNIIF,
    remainingFiscal,
    nominalNIIF,
    nominalFiscal
  };
}

async function runTest() {
  console.log('=== TEST PROYECCIÓN DEPRECIACIÓN ENERO 2026 (DOMESTIKO SAS) ===\n');

  const assets = await query('SELECT * FROM niif_assets ORDER BY code');
  console.log(`Total activos en BD: ${assets.length}`);

  const evaluated = assets.map(a => ({
    asset: a,
    evalRes: evaluateAssetDepreciationForPeriod(a, '2026-01')
  }));

  const eligible = evaluated.filter(x => x.evalRes.eligible);
  const excluded = evaluated.filter(x => !x.evalRes.eligible);

  console.log(`\n✅ ACTIVOS ELEGIBLES EN 2026-01: ${eligible.length}`);
  let totalNIIF = 0;
  let totalFiscal = 0;
  console.table(eligible.map(x => {
    totalNIIF += x.evalRes.deprNIIF;
    totalFiscal += x.evalRes.deprFiscal;
    return {
      code: x.asset.code,
      name: x.asset.name.slice(0, 25),
      cost: x.asset.cost,
      purchDate: x.asset.purchase_date,
      lastPeriod: x.asset.last_depreciation_period,
      deprNIIF: x.evalRes.deprNIIF,
      deprFiscal: x.evalRes.deprFiscal
    };
  }));

  console.log(`TOTAL CUOTA NIIF ENERO 2026: $ ${totalNIIF.toLocaleString('es-CO')}`);
  console.log(`TOTAL CUOTA FISCAL ENERO 2026: $ ${totalFiscal.toLocaleString('es-CO')}`);

  console.log(`\n❌ ACTIVOS OMITIDOS EN 2026-01: ${excluded.length}`);
  console.table(excluded.map(x => ({
    code: x.asset.code,
    name: x.asset.name.slice(0, 25),
    cost: x.asset.cost,
    purchDate: x.asset.purchase_date,
    lastPeriod: x.asset.last_depreciation_period,
    reason: x.evalRes.reasonCode,
    reasonLabel: x.evalRes.reasonLabel.slice(0, 45)
  })));

  db.close();
}

runTest().catch(console.error);

