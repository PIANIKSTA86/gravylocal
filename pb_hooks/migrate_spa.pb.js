/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — migrate_spa.pb.js
 * Hook de migración e inicialización del Módulo Unificado SPA.
 * Crea/asegura la colección `spa_clients` y actualiza `appointments`.
 */

onBootstrap((e) => {
  e.next();
  try {
    const readRule = "@request.auth.id != ''";
    const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'vendedor' || @request.auth.role = 'cajero')";
    const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

    let thirdPartiesColId = "";
    try {
      thirdPartiesColId = $app.findCollectionByNameOrId("third_parties").id;
    } catch (_) {
      thirdPartiesColId = "pbc_955284662";
    }

    // 1. Crear o actualizar colección spa_clients
    let spaClientsCol;
    try {
      spaClientsCol = $app.findCollectionByNameOrId("spa_clients");
    } catch (_) {
      try {
        spaClientsCol = new Collection({
          name: "spa_clients",
          type: "base",
          listRule: readRule,
          viewRule: readRule,
          createRule: writeRule,
          updateRule: writeRule,
          deleteRule: deleteRule,
          fields: [
            { name: "client_id", type: "relation", required: true, collectionId: thirdPartiesColId, maxSelect: 1 },
            { name: "skin_type", type: "select", required: false, maxSelect: 1, values: ["GRASA", "SECA", "MIXTA", "SENSIBLE", "NORMAL"] },
            { name: "allergies", type: "text", required: false },
            { name: "medical_conditions", type: "text", required: false },
            { name: "treatment_notes", type: "text", required: false },
            { name: "birthdate", type: "text", required: false },
            { name: "created", type: "autodate", onCreate: true, onUpdate: false },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
          ]
        });
        $app.save(spaClientsCol);
      } catch (err) {}
    }

    if (spaClientsCol) {
      try {
        let changed = false;
        if (spaClientsCol.listRule !== readRule) { spaClientsCol.listRule = readRule; changed = true; }
        if (spaClientsCol.viewRule !== readRule) { spaClientsCol.viewRule = readRule; changed = true; }
        if (spaClientsCol.createRule !== writeRule) { spaClientsCol.createRule = writeRule; changed = true; }
        if (spaClientsCol.updateRule !== writeRule) { spaClientsCol.updateRule = writeRule; changed = true; }

        try {
          spaClientsCol.fields.getByName("created");
        } catch (_) {
          spaClientsCol.fields.add(new Field({
            name: "created",
            type: "autodate",
            onCreate: true,
            onUpdate: false
          }));
          changed = true;
        }

        try {
          spaClientsCol.fields.getByName("updated");
        } catch (_) {
          spaClientsCol.fields.add(new Field({
            name: "updated",
            type: "autodate",
            onCreate: true,
            onUpdate: true
          }));
          changed = true;
        }

        if (changed) $app.save(spaClientsCol);
      } catch (e) {}
    }

    // 2. Actualizar colección appointments
    try {
      const apptsCol = $app.findCollectionByNameOrId("appointments");
      let changed = false;

      try {
        const petField = apptsCol.fields.getByName("pet_id");
        if (petField && petField.required) {
          petField.required = false;
          changed = true;
        }
      } catch (_) {}

      try {
        apptsCol.fields.getByName("spa_client_id");
      } catch (_) {
        const spaColId = spaClientsCol ? spaClientsCol.id : "spa_clients";
        apptsCol.fields.add(new Field({
          name: "spa_client_id",
          type: "relation",
          collectionId: spaColId,
          required: false,
          maxSelect: 1
        }));
        changed = true;
      }

      try {
        apptsCol.fields.getByName("client_id");
      } catch (_) {
        apptsCol.fields.add(new Field({
          name: "client_id",
          type: "relation",
          collectionId: thirdPartiesColId,
          required: false,
          maxSelect: 1
        }));
        changed = true;
      }

      if (changed) $app.save(apptsCol);
    } catch (err) {}

    // 3. Extender licenses.module_key si existe la colección licenses
    try {
      const licensesCol = $app.findCollectionByNameOrId("licenses");
      const moduleKeyField = licensesCol ? licensesCol.fields.findByName("module_key") : null;
      if (moduleKeyField) {
        const values = moduleKeyField.values || [];
        let licChanged = false;
        if (!values.includes("spa")) { values.push("spa"); licChanged = true; }
        if (!values.includes("spa-belleza")) { values.push("spa-belleza"); licChanged = true; }
        if (licChanged) {
          moduleKeyField.values = values;
          $app.save(licensesCol);
          console.log("[GRAVY] Campo module_key de licenses extendido con 'spa-belleza'.");
        }
      }
    } catch (_) {}
  } catch (err) {}
});

// Endpoint API para asegurar colecciones en caliente
routerAdd("GET", "/api/gravy/ensure-spa-clients", (c) => {
  try {
    const readRule = "@request.auth.id != ''";
    const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'vendedor' || @request.auth.role = 'cajero')";
    const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

    let thirdPartiesColId = "";
    try { thirdPartiesColId = $app.findCollectionByNameOrId("third_parties").id; } catch (_) { thirdPartiesColId = "pbc_955284662"; }

    let spaClientsCol;
    try {
      spaClientsCol = $app.findCollectionByNameOrId("spa_clients");
    } catch (_) {
      try {
        spaClientsCol = new Collection({
          name: "spa_clients",
          type: "base",
          listRule: readRule,
          viewRule: readRule,
          createRule: writeRule,
          updateRule: writeRule,
          deleteRule: deleteRule,
          fields: [
            { name: "client_id", type: "relation", required: true, collectionId: thirdPartiesColId, maxSelect: 1 },
            { name: "skin_type", type: "select", required: false, maxSelect: 1, values: ["GRASA", "SECA", "MIXTA", "SENSIBLE", "NORMAL"] },
            { name: "allergies", type: "text", required: false },
            { name: "medical_conditions", type: "text", required: false },
            { name: "treatment_notes", type: "text", required: false },
            { name: "birthdate", type: "text", required: false },
            { name: "created", type: "autodate", onCreate: true, onUpdate: false },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
          ]
        });
        $app.save(spaClientsCol);
      } catch (err) {}
    }

    if (spaClientsCol) {
      try {
        let changed = false;
        if (spaClientsCol.listRule !== readRule) { spaClientsCol.listRule = readRule; changed = true; }
        if (spaClientsCol.viewRule !== readRule) { spaClientsCol.viewRule = readRule; changed = true; }
        if (spaClientsCol.createRule !== writeRule) { spaClientsCol.createRule = writeRule; changed = true; }
        if (spaClientsCol.updateRule !== writeRule) { spaClientsCol.updateRule = writeRule; changed = true; }

        try {
          spaClientsCol.fields.getByName("created");
        } catch (_) {
          spaClientsCol.fields.add(new Field({
            name: "created",
            type: "autodate",
            onCreate: true,
            onUpdate: false
          }));
          changed = true;
        }

        try {
          spaClientsCol.fields.getByName("updated");
        } catch (_) {
          spaClientsCol.fields.add(new Field({
            name: "updated",
            type: "autodate",
            onCreate: true,
            onUpdate: true
          }));
          changed = true;
        }

        if (changed) $app.save(spaClientsCol);
      } catch (e) {}
    }

    try {
      const apptsCol = $app.findCollectionByNameOrId("appointments");
      let changed = false;
      try { const petField = apptsCol.fields.getByName("pet_id"); if (petField && petField.required) { petField.required = false; changed = true; } } catch (_) {}
      try { apptsCol.fields.getByName("spa_client_id"); } catch (_) {
        const spaColId = spaClientsCol ? spaClientsCol.id : "spa_clients";
        apptsCol.fields.add(new Field({ name: "spa_client_id", type: "relation", collectionId: spaColId, required: false, maxSelect: 1 }));
        changed = true;
      }
      try { apptsCol.fields.getByName("client_id"); } catch (_) {
        apptsCol.fields.add(new Field({ name: "client_id", type: "relation", collectionId: thirdPartiesColId, required: false, maxSelect: 1 }));
        changed = true;
      }
      if (changed) $app.save(apptsCol);
    } catch (err) {}

    return c.json(200, { success: true, message: "Colecciones SPA aseguradas." });
  } catch (err) {
    return c.json(500, { success: false, error: String(err) });
  }
});
