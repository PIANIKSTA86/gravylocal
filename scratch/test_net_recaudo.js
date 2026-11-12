const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all("SELECT id, code, name FROM ph_properties ORDER BY code ASC", (err, props) => {
    const propById = {};
    const propByCode = {};
    props.forEach(p => {
      propById[p.id] = p;
      propByCode[String(p.code).trim().toUpperCase()] = p;
    });

    db.all("SELECT id, number, property_id, total, status, tx_id FROM ph_invoices WHERE status != 'voided' AND tx_id != ''", (err, invoices) => {
      const invTxIds = new Set(invoices.map(i => i.tx_id).filter(Boolean));
      const invByNum = {};
      const invsByProp = {};
      invoices.forEach(i => {
        invByNum[String(i.number).trim().toUpperCase()] = i;
        if (!invsByProp[i.property_id]) invsByProp[i.property_id] = [];
        invsByProp[i.property_id].push(i);
      });

      db.all(`
        SELECT l.id, l.tx_id, l.debit, l.credit, l.description, l.cross_doc_ref, t.number as tx_num
        FROM tx_lines l
        JOIN transactions t ON t.id = l.tx_id
        JOIN accounts a ON a.id = l.account_id
        WHERE a.code = '13459501' AND t.status = 'active'
      `, (err, c13Lines) => {
        const unitLedger = {};
        props.forEach(p => {
          unitLedger[p.id] = { debits: 0, credits: 0, balance: 0, nonInvoiceDebits: 0 };
        });

        for (const l of c13Lines) {
          let matchedPropId = null;
          const ref = String(l.cross_doc_ref || "").trim().toUpperCase();

          if (ref.startsWith("ANT-")) {
            matchedPropId = ref.substring(4).toLowerCase();
          } else if (ref.startsWith("ANTICIPO-")) {
            const parts = ref.split("-");
            if (parts.length >= 3) matchedPropId = parts.slice(2).join("-").toLowerCase();
          } else if (ref) {
            const baseInvNum = ref.split("-").slice(0, 3).join("-");
            const inv = invByNum[baseInvNum] || invByNum[ref];
            if (inv) matchedPropId = inv.property_id;
          }

          if (!matchedPropId && l.description) {
            const bracketMatch = l.description.match(/\[([0-9a-zA-Z_-]+)\]/);
            if (bracketMatch && propByCode[bracketMatch[1].toUpperCase()]) {
              matchedPropId = propByCode[bracketMatch[1].toUpperCase()].id;
            } else {
              for (const p of props) {
                if (l.description.indexOf("Unidad " + p.code) !== -1 || l.description.indexOf(p.name) !== -1) {
                  matchedPropId = p.id;
                  break;
                }
              }
            }
          }

          if (matchedPropId && unitLedger[matchedPropId]) {
            const d = Number(l.debit || 0);
            const c = Number(l.credit || 0);
            unitLedger[matchedPropId].debits += d;
            unitLedger[matchedPropId].credits += c;
            unitLedger[matchedPropId].balance += (d - c);

            // Débito no originado por emisión de factura (ej. cruce/compensación en RC)
            if (d > 0 && (!invTxIds.has(l.tx_id) || l.tx_num.startsWith('RC-') || l.description.includes('Cruce / Aplicación'))) {
              unitLedger[matchedPropId].nonInvoiceDebits += d;
            }
          }
        }

        const mismatches = [];
        let totalCartera = 0;
        let totalLibro = 0;

        props.forEach(p => {
          const pInvs = invsByProp[p.id] || [];
          let facturado = 0;
          pInvs.forEach(i => facturado += Number(i.total || 0));

          const ledger = unitLedger[p.id];
          // Recaudo neto real
          const netRecaudo = ledger.credits - ledger.nonInvoiceDebits;
          const carteraBal = Math.round((facturado - netRecaudo) * 100) / 100;
          const libroBal = Math.round(ledger.balance * 100) / 100;

          totalCartera += carteraBal;
          totalLibro += libroBal;

          const diff = Math.round((carteraBal - libroBal) * 100) / 100;
          if (Math.abs(diff) > 0.01) {
            mismatches.push({
              code: p.code,
              name: p.name,
              carteraBal,
              libroBal,
              diff
            });
          }
        });

        console.log(`=== AUDITORÍA MATEMÁTICA CON NET RECAUDO ===`);
        console.log(`Total Unidades: ${props.length}`);
        console.log(`Unidades Descuadradas: ${mismatches.length}`);
        console.log(`Total Cartera: ${totalCartera}`);
        console.log(`Total Libro: ${totalLibro}`);
        console.log(`Diferencia Global: ${totalCartera - totalLibro}`);
        if (mismatches.length > 0) {
          console.log(`Mismatches restantes (${mismatches.length}):`, mismatches.slice(0, 10));
        }
      });
    });
  });
});

