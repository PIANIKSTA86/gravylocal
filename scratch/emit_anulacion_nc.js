const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error("Error opening DB:", err);
    process.exit(1);
  }
});

function generateId(prefix = 'r') {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = prefix;
  for (let i = 0; i < 14; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

db.serialize(() => {
  console.log("=== INICIANDO EMISIÓN DE NOTA CRÉDITO DE ANULACIÓN (CONCEPTO 2 DIAN) ===");

  // 1. Obtener settings y token
  db.all("SELECT key, value FROM settings WHERE key IN ('matias_api_token', 'matias_environment', 'company_nit', 'company_name', 'company_address', 'company_phone', 'company_email')", [], (err, rows) => {
    if (err) {
      console.error("Error leyendo settings:", err);
      return;
    }
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);

    const token = settings.matias_api_token;
    const env = settings.matias_environment || 'production';
    const host = env === 'production' ? 'api-v2.matias-api.com' : 'sandbox-api.matias-api.com';

    // 2. Obtener consecutivo siguiente para NC
    db.get("SELECT * FROM dian_resolutions WHERE prefix = 'NC' AND active = 1", [], (err, resNC) => {
      if (err || !resNC) {
        console.error("No se encontró resolución activa de Nota Crédito:", err);
        return;
      }

      const nextConsecutive = (resNC.current_number || 52) + 1;
      const ncNumber = `NC-000000${nextConsecutive}`.replace(/0+(\d{8})$/, '$1'); // formato estándar
      const docNumClean = String(nextConsecutive);
      const prefix = resNC.prefix; // "NC"
      const resNumber = resNC.resolution_number || "18760000001";

      console.log(`Emitiendo Nota Crédito: ${prefix}${docNumClean} (${ncNumber}) sobre resolución ${resNumber}...`);

      const now = new Date();
      // Hora Colombia UTC-5
      const coDate = new Date(now.getTime() - (5 * 60 * 60 * 1000));
      const issueDate = coDate.toISOString().slice(0, 10);
      const issueTime = coDate.toISOString().slice(11, 19);

      // 3. Construir Payload Oficial MATIAS API para Nota Crédito de Anulación (Concepto 2)
      const payload = {
        resolution_number: String(resNumber),
        prefix: prefix,
        document_number: docNumClean,
        operation_type_id: 12, // 12 = Con Referencia (DIAN 20)
        type_document_id: 5,   // 5 = Nota Crédito (code 91)
        date: issueDate,
        time: issueTime,
        notes: "Anulación de Factura Electrónica FE-00003176 por inconsistencia en conceptos y valores transmitidos",
        send_email: 0,
        customer: {
          identification_number: "4472973",
          dni: "4472973",
          name: "CARLOS ARTURO HERNANDEZ GALEANO",
          company_name: "CARLOS ARTURO HERNANDEZ GALEANO",
          email: "tanainas384@gmail.com",
          phone: "3148627745",
          mobile: "3148627745",
          address: "CR 5 15 00 LC 81",
          postal_code: "760001",
          merchant_registration: "0000000-00",
          identity_document_id: 1, // CC
          type_document_identification_id: 1,
          type_organization_id: 2, // Persona natural
          tax_regime_id: 2,        // No responsable
          tax_level_id: 5,         // R-99-PN
          type_liability_id: 117,
          municipality_id: 1006,   // Cali
          country_id: 45,
          city_id: 1006,
          dv: null
        },
        billing_reference: {
          number: "FE3176",
          date: "2026-11-19",
          uuid: "f347b9c506d8da6017abe51e32d58681aa2e214ae34d883f5e7ed94fefe8b5f35968a9484143a8d048d97130747b48c5",
          scheme_name: "CUFE-SHA384"
        },
        discrepancy_response: {
          reference_id: "FE3176",
          response_id: "2", // 2 = Anulación de factura electrónica
          description: "Anulación de factura electrónica"
        },
        payment_form: {
          payment_form_id: 2, // Crédito
          payment_method_id: 30, // Crédito
          payment_due_date: issueDate,
          duration_measure: "0"
        },
        payments: [
          {
            payment_method_id: 2,
            means_payment_id: 30,
            value_paid: "9989223.22",
            payment_due_date: issueDate,
            duration_measure: "0"
          }
        ],
        lines: [
          {
            unit_measure_id: 1093,
            quantity_units_id: 1093,
            invoiced_quantity: "1.00",
            line_extension_amount: "3082338.00",
            free_of_charge_indicator: false,
            description: "Venta FE-00003176 CREDITO",
            code: "99999999",
            type_item_identification_id: 4,
            type_item_identifications_id: 4,
            reference_price_id: 1,
            price_amount: "3082338.00",
            base_quantity: "1.00",
            tax_totals: [
              {
                tax_id: 1,
                percent: "0.00",
                taxable_amount: "3082338.00",
                tax_amount: "0.00"
              }
            ]
          },
          {
            unit_measure_id: 1093,
            quantity_units_id: 1093,
            invoiced_quantity: "1.00",
            line_extension_amount: "2590200.00",
            free_of_charge_indicator: false,
            description: "Ingresos por ventas consolidados - FE-00003176",
            code: "99999999",
            type_item_identification_id: 4,
            type_item_identifications_id: 4,
            reference_price_id: 1,
            price_amount: "2590200.00",
            base_quantity: "1.00",
            tax_totals: [
              {
                tax_id: 1,
                percent: "0.00",
                taxable_amount: "2590200.00",
                tax_amount: "0.00"
              }
            ]
          },
          {
            unit_measure_id: 1093,
            quantity_units_id: 1093,
            invoiced_quantity: "1.00",
            line_extension_amount: "492138.00",
            free_of_charge_indicator: false,
            description: "IVA Generado 19% venta FE-00003176",
            code: "99999999",
            type_item_identification_id: 4,
            type_item_identifications_id: 4,
            reference_price_id: 1,
            price_amount: "492138.00",
            base_quantity: "1.00",
            tax_totals: [
              {
                tax_id: 1,
                percent: "0.00",
                taxable_amount: "492138.00",
                tax_amount: "0.00"
              }
            ]
          },
          {
            unit_measure_id: 1093,
            quantity_units_id: 1093,
            invoiced_quantity: "1.00",
            line_extension_amount: "1912273.61",
            free_of_charge_indicator: false,
            description: "Costo de Ventas consolidado - FE-00003176",
            code: "99999999",
            type_item_identification_id: 4,
            type_item_identifications_id: 4,
            reference_price_id: 1,
            price_amount: "1912273.61",
            base_quantity: "1.00",
            tax_totals: [
              {
                tax_id: 1,
                percent: "0.00",
                taxable_amount: "1912273.61",
                tax_amount: "0.00"
              }
            ]
          },
          {
            unit_measure_id: 1093,
            quantity_units_id: 1093,
            invoiced_quantity: "1.00",
            line_extension_amount: "1912273.61",
            free_of_charge_indicator: false,
            description: "Baja Inventario COGS consolidada - FE-00003176",
            code: "99999999",
            type_item_identification_id: 4,
            type_item_identifications_id: 4,
            reference_price_id: 1,
            price_amount: "1912273.61",
            base_quantity: "1.00",
            tax_totals: [
              {
                tax_id: 1,
                percent: "0.00",
                taxable_amount: "1912273.61",
                tax_amount: "0.00"
              }
            ]
          }
        ],
        tax_totals: [
          {
            tax_id: 1,
            percent: "0.00",
            taxable_amount: "9989223.22",
            tax_amount: "0.00"
          }
        ],
        legal_monetary_totals: {
          line_extension_amount: "9989223.22",
          tax_exclusive_amount: "9989223.22",
          tax_inclusive_amount: "9989223.22",
          payable_amount: "9989223.22"
        }
      };

      console.log("Transmitiendo Nota Crédito a MATIAS API...");
      const bodyStr = JSON.stringify(payload);

      const req = https.request({
        hostname: host,
        path: '/api/ubl2.1/notes/credit',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr)
        }
      }, (res) => {
        let respData = '';
        res.on('data', chunk => respData += chunk);
        res.on('end', () => {
          console.log(`MATIAS API HTTP Status: ${res.statusCode}`);
          let parsed = {};
          try {
            parsed = JSON.parse(respData);
          } catch (_) {
            console.log("Raw response:", respData);
          }

          console.log("Respuesta MATIAS API:", JSON.stringify(parsed, null, 2));

          const isValid = parsed.data && (parsed.data.is_valid === 1 || parsed.data.status === 1 || parsed.data.is_valid === true);
          const cude = parsed.data?.cude || parsed.data?.uuid || parsed.data?.XmlDocumentKey || "";
          const dianMsg = parsed.message || parsed.data?.status_description || "Nota Crédito autorizada por la DIAN";
          const xmlContent = parsed.data?.xml || parsed.data?.xml_base64 || "";

          if (isValid || cude || res.statusCode === 200 || res.statusCode === 201) {
            console.log(">>> NOTA CRÉDITO ACEPTADA POR LA DIAN CON ÉXITO! <<<");
            console.log("CUDE:", cude);

            // 4. Crear transacción contable de la Nota Crédito en DB
            const ncTxId = generateId('r');
            const ncTxTypeId = 'dvjnxfmqpex345k'; // Tipo Nota Crédito NC
            const customerId = '29zuv14e1s1ameu'; // Carlos Arturo
            const fullDocNum = `NC${docNumClean}`;

            db.run(`
              INSERT INTO transactions (id, number, date, description, third_party_id, tx_type_id, user_id, status, branch_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'eo3d07bscdpb7kd')
            `, [ncTxId, fullDocNum, issueDate, `Anulación Nota Crédito de FE-00003176 - CARLOS ARTURO HERNANDEZ GALEANO`, customerId, ncTxTypeId, 'luisa_user'], function(err) {
              if (err) console.error("Error insertando transaccion NC:", err);
              else console.log(`Transacción contable ${fullDocNum} creada con id ${ncTxId}`);
            });

            // 5. Guardar en einvoice_docs
            const einvId = generateId('r');
            db.run(`
              INSERT INTO einvoice_docs (id, tx_id, document_number, cufe, status, dian_response, sent_at, email_sent, xml_content)
              VALUES (?, ?, ?, ?, 'aceptada', ?, datetime('now'), 0, ?)
            `, [einvId, ncTxId, fullDocNum, cude, `La Nota de crédito electrónica ${fullDocNum}, ha sido autorizada.`, xmlContent], function(err) {
              if (err) console.error("Error insertando einvoice_docs:", err);
              else console.log(`einvoice_docs registrado para ${fullDocNum}`);
            });

            // 6. Actualizar consecutivo en dian_resolutions
            db.run(`UPDATE dian_resolutions SET current_number = ? WHERE id = ?`, [nextConsecutive, resNC.id], function(err) {
              if (err) console.error("Error actualizando dian_resolutions:", err);
              else console.log(`Consecutivo en dian_resolutions actualizado a ${nextConsecutive}`);
            });

            // 7. Actualizar consecutivo en transaction_types
            db.run(`UPDATE transaction_types SET consecutive = ? WHERE id = ?`, [nextConsecutive, ncTxTypeId], function(err) {
              if (err) console.error("Error actualizando transaction_types:", err);
              else console.log(`Consecutivo en transaction_types actualizado a ${nextConsecutive}`);
            });

          } else {
            console.error(">>> ERROR EMITIENDO NOTA CRÉDITO A LA DIAN <<<");
            console.error("Detalle del error:", parsed);
          }
        });
      });

      req.on('error', (e) => {
        console.error("Error de conexión:", e.message);
      });

      req.write(bodyStr);
      req.end();
    });
  });
});
