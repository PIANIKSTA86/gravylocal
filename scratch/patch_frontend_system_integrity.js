const fs = require('fs');
const path = require('path');

// 1. Patch frontend/src/api.ts
const apiPath = path.join(__dirname, '..', 'frontend', 'src', 'api.ts');
let apiCode = fs.readFileSync(apiPath, 'utf8');

const apiTarget = `    const mismatches = Object.values(byInvoice)
      .map((m) => {
        m.diferencia = Math.round((m.totalFactura - m.totalLineas) * 100) / 100;
        return m;
      })
      .filter((m) => Math.abs(m.diferencia) > 1)
      .sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia));

    return {
      totals,
      mismatches,
      isBalanced: Math.abs(totals.diferenciaGlobal) <= 1 && mismatches.length === 0,
    };
  },`;

const apiReplacement = `    const mismatches = Object.values(byInvoice)
      .map((m) => {
        m.diferencia = Math.round((m.totalFactura - (m.totalOriginalLines || 0)) * 100) / 100;
        return m;
      })
      .filter((m) => Math.abs(m.diferencia) > 1)
      .sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia));

    return {
      totals,
      mismatches,
      isBalanced: Math.abs(totals.diferenciaGlobal) <= 1 && mismatches.length === 0,
    };
  },

  /**
   * Auditoría de integridad contable de todo el sistema en tiempo real.
   * Valida cuadre 100% de todas las unidades habitacionales: Cartera PH vs Libro Auxiliar 13459501.
   */
  async getPhSystemIntegrity() {
    const res = await fetch(\`\${pb.baseUrl}/api/ph/integrity-check\`, {
      headers: {
        ...(pb.authStore.token ? { Authorization: \`Bearer \${pb.authStore.token}\` } : {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || \`Error \${res.status} al verificar integridad del sistema\`);
    }
    return res.json();
  },`;

if (!apiCode.includes('getPhSystemIntegrity')) {
  const normApiCode = apiCode.replace(/\r\n/g, '\n');
  const normApiTarget = apiTarget.replace(/\r\n/g, '\n');
  const normApiReplacement = apiReplacement.replace(/\r\n/g, '\n');
  if (normApiCode.includes(normApiTarget)) {
    apiCode = normApiCode.replace(normApiTarget, normApiReplacement);
    fs.writeFileSync(apiPath, apiCode, 'utf8');
    console.log('Successfully patched frontend/src/api.ts with getPhSystemIntegrity');
  } else {
    console.error('Could not find apiTarget in frontend/src/api.ts');
  }
} else {
  console.log('frontend/src/api.ts already has getPhSystemIntegrity');
}

// 2. Patch frontend/src/modules/copropiedades.ts
const copPath = path.join(__dirname, '..', 'frontend', 'src', 'modules', 'copropiedades.ts');
let copCode = fs.readFileSync(copPath, 'utf8');

const copTargetRender = `    function renderIntegrity(info) {
      const box = document.getElementById('ph-cartera-integrity');
      if (!box) return;
      if (!info) {
        box.innerHTML = '';
        return;
      }
      const tone = info.isBalanced
        ? { bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46', icon: 'fa-circle-check', title: 'Integridad OK' }
        : { bg: '#FFF7ED', border: '#FDBA74', color: '#9A3412', icon: 'fa-triangle-exclamation', title: 'Descuadres detectados' };

      box.innerHTML = \`
        <div class="rounded-2xl border p-4" style="background:\${tone.bg};border-color:\${tone.border}">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div class="font-bold" style="color:\${tone.color}">
              <i class="fas \${tone.icon} mr-2"></i>\${tone.title}
            </div>
            <div class="text-sm" style="color:\${tone.color}">
              Facturas: <strong>\${info.totals.invoices}</strong> | Líneas: <strong>\${info.totals.lines}</strong>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm" style="color:\${tone.color}">
            <div>Total facturas: <strong>\${fmt(info.totals.totalFacturas)}</strong></div>
            <div>Total líneas: <strong>\${fmt(info.totals.totalLineas)}</strong></div>
            <div>Pendiente: <strong>\${fmt(info.totals.totalPendiente)}</strong></div>
            <div>Cancelado: <strong>\${fmt(info.totals.totalCancelado)}</strong></div>
            <div>Diferencia global: <strong>\${fmt(info.totals.diferenciaGlobal)}</strong></div>
          </div>
          \${info.mismatches.length ? \`
            <div class="mt-3 text-sm" style="color:\${tone.color}">
              <div class="font-semibold mb-1">Facturas descuadradas (Top \${Math.min(5, info.mismatches.length)}):</div>
              \${info.mismatches.slice(0, 5).map(m =>
                \`<div>#\${esc(m.number)} (\${esc(m.period)}): Factura \${fmt(m.totalFactura)} vs Líneas \${fmt(m.totalLineas)} (dif \${fmt(m.diferencia)})</div>\`
              ).join('')}
            </div>\` : ''}
        </div>\`;
    }`;

const copReplacementRender = `    function renderIntegrity(info: any, sysIntegrity: any = null) {
      const box = document.getElementById('ph-cartera-integrity');
      if (!box) return;
      if (!info && !sysIntegrity) {
        box.innerHTML = '';
        return;
      }
      
      let html = '';
      
      // 1. Auditoría del Sistema Contable (Cartera PH vs Libro Auxiliar 13459501)
      if (sysIntegrity && sysIntegrity.ok) {
        const sysTone = sysIntegrity.balanced
          ? { bg: '#F0FDF4', border: '#86EFAC', color: '#166534', icon: 'fa-shield-check', title: 'Integridad Contable 100% Cuadrada (Cartera PH === Libro Auxiliar)' }
          : { bg: '#FEF2F2', border: '#FCA5A5', color: '#991B1B', icon: 'fa-triangle-exclamation', title: 'Alerta: Descuadre Contable Detectado (Ley 675 / CTCP)' };

        html += \`
          <div class="rounded-2xl border p-4 mb-3 shadow-xs" style="background:\${sysTone.bg};border-color:\${sysTone.border}">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div class="font-bold flex items-center gap-2" style="color:\${sysTone.color}">
                <i class="fas \${sysTone.icon} text-base"></i>
                <span>\${sysTone.title}</span>
              </div>
              <div class="text-xs px-2.5 py-1 rounded-full font-semibold" style="background:\${sysIntegrity.balanced ? '#DCFCE7' : '#FEE2E2'};color:\${sysTone.color}">
                \${sysIntegrity.balancedUnits}/\${sysIntegrity.unitsCount} unidades en balance perfecto
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-2" style="color:\${sysTone.color}">
              <div>Total Cartera PH: <strong>\${_fmt(sysIntegrity.totalCartera)}</strong></div>
              <div>Total Libro (13459501): <strong>\${_fmt(sysIntegrity.totalLibro)}</strong></div>
              <div>Diferencia Global: <strong>\${_fmt(sysIntegrity.diferenciaGlobal)}</strong></div>
              <div>Auditoría: <span class="font-mono text-xs">\${new Date(sysIntegrity.auditedAt || Date.now()).toLocaleTimeString()}</span></div>
            </div>
            \${sysIntegrity.mismatches && sysIntegrity.mismatches.length ? \`
              <div class="mt-3 p-3 rounded-xl bg-white/80 border border-red-200 text-xs text-red-900">
                <div class="font-bold mb-1">Unidades con inconsistencia:</div>
                \${sysIntegrity.mismatches.map((m: any) => \`
                  <div>Unidad \${esc(m.code)} (\${esc(m.name)}): Cartera \${_fmt(m.carteraBalance)} vs Libro \${_fmt(m.libroBalance)} (Dif: \${_fmt(m.diferencia)})</div>
                \`).join('')}
              </div>
            \` : ''}
          </div>
        \`;
      }

      // 2. Integridad de facturas vs líneas de la consulta actual
      if (info) {
        const tone = info.isBalanced
          ? { bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46', icon: 'fa-circle-check', title: 'Consistencia Operativa de Facturas y Líneas' }
          : { bg: '#FFF7ED', border: '#FDBA74', color: '#9A3412', icon: 'fa-triangle-exclamation', title: 'Descuadres en Facturas detectados' };

        html += \`
          <div class="rounded-2xl border p-4" style="background:\${tone.bg};border-color:\${tone.border}">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div class="font-bold" style="color:\${tone.color}">
                <i class="fas \${tone.icon} mr-2"></i>\${tone.title}
              </div>
              <div class="text-sm" style="color:\${tone.color}">
                Facturas: <strong>\${info.totals.invoices}</strong> | Líneas: <strong>\${info.totals.lines}</strong>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm" style="color:\${tone.color}">
              <div>Total facturas: <strong>\${_fmt(info.totals.totalFacturas)}</strong></div>
              <div>Total líneas: <strong>\${_fmt(info.totals.totalLineas)}</strong></div>
              <div>Pendiente: <strong>\${_fmt(info.totals.totalPendiente)}</strong></div>
              <div>Cancelado: <strong>\${_fmt(info.totals.totalCancelado)}</strong></div>
              <div>Diferencia global: <strong>\${_fmt(info.totals.diferenciaGlobal)}</strong></div>
            </div>
            \${info.mismatches.length ? \`
              <div class="mt-3 text-sm" style="color:\${tone.color}">
                <div class="font-semibold mb-1">Facturas descuadradas (Top \${Math.min(5, info.mismatches.length)}):</div>
                \${info.mismatches.slice(0, 5).map((m: any) =>
                  \`<div>#\${esc(m.number)} (\${esc(m.period)}): Factura \${_fmt(m.totalFactura)} vs Líneas \${_fmt(m.totalOriginalLines || m.totalLineas)} (dif \${_fmt(m.diferencia)})</div>\`
                ).join('')}
              </div>\` : ''}
          </div>
        \`;
      }

      box.innerHTML = html;
    }`;

const copTargetCall = `        const [cartera, integrity] = await Promise.all([
          API.getPhCarteraByUnit(unitId, '', toDate),
          API.getPhCarteraIntegrity(unitId, '', toDate),
        ]);
        renderIntegrity(integrity);`;

const copReplacementCall = `        const [cartera, integrity, sysIntegrity] = await Promise.all([
          API.getPhCarteraByUnit(unitId, '', toDate),
          API.getPhCarteraIntegrity(unitId, '', toDate),
          API.getPhSystemIntegrity().catch(() => null),
        ]);
        renderIntegrity(integrity, sysIntegrity);`;

const normCopCode = copCode.replace(/\r\n/g, '\n');
const normCopTargetRender = copTargetRender.replace(/\r\n/g, '\n');
const normCopReplacementRender = copReplacementRender.replace(/\r\n/g, '\n');
const normCopTargetCall = copTargetCall.replace(/\r\n/g, '\n');
const normCopReplacementCall = copReplacementCall.replace(/\r\n/g, '\n');

if (normCopCode.includes(normCopTargetRender) && normCopCode.includes(normCopTargetCall)) {
  copCode = normCopCode
    .replace(normCopTargetRender, normCopReplacementRender)
    .replace(normCopTargetCall, normCopReplacementCall);
  fs.writeFileSync(copPath, copCode, 'utf8');
  console.log('Successfully patched frontend/src/modules/copropiedades.ts');
} else {
  console.error('Could not find targets in frontend/src/modules/copropiedades.ts');
}

