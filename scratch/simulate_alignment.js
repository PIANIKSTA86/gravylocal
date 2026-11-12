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
      db.all(`
        SELECT l.id, l.tx_id, l.debit, l.credit, l.description, l.cross_doc_ref, t.number as tx_num
        FROM tx_lines l
        JOIN transactions t ON t.id = l.tx_id
        JOIN accounts a ON a.id = l.account_id
        WHERE a.code = '13459501' AND t.status = 'active'
      `, (err, c13Lines) => {
        // Calculate debits per invoice tx_id in 13459501
        const debitsByTxId = {};
        for (const l of c13Lines) {
          const d = Number(l.debit || 0);
          if (d > 0) {
            debitsByTxId[l.tx_id] = (debitsByTxId[l.tx_id] || 0) + d;
          }
        }

        // SIMULATED: Invoices aligned to their accounting tx debits
        const invByNum = {};
        const invsByProp = {};
        invoices.forEach(i => {
          let alignedTotal = Number(i.total || 0);
          // If invoice has a dedicated tx_id (not the multi-property SI aperture AP-202605-000001)
          if (i.tx_id && !i.number.startsWith('SI-') && debitsByTxId[i.tx_id] !== undefined) {
            alignedTotal = debitsByTxId[i.tx_id];
          }

          const simInv = { ...i, total: alignedTotal };
          invByNum[String(i.number).trim().toUpperCase()] = simInv;
          if (!invsByProp[i.property_id]) invsByProp[i.property_id] = [];
          invsByProp[i.property_id].push(simInv);
        });

        const unitLedger = {};
        props.forEach(p => {
          unitLedger[p.id] = { debits: 0, credits: 0, balance: 0, crossDebits: 0 };
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

            if (d > 0 && l.description && (l.description.includes('Cruce / Aplicación Nota Crédito') || l.description.includes('Cruce / Aplicación'))) {
              unitLedger[matchedPropId].crossDebits += d;
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
          const recaudadoReal = ledger.credits - ledger.crossDebits;
          const carteraBal = Math.round((facturado - recaudadoReal) * 100) / 100;
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

        console.log(`=== RESULTADO DE LA SIMULACIÓN DE ALINEACIÓN ===`);
        console.log(`Total Unidades: ${props.length}`);
        console.log(`Unidades Descuadradas: ${mismatches.length}`);
        console.log(`Total Cartera: ${totalCartera}`);
        console.log(`Total Libro: ${totalLibro}`);
        console.log(`Diferencia Global: ${totalCartera - totalLibro}`);
        if (mismatches.length > 0) {
          console.log('Mismatches:', mismatches);
        }
      });
    });
  });
});

