/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_resoluciones.pb.js
 * Módulo de Resoluciones DIAN y Cajas Registradoras.
 * Crea colecciones de base de datos e integra pos_shifts de forma idempotente.
 */

onBootstrap((e) => {
  e.next();

  let usersId = "";
  try {
    usersId = $app.findCollectionByNameOrId("users").id;
  } catch (_) {
    try { usersId = $app.findCollectionByNameOrId("_pb_users_auth_").id; } catch (_2) {}
  }

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  // 1. COLECCIÓN: pos_registers (Cajas Registradoras)
  let posRegistersId = "";
  try {
    posRegistersId = $app.findCollectionByNameOrId("pos_registers").id;
  } catch (_) {
    try {
      const posRegisters = new Collection({
        name: "pos_registers",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "name", type: "text", required: true },
          { name: "terminal_key", type: "text", required: true },
          { name: "active", type: "bool", required: false }
        ],
        indexes: ["CREATE UNIQUE INDEX idx_pos_reg_key ON pos_registers (terminal_key)"]
      });
      $app.save(posRegisters);
      posRegistersId = posRegisters.id;
      console.log("[GRAVY-RESOLUCIONES] Colección pos_registers creada.");
    } catch (err) {
      console.log("[GRAVY-RESOLUCIONES] Error al crear pos_registers: " + err);
    }
  }

  // 2. COLECCIÓN: dian_resolutions (Resoluciones DIAN)
  let dianResolutionsId = "";
  try {
    dianResolutionsId = $app.findCollectionByNameOrId("dian_resolutions").id;
  } catch (_) {
    try {
      const dianResolutions = new Collection({
        name: "dian_resolutions",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "document_type", type: "select", required: true, values: ["FV", "POS", "DS", "NE", "NC", "ND", "NDS"] },
          { name: "prefix", type: "text", required: true },
          { name: "resolution_number", type: "text", required: true },
          { name: "resolution_date", type: "text", required: true },
          { name: "number_from", type: "number", required: true, min: 0 },
          { name: "number_to", type: "number", required: true, min: 0 },
          { name: "current_number", type: "number", required: true, min: 0 },
          { name: "expiration_date", type: "text", required: true },
          { name: "pos_register_id", type: "relation", required: false, collectionId: posRegistersId, cascadeDelete: false },
          { name: "active", type: "bool", required: false }
        ]
      });
      $app.save(dianResolutions);
      dianResolutionsId = dianResolutions.id;
      console.log("[GRAVY-RESOLUCIONES] Colección dian_resolutions creada.");
    } catch (err) {
      console.log("[GRAVY-RESOLUCIONES] Error al crear dian_resolutions: " + err);
    }
  }

  // 3. Modificar pos_shifts para asociarlo con pos_register_id
  try {
    const posShiftsCol = $app.findCollectionByNameOrId("pos_shifts");
    const existingFields = new Set(posShiftsCol.fields.fieldNames());
    if (!existingFields.has("pos_register_id") && posRegistersId) {
      posShiftsCol.fields.add(new RelationField({
        name: "pos_register_id",
        collectionId: posRegistersId,
        required: false,
        cascadeDelete: false
      }));
      $app.save(posShiftsCol);
      console.log("[GRAVY-RESOLUCIONES] Campo pos_register_id añadido a pos_shifts.");
    }
  } catch (err) {
    console.log("[GRAVY-RESOLUCIONES] Error al extender pos_shifts: " + err);
  }

  // 4. Sembrado automático de caja registradora predeterminada si la colección está vacía
  try {
    const regCount = $app.findRecordsByFilter("pos_registers", "active = true", "", 1).length;
    if (regCount === 0) {
      const regCol = $app.findCollectionByNameOrId("pos_registers");
      const defaultReg = new Record(regCol);
      defaultReg.set("id", "2ss1le5f5q06wdt");
      defaultReg.set("name", "Caja Principal 01");
      defaultReg.set("terminal_key", "POS-01");
      defaultReg.set("active", true);
      try {
        const defaultBranch = $app.findFirstRecordByFilter("branches", "active = true");
        if (defaultBranch) defaultReg.set("branch_id", defaultBranch.id);
      } catch (_) {}
      $app.save(defaultReg);
      console.log("[GRAVY-RESOLUCIONES] Creada Caja Registradora Principal inicial.");
    }
  } catch (err) {
    console.log("[GRAVY-RESOLUCIONES] Nota al verificar cajas iniciales: " + err);
  }

  // 5. Sembrado automático de resolución POS si no existe
  try {
    const posResCount = $app.findRecordsByFilter("dian_resolutions", "document_type = 'POS'", "", 1).length;
    if (posResCount === 0) {
      const resCol = $app.findCollectionByNameOrId("dian_resolutions");
      const defaultRes = new Record(resCol);
      defaultRes.set("document_type", "POS");
      defaultRes.set("prefix", "POS");
      defaultRes.set("resolution_number", "18764000001");
      defaultRes.set("resolution_date", "2026-01-01");
      defaultRes.set("number_from", 1);
      defaultRes.set("number_to", 100000);
      defaultRes.set("current_number", 0);
      defaultRes.set("expiration_date", "2028-12-31");
      defaultRes.set("pos_register_id", "");
      defaultRes.set("active", true);
      $app.save(defaultRes);
      console.log("[GRAVY-RESOLUCIONES] Creada Resolución DIAN POS por defecto.");
    }
  } catch (err) {
    console.log("[GRAVY-RESOLUCIONES] Nota al verificar resolución POS: " + err);
  }
});
