/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_employee_hire_dates.pb.js
 * Auto-curación y consolidación de reglas de nómina y fechas históricas de inicio de contrato.
 */

onBootstrap((e) => {
  e.next();

  try {
    const tpRecords = $app.findRecordsByFilter("third_parties", "type = 'EMPLEADO'");
    if (!tpRecords || tpRecords.length === 0) return;

    const parts = $app.findRecordsByFilter("settings", "key ~ 'payroll_accounting_config_v1_employee_rules'");
    if (!parts || parts.length === 0) return;

    parts.sort(function (a, b) { return a.getString("key").localeCompare(b.getString("key")); });
    let allRulesJson = "";
    parts.forEach(function (p) { allRulesJson += (p.getString("value") || ""); });

    let rules = [];
    try {
      rules = JSON.parse(allRulesJson);
    } catch (_) {
      return;
    }

    if (!Array.isArray(rules) || rules.length === 0) return;

    const empIdSet = {};
    tpRecords.forEach(function (tp) { empIdSet[tp.id] = true; });

    // Reglas huérfanas con datos de inicio de contrato y cargo
    const orphanRules = rules.filter(function (r) {
      return !empIdSet[r.employee_id] && (r.start_date || r.position);
    });

    let modified = false;

    tpRecords.forEach(function (tp) {
      const empId = tp.id;
      let r = rules.find(function (x) { return x.employee_id === empId; });
      if (!r) {
        r = { employee_id: empId };
        rules.push(r);
        modified = true;
      }

      // Si falta fecha de inicio o cargo, auto-recuperar
      if (!r.start_date || !r.position || !r.contract_type) {
        // 1. Buscar en historial de nóminas electrónicas previas de la DIAN
        try {
          const histRecords = $app.findRecordsByFilter(
            "electronic_payrolls",
            "employee_id = '" + empId + "' && xml_generado != ''",
            "created",
            1,
            0
          );
          if (histRecords && histRecords.length > 0) {
            const xml = histRecords[0].getString("xml_generado") || "";
            const mXml = xml.match(/FechaIngreso="([^"]+)"/i);
            const mJson = xml.match(/"date_entry"\s*:\s*"([^"]+)"/i);
            const foundDate = mXml ? mXml[1] : (mJson ? mJson[1] : "");
            if (foundDate && (!r.start_date || r.start_date.endsWith("-01"))) {
              r.start_date = foundDate;
              modified = true;
            }
          }
        } catch (_) { }

        // 2. Buscar en reglas huérfanas por coincidencia de salario o fecha
        if (orphanRules.length > 0) {
          const matchedOrphan = orphanRules.find(function (o) {
            if (r.start_date && o.start_date === r.start_date) return true;
            if (r.basic_salary && o.basic_salary === r.basic_salary) return true;
            return false;
          });

          if (matchedOrphan) {
            if (!r.start_date && matchedOrphan.start_date) {
              r.start_date = matchedOrphan.start_date;
              modified = true;
            }
            if (!r.position && matchedOrphan.position) {
              r.position = matchedOrphan.position;
              modified = true;
            }
            if (!r.contract_type && matchedOrphan.contract_type) {
              r.contract_type = matchedOrphan.contract_type;
              modified = true;
            }
            if (!r.workday_type && matchedOrphan.workday_type) {
              r.workday_type = matchedOrphan.workday_type;
              modified = true;
            }
          }
        }
      }
    });

    if (modified) {
      const updatedJson = JSON.stringify(rules);
      const chunkSize = 5000;
      const chunks = [];
      for (let i = 0; i < updatedJson.length; i += chunkSize) {
        chunks.push(updatedJson.slice(i, i + chunkSize));
      }

      for (let i = 0; i < chunks.length; i++) {
        if (i < parts.length) {
          parts[i].set("value", chunks[i]);
          $app.save(parts[i]);
        }
      }
      console.log("[GRAVY-MIGRATION] Auto-curación de reglas y fechas de contrato de empleados completada con éxito.");
    }
  } catch (err) {
    console.error("[GRAVY-MIGRATION] Error en auto-curación de reglas de nómina:", err);
  }
});

