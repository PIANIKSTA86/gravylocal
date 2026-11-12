/**
 * Suite de Verificación QA: Depreciación Proporcional en Mes de Compra por Días Calendario
 */

const assert = require('assert');

function extractAssetAcquisitionPeriod(a) {
  const rawDate = String(a?.start_service_date || a?.purchase_date || a?.invoice_date || '').trim();
  if (!rawDate) return null;
  const m = rawDate.match(/^(\d{4})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}`;
  const d = new Date(rawDate);
  if (!isNaN(d.getTime())) {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }
  return null;
}

function getAssetFirstDepreciationPeriod(a) {
  if (a?.is_depreciable === false) return null;
  return extractAssetAcquisitionPeriod(a);
}

function evaluateAssetDepreciationForPeriod(a, targetPeriod) {
  const cost = Number(a?.cost || 0);
  const isImmediate = a?.is_immediate_depreciation === true;
  const residual = isImmediate ? 0 : Number(a?.residual_value || 0);
  const refDateStr = String(a?.start_service_date || a?.purchase_date || a?.invoice_date || '').trim();
  const acqDateStr = a?.purchase_date || a?.start_service_date || '';
  const acqPeriod = extractAssetAcquisitionPeriod(a);
  const firstEligiblePeriod = getAssetFirstDepreciationPeriod(a);

  const maxNIIF = Math.max(0, cost - residual);
  const maxFiscal = Math.max(0, cost);
  const prevAccumNIIF = Math.min(maxNIIF, Math.max(Number(a?.initial_depreciation_niif || 0), Number(a?.accumulated_depreciation_niif || 0)));
  const prevAccumFiscal = Math.min(maxFiscal, Math.max(Number(a?.initial_depreciation_fiscal || 0), Number(a?.accumulated_depreciation_fiscal || 0)));
  const remainingNIIF = Math.max(0, maxNIIF - prevAccumNIIF);
  const remainingFiscal = Math.max(0, maxFiscal - prevAccumFiscal);

  if (a?.is_depreciable === false) {
    return {
      eligible: false,
      reasonCode: 'non_depreciable',
      reasonLabel: 'Catalogado como No Depreciable (NIC 16)',
      acqDateStr,
      acqPeriod,
      firstEligiblePeriod: null,
      isImmediate: false,
      isProportional: false,
      activeDays: 0,
      totalDaysInMonth: 0,
      deprNIIF: 0,
      deprFiscal: 0,
      remainingNIIF: 0,
      remainingFiscal: 0,
      nominalNIIF: 0,
      nominalFiscal: 0
    };
  }

  // 1. Validar fecha de compra / entrada frente al periodo liquidado (excluir si es compra futura)
  if (firstEligiblePeriod && targetPeriod < firstEligiblePeriod) {
    const reasonLabel = `Comprado en ${acqDateStr || acqPeriod} (fecha posterior al periodo ${targetPeriod}) — Inicia depreciación en ${firstEligiblePeriod}`;
    return {
      eligible: false,
      reasonCode: 'future_purchase',
      reasonLabel,
      acqDateStr,
      acqPeriod,
      firstEligiblePeriod,
      isImmediate,
      isProportional: false,
      activeDays: 0,
      totalDaysInMonth: 0,
      deprNIIF: 0,
      deprFiscal: 0,
      remainingNIIF,
      remainingFiscal,
      nominalNIIF: 0,
      nominalFiscal: 0
    };
  }

  // 2. Validar si el activo ya fue depreciado o tiene corte de saldo inicial igual o posterior al periodo objetivo
  const lastPeriod = (a?.last_depreciation_period || '').trim();
  if (lastPeriod && /^\d{4}-\d{2}$/.test(lastPeriod) && targetPeriod <= lastPeriod) {
    return {
      eligible: false,
      reasonCode: 'already_closed_period',
      reasonLabel: `Ya registra cierre/depreciación hasta el periodo ${lastPeriod}`,
      acqDateStr,
      acqPeriod,
      firstEligiblePeriod,
      isImmediate,
      isProportional: false,
      activeDays: 0,
      totalDaysInMonth: 0,
      deprNIIF: 0,
      deprFiscal: 0,
      remainingNIIF,
      remainingFiscal,
      nominalNIIF: 0,
      nominalFiscal: 0
    };
  }

  // 3. Calcular cuotas del periodo
  const lifeNIIF = isImmediate ? 1 : (Number(a?.useful_life_niif) || 1);
  const lifeFiscal = isImmediate ? 1 : (Number(a?.useful_life_fiscal) || 1);

  const fullNominalNIIF = isImmediate ? maxNIIF : (maxNIIF / lifeNIIF);
  const fullNominalFiscal = isImmediate ? maxFiscal : (maxFiscal / lifeFiscal);

  let nominalNIIF = fullNominalNIIF;
  let nominalFiscal = fullNominalFiscal;
  let isProportional = false;
  let activeDays = 0;
  let totalDaysInMonth = 0;

  // Prorrata por días calendario reales en el mes de adquisición o entrada en operación
  if (!isImmediate && acqPeriod && targetPeriod === acqPeriod) {
    const [yrStr, moStr] = targetPeriod.split('-');
    const yr = Number(yrStr);
    const mo = Number(moStr);
    totalDaysInMonth = new Date(yr, mo, 0).getDate(); // Días reales del mes (28, 29, 30 ó 31)

    let dayOfPurchase = 1;
    const dayMatch = refDateStr.match(/^\d{4}-\d{2}-(\d{1,2})/);
    if (dayMatch) {
      dayOfPurchase = parseInt(dayMatch[1], 10);
    } else {
      const d = new Date(refDateStr);
      if (!isNaN(d.getTime())) {
        dayOfPurchase = d.getUTCDate();
      }
    }
    dayOfPurchase = Math.min(Math.max(1, dayOfPurchase), totalDaysInMonth);

    activeDays = (totalDaysInMonth - dayOfPurchase) + 1;
    if (activeDays < totalDaysInMonth) {
      isProportional = true;
      const proportion = activeDays / totalDaysInMonth;
      nominalNIIF = Math.round(fullNominalNIIF * proportion);
      nominalFiscal = Math.round(fullNominalFiscal * proportion);
    }
  }

  const deprNIIF = Math.min(nominalNIIF, remainingNIIF);
  const deprFiscal = Math.min(nominalFiscal, remainingFiscal);

  if (deprNIIF <= 0 && deprFiscal <= 0) {
    return {
      eligible: false,
      reasonCode: 'fully_depreciated',
      reasonLabel: 'Vida útil agotada (100% depreciado en libros)',
      acqDateStr,
      acqPeriod,
      firstEligiblePeriod,
      isImmediate,
      isProportional: false,
      activeDays,
      totalDaysInMonth,
      deprNIIF: 0,
      deprFiscal: 0,
      remainingNIIF: 0,
      remainingFiscal: 0,
      nominalNIIF: 0,
      nominalFiscal: 0
    };
  }

  return {
    eligible: true,
    reasonCode: 'ok',
    reasonLabel: isImmediate
      ? 'Depreciación Inmediata (<= 50 UVT - 100%)'
      : (isProportional ? `Cuota mensual proporcional (${activeDays}/${totalDaysInMonth} días)` : 'Cuota mensual ordinaria'),
    acqDateStr,
    acqPeriod,
    firstEligiblePeriod,
    isImmediate,
    isProportional,
    activeDays,
    totalDaysInMonth,
    deprNIIF,
    deprFiscal,
    remainingNIIF,
    remainingFiscal,
    nominalNIIF,
    nominalFiscal
  };
}

console.log('=== INICIANDO VALIDACIÓN QA DE DEPRECIACIÓN PROPORCIONAL ===\n');

// TEST 1: Activo comprado el 16 de enero de 2026 (mes de 31 días)
// Costo: $6.000.000, 60 meses, valor residual 0.
// Días activos: (31 - 16) + 1 = 16 días.
// Cuota ordinaria: $100.000. Cuota proporcional: round(100.000 * 16 / 31) = $51.613.
const assetMidMonth = {
  code: 'ACT-MID',
  name: 'Activo Mitad de Mes',
  cost: 6000000,
  useful_life_niif: 60,
  useful_life_fiscal: 60,
  residual_value: 0,
  purchase_date: '2026-01-16',
  is_depreciable: true
};

const resJan = evaluateAssetDepreciationForPeriod(assetMidMonth, '2026-01');
assert.strictEqual(resJan.eligible, true, 'Debe ser elegible en el mes de compra (2026-01)');
assert.strictEqual(resJan.isProportional, true, 'Debe ser identificado como proporcional');
assert.strictEqual(resJan.activeDays, 16, 'Días activos debe ser 16');
assert.strictEqual(resJan.totalDaysInMonth, 31, 'Días de enero debe ser 31');
assert.strictEqual(resJan.deprNIIF, 51613, 'Cuota NIIF enero debe ser $51.613');
console.log('✅ Test 1.1 OK: Compra 2026-01-16 liquida 16/31 días ($51.613)');

// Simular mes siguiente (2026-02): Debe cobrar cuota completa ordinaria ($100.000)
const assetInFeb = {
  ...assetMidMonth,
  accumulated_depreciation_niif: 51613,
  accumulated_depreciation_fiscal: 51613,
  last_depreciation_period: '2026-01'
};
const resFeb = evaluateAssetDepreciationForPeriod(assetInFeb, '2026-02');
assert.strictEqual(resFeb.eligible, true);
assert.strictEqual(resFeb.isProportional, false, 'En febrero ya no es proporcional, es ordinaria');
assert.strictEqual(resFeb.deprNIIF, 100000, 'Cuota febrero debe ser cuota completa ($100.000)');
console.log('✅ Test 1.2 OK: Mes siguiente (2026-02) liquida cuota ordinaria completa ($100.000)');

// Simular mes 61 (último mes de vida útil): Saldo remanente exacto de $48.387
const assetLastMonth = {
  ...assetMidMonth,
  accumulated_depreciation_niif: 6000000 - 48387,
  accumulated_depreciation_fiscal: 6000000 - 48387,
  last_depreciation_period: '2030-12'
};
const resLast = evaluateAssetDepreciationForPeriod(assetLastMonth, '2031-01');
assert.strictEqual(resLast.eligible, true);
assert.strictEqual(resLast.deprNIIF, 48387, 'Debe absorber exactamente el saldo restante ($48.387)');
console.log('✅ Test 1.3 OK: Último mes de vida útil liquida remanente exacto ($48.387) cerrando al 100%');

// TEST 2: Activo comprado el día 1 de enero (2026-01-01): Días activos = 31 -> Cuota 100% ($100.000)
const assetDay1 = {
  code: 'ACT-DAY1',
  name: 'Activo Día 1',
  cost: 6000000,
  useful_life_niif: 60,
  useful_life_fiscal: 60,
  residual_value: 0,
  purchase_date: '2026-01-01',
  is_depreciable: true
};
const resDay1 = evaluateAssetDepreciationForPeriod(assetDay1, '2026-01');
assert.strictEqual(resDay1.eligible, true);
assert.strictEqual(resDay1.isProportional, false, 'Comprado el día 1 deprecia mes completo (no proporcional)');
assert.strictEqual(resDay1.deprNIIF, 100000, 'Cuota día 1 debe ser $100.000');
console.log('✅ Test 2 OK: Comprado el día 1 (2026-01-01) liquida 31/31 = 100% de cuota mensual ($100.000)');

// TEST 3: Activo comprado el día 31 de enero (2026-01-31): Días activos = 1 -> Cuota round(100.000 * 1 / 31) = $3.226
const assetDay31 = {
  code: 'ACT-DAY31',
  name: 'Activo Día 31',
  cost: 6000000,
  useful_life_niif: 60,
  useful_life_fiscal: 60,
  residual_value: 0,
  purchase_date: '2026-01-31',
  is_depreciable: true
};
const resDay31 = evaluateAssetDepreciationForPeriod(assetDay31, '2026-01');
assert.strictEqual(resDay31.eligible, true);
assert.strictEqual(resDay31.isProportional, true);
assert.strictEqual(resDay31.activeDays, 1);
assert.strictEqual(resDay31.deprNIIF, 3226, 'Cuota de 1 día debe ser $3.226');
console.log('✅ Test 3 OK: Comprado el último día (2026-01-31) liquida 1/31 días ($3.226)');

// TEST 4: Activo comprado en fecha futura (2026-06-15) liquidando enero 2026 (2026-01)
const assetFuture = {
  code: 'ACT-FUT',
  name: 'Activo Futuro',
  cost: 6000000,
  useful_life_niif: 60,
  useful_life_fiscal: 60,
  residual_value: 0,
  purchase_date: '2026-06-15',
  is_depreciable: true
};
const resFut = evaluateAssetDepreciationForPeriod(assetFuture, '2026-01');
assert.strictEqual(resFut.eligible, false, 'Activo comprado en junio debe omitirse en enero');
assert.strictEqual(resFut.reasonCode, 'future_purchase');
console.log('✅ Test 4 OK: Activo comprado en junio 2026 permanece omitido en enero 2026');

// TEST 5: Prioridad de start_service_date sobre purchase_date
// Compra: 2026-01-05, Puesta en servicio: 2026-01-20
// Días activos deben ser: (31 - 20) + 1 = 12 días
// Cuota: round(100.000 * 12 / 31) = $38.710
const assetServiceDate = {
  code: 'ACT-SERV',
  name: 'Activo con Puesta en Servicio',
  cost: 6000000,
  useful_life_niif: 60,
  useful_life_fiscal: 60,
  residual_value: 0,
  purchase_date: '2026-01-05',
  start_service_date: '2026-01-20',
  is_depreciable: true
};
const resServ = evaluateAssetDepreciationForPeriod(assetServiceDate, '2026-01');
assert.strictEqual(resServ.eligible, true);
assert.strictEqual(resServ.activeDays, 12, 'Días activos debe regirse por start_service_date (12 días)');
assert.strictEqual(resServ.deprNIIF, 38710, 'Cuota debe ser 12/31 = $38.710');
console.log('✅ Test 5 OK: Puesta en servicio 2026-01-20 prima sobre compra 2026-01-05 (12/31 días = $38.710)');

// TEST 6: Activo de Menor Cuantía (<= 50 UVT) con Depreciación Inmediata
const assetImmediate = {
  code: 'ACT-50UVT',
  name: 'Monitor Menor Cuantía',
  cost: 1800000,
  useful_life_niif: 1,
  useful_life_fiscal: 1,
  residual_value: 0,
  purchase_date: '2026-01-16',
  is_depreciable: true,
  is_immediate_depreciation: true
};
const resImm = evaluateAssetDepreciationForPeriod(assetImmediate, '2026-01');
assert.strictEqual(resImm.eligible, true);
assert.strictEqual(resImm.isImmediate, true);
assert.strictEqual(resImm.deprNIIF, 1800000, 'Depreciación inmediata causa el 100% ($1.800.000), no se fracciona');
console.log('✅ Test 6 OK: Menor cuantía (<= 50 UVT) causa 100% en el mes de compra ($1.800.000)');

console.log('\n🎉 TODOS LOS CASOS DE PRUEBA PASARON EXITOSAMENTE.');

