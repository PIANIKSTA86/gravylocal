const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';
const db = new sqlite3.Database(dbPath);

const pCode = '1104';

db.serialize(() => {
  db.get("SELECT id, code, name FROM ph_properties WHERE code = ?", [pCode], (err, prop) => {
    db.all("SELECT id, number, period, total, status FROM ph_invoices WHERE property_id = ? AND status != 'voided'", [prop.id], (err, invs) => {
      console.log('FACTURAS ACTIVAS DE 1104:');
      let sumInv = 0;
      invs.forEach(i => {
        sumInv += Number(i.total || 0);
        console.log(`  ${i.number} | ${i.period} | $${i.total} | ${i.status}`);
      });
      console.log('TOTAL FACTURADO:', sumInv);

      // Now emulate the exact matching of ph_integrity_guard
      db.all("SELECT id, number, property_id FROM ph_invoices WHERE status != 'voided'", (err, allInvs) => {
        const invByNum = {};
        for (const inv of allInvs) {
          invByNum[String(inv.number).trim().toUpperCase()] = inv;
        }

        db.all("SELECT id, code, name FROM ph_properties", (err, allProps) => {
          db.all(`
            SELECT l.id, l.tx_id, l.debit, l.credit, l.description, l.cross_doc_ref, t.number as tx_num, t.date as tx_date
            FROM tx_lines l
            JOIN transactions t ON t.id = l.tx_id
            JOIN accounts a ON a.id = l.account_id
            WHERE a.code = '13459501' AND t.status = 'active'
          `, (err, lines) => {
            const assigned = [];
            for (const l of lines) {
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
                for (const p of allProps) {
                  if (l.description.indexOf("Unidad " + p.code) !== -1 || l.description.indexOf(p.name) !== -1) {
                    matchedPropId = p.id;
                    break;
                  }
                }
              }

              if (matchedPropId === prop.id) {
                assigned.push(l);
              }
            }

            console.log(`\nLINEAS ASIGNADAS A 1104 (${assigned.length}):`);
            let deb = 0, cred = 0;
            assigned.forEach(l => {
              deb += Number(l.debit || 0);
              cred += Number(l.credit || 0);
              console.log(`  Tx: ${l.tx_num} (${l.tx_date}) | D: ${l.debit} | C: ${l.credit} | ref: ${l.cross_doc_ref} | desc: ${l.description}`);
            });
            console.log(`TOTAL DEBITOS LIBRO: ${deb}, TOTAL CREDITOS LIBRO: ${cred}, NETO LIBRO: ${deb - cred}`);
          });
        });
      });
    });
  });
});

