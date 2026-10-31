const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'pb_hooks', 'reports_optimized.pb.js'),
  path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_hooks', 'reports_optimized.pb.js')
];

const target = `      rows.push({
        invoice_id:      inv.invoice_id,
        invoice_number:  inv.invoice_number,
        period:          inv.period,
        invoice_date:    inv.invoice_date,
        due_date:        dueStr,
        days_overdue:    daysOverdue,
        property_id:     inv.property_id,
        property_code:   inv.property_code,
        property_name:   inv.property_name,
        tower:           inv.tower,
        apartment:       inv.apartment,
        coef:            inv.coef,
        owner_id:        inv.owner_id,
        owner_name:      inv.owner_name,
        owner_doc:       inv.owner_doc,
        total_facturado: Number(inv.total || 0),
        total_abonado:   totalAbonado,
        saldo:           saldo,
        por_vencer:      por_vencer,
        de_0_a_30:       de_0_a_30,
        de_31_a_60:      de_31_a_60,
        de_61_a_90:      de_61_a_90,
        mayor_a_90:      mayor_a_90,
        lines:           invLines.map(l => ({
          concept_id:   l.concept_id,
          concept_name: l.concept_name,
          amount:       Number(l.amount || 0)
        }))
      });
    }

    return c.json(200, { rows, totals });`;

const replacement = `      rows.push({
        invoice_id:      inv.invoice_id,
        invoice_number:  inv.invoice_number,
        period:          inv.period,
        invoice_date:    inv.invoice_date,
        due_date:        dueStr,
        days_overdue:    daysOverdue,
        property_id:     inv.property_id,
        property_code:   inv.property_code,
        property_name:   inv.property_name,
        tower:           inv.tower,
        apartment:       inv.apartment,
        coef:            inv.coef,
        owner_id:        inv.owner_id,
        owner_name:      inv.owner_name,
        owner_doc:       inv.owner_doc,
        total_facturado: Number(inv.total || 0),
        total_abonado:   totalAbonado,
        saldo:           saldo,
        por_vencer:      por_vencer,
        de_0_a_30:       de_0_a_30,
        de_31_a_60:      de_31_a_60,
        de_61_a_90:      de_61_a_90,
        mayor_a_90:      mayor_a_90,
        lines:           invLines.map(l => ({
          concept_id:   l.concept_id,
          concept_name: l.concept_name,
          amount:       Number(l.amount || 0)
        }))
      });
    }

    // Agregar saldos a favor (anticipos no absorbidos) bajo Cuota de Administración
    for (const pKey in advancesByProp) {
      const rem = advancesByProp[pKey];
      if (rem > 0.01) {
        let propRec = null;
        try { propRec = $app.findRecordById("ph_properties", pKey.toLowerCase()); } catch (_) {}
        if (propRec) {
          let ownerRec = null;
          try {
            if (propRec.getString("owner_id")) {
              ownerRec = $app.findRecordById("third_parties", propRec.getString("owner_id"));
            }
          } catch (_) {}

          rows.push({
            invoice_id: "ADV-" + pKey,
            invoice_number: "ANTICIPO",
            period: "Anticipo",
            invoice_date: "",
            due_date: "",
            days_overdue: -1,
            property_id: propRec.id,
            property_code: propRec.getString("code"),
            property_name: propRec.getString("name"),
            tower: propRec.getString("tower"),
            apartment: propRec.getString("apartment"),
            coef: propRec.getFloat("coef_participacion"),
            owner_id: ownerRec ? ownerRec.id : "",
            owner_name: ownerRec ? ownerRec.getString("name") : "",
            owner_doc: ownerRec ? ownerRec.getString("doc_number") : "",
            total_facturado: 0,
            total_abonado: rem,
            saldo: -rem,
            por_vencer: -rem,
            de_0_a_30: 0,
            de_31_a_60: 0,
            de_61_a_90: 0,
            mayor_a_90: 0,
            lines: [{
              concept_id: "ADM",
              concept_name: "Cuota de administración",
              amount: -rem
            }]
          });
          totals.grandTotal -= rem;
          totals.por_vencer -= rem;
        }
      }
    }

    return c.json(200, { rows, totals });`;

for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    const normC = content.replace(/\r\n/g, '\n');
    const normT = target.replace(/\r\n/g, '\n');
    const normR = replacement.replace(/\r\n/g, '\n');
    if (normC.includes(normT)) {
      content = normC.replace(normT, normR);
      fs.writeFileSync(f, content, 'utf8');
      console.log('Successfully patched', f);
    } else {
      console.error('Target not found in', f);
    }
  }
}

