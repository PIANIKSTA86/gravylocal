const fs = require('fs');
const path = require('path');

// =============================================================================
// 1. PATCH frontend/src/api.ts
// =============================================================================
const apiPath = path.join(__dirname, '..', 'frontend', 'src', 'api.ts');
let apiCode = fs.readFileSync(apiPath, 'utf8');

// Target 1: txLines loop and advancesByPropMap in _getPhCarteraDataset
const apiTarget1 = `    if (invNumbers.length > 0) {
      // Traemos líneas contables que afecten cartera (cuenta 13%) con cross_doc_ref y fecha <= corte
      const txLines = await pb.listAll("tx_lines", {
        filter: \`cross_doc_ref!="" && account_id.code ~ "13%" && tx_id.date <= "\${refDate}" && (tx_id.status = "posted" || tx_id.status = "active")\`,
        expand: "tx_id,account_id"
      });

      for (const tl of txLines) {
        // En cuenta 13%, el abono o pago reduce la cartera mediante crédito
        const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
        if (valAbono === 0) continue;

        // Si es una línea débito perteneciente a la causación original de la factura, ignorar
        if (causalityTxIds.has(tl.tx_id) && valAbono < 0) continue;

        const ref = String(tl.cross_doc_ref || "").trim().toUpperCase();

        // Buscamos si esta referencia pertenece a alguna de nuestras facturas
        const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + "-"));

        if (matchedInv) {
          abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
        } else if (ref.startsWith("ANTICIPO-")) {
          // Soporte Cartera Directa: anticipo pre-asignado a cuota futura (ANTICIPO-YYYYMM-{propId})
          const parts = ref.split("-");
          if (parts.length >= 3) {
            const pCode = parts[1];
            const pId = parts.slice(2).join("-");
            const targetInv = invoices.find(inv => {
              const invPCode = String(inv.period || "").replace("-", "");
              return invPCode === pCode && String(inv.property_id).toUpperCase() === pId.toUpperCase();
            });
            if (targetInv && targetInv.number) {
              const invNum = String(targetInv.number).trim().toUpperCase();
              abonosMap.set(invNum, (abonosMap.get(invNum) || 0) + valAbono);
            } else {
              const pidKey = pId.toLowerCase();
              advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
            }
          }
        } else if (ref.startsWith("ANT-")) {
          // Soporte saldo inicial de anticipos por unidad (ANT-{propId})
          const pidKey = ref.substring(4).toLowerCase();
          advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
        }
      }
    }`;

const apiReplacement1 = `    const properties = await this.getPhProperties(false).catch(() => []);
    const propById = new Map(properties.map((p: any) => [String(p.id).toLowerCase(), p]));

    if (invNumbers.length > 0 || properties.length > 0) {
      // Traemos líneas contables que afecten cartera (cuenta 13%) con fecha <= corte
      const txLines = await pb.listAll("tx_lines", {
        filter: \`account_id.code ~ "13%" && tx_id.date <= "\${refDate}" && (tx_id.status = "posted" || tx_id.status = "active")\`,
        expand: "tx_id,account_id"
      });

      for (const tl of txLines) {
        // En cuenta 13%, el abono o pago reduce la cartera mediante crédito
        const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
        if (valAbono === 0) continue;

        // Si es una línea débito perteneciente a la causación original de la factura, ignorar
        if (causalityTxIds.has(tl.tx_id) && valAbono < 0) continue;

        const ref = String(tl.cross_doc_ref || "").trim().toUpperCase();

        // Buscamos si esta referencia pertenece a alguna de nuestras facturas
        const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + "-"));

        if (matchedInv) {
          abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
        } else if (ref.startsWith("ANTICIPO-")) {
          // Soporte Cartera Directa: anticipo pre-asignado a cuota futura (ANTICIPO-YYYYMM-{propId})
          const parts = ref.split("-");
          if (parts.length >= 3) {
            const pCode = parts[1];
            const pId = parts.slice(2).join("-");
            const targetInv = invoices.find(inv => {
              const invPCode = String(inv.period || "").replace("-", "");
              return invPCode === pCode && String(inv.property_id).toUpperCase() === pId.toUpperCase();
            });
            if (targetInv && targetInv.number) {
              const invNum = String(targetInv.number).trim().toUpperCase();
              abonosMap.set(invNum, (abonosMap.get(invNum) || 0) + valAbono);
            } else {
              const pidKey = pId.toLowerCase();
              advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
            }
          }
        } else if (ref.startsWith("ANT-")) {
          // Soporte saldo inicial de anticipos por unidad (ANT-{propId})
          const pidKey = ref.substring(4).toLowerCase();
          advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
        } else if (tl.description) {
          // Fallback por descripción de unidad (ej: "Unidad 2903" o "Apartamento. B-903")
          for (const p of properties) {
            if (tl.description.includes(\`Unidad \${p.code}\`) || (p.name && tl.description.includes(p.name))) {
              const pidKey = String(p.id).toLowerCase();
              advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
              break;
            }
          }
        }
      }
    }`;

// Target 2: End of loop for inv of invoices -> append leftover advances as CUOTA DE ADMINISTRACION
const apiTarget2 = `    const properties = await this.getPhProperties(false).catch(() => []);
    const propById = new Map(properties.map(p => [String(p.id), p]));

    // Ordenar facturas cronológicamente para aplicación FIFO estricta de pagos y anticipos
    invoices.sort((a, b) => {
      const dA = String(a.date || a.created || "");
      const dB = String(b.date || b.created || "");
      return dA.localeCompare(dB) || String(a.number || "").localeCompare(String(b.number || ""));
    });

    const rows = [];
    for (const inv of invoices) {`;

const apiReplacement2 = `    // Ordenar facturas cronológicamente para aplicación FIFO estricta de pagos y anticipos
    invoices.sort((a, b) => {
      const dA = String(a.date || a.created || "");
      const dB = String(b.date || b.created || "");
      return dA.localeCompare(dB) || String(a.number || "").localeCompare(String(b.number || ""));
    });

    const rows = [];
    for (const inv of invoices) {`;

// Target 3: After loop inv of invoices -> inject unused advance pool as Cuota de Administración
const apiTarget3 = `        rows.push({
          invoice: inv,
          line,
          amount: currentBalance, // Saldo para el reporte
          originalAmount: originalAmount, // Valor original para integridad
          abono: abonoAplicado,
          saldoAnticipo: propAdvancePool,
          diasMora: Math.max(0, diasMoraRaw),
          diasMoraRaw,
          fechaDoc,
          dueDate: venc,
          estado,
          propertyId: String(inv.property_id || ""),
          propertyCode: String(prop?.code || ""),
          propertyName: String(prop?.name || ""),
          ownerId: String(prop?.owner_id || owner?.id || ""),
          ownerName: String(owner?.name || "").trim(),
          ownerDoc: String(owner?.doc_number || "").trim(),
          conceptoId: normalizedConceptId,
          concepto: normalizedConcepto,
        });
      }
    }
    return { invoices, rows };`;

const apiReplacement3 = `        rows.push({
          invoice: inv,
          line,
          amount: currentBalance, // Saldo para el reporte
          originalAmount: originalAmount, // Valor original para integridad
          abono: abonoAplicado,
          saldoAnticipo: propAdvancePool,
          diasMora: Math.max(0, diasMoraRaw),
          diasMoraRaw,
          fechaDoc,
          dueDate: venc,
          estado,
          propertyId: String(inv.property_id || ""),
          propertyCode: String(prop?.code || ""),
          propertyName: String(prop?.name || ""),
          ownerId: String(prop?.owner_id || owner?.id || ""),
          ownerName: String(owner?.name || "").trim(),
          ownerDoc: String(owner?.doc_number || "").trim(),
          conceptoId: normalizedConceptId,
          concepto: normalizedConcepto,
        });
      }
    }

    // 4. Incorporar saldos a favor (anticipos no absorbidos en cuenta 134595)
    // Se unifican directamente bajo el concepto 'Cuota de administración' (ADM)
    for (const [pIdKey, remAdvance] of advancesByPropMap.entries()) {
      if (remAdvance > 0.01) {
        if (propertyId && String(propertyId).toLowerCase() !== pIdKey) {
          continue;
        }
        const prop = propById.get(pIdKey) || properties.find((p: any) => String(p.id).toLowerCase() === pIdKey);
        const owner = prop?.expand?.owner_id;

        rows.push({
          invoice: {
            id: \`ADV-\${pIdKey}\`,
            number: 'ANTICIPO',
            period: 'Anticipo',
            status: 'posted',
            total: 0,
          },
          line: {
            description: 'Anticipo Cuota de Administración',
          },
          amount: -remAdvance, // Saldo a favor acreedor (negativo)
          originalAmount: 0,
          abono: remAdvance,
          saldoAnticipo: remAdvance,
          diasMora: 0,
          diasMoraRaw: -1,
          fechaDoc: cutoffDate || new Date().toISOString().slice(0, 10),
          dueDate: '',
          estado: 'saldo_a_favor',
          propertyId: prop?.id || pIdKey,
          propertyCode: String(prop?.code || ''),
          propertyName: String(prop?.name || ''),
          ownerId: String(prop?.owner_id || owner?.id || ''),
          ownerName: String(owner?.name || '').trim(),
          ownerDoc: String(owner?.doc_number || '').trim(),
          conceptoId: 'CUOTA DE ADMINISTRACION',
          concepto: 'Cuota de administración',
        });
      }
    }

    return { invoices, rows };`;

// Target 4: getPhCarteraOpenParties mapping
const apiTarget4 = `        dueDate: r.dueDate,
        diasMora: r.diasMora,
        estado: r.estado,
      }))`;

const apiReplacement4 = `        dueDate: r.dueDate,
        diasMora: r.diasMora,
        diasMoraRaw: r.diasMoraRaw,
        saldoAnticipo: r.saldoAnticipo,
        estado: r.estado,
      }))`;

// Target 5: byInvoice in getPhCarteraIntegrity
const apiTarget5 = `    const byInvoice = {};
    for (const r of rows) {
      const id = r.invoice.id;`;

const apiReplacement5 = `    const byInvoice = {};
    for (const r of rows) {
      if (r.estado === 'saldo_a_favor') continue;
      const id = r.invoice.id;`;

// Normalize CRLF
let normCode = apiCode.replace(/\r\n/g, '\n');
const normT1 = apiTarget1.replace(/\r\n/g, '\n');
const normR1 = apiReplacement1.replace(/\r\n/g, '\n');
const normT2 = apiTarget2.replace(/\r\n/g, '\n');
const normR2 = apiReplacement2.replace(/\r\n/g, '\n');
const normT3 = apiTarget3.replace(/\r\n/g, '\n');
const normR3 = apiReplacement3.replace(/\r\n/g, '\n');
const normT4 = apiTarget4.replace(/\r\n/g, '\n');
const normR4 = apiReplacement4.replace(/\r\n/g, '\n');
const normT5 = apiTarget5.replace(/\r\n/g, '\n');
const normR5 = apiReplacement5.replace(/\r\n/g, '\n');

if (normCode.includes(normT1) && normCode.includes(normT2) && normCode.includes(normT3) && normCode.includes(normT4) && normCode.includes(normT5)) {
  normCode = normCode.replace(normT1, normR1)
                     .replace(normT2, normR2)
                     .replace(normT3, normR3)
                     .replace(normT4, normR4)
                     .replace(normT5, normR5);
  fs.writeFileSync(apiPath, normCode, 'utf8');
  console.log('Successfully patched frontend/src/api.ts');
} else {
  console.error('Target mismatch in frontend/src/api.ts');
  console.log('T1:', normCode.includes(normT1), 'T2:', normCode.includes(normT2), 'T3:', normCode.includes(normT3), 'T4:', normCode.includes(normT4), 'T5:', normCode.includes(normT5));
}

// =============================================================================
// 2. PATCH frontend/src/modules/copropiedades.ts
// =============================================================================
const copPath = path.join(__dirname, '..', 'frontend', 'src', 'modules', 'copropiedades.ts');
let copCode = fs.readFileSync(copPath, 'utf8');
let normCop = copCode.replace(/\r\n/g, '\n');

// Target 1: Meta and Table Body rendering in loadCartera
const copTarget1 = `          const rows = [...byUnit.values()].sort((a, b) => a.unidad.localeCompare(b.unidad, 'es'));

          const totalByConcept = {};
          let grandTotal = 0;
          let grandAnticipos = 0;
          for (const r of rows) {
            grandTotal += Number(r.totalGeneral || 0);
            grandAnticipos += Number(r.saldoAnticipo || 0);
            for (const c of concepts) {
              totalByConcept[c.id] = (totalByConcept[c.id] || 0) + Number(r.byConcept[c.id] || 0);
            }
          }

          const uniqueDocs = new Set(activeParties.map(p => String(p.invoiceId || ''))).size;

          document.getElementById('ph-cartera-bal-meta').innerHTML =
            \`Unidades: <strong>\${fmtN(rows.length)}</strong> · Conceptos: <strong>\${fmtN(concepts.length)}</strong> · Documentos: <strong>\${fmtN(uniqueDocs)}</strong> · Saldo facturado: <strong>\${fmt(grandTotal)}</strong>\${grandAnticipos > 0 ? \` · Saldo a favor (Anticipos 28): <strong class="text-emerald-700">-\${fmt(grandAnticipos)}</strong> · Saldo neto real: <strong class="text-blue-800">\${fmt(Math.max(0, grandTotal - grandAnticipos))}</strong>\` : ''}\`;`;

const copReplacement1 = `          const rows = [...byUnit.values()].sort((a, b) => a.unidad.localeCompare(b.unidad, 'es'));

          const totalByConcept: any = {};
          let grandTotal = 0;
          let grandDebits = 0;
          let grandCredits = 0;
          let creditUnitsCount = 0;

          for (const r of rows) {
            const tot = Number(r.totalGeneral || 0);
            grandTotal += tot;
            if (tot > 0) grandDebits += tot;
            else if (tot < -0.01) {
              grandCredits += Math.abs(tot);
              creditUnitsCount++;
            }
            for (const c of concepts) {
              totalByConcept[c.id] = (totalByConcept[c.id] || 0) + Number(r.byConcept[c.id] || 0);
            }
          }

          const uniqueDocs = new Set(activeParties.map(p => String(p.invoiceId || ''))).size;

          document.getElementById('ph-cartera-bal-meta').innerHTML =
            \`Unidades con saldo: <strong>\${fmtN(rows.length)}</strong> · Conceptos: <strong>\${fmtN(concepts.length)}</strong> · Cartera CxC (Deuda): <strong class="text-gray-900">\${_fmt(grandDebits)}</strong>\${grandCredits > 0 ? \` · Saldos a favor (Anticipos): <strong class="text-emerald-700">-\${_fmt(grandCredits)} (\${creditUnitsCount} unidades)</strong>\` : ''} · Saldo neto cartera: <strong class="text-blue-900">\${_fmt(grandTotal)}</strong>\`;`;

// Target 2: Tbody and Tfoot rendering
const copTarget2 = `          document.getElementById('ph-cartera-resumen-tbody').innerHTML = rows.map(r => {
            const netAmt = Math.max(0, r.totalGeneral - (r.saldoAnticipo || 0));
            return \`
            <tr>
              <td class="font-semibold" style="color:#0D2137">\${esc(r.unidad)}</td>
              <td>
                <span class="text-sm font-medium" style="color:#374151">\${esc(r.ownerName || '—')}</span>
                \${r.ownerDoc ? \`<br><span class="text-xs" style="color:#9CA3AF">\${esc(r.ownerDoc)}</span>\` : ''}
              </td>
              \${concepts.map(c => {
                const v = Number(r.byConcept[c.id] || 0);
                return \`<td class="text-right">\${v ? fmt(v) : ''}</td>\`;
              }).join('')}
              <td class="text-right font-semibold" style="color:#065F46">
                <div>\${fmt(r.totalGeneral)}</div>
                \${r.saldoAnticipo > 0 ? \`<div class="text-[11px] font-medium text-emerald-700" title="Saldo a favor en cuenta 28">Anticipo: -\${fmt(r.saldoAnticipo)}<br><span class="font-bold \${netAmt > 0 ? 'text-amber-800' : 'text-emerald-800'}">Neto: \${fmt(netAmt)}</span></div>\` : ''}
              </td>
            </tr>\`;
          }).join('');
          document.getElementById('ph-cartera-resumen-tfoot').innerHTML = \`
            <tr>
              <td colspan="2" class="font-bold">Total general</td>
              \${concepts.map(c => \`<td class="font-bold text-right">\${totalByConcept[c.id] ? fmt(totalByConcept[c.id]) : ''}</td>\`).join('')}
              <td class="font-bold text-right">\${fmt(grandTotal)}</td>
            </tr>\`;`;

const copReplacement2 = `          document.getElementById('ph-cartera-resumen-tbody').innerHTML = rows.map(r => {
            const isCredit = Number(r.totalGeneral || 0) < -0.01;
            return \`
            <tr class="\${isCredit ? 'bg-emerald-50/40' : ''}">
              <td class="font-semibold" style="color:#0D2137">
                \${esc(r.unidad)}
                \${isCredit ? \`<span class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800" title="Saldo a favor disponible para cuotas futuras"><i class="fas fa-piggy-bank mr-1"></i>A favor</span>\` : ''}
              </td>
              <td>
                <span class="text-sm font-medium" style="color:#374151">\${esc(r.ownerName || '—')}</span>
                \${r.ownerDoc ? \`<br><span class="text-xs" style="color:#9CA3AF">\${esc(r.ownerDoc)}</span>\` : ''}
              </td>
              \${concepts.map(c => {
                const v = Number(r.byConcept[c.id] || 0);
                if (Math.abs(v) < 0.01) return \`<td class="text-right text-gray-300">—</td>\`;
                const isColCredit = v < -0.01;
                return \`<td class="text-right font-medium \${isColCredit ? 'text-emerald-700 font-bold' : ''}">
                  \${isColCredit ? \`(\${_fmt(Math.abs(v))})\` : _fmt(v)}
                </td>\`;
              }).join('')}
              <td class="text-right font-semibold" style="color:\${isCredit ? '#047857' : '#065F46'}">
                <div class="\${isCredit ? 'text-emerald-700 font-bold' : ''}">\${isCredit ? \`(\${_fmt(Math.abs(r.totalGeneral))})\` : _fmt(r.totalGeneral)}</div>
              </td>
            </tr>\`;
          }).join('');
          document.getElementById('ph-cartera-resumen-tfoot').innerHTML = \`
            <tr>
              <td colspan="2" class="font-bold">Total general neto</td>
              \${concepts.map(c => {
                const tv = Number(totalByConcept[c.id] || 0);
                const isCrd = tv < -0.01;
                return \`<td class="font-bold text-right \${isCrd ? 'text-emerald-700' : ''}">\${tv ? (isCrd ? \`(\${_fmt(Math.abs(tv))})\` : _fmt(tv)) : ''}</td>\`;
              }).join('')}
              <td class="font-bold text-right" style="color:\${grandTotal < 0 ? '#047857' : '#0D2137'}">\${grandTotal < 0 ? \`(\${_fmt(Math.abs(grandTotal))})\` : _fmt(grandTotal)}</td>
            </tr>\`;`;

const normCopT1 = copTarget1.replace(/\r\n/g, '\n');
const normCopR1 = copReplacement1.replace(/\r\n/g, '\n');
const normCopT2 = copTarget2.replace(/\r\n/g, '\n');
const normCopR2 = copReplacement2.replace(/\r\n/g, '\n');

if (normCop.includes(normCopT1) && normCop.includes(normCopT2)) {
  normCop = normCop.replace(normCopT1, normCopR1).replace(normCopT2, normCopR2);
  fs.writeFileSync(copPath, normCop, 'utf8');
  console.log('Successfully patched frontend/src/modules/copropiedades.ts');
} else {
  console.error('Target mismatch in frontend/src/modules/copropiedades.ts');
  console.log('T1:', normCop.includes(normCopT1), 'T2:', normCop.includes(normCopT2));
}

