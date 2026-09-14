// Test script simulating the exact logic from pb_hooks/ph_email.pb.js and hub/orchestrator.js

function getCanonicalConceptName(rawDesc) {
  if (!rawDesc) return 'CONCEPTO';
  var str = String(rawDesc).trim();
  var norm = str
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u');

  if (
    (norm.indexOf('interes') !== -1 && norm.indexOf('mora') !== -1) ||
    norm === 'mora' ||
    norm.indexOf('mora ') === 0 ||
    norm.indexOf(' intereses mora') !== -1
  ) {
    return 'INTERESES DE MORA';
  }

  if (
    norm.indexOf('cuota de administracion') !== -1 ||
    norm.indexOf('cuota administracion') !== -1 ||
    norm.indexOf('cuota ordinaria') !== -1 ||
    norm === 'administracion'
  ) {
    return 'CUOTA ADMINISTRACION';
  }

  if (
    norm.indexOf('fondo de imprevistos') !== -1 ||
    norm.indexOf('fondo imprevistos') !== -1
  ) {
    return 'FONDO DE IMPREVISTOS';
  }

  return str;
}

function resolveConceptGroup(line, cache) {
  var rawId = line.concept_id || "";
  var rawDesc = line.description || "Concepto";
  var canonicalDesc = getCanonicalConceptName(rawDesc);

  var conceptObj = (rawId && cache && cache.byId) ? cache.byId[rawId] : null;
  var isMoraById = rawId && (rawId === cache?.moraId || (conceptObj && (conceptObj.code === "MORA" || conceptObj.name.toUpperCase().indexOf("MORA") !== -1)));
  var isMoraByText = canonicalDesc === "INTERESES DE MORA";

  if (isMoraById || isMoraByText) {
    return {
      groupKey: "__MORA__",
      conceptId: (conceptObj ? conceptObj.id : (cache ? cache.moraId : "")) || "",
      description: "INTERESES DE MORA"
    };
  }

  if (conceptObj) {
    return {
      groupKey: "ID_" + conceptObj.id,
      conceptId: conceptObj.id,
      description: conceptObj.name.toUpperCase()
    };
  }

  if (cache && cache.byCanonicalName && cache.byCanonicalName[canonicalDesc]) {
    var matchedId = cache.byCanonicalName[canonicalDesc];
    var matchedConcept = cache.byId[matchedId];
    if (matchedConcept) {
      return {
        groupKey: "ID_" + matchedConcept.id,
        conceptId: matchedConcept.id,
        description: matchedConcept.name.toUpperCase()
      };
    }
  }

  if (rawId) {
    return {
      groupKey: "ID_" + rawId,
      conceptId: rawId,
      description: canonicalDesc || String(rawDesc).toUpperCase()
    };
  }

  return {
    groupKey: "__TEXT_" + canonicalDesc,
    conceptId: "",
    description: canonicalDesc || "CONCEPTO"
  };
}

function buildGroupedConceptsList(lines, outstandingLines, cache) {
  var conceptsMap = {};

  if (lines) {
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      var group = resolveConceptGroup(l, cache);
      var key = group.groupKey;
      var amount = Number(l.amount) || 0;
      if (!conceptsMap[key]) {
        conceptsMap[key] = {
          conceptId: group.conceptId,
          description: group.description,
          saldoAnterior: 0,
          cobrosMes: 0,
          saldoActual: 0
        };
      }
      conceptsMap[key].cobrosMes += amount;
      conceptsMap[key].saldoActual += amount;
    }
  }

  if (outstandingLines) {
    for (var k = 0; k < outstandingLines.length; k++) {
      var ol = outstandingLines[k];
      var groupOld = resolveConceptGroup(ol, cache);
      var keyOld = groupOld.groupKey;
      var amountOld = Number(ol.amount) || 0;
      if (!conceptsMap[keyOld]) {
        conceptsMap[keyOld] = {
          conceptId: groupOld.conceptId,
          description: groupOld.description,
          saldoAnterior: 0,
          cobrosMes: 0,
          saldoActual: 0
        };
      }
      conceptsMap[keyOld].saldoAnterior += amountOld;
      conceptsMap[keyOld].saldoActual += amountOld;
    }
  }

  var list = Object.keys(conceptsMap).map(function(k) { return conceptsMap[k]; });

  list.sort(function(a, b) {
    var nameA = String(a.description || '').toUpperCase();
    var nameB = String(b.description || '').toUpperCase();
    if (nameA.indexOf('ADMIN') !== -1 && nameB.indexOf('ADMIN') === -1) return -1;
    if (nameA.indexOf('ADMIN') === -1 && nameB.indexOf('ADMIN') !== -1) return 1;
    if (nameA.indexOf('MORA') !== -1 && nameB.indexOf('MORA') === -1) return 1;
    if (nameA.indexOf('MORA') === -1 && nameB.indexOf('MORA') !== -1) return -1;
    return nameA.localeCompare(nameB);
  });

  return list;
}

// ── Test Cases ──
const mockCache = {
  byId: {
    'adm_1': { id: 'adm_1', code: 'ADM', name: 'CUOTA ADMINISTRACION' },
    'mora_1': { id: 'mora_1', code: 'MORA', name: 'INTERESES DE MORA' },
    'ext_1': { id: 'ext_1', code: 'EXT', name: 'CUOTA EXTRAORDINARIA' }
  },
  moraId: 'mora_1',
  admId: 'adm_1',
  byCanonicalName: {
    'CUOTA ADMINISTRACION': 'adm_1',
    'INTERESES DE MORA': 'mora_1'
  }
};

// Test 1: Lines with matched concept_id (the new standard)
const currentLines1 = [
  { concept_id: 'adm_1', description: 'CUOTA ADMINISTRACION', amount: 250000 },
  { concept_id: 'mora_1', description: 'Interés de mora a 2026-09-01', amount: 15420 }
];
const oldLines1 = [
  { concept_id: 'adm_1', description: 'CUOTA ADMINISTRACION', amount: 250000 },
  { concept_id: 'mora_1', description: 'Intereses de Mora acumulados', amount: 30840 }
];

const result1 = buildGroupedConceptsList(currentLines1, oldLines1, mockCache);
console.log('Result 1 (By concept_id):');
console.table(result1);

// Verify result 1
if (result1.length !== 2) throw new Error('Expected exactly 2 rows, got ' + result1.length);
if (result1[0].description !== 'CUOTA ADMINISTRACION' || result1[0].saldoAnterior !== 250000 || result1[0].cobrosMes !== 250000) throw new Error('Admin row mismatch');
if (result1[1].description !== 'INTERESES DE MORA' || result1[1].saldoAnterior !== 30840 || result1[1].cobrosMes !== 15420 || result1[1].saldoActual !== 46260) throw new Error('Mora row mismatch');

// Test 2: Historical lines with NO concept_id (empty strings)
const currentLines2 = [
  { concept_id: '', description: 'Cuota de administración', amount: 200000 },
  { concept_id: '', description: 'Interés de mora a 2026-09-01', amount: 5000 }
];
const oldLines2 = [
  { concept_id: '', description: 'Intereses de Mora acumulados', amount: 10000 }
];

const result2 = buildGroupedConceptsList(currentLines2, oldLines2, mockCache);
console.log('Result 2 (Fallback for empty concept_id):');
console.table(result2);

if (result2.length !== 2) throw new Error('Expected exactly 2 rows in Result 2, got ' + result2.length);
if (result2[1].description !== 'INTERESES DE MORA' || result2[1].saldoAnterior !== 10000 || result2[1].cobrosMes !== 5000 || result2[1].saldoActual !== 15000) throw new Error('Mora fallback mismatch');

console.log('\n>>> ALL TEST CASES PASSED WITH 100% ACCURACY! <<<');
