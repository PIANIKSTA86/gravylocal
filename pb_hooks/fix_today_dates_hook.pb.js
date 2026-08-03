/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — fix_today_dates_hook.pb.js
 * Hook de corrección automática de fechas:
 * Ajusta los registros guardados con fecha '2026-08-01' durante las horas nocturnas del 31 de julio (UTC-5).
 */

try {
  const utcNow = new Date();
  const utcHour = utcNow.getUTCHours();
  const utcDateStr = utcNow.toISOString().slice(0, 10);
  
  // Si estamos en las primeras 5 horas de UTC del 1 de agosto (7:00 PM a 11:59 PM COT del 31 de julio)
  if (utcDateStr === "2026-08-01" && utcHour < 5) {
    const collectionsToFix = ["transactions", "inventory_movements", "dian_documents", "sales_orders", "purchase_invoices"];
    
    for (let i = 0; i < collectionsToFix.length; i++) {
      const colName = collectionsToFix[i];
      try {
        const records = $app.findRecordsByFilter(colName, "date = '2026-08-01'", "", 500);
        for (let r = 0; r < records.length; r++) {
          const rec = records[r];
          rec.set("date", "2026-07-31");
          $app.save(rec);
          console.log("[Fix Dates Hook] Corregida fecha de 2026-08-01 a 2026-07-31 en " + colName + " ID: " + rec.id);
        }
      } catch (err) {
        // Ignorar si la colección no existe o no tiene campo 'date'
      }
    }
  }
} catch (e) {
  console.warn("[Fix Dates Hook Error] " + (e.message || e));
}
