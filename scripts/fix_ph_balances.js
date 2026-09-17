/**
 * GRAVY v2.0 — scripts/fix_ph_balances.js
 * 
 * Script de diagnóstico y corrección de saldos PH históricos.
 * 
 * Propósito:
 *   1. Auditar facturas ph_invoices con status='posted' que ya tienen
 *      pagos completos en tx_lines (deberían ser 'paid').
 *   2. Reportar facturas con pagos parciales y el saldo real pendiente.
 *   3. Calcular el delta total del error de facturación (cobros en exceso).
 * 
 * Uso:
 *   node scripts/fix_ph_balances.js
 *   node scripts/fix_ph_balances.js --fix
 *   node scripts/fix_ph_balances.js --period 2026-06
 *   node scripts/fix_ph_balances.js --fix --period 2026-06
 *   node scripts/fix_ph_balances.js --email admin@ejemplo.com --pass mipass
 * 
 * IMPORTANTE: Ejecutar primero SIN --fix para ver el reporte de auditoría.
 */

const http  = require('http');
const https = require('https');

// ── Configuración ──────────────────────────────────────────────────────────
const PB_URL   = process.env.PB_URL   || 'http://127.0.0.1:8090';
const args     = process.argv.slice(2);
const getArg   = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i+1] : null; };

const PB_EMAIL  = process.env.PB_EMAIL  || getArg('--email') || '';
const PB_PASS   = process.env.PB_PASS   || getArg('--pass')  || '';
const applyFix  = args.includes('--fix');
const periodArg = getArg('--period') || '';

// ── Helper HTTP ────────────────────────────────────────────────────────────
function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj    = new URL(url);
    const lib       = urlObj.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname : urlObj.hostname,
      port     : urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path     : urlObj.pathname + urlObj.search,
      method   : options.method || 'GET',
      headers  : { 'Content-Type': 'application/json', ...(options.headers || {}) }
    };
    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (_) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    req.end();
  });
}

// ── Formateo COP ──────────────────────────────────────────────────────────
const fmt = (n) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  GRAVY PH — Diagnóstico de Saldos Anteriores en Facturas  ');
  console.log('════════════════════════════════════════════════════════════');
  console.log('  Modo   :', applyFix ? '⚠️  CORRECCIÓN ACTIVA (--fix)' : '🔍 Solo auditoría (sin --fix)');
  console.log('  Período:', periodArg || 'Todos los períodos');
  console.log('  URL PB :', PB_URL);
  console.log('');

  // 1. Autenticar
  let token = '';
  if (PB_EMAIL && PB_PASS) {
    const auth = await fetchJson(`${PB_URL}/api/collections/users/auth-with-password`, {
      method : 'POST',
      body   : { identity: PB_EMAIL, password: PB_PASS }
    });
    if (auth.body?.token) {
      token = auth.body.token;
      console.log('✅ Autenticado en PocketBase como', PB_EMAIL);
    } else {
      console.error('❌ Error de autenticación:', JSON.stringify(auth.body));
      process.exit(1);
    }
  } else {
    console.warn('⚠️  Sin credenciales. Usa --email y --pass para autenticar.\n');
  }

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // 2. Obtener facturas pendientes de revisión
  const periodFilter = periodArg ? `%26%26period='${periodArg}'` : '';
  const url = `${PB_URL}/api/collections/ph_invoices/records` +
              `?filter=status!%3D'paid'%26%26status!%3D'voided'${periodFilter}` +
              `&sort=period%2Cnumber&perPage=500&page=1`;

  const invRes = await fetchJson(url, { headers });

  if (!invRes.body?.items?.length) {
    console.log('ℹ️  No hay facturas pendientes para revisar con los filtros dados.');
    return;
  }

  const invoices = invRes.body.items;
  console.log(`📋 Facturas pendientes encontradas: ${invoices.length}\n`);

  // 3. Analizar cada factura via el endpoint /api/ph/unit-balance
  let totalFacturadoPendiente = 0;
  let totalRealPendiente      = 0;
  let fullPaidNotMarked       = 0;
  let partialPaid             = 0;
  let sinProblema             = 0;
  const issues                = [];

  for (const inv of invoices) {
    try {
      const balUrl = `${PB_URL}/api/ph/unit-balance?propertyId=${inv.property_id}&period=${inv.period}`;
      const balRes = await fetchJson(balUrl, { headers });

      if (balRes.status !== 200 || !balRes.body?.invoices) {
        console.warn(`  ⚠️  No se pudo obtener saldo para factura ${inv.number} (status ${balRes.status})`);
        continue;
      }

      const invData = balRes.body.invoices.find(i => i.invoiceId === inv.id);
      if (!invData) continue;

      const total   = invData.total         || 0;
      const paid    = invData.paidAmount    || 0;
      const pending = invData.pendingAmount || 0;

      totalFacturadoPendiente += total;
      totalRealPendiente      += pending;

      if (paid >= total - 0.01) {
        // Factura pagada contablemente pero no marcada como 'paid'
        fullPaidNotMarked++;
        const action = applyFix && token ? 'MARCADA COMO PAID ✅' : 'REQUIERE CORRECCIÓN';
        issues.push({ tipo: 'PAGADA_NO_MARCADA', number: inv.number, period: inv.period, total, paid, pending: 0, action });

        if (applyFix && token) {
          const patchRes = await fetchJson(
            `${PB_URL}/api/collections/ph_invoices/records/${inv.id}`,
            { method: 'PATCH', headers, body: { status: 'paid' } }
          );
          if (patchRes.status !== 200) {
            console.warn(`  ⚠️  No se pudo marcar ${inv.number} como paid:`, JSON.stringify(patchRes.body));
          }
        }

      } else if (paid > 0.01) {
        // Pago parcial registrado
        partialPaid++;
        const pct = Math.round((paid / total) * 100);
        issues.push({ tipo: 'PAGO_PARCIAL', number: inv.number, period: inv.period, total, paid, pending, action: `Abono del ${pct}% — conserva estado posted` });

      } else {
        // Sin pagos — correcto
        sinProblema++;
      }
    } catch (e) {
      console.warn(`  ⚠️  Error procesando ${inv.number}:`, e.message);
    }
  }

  // 4. Reporte
  const deltaError = totalFacturadoPendiente - totalRealPendiente;

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  RESUMEN DE AUDITORÍA                                      ');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  Facturas revisadas total    : ${invoices.length}`);
  console.log(`  ✅ Sin problema             : ${sinProblema}`);
  console.log(`  🔴 Pagadas sin marcar       : ${fullPaidNotMarked}`);
  console.log(`  🟡 Con pago parcial         : ${partialPaid}`);
  console.log('');
  console.log(`  Facturado como pendiente    : ${fmt(totalFacturadoPendiente)}`);
  console.log(`  Saldo real pendiente        : ${fmt(totalRealPendiente)}`);
  console.log(`  ⚠️  DELTA (cobro en exceso) : ${fmt(deltaError)}`);
  console.log('');

  if (issues.length) {
    console.log('  DETALLE DE INCONSISTENCIAS:');
    console.log('  ─────────────────────────────────────────────────────────');
    for (const iss of issues) {
      const pct = iss.total > 0 ? Math.round((iss.paid / iss.total) * 100) : 0;
      console.log(
        `  [${iss.tipo}] ${iss.number} | ${iss.period} | ` +
        `Total: ${fmt(iss.total)} | Pagado: ${fmt(iss.paid)} (${pct}%) | ` +
        `Pendiente: ${fmt(iss.pending)} | ${iss.action}`
      );
    }
    console.log('');
  }

  if (applyFix) {
    console.log(`✅ Corrección aplicada: ${fullPaidNotMarked} facturas marcadas como 'paid'.`);
  } else if (fullPaidNotMarked > 0 || partialPaid > 0) {
    console.log(`ℹ️  Para corregir, ejecutar:\n  node scripts/fix_ph_balances.js --fix --email ADMIN --pass PASS`);
  }

  console.log('════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err);
  process.exit(1);
});
