const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';
const db = new sqlite3.Database(dbPath);

// Exactly what pb_hooks/ph_integrity_guard.pb.js does:
db.all("SELECT id, code, name FROM ph_properties WHERE code = '4104'", (err, props) => {
  const p = props[0];

  db.all("SELECT id, number, period, date, total, status, property_id, tx_id FROM ph_invoices WHERE status != 'voided' AND tx_id != ''", (err, invoices) => {
    const invByNum = {};
    const invsByProp = {};
    for (const inv of invoices) {
      const nKey = String(inv.number || "").trim().toUpperCase();
      invByNum[nKey] = inv;
      if (!invsByProp[inv.property_id]) invsByProp[inv.property_id] = [];
      invsByProp[inv.property_id].push(inv);
    }

    db.all(`
      SELECT l.id, l.tx_id, l.debit, l.credit, l.description, l.cross_doc_ref, l.third_party_id, t.number as tx_num
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN accounts a ON a.id = l.account_id
      WHERE a.code = '13459501' AND t.status = 'active'
    `, (err, c13Lines) => {
      const unitLedger = { debits: 0, credits: 0, cruceDebits: 0, balance: 0 };

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
          const bracketMatch = String(l.description).match(/\[([0-9a-zA-Z_-]+)\]/);
          if (bracketMatch && bracketMatch[1].toUpperCase() === p.code) {
            matchedPropId = p.id;
          } else if (l.description.indexOf("Unidad " + p.code) !== -1 || l.description.indexOf(p.name) !== -1) {
            matchedPropId = p.id;
          }
        }

        if (matchedPropId === p.id) {
          const deb = Number(l.debit || 0);
          const cred = Number(l.credit || 0);
          unitLedger.debits += deb;
          unitLedger.credits += cred;
          unitLedger.balance += (deb - cred);
          if (deb > 0 && (String(l.tx_num || "").indexOf("RC-") === 0 || String(l.description || "").indexOf("Cruce / Aplicación") !== -1)) {
            unitLedger.cruceDebits += deb;
          }
        }
      }

      const pInvs = invsByProp[p.id] || [];
      let facturado = 0;
      for (const inv of pInvs) facturado += Number(inv.total || 0);

      const recaudado = Math.max(0, unitLedger.credits - (unitLedger.cruceDebits || 0));
      const carteraBal = Math.round((facturado - recaudado) * 100) / 100;
      const libroBal = Math.round(unitLedger.balance * 100) / 100;

      console.log('--- PH_INTEGRITY_GUARD PARA 4104 ---');
      console.log('Invoices count:', pInvs.length);
      console.log('Facturado total:', facturado);
      console.log('Ledger debits:', unitLedger.debits);
      console.log('Ledger credits:', unitLedger.credits);
      console.log('Ledger cruceDebits:', unitLedger.cruceDebits);
      console.log('Recaudado (credits - cruceDebits):', recaudado);
      console.log('CarteraBal (facturado - recaudado):', carteraBal);
      console.log('LibroBal (debits - credits):', libroBal);
      console.log('Diferencia:', carteraBal - libroBal);
    });
  });
});

