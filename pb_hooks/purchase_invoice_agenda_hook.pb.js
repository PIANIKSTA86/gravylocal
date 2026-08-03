/**
 * GRAVY v2.0 — purchase_invoice_agenda_hook.pb.js
 * Automatización para programar pagos de CXP cuando se asientan facturas de compra.
 */

onRecordCreateRequest((e) => {
  e.next(); // Ejecutar guardado en base de datos primero
  handler(e.record);
}, "purchase_invoices");

onRecordUpdateRequest((e) => {
  e.next(); // Ejecutar actualización en base de datos primero
  handler(e.record);
}, "purchase_invoices");

function handler(invoice) {
  if (!invoice) return;

  // Solo programamos en la agenda si la factura está en estado 'posted' (asentada)
  const status = invoice.get("status");
  if (status !== "posted") return;

  const invoiceId = invoice.id;
  const number = invoice.get("number");
  const dueDate = invoice.get("due_date") || invoice.get("date");
  const total = invoice.get("payable_total") || invoice.get("total") || 0;
  const notes = invoice.get("notes") || "";

  // 1. Obtener nombre del proveedor
  let supplierName = "Proveedor Desconocido";
  try {
    const supplierId = invoice.get("supplier_id");
    if (supplierId) {
      const supplier = $app.findRecordById("third_parties", supplierId);
      supplierName = supplier.get("name") || "Proveedor Desconocido";
    }
  } catch (err) {
    console.log("[GRAVY-AGENDA-HOOK] Error al buscar proveedor: " + err);
  }

  // 2. Verificar si ya existe el recordatorio en agenda_vencimientos
  try {
    const refTag = `Ref Compra: ${invoiceId}`;
    let exists = false;
    
    // Buscar registros existentes que tengan la referencia de esta compra
    const existing = $app.findRecordsByFilter(
      "agenda_vencimientos",
      `description ~ '${invoiceId}'`,
      "",
      1,
      0
    );

    if (existing && existing.length > 0) {
      // Ya existe, podemos actualizar el monto o la fecha si cambiaron
      const agendaRec = existing[0];
      if (agendaRec.get("amount") !== total || agendaRec.get("due_date") !== dueDate) {
        agendaRec.set("amount", total);
        agendaRec.set("due_date", dueDate);
        agendaRec.set("title", `CXP Proveedor: ${supplierName} - Fac. ${number}`);
        $app.save(agendaRec);
        console.log("[GRAVY-AGENDA-HOOK] Registro de agenda actualizado para factura: " + number);
      }
      exists = true;
    }

    if (!exists) {
      // 3. Crear el recordatorio de pago en agenda_vencimientos
      const newAgenda = new Record($app.findCollectionByNameOrId("agenda_vencimientos"), {
        type: "cxp_proveedor",
        title: `CXP Proveedor: ${supplierName} - Fac. ${number}`,
        description: `${refTag}\n${notes}`,
        due_date: dueDate,
        amount: total,
        status: "pendiente",
        assigned_roles: JSON.stringify(["auxiliar", "contador", "admin"])
      });
      $app.save(newAgenda);
      console.log("[GRAVY-AGENDA-HOOK] Registro de agenda creado automáticamente para factura: " + number);
    }
  } catch (err) {
    console.log("[GRAVY-AGENDA-HOOK] Error al programar pago en agenda: " + err);
  }
}
