/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_unify_contracts.pb.js
 * Unifica las tablas de contratos inmo_contracts y niif_leases.
 */

onBootstrap((e) => {
  e.next();

  let inmoContracts = null;
  try {
    inmoContracts = $app.findCollectionByNameOrId("inmo_contracts");
  } catch (err) {
    console.log("[GRAVY-UNIFICATION] Aviso: no se pudo encontrar la colección inmo_contracts: " + err);
    return;
  }

  const fieldsSet = new Set(inmoContracts.fields.fieldNames());
  let modified = false;

  // 1. Agregar 'type' (Select: EMITIDO / RECIBIDO)
  if (!fieldsSet.has("type")) {
    inmoContracts.fields.add(new SelectField({
      name: "type",
      required: true,
      values: ["EMITIDO", "RECIBIDO"]
    }));
    modified = true;
  }

  // 2. Agregar 'description' (Text)
  if (!fieldsSet.has("description")) {
    inmoContracts.fields.add(new TextField({
      name: "description",
      required: false
    }));
    modified = true;
  }

  // 3. Agregar 'term_months' (Number)
  if (!fieldsSet.has("term_months")) {
    inmoContracts.fields.add(new NumberField({
      name: "term_months",
      required: false
    }));
    modified = true;
  }

  // 4. Agregar 'implicit_interest_rate' (Number)
  if (!fieldsSet.has("implicit_interest_rate")) {
    inmoContracts.fields.add(new NumberField({
      name: "implicit_interest_rate",
      required: false
    }));
    modified = true;
  }

  // 5. Agregar 'right_of_use_value' (Number)
  if (!fieldsSet.has("right_of_use_value")) {
    inmoContracts.fields.add(new NumberField({
      name: "right_of_use_value",
      required: false
    }));
    modified = true;
  }

  // 6. Agregar 'lease_liability_value' (Number)
  if (!fieldsSet.has("lease_liability_value")) {
    inmoContracts.fields.add(new NumberField({
      name: "lease_liability_value",
      required: false
    }));
    modified = true;
  }

  // 7. Agregar 'amortization_table' (JSON)
  if (!fieldsSet.has("amortization_table")) {
    inmoContracts.fields.add(new JSONField({
      name: "amortization_table",
      required: false
    }));
    modified = true;
  }

  // 8. Agregar 'lessor_id' (Relation a third_parties)
  if (!fieldsSet.has("lessor_id")) {
    let thirdPartiesId = "";
    try {
      thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
    } catch (_) {}

    if (thirdPartiesId) {
      inmoContracts.fields.add(new RelationField({
        name: "lessor_id",
        required: false,
        collectionId: thirdPartiesId,
        maxSelect: 1,
        cascadeDelete: false
      }));
      modified = true;
    }
  }

  // 9. Cambiar requeridos a opcionales para permitir contratos recibidos
  const propertyField = inmoContracts.fields.getByName("property_id");
  if (propertyField && propertyField.required) {
    propertyField.required = false;
    modified = true;
  }

  const tenantField = inmoContracts.fields.getByName("tenant_id");
  if (tenantField && tenantField.required) {
    tenantField.required = false;
    modified = true;
  }

  const endDateField = inmoContracts.fields.getByName("end_date");
  if (endDateField && endDateField.required) {
    endDateField.required = false;
    modified = true;
  }

  if (modified) {
    try {
      $app.save(inmoContracts);
      console.log("[GRAVY-UNIFICATION] Colección inmo_contracts modificada exitosamente.");
    } catch (saveErr) {
      console.log("[GRAVY-UNIFICATION] Error al guardar colección inmo_contracts: " + saveErr);
    }
  }

  // 10. Inicializar type = 'EMITIDO' en contratos preexistentes
  try {
    const existing = $app.findRecordsByFilter("inmo_contracts", 'type = "" || type = null');
    if (existing && existing.length > 0) {
      existing.forEach((rec) => {
        rec.set("type", "EMITIDO");
        $app.save(rec);
      });
      console.log("[GRAVY-UNIFICATION] " + existing.length + " contratos inmobiliarios inicializados a EMITIDO.");
    }
  } catch (err) {
    console.log("[GRAVY-UNIFICATION] Error al inicializar tipo en contratos preexistentes: " + err);
  }

  // 11. Migración de registros de niif_leases a inmo_contracts
  let niifLeasesCol = null;
  try {
    niifLeasesCol = $app.findCollectionByNameOrId("niif_leases");
  } catch (_) {}

  if (niifLeasesCol) {
    try {
      const leases = $app.findRecordsByFilter("niif_leases", "active = true || active = false");
      console.log("[GRAVY-UNIFICATION] Encontrados " + leases.length + " contratos NIIF 16 para migrar.");

      let migratedCount = 0;
      leases.forEach((l) => {
        const num = l.get("contract_number");
        
        // Verificar si ya existe en inmo_contracts
        let exists = false;
        try {
          const check = $app.findRecordsByFilter("inmo_contracts", 'number = "' + num + '"');
          if (check && check.length > 0) {
            exists = true;
          }
        } catch (_) {}

        if (!exists) {
          const newRec = new Record(inmoContracts, {
            type: "RECIBIDO",
            number: num,
            description: l.get("description") || "",
            start_date: l.get("start_date") || "",
            term_months: l.get("term_months") || 12,
            monthly_rent: l.get("monthly_canon") || 0,
            implicit_interest_rate: l.get("implicit_interest_rate") || 0,
            right_of_use_value: l.get("right_of_use_value") || 0,
            lease_liability_value: l.get("lease_liability_value") || 0,
            amortization_table: l.get("amortization_table") || "[]",
            lessor_id: l.get("lessor_id") || null,
            active: l.get("active") === undefined ? true : l.get("active"),
            status: "VIGENTE"
          });
          $app.save(newRec);
          migratedCount++;
        }
      });

      console.log("[GRAVY-UNIFICATION] " + migratedCount + " contratos NIIF 16 migrados a inmo_contracts.");
      
      // Eliminar colección antigua niif_leases de forma segura
      try {
        $app.delete(niifLeasesCol);
        console.log("[GRAVY-UNIFICATION] Antigua colección niif_leases eliminada.");
      } catch (delErr) {
        console.log("[GRAVY-UNIFICATION] Error al eliminar colección niif_leases: " + delErr);
      }

    } catch (migErr) {
      console.log("[GRAVY-UNIFICATION] Error durante la migración de contratos NIIF 16: " + migErr);
    }
  }
});
