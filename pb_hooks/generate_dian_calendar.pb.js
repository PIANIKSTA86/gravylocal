/**
 * GRAVY v2.0 — generate_dian_calendar.pb.js
 * Endpoint para precargar el Calendario Tributario DIAN 2026 en base al NIT.
 */

routerAdd("POST", "/api/gravy/agenda/generar-calendario-dian", (e) => {
  try {
    const auth = e.requestInfo()?.auth;
    if (!auth) {
      return e.json(401, { message: "No autenticado" });
    }

    const role = auth.getString("role") || "viewer";
    if (role !== "admin" && role !== "superadmin" && role !== "contador") {
      return e.json(403, { message: "Sin permisos para generar la agenda tributaria" });
    }

    const body = e.requestInfo()?.body || {};
    const periodicity = String(body.periodicity || "bimestral").toLowerCase();

    // 1. Obtener NIT de la configuración
    let nit = "";
    try {
      const nitRecord = $app.findFirstRecordByFilter("settings", "key = 'company_nit'");
      nit = nitRecord.get("value") || "";
    } catch (_) {}

    if (!nit) {
      return e.json(400, { message: "No se ha configurado el NIT de la empresa en Configuración General." });
    }

    // 2. Extraer el último dígito antes del dígito de verificación
    let baseNit = nit.replace(/\D/g, "");
    if (nit.indexOf("-") !== -1) {
      baseNit = nit.split("-")[0].replace(/\D/g, "");
    } else if (baseNit.length > 1) {
      baseNit = baseNit.slice(0, -1);
    }

    if (!baseNit) {
      return e.json(400, { message: "El NIT configurado no contiene caracteres numéricos válidos." });
    }

    const lastDigit = parseInt(baseNit.slice(-1));
    const digitIndex = lastDigit === 0 ? 9 : lastDigit - 1;

    // 3. Tablas de Vencimientos Oficiales 2026 (extraídas del PDF de la DIAN)
    const retencionMap = {
      "02": [10, 11, 12, 13, 16, 17, 18, 19, 20, 23], // Enero (vence Feb)
      "03": [10, 11, 12, 13, 16, 17, 18, 19, 20, 24], // Febrero (vence Mar)
      "04": [13, 14, 15, 16, 20, 21, 22, 23, 24, 27], // Marzo (vence Abr)
      "05": [12, 13, 14, 15, 19, 20, 21, 22, 25, 26], // Abril (vence May)
      "06": [10, 11, 12, 16, 17, 18, 19, 22, 23, 24], // Mayo (vence Jun)
      "07": [9, 10, 14, 15, 16, 17, 21, 22, 23, 24],  // Junio (vence Jul)
      "08": [12, 13, 14, 18, 19, 20, 21, 24, 25, 26], // Julio (vence Ago)
      "09": [9, 10, 11, 14, 15, 16, 17, 18, 21, 22],  // Agosto (vence Sep)
      "10": [9, 13, 14, 15, 16, 19, 20, 21, 22, 23],  // Septiembre (vence Oct)
      "11": [11, 12, 13, 17, 18, 19, 20, 23, 24, 25], // Octubre (vence Nov)
      "12": [10, 11, 14, 15, 16, 17, 18, 21, 22, 23], // Noviembre (vence Dic)
      "01": [13, 14, 15, 18, 19, 20, 21, 22, 25, 26]  // Diciembre (vence Ene 2027)
    };

    const ivaBimestralMap = {
      "03": [10, 11, 12, 13, 16, 17, 18, 19, 20, 24], // Ene-Feb (vence Mar)
      "05": [12, 13, 14, 15, 19, 20, 21, 22, 25, 26], // Mar-Abr (vence May)
      "07": [9, 10, 14, 15, 16, 17, 21, 22, 23, 24],  // May-Jun (vence Jul)
      "09": [9, 10, 11, 14, 15, 16, 17, 18, 21, 22],  // Jul-Ago (vence Sep)
      "11": [11, 12, 13, 17, 18, 19, 20, 23, 24, 25], // Sep-Oct (vence Nov)
      "01": [13, 14, 15, 18, 19, 20, 21, 22, 25, 26]  // Nov-Dic (vence Ene 2027)
    };

    const ivaCuatrimestralMap = {
      "05": [12, 13, 14, 15, 19, 20, 21, 22, 25, 26], // Ene-Abr (vence May)
      "09": [9, 10, 11, 14, 15, 16, 17, 18, 21, 22],  // May-Ago (vence Sep)
      "01": [13, 14, 15, 18, 19, 20, 21, 22, 25, 26]  // Sep-Dic (vence Ene 2027)
    };

    const pad = (n) => n.toString().padStart(2, "0");
    const agendaCollection = $app.findCollectionByNameOrId("agenda_vencimientos");
    let createdCount = 0;

    // 4. Generar Retención en la fuente (Mensual)
    const mesesNombres = {
      "02": "Enero", "03": "Febrero", "04": "Marzo", "05": "Abril", "06": "Mayo", "07": "Junio",
      "08": "Julio", "09": "Agosto", "10": "Septiembre", "11": "Octubre", "12": "Noviembre", "01": "Diciembre"
    };

    for (let mesVence in retencionMap) {
      const anio = mesVence === "01" ? "2027" : "2026";
      const dia = pad(retencionMap[mesVence][digitIndex]);
      const due_date = `${anio}-${mesVence}-${dia}`;
      const mesDeclarado = mesesNombres[mesVence];
      const title = `Retención en la Fuente - Periodo ${mesDeclarado} 2026`;
      const tag = `DIAN_RETE_2026_${mesVence}`;

      // Evitar duplicados
      try {
        const existing = $app.findRecordsByFilter("agenda_vencimientos", `description ~ '${tag}'`, "", 1);
        if (existing && existing.length > 0) continue;
      } catch (_) {}

      const rec = new Record(agendaCollection, {
        type: "impuesto_dian_retencion",
        title: title,
        description: `Vencimiento de Retención en la Fuente calculado según NIT ${nit}. [Tag: ${tag}]`,
        due_date: due_date,
        amount: 0,
        status: "pendiente",
        assigned_roles: JSON.stringify(["contador", "admin"]) // Guardar como string JSON
      });
      $app.save(rec);
      createdCount++;
    }

    // 5. Generar IVA (Bimestral o Cuatrimestral)
    if (periodicity === "cuatrimestral") {
      const cuatriPeriodos = {
        "05": "Periodo 1 (Ene-Abr)",
        "09": "Periodo 2 (May-Ago)",
        "01": "Periodo 3 (Sep-Dic)"
      };

      for (let mesVence in ivaCuatrimestralMap) {
        const anio = mesVence === "01" ? "2027" : "2026";
        const dia = pad(ivaCuatrimestralMap[mesVence][digitIndex]);
        const due_date = `${anio}-${mesVence}-${dia}`;
        const periodLabel = cuatriPeriodos[mesVence];
        const title = `IVA Cuatrimestral - ${periodLabel} 2026`;
        const tag = `DIAN_IVA_CUATRI_2026_${mesVence}`;

        try {
          const existing = $app.findRecordsByFilter("agenda_vencimientos", `description ~ '${tag}'`, "", 1);
          if (existing && existing.length > 0) continue;
        } catch (_) {}

        const rec = new Record(agendaCollection, {
          type: "impuesto_dian_iva",
          title: title,
          description: `Vencimiento de IVA Cuatrimestral calculado según NIT ${nit}. [Tag: ${tag}]`,
          due_date: due_date,
          amount: 0,
          status: "pendiente",
          assigned_roles: JSON.stringify(["contador", "admin"])
        });
        $app.save(rec);
        createdCount++;
      }
    } else {
      const bimesPeriodos = {
        "03": "Bimestre 1 (Ene-Feb)",
        "05": "Bimestre 2 (Mar-Abr)",
        "07": "Bimestre 3 (May-Jun)",
        "09": "Bimestre 4 (Jul-Ago)",
        "11": "Bimestre 5 (Sep-Oct)",
        "01": "Bimestre 6 (Nov-Dic)"
      };

      for (let mesVence in ivaBimestralMap) {
        const anio = mesVence === "01" ? "2027" : "2026";
        const dia = pad(ivaBimestralMap[mesVence][digitIndex]);
        const due_date = `${anio}-${mesVence}-${dia}`;
        const periodLabel = bimesPeriodos[mesVence];
        const title = `IVA Bimestral - ${periodLabel} 2026`;
        const tag = `DIAN_IVA_BIMES_2026_${mesVence}`;

        try {
          const existing = $app.findRecordsByFilter("agenda_vencimientos", `description ~ '${tag}'`, "", 1);
          if (existing && existing.length > 0) continue;
        } catch (_) {}

        const rec = new Record(agendaCollection, {
          type: "impuesto_dian_iva",
          title: title,
          description: `Vencimiento de IVA Bimestral calculado según NIT ${nit}. [Tag: ${tag}]`,
          due_date: due_date,
          amount: 0,
          status: "pendiente",
          assigned_roles: JSON.stringify(["contador", "admin"])
        });
        $app.save(rec);
        createdCount++;
      }
    }

    return e.json(200, {
      message: `Calendario Tributario 2026 cargado exitosamente. Se crearon ${createdCount} nuevos vencimientos de impuestos.`,
      created_count: createdCount
    });

  } catch (err) {
    console.log("[GRAVY-CALENDARIO-ERROR] Error al generar calendario: " + err);
    return e.json(500, { message: "Error interno al generar el calendario: " + err.toString() });
  }
});
