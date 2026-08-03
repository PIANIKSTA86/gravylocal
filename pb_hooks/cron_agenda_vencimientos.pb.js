/**
 * GRAVY v2.0 — cron_agenda_vencimientos.pb.js
 * Tarea programada diaria para verificar vencimientos en PocketBase.
 */

cronAdd("check_vencimientos_diarios", "0 7 * * *", () => {
  // Obtener fecha actual en formato local AAAA-MM-DD
  const todayStr = new Date(Date.now() - 5 * 3600 * 1000).toISOString().split("T")[0];

  try {
    // Buscar los vencimientos pendientes o programados cuya fecha límite sea menor a hoy
    const records = $app.findRecordsByFilter(
      "agenda_vencimientos",
      `status != 'pagado' && due_date < '${todayStr}'`,
      "",
      5000,
      0
    );

    let count = 0;
    for (let r of records) {
      if (r.get("status") !== "vencido") {
        r.set("status", "vencido");
        $app.save(r);
        count++;
      }
    }

    if (count > 0) {
      console.log(`[GRAVY-AGENDA-CRON] Se marcaron ${count} vencimientos como 'vencido'.`);
    }
  } catch (err) {
    console.log("[GRAVY-AGENDA-CRON] Error al ejecutar cron de vencimientos: " + err);
  }
});
