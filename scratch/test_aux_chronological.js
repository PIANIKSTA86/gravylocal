const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function getDbData(fromDate, toDate) {
  const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
  const db = new DatabaseSync(dbPath);

  const sqlOpening = `
    SELECT
      l.account_id AS accountId,
      COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdId,
      (CASE WHEN a.maneja_cruce = 1 OR a.maneja_cruce = 'true' THEN COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') ELSE 'NO_CRUCE' END) AS docCruce,
      SUM(l.debit - l.credit) AS balance
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    INNER JOIN accounts a ON a.id = l.account_id
    WHERE t.status = 'active'
      AND t.date < ?
    GROUP BY
      l.account_id,
      COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO'),
      (CASE WHEN a.maneja_cruce = 1 OR a.maneja_cruce = 'true' THEN COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') ELSE 'NO_CRUCE' END)
  `;

  const sqlPeriod = `
    SELECT
      t.date AS fecha,
      t.number AS comprobante,
      t.id AS txId,
      l.account_id AS accountId,
      a.code AS accountCode,
      a.name AS accountName,
      a.nature AS accountNature,
      a.maneja_cruce AS accountManejaCruce,
      COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdId,
      COALESCE(tp.name, 'Sin tercero') AS thirdName,
      COALESCE(tp.doc_number, '') AS thirdDoc,
      COALESCE(TRIM(l.cross_doc_ref), '') AS doc_cruce,
      COALESCE(l.description, t.description, '') AS descripcion,
      l.debit AS debito,
      l.credit AS credito
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    INNER JOIN accounts a ON a.id = l.account_id
    LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
    WHERE t.status = 'active'
      AND t.date >= ?
      AND t.date <= ?
    ORDER BY t.date ASC, t.number ASC, COALESCE(l.line_order, 0) ASC, l.id ASC
  `;

  const openingBalances = db.prepare(sqlOpening).all(fromDate);
  const periodLines = db.prepare(sqlPeriod).all(fromDate, toDate + ' 23:59:59');

  return { openingBalances, periodLines };
}

function simulateFrontendAux(mode, periodLines, openingBalances, dateFrom) {
  const openingByAccount = new Map();
  const openingByThirdAccount = new Map();

  for (const b of (openingBalances || [])) {
    const bal = Number(b.balance || 0);
    const accId = String(b.accountId || '');
    const thirdId = String(b.thirdId || 'NO_TERCERO');
    openingByAccount.set(accId, (openingByAccount.get(accId) || 0) + bal);
    const tk = `${accId}|${thirdId}`;
    openingByThirdAccount.set(tk, (openingByThirdAccount.get(tk) || 0) + bal);
  }

  const rows = (periodLines || []).map((l) => {
    const isCruce = l.accountManejaCruce === 1 || l.accountManejaCruce === true || l.accountManejaCruce === '1';
    const thirdName = l.thirdName || 'Sin tercero';
    const thirdDoc = l.thirdDoc || '';
    const thirdDisplay = thirdDoc ? `${thirdDoc} - ${thirdName}` : thirdName;

    return {
      fecha: l.fecha || '',
      comprobante: l.comprobante || '',
      txId: l.txId || '',
      cuenta: `${l.accountCode} - ${l.accountName}`.trim(),
      accountCode: l.accountCode,
      accountName: l.accountName,
      tercero: thirdDisplay,
      thirdName: thirdName,
      thirdDoc: thirdDoc,
      doc_cruce: l.doc_cruce || '',
      descripcion: l.descripcion || '',
      debito: Number(l.debito || 0),
      credito: Number(l.credito || 0),
      keyCuenta: `${l.accountCode} - ${l.accountName}`.trim(),
      keyTercero: thirdDisplay,
      accountId: l.accountId,
      accountNature: l.accountNature || 'debit',
      accountManejaCruce: isCruce,
      thirdId: l.thirdId || 'NO_TERCERO',
      isOpeningRow: false,
    };
  });

  const activeThirdKeys = new Set();
  const activeAccountKeys = new Set();
  for (const r of rows) {
    activeThirdKeys.add(`${r.accountId}|${r.thirdId}`);
    activeAccountKeys.add(r.accountId);
  }

  for (const b of (openingBalances || [])) {
    const bal = Number(b.balance || 0);
    if (Math.abs(bal) < 0.0001) continue;
    const accId = String(b.accountId || '');
    const thirdId = String(b.thirdId || 'NO_TERCERO');

    let needRow = false;
    if (mode === 'cuenta-sin-tercero') {
      if (!activeAccountKeys.has(accId)) {
        needRow = true;
        activeAccountKeys.add(accId);
      }
    } else {
      const tk = `${accId}|${thirdId}`;
      if (!activeThirdKeys.has(tk)) {
        needRow = true;
        activeThirdKeys.add(tk);
      }
    }

    if (needRow) {
      rows.push({
        fecha: dateFrom,
        comprobante: 'SALDO INICIAL',
        txId: '',
        cuenta: `Cuenta_${accId}`,
        accountCode: `Acc_${accId}`,
        accountName: 'Cuenta',
        tercero: thirdId,
        thirdName: thirdId,
        thirdDoc: '',
        doc_cruce: '',
        descripcion: 'SALDO ANTERIOR PENDIENTE',
        debito: 0,
        credito: 0,
        keyCuenta: `Cuenta_${accId}`,
        keyTercero: thirdId,
        accountId: accId,
        accountNature: 'debit',
        accountManejaCruce: false,
        thirdId: thirdId,
        isOpeningRow: true,
      });
    }
  }

  const primaryField = mode === 'tercero-cuenta' ? 'keyTercero' : 'keyCuenta';
  const secondaryField = mode === 'tercero-cuenta' ? 'keyCuenta' : 'keyTercero';

  if (mode === 'cuenta-sin-tercero') {
    rows.sort((a, b) => {
      const codeA = a.accountCode || '';
      const codeB = b.accountCode || '';
      if (codeA !== codeB) return codeA.localeCompare(codeB, undefined, { numeric: true });
      if (a.isOpeningRow !== b.isOpeningRow) return a.isOpeningRow ? -1 : 1;
      const fechaA = a.fecha || '';
      const fechaB = b.fecha || '';
      if (fechaA !== fechaB) return fechaA.localeCompare(fechaB);
      const compA = a.comprobante || '';
      const compB = b.comprobante || '';
      const compCmp = compA.localeCompare(compB, undefined, { numeric: true });
      if (compCmp !== 0) return compCmp;
      const cruceA = a.doc_cruce || '';
      const cruceB = b.doc_cruce || '';
      if (cruceA !== cruceB) return cruceA.localeCompare(cruceB, undefined, { numeric: true });
      return (a.txId || '').localeCompare(b.txId || '');
    });

    const accRunningBalance = new Map();
    for (const row of rows) {
      row.balanceKey = `acc|${row.accountId}`;
      const prevBal = accRunningBalance.has(row.accountId)
        ? accRunningBalance.get(row.accountId)
        : (openingByAccount.get(row.accountId) || 0);
      const delta = row.debito - row.credito;
      row.saldo_anterior = prevBal;
      row.saldo_actual = prevBal + delta;
      accRunningBalance.set(row.accountId, row.saldo_actual);
    }
  } else {
    rows.sort((a, b) => {
      const pA = a[primaryField] || '';
      const pB = b[primaryField] || '';
      if (pA !== pB) return pA.localeCompare(pB, undefined, { numeric: true });
      const sA = a[secondaryField] || '';
      const sB = b[secondaryField] || '';
      if (sA !== sB) return sA.localeCompare(sB, undefined, { numeric: true });
      if (a.isOpeningRow !== b.isOpeningRow) return a.isOpeningRow ? -1 : 1;
      const fechaA = a.fecha || '';
      const fechaB = b.fecha || '';
      if (fechaA !== fechaB) return fechaA.localeCompare(fechaB);
      const compA = a.comprobante || '';
      const compB = b.comprobante || '';
      const compCmp = compA.localeCompare(compB, undefined, { numeric: true });
      if (compCmp !== 0) return compCmp;
      const cruceA = a.doc_cruce || '';
      const cruceB = b.doc_cruce || '';
      if (cruceA !== cruceB) return cruceA.localeCompare(cruceB, undefined, { numeric: true });
      return (a.txId || '').localeCompare(b.txId || '');
    });

    const streamRunningBalance = new Map();
    for (const row of rows) {
      const balanceKey = `${row.accountId}|${row.thirdId}`;
      row.balanceKey = balanceKey;
      const prevBal = streamRunningBalance.has(balanceKey)
        ? streamRunningBalance.get(balanceKey)
        : (openingByThirdAccount.get(balanceKey) || 0);
      const delta = row.debito - row.credito;
      row.saldo_anterior = prevBal;
      row.saldo_actual = prevBal + delta;
      streamRunningBalance.set(balanceKey, row.saldo_actual);
    }
  }

  return { rows, openingByThirdAccount, openingByAccount };
}

function testRealData() {
  console.log('=== TEST 1: Datos Reales desde la BD (data.db) con la nueva lógica ===');
  const fromDate = '2026-01-01';
  const toDate = '2026-12-31';
  const { openingBalances, periodLines } = getDbData(fromDate, toDate);

  console.log(`Líneas del período encontradas: ${periodLines.length}, Saldos iniciales: ${openingBalances.length}`);

  ['cuenta-tercero', 'tercero-cuenta', 'cuenta-sin-tercero'].forEach(mode => {
    console.log(`\nValidando modalidad: [${mode}]...`);
    const { rows } = simulateFrontendAux(mode, periodLines, openingBalances, fromDate);

    let chronologicalErrors = 0;
    let balanceContinuityErrors = 0;

    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const curr = rows[i];

      // Mismo grupo contable
      if (prev.balanceKey === curr.balanceKey) {
        // Validación 1: Fechas estrictamente cronológicas (curr.fecha >= prev.fecha)
        if (curr.fecha < prev.fecha) {
          console.error(`  [ERROR CRONOLÓGICO]: En ${curr.balanceKey}: Fecha ${curr.fecha} apareció después de ${prev.fecha}`);
          chronologicalErrors++;
        }

        // Validación 2: Continuidad de saldo (curr.saldo_anterior === prev.saldo_actual)
        if (Math.abs(curr.saldo_anterior - prev.saldo_actual) > 0.001) {
          console.error(`  [ERROR CONTINUIDAD]: Saldo anterior ${curr.saldo_anterior} no coincide con previo actual ${prev.saldo_actual}`);
          balanceContinuityErrors++;
        }
      }

      // Validación 3: Saldo actual = Saldo anterior + débito - crédito
      const expectedCurr = curr.saldo_anterior + curr.debito - curr.credito;
      if (Math.abs(curr.saldo_actual - expectedCurr) > 0.001) {
        console.error(`  [ERROR SALDO FILA]: ${curr.saldo_actual} != ${expectedCurr}`);
        balanceContinuityErrors++;
      }
    }

    if (chronologicalErrors === 0 && balanceContinuityErrors === 0) {
      console.log(`  ✓ ÉXITO: 0 errores cronológicos y 0 errores de continuidad de saldo en ${rows.length} registros analizados.`);
    } else {
      console.error(`  ✗ FALLO: Errores cronológicos: ${chronologicalErrors}, Errores de saldo: ${balanceContinuityErrors}`);
    }
  });
}

function testCrucesSimulation() {
  console.log('\n=== TEST 2: Prueba Específica de Inversión de Fechas por Doc. Cruce ===');
  // Tercero tiene Factura 2 (02-Ene con doc_cruce='FAC-002') y Factura 1 (10-Ene con doc_cruce='FAC-001')
  // Antes, como se anteponía doc_cruce, FAC-001 salía antes de FAC-002, por lo que 10-Ene salía antes de 02-Ene.
  const periodLines = [
    { fecha: '2026-01-10', comprobante: 'RC-00000001', doc_cruce: 'FAC-001', debito: 0, credito: 100, accountCode: '130505', accountName: 'Clientes Nacionales', thirdDoc: '900123456', thirdName: 'Cliente Ejemplo SAS', accountId: 'acc1', thirdId: 't1' },
    { fecha: '2026-01-02', comprobante: 'FV-00000001', doc_cruce: 'FAC-002', debito: 200, credito: 0, accountCode: '130505', accountName: 'Clientes Nacionales', thirdDoc: '900123456', thirdName: 'Cliente Ejemplo SAS', accountId: 'acc1', thirdId: 't1' },
    { fecha: '2026-01-05', comprobante: 'FV-00000002', doc_cruce: 'FAC-003', debito: 300, credito: 0, accountCode: '130505', accountName: 'Clientes Nacionales', thirdDoc: '900123456', thirdName: 'Cliente Ejemplo SAS', accountId: 'acc1', thirdId: 't1' },
    { fecha: '2026-01-01', comprobante: 'SALDO INICIAL', doc_cruce: '', debito: 0, credito: 0, accountCode: '130505', accountName: 'Clientes Nacionales', thirdDoc: '900123456', thirdName: 'Cliente Ejemplo SAS', accountId: 'acc1', thirdId: 't1', isOpeningRow: true },
  ];
  const openingBalances = [
    { accountId: 'acc1', thirdId: 't1', balance: 500 }
  ];

  const { rows } = simulateFrontendAux('cuenta-tercero', periodLines, openingBalances, '2026-01-01');
  console.log('Secuencia resultante de filas en cuenta-tercero:');
  rows.forEach((r, idx) => {
    console.log(`  ${idx + 1}. Fecha: ${r.fecha} | Cruce: ${r.doc_cruce.padEnd(8)} | Comp: ${r.comprobante.padEnd(14)} | Saldo Ant: ${r.saldo_anterior} | Deb: ${r.debito} | Cred: ${r.credito} | Saldo Act: ${r.saldo_actual}`);
  });

  const dates = rows.map(r => r.fecha);
  const isSorted = dates.every((d, i) => i === 0 || d >= dates[i - 1]);
  if (isSorted) {
    console.log('  ✓ ÉXITO: Las fechas están 100% en orden cronológico (2026-01-01 -> 2026-01-02 -> 2026-01-05 -> 2026-01-10).');
  } else {
    console.error('  ✗ FALLO: Las fechas no están en orden cronológico.');
  }

  // Verificar continuidad matemática de saldos:
  let ok = true;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].saldo_anterior !== rows[i - 1].saldo_actual) ok = false;
    if (rows[i].saldo_actual !== (rows[i].saldo_anterior + rows[i].debito - rows[i].credito)) ok = false;
  }
  if (ok) {
    console.log('  ✓ ÉXITO: Continuidad matemática perfecta fila a fila (Saldo Anterior + Débito - Crédito = Saldo Actual).');
  } else {
    console.error('  ✗ FALLO: Hay inconsistencias en la continuidad de saldos.');
  }
}

function run() {
  testRealData();
  testCrucesSimulation();
}

run();
