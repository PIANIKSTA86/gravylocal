const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all("SELECT id, code, name FROM ph_properties", (err, props) => {
    const propMap = {};
    props.forEach(p => propMap[p.id] = p);

    db.all("SELECT id, number, property_id, total, status, period FROM ph_invoices WHERE status != 'voided'", (err, invs) => {
      const invByNum = {};
      const invsByProp = {};
      invs.forEach(i => {
        invByNum[String(i.number).trim().toUpperCase()] = i;
        if (!invsByProp[i.property_id]) invsByProp[i.property_id] = [];
        invsByProp[i.property_id].push(i);
      });

      db.all(`
        SELECT l.id, l.tx_id, l.debit, l.credit, l.description, l.cross_doc_ref, t.number as tx_num, t.date as tx_date, a.code as acc_code
        FROM tx_lines l
        JOIN transactions t ON t.id = l.tx_id
        JOIN accounts a ON a.id = l.account_id
        WHERE a.code = '13459501' AND t.status = 'active'
      `, (err, lines) => {
        const linesByProp = {};
        props.forEach(p => linesByProp[p.id] = []);

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
            for (const p of props) {
              if (l.description.indexOf("Unidad " + p.code) !== -1 || l.description.indexOf(p.name) !== -1) {
                matchedPropId = p.id;
                break;
              }
            }
          }

          if (matchedPropId && linesByProp[matchedPropId]) {
            linesByProp[matchedPropId].push(l);
          }
        }

        console.log('=== DETAILED ROOT CAUSE FOR ALL 24 UNITS ===\n');

        props.forEach(p => {
          const pInvs = invsByProp[p.id] || [];
          let facturado = 0;
          pInvs.forEach(i => facturado += Number(i.total || 0));

          const pLines = linesByProp[p.id] || [];
          let debits = 0, credits = 0;
          pLines.forEach(l => {
            debits += Number(l.debit || 0);
            credits += Number(l.credit || 0);
          });

          const carteraBal = Math.round((facturado - credits) * 100) / 100;
          const libroBal = Math.round((debits - credits) * 100) / 100;
          const diff = Math.round((carteraBal - libroBal) * 100) / 100;

          if (Math.abs(diff) > 0.01) {
            console.log(`\n>>> Unidad ${p.code} (${p.name}) | Dif: ${diff}`);
            console.log(`    Facturado: ${facturado} | Debits: ${debits} | Credits: ${credits}`);
            console.log(`    Invoices (${pInvs.length}):`);
            pInvs.forEach(i => console.log(`      - ${i.number} (${i.period}): ${i.total}`));
            console.log(`    Tx Lines with unexpected debits or non-invoice debits:`);
            pLines.filter(l => Number(l.debit || 0) > 0).forEach(l => {
              const isInv = l.tx_num.startsWith('CF-') || l.tx_num.startsWith('SI-');
              if (!isInv || Number(l.debit) !== 250000) {
                console.log(`      * D: ${l.debit} | Tx: ${l.tx_num} | Ref: ${l.cross_doc_ref} | Desc: ${l.description}`);
              }
            });
            console.log(`    Tx Lines with unexpected credits:`);
            pLines.filter(l => Number(l.credit || 0) > 0 && !l.tx_num.startsWith('RC-')).forEach(l => {
              console.log(`      * C: ${l.credit} | Tx: ${l.tx_num} | Ref: ${l.cross_doc_ref} | Desc: ${l.description}`);
            });
          }
        });
      });
    });
  });
});

