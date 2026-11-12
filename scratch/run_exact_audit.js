const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 1. Props
  db.all("SELECT id, code, name, owner_id FROM ph_properties ORDER BY code ASC", (err, props) => {
    // 2. Invoices
    db.all("SELECT id, number, period, date, total, status, property_id, tx_id FROM ph_invoices WHERE status != 'voided' AND tx_id != ''", (err, invoices) => {
      const invByNum = {};
      const invsByProp = {};
      for (const inv of invoices) {
        const nKey = String(inv.number || "").trim().toUpperCase();
        invByNum[nKey] = inv;
        if (!invsByProp[inv.property_id]) invsByProp[inv.property_id] = [];
        invsByProp[inv.property_id].push(inv);
      }

      // 3. tx_lines
      db.all(`
        SELECT l.id, l.tx_id, l.debit, l.credit, l.description, l.cross_doc_ref, l.third_party_id
        FROM tx_lines l
        INNER JOIN transactions t ON t.id = l.tx_id
        INNER JOIN accounts a ON a.id = l.account_id
        WHERE a.code = '13459501' AND t.status = 'active'
      `, (err, c13Lines) => {
        const unitLedger = {};
        for (const p of props) {
          unitLedger[p.id] = { debits: 0, credits: 0, balance: 0, lines: [] };
        }

        const unassignedLines = [];

        for (const l of c13Lines) {
          let matchedPropId = null;
          const ref = String(l.cross_doc_ref || "").trim().toUpperCase();

          if (ref.startsWith("ANT-")) {
            matchedPropId = ref.substring(4).toLowerCase();
          } else if (ref.startsWith("ANTICIPO-")) {
            const parts = ref.split("-");
            if (parts.length >= 3) {
              matchedPropId = parts.slice(2).join("-").toLowerCase();
            }
          } else if (ref) {
            const baseInvNum = ref.split("-").slice(0, 3).join("-");
            const inv = invByNum[baseInvNum] || invByNum[ref];
            if (inv) matchedPropId = inv.property_id;
          }

          if (!matchedPropId && l.description) {
            for (const p of props) {
              if (l.description.indexOf("Unidad " + p.code) !== -1 || l.description.indexOf(p.name) !== -1) {
                matchedPropId = p.id;
                break;
              }
            }
          }

          if (matchedPropId && unitLedger[matchedPropId]) {
            unitLedger[matchedPropId].debits += Number(l.debit || 0);
            unitLedger[matchedPropId].credits += Number(l.credit || 0);
            unitLedger[matchedPropId].balance += (Number(l.debit || 0) - Number(l.credit || 0));
            unitLedger[matchedPropId].lines.push(l);
          } else {
            unassignedLines.push(l);
          }
        }

        console.log('Unassigned lines in 13459501:', unassignedLines.length);
        unassignedLines.forEach(l => {
          console.log('  UNASSIGNED:', l.description, '| ref:', l.cross_doc_ref, '| D:', l.debit, '| C:', l.credit);
        });

        const mismatches = [];
        for (const p of props) {
          const pInvs = invsByProp[p.id] || [];
          let facturado = 0;
          for (const inv of pInvs) facturado += Number(inv.total || 0);

          const ledger = unitLedger[p.id] || { debits: 0, credits: 0, balance: 0, lines: [] };
          const recaudado = ledger.credits;
          const carteraBal = Math.round((facturado - recaudado) * 100) / 100;
          const libroBal = Math.round(ledger.balance * 100) / 100;
          const diff = Math.round((carteraBal - libroBal) * 100) / 100;

          if (Math.abs(diff) > 0.01) {
            mismatches.push({
              code: p.code,
              name: p.name,
              id: p.id,
              facturado,
              recaudado,
              ledgerDebits: ledger.debits,
              ledgerCredits: ledger.credits,
              carteraBal,
              libroBal,
              diff,
              invsCount: pInvs.length,
              linesCount: ledger.lines.length
            });
          }
        }

        console.log(`\nTOTAL MISMATCHES: ${mismatches.length}`);
        mismatches.forEach(m => {
          console.log(`Unidad ${m.code} (${m.name}): Facturado=${m.facturado}, LedgerDebits=${m.ledgerDebits} (DifDeb=${m.facturado - m.ledgerDebits}), Recaudado=${m.recaudado}, LedgerCredits=${m.ledgerCredits}, Cartera=${m.carteraBal}, Libro=${m.libroBal}, Dif=${m.diff}`);
        });
      });
    });
  });
});

