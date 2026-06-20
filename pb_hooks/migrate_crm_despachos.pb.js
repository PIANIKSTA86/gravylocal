/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_crm_despachos.pb.js
 * Crea las colecciones para CRM (crm_deals) y Logística (logistica_vehicles, logistica_deliveries).
 * Asegura los campos created/updated en base a PocketBase v0.23+ y parcha la colección licenses local.
 */

onBootstrap((e) => {
  e.next();

  let thirdPartiesId = "";
  let salesOrdersId = "";
  let invoicesId = "";

  try {
    thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
  } catch (err) {
    console.log("[GRAVY-CRM-LOGISTICA] Error: no se pudo obtener la colección third_parties: " + err);
    return;
  }

  // Opcionales (pueden no existir aún en ambientes limpios)
  try {
    salesOrdersId = $app.findCollectionByNameOrId("sales_orders").id;
  } catch (_) {}
  try {
    invoicesId = $app.findCollectionByNameOrId("invoices").id;
  } catch (_) {}

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  // ──────────────────────────────────────────────────────────
  // A. PARCHE DE ESQUEMA: licenses.module_key
  // ──────────────────────────────────────────────────────────
  try {
    const licensesCol = $app.findCollectionByNameOrId("licenses");
    let moduleKeyField = null;
    try {
      moduleKeyField = licensesCol.fields.getByName("module_key");
    } catch (_) {}
    if (!moduleKeyField && licensesCol.fields) {
      for (let i = 0; i < licensesCol.fields.length; i++) {
        if (licensesCol.fields[i].name === "module_key") {
          moduleKeyField = licensesCol.fields[i];
          break;
        }
      }
    }
    if (moduleKeyField) {
      const needed = ["inmobiliarias", "logistica", "inventarios", "tesoreria", "tienda-virtual", "spa", "conciliacion", "crm"];
      let changed = false;
      const currentVals = moduleKeyField.values || [];
      const valsArray = [];
      for (let j = 0; j < currentVals.length; j++) {
        valsArray.push(currentVals[j]);
      }
      needed.forEach(v => {
        if (valsArray.indexOf(v) === -1) {
          valsArray.push(v);
          changed = true;
        }
      });
      if (changed) {
        moduleKeyField.values = valsArray;
        $app.save(licensesCol);
        console.log("[GRAVY-CRM-LOGISTICA] Agregados módulos a licenses.module_key local.");
      }
    }
  } catch (err) {
    console.log("[GRAVY-CRM-LOGISTICA] Aviso al parchar licenses.module_key: " + err);
  }

  // ──────────────────────────────────────────────────────────
  // 1. COLECCIÓN: crm_deals (Oportunidades de Venta)
  // ──────────────────────────────────────────────────────────
  let crmDealsId = "";
  try {
    crmDealsId = $app.findCollectionByNameOrId("crm_deals").id;
  } catch (_) {
    try {
      const crmDeals = new Collection({
        name: "crm_deals",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "title", type: "text", required: true },
          { name: "client_id", type: "relation", required: true, collectionId: thirdPartiesId, cascadeDelete: false },
          { name: "value", type: "number", required: true, min: 0 },
          { name: "stage", type: "select", required: true, values: ["CONTACTO", "PROPUESTA", "NEGOCIACION", "GANADO", "PERDIDO"] },
          { name: "expected_close", type: "text", required: false },
          { name: "notes", type: "text", required: false },
          { name: "active", type: "bool", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ]
      });
      $app.save(crmDeals);
      crmDealsId = crmDeals.id;
      console.log("[GRAVY-CRM] Colección crm_deals creada.");
    } catch (err) {
      console.log("[GRAVY-CRM] Error al crear crm_deals: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 2. COLECCIÓN: logistica_vehicles (Flota de Vehículos)
  // ──────────────────────────────────────────────────────────
  let logisticaVehiclesId = "";
  try {
    logisticaVehiclesId = $app.findCollectionByNameOrId("logistica_vehicles").id;
  } catch (_) {
    try {
      const logisticaVehicles = new Collection({
        name: "logistica_vehicles",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "plate", type: "text", required: true },
          { name: "transportista_id", type: "relation", required: false, collectionId: thirdPartiesId, cascadeDelete: false, maxSelect: 1 },
          { name: "driver", type: "text", required: true },
          { name: "capacity", type: "number", required: true, min: 0 },
          { name: "status", type: "select", required: true, values: ["DISPONIBLE", "EN_RUTA", "MANTENIMIENTO"] },
          { name: "notes", type: "text", required: false },
          { name: "active", type: "bool", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ],
        indexes: ["CREATE UNIQUE INDEX idx_log_veh_plate ON logistica_vehicles (plate)"]
      });
      $app.save(logisticaVehicles);
      logisticaVehiclesId = logisticaVehicles.id;
      console.log("[GRAVY-LOGISTICA] Colección logistica_vehicles creada.");
    } catch (err) {
      console.log("[GRAVY-LOGISTICA] Error al crear logistica_vehicles: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 3. COLECCIÓN: logistica_deliveries (Entregas y Despachos)
  // ──────────────────────────────────────────────────────────
  let logisticaDeliveriesId = "";
  try {
    logisticaDeliveriesId = $app.findCollectionByNameOrId("logistica_deliveries").id;
  } catch (_) {
    try {
      const logisticaDeliveries = new Collection({
        name: "logistica_deliveries",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "number", type: "text", required: true },
          { name: "client_id", type: "relation", required: true, collectionId: thirdPartiesId, cascadeDelete: false },
          { name: "vehicle_id", type: "relation", required: false, collectionId: logisticaVehiclesId, cascadeDelete: false },
          { name: "address", type: "text", required: true },
          { name: "date", type: "text", required: true },
          { name: "status", type: "select", required: true, values: ["PENDIENTE", "DESPACHADO", "ENTREGADO", "DEVUELTO", "CANCELADO"] },
          { name: "weight", type: "number", required: false, min: 0 },
          { name: "notes", type: "text", required: false },
          { name: "items", type: "text", required: false },
          { name: "sales_order_id", type: "relation", required: false, collectionId: salesOrdersId, cascadeDelete: false },
          { name: "invoice_id", type: "relation", required: false, collectionId: invoicesId, cascadeDelete: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ],
        indexes: ["CREATE UNIQUE INDEX idx_log_del_number ON logistica_deliveries (number)"]
      });
      $app.save(logisticaDeliveries);
      logisticaDeliveriesId = logisticaDeliveries.id;
      console.log("[GRAVY-LOGISTICA] Colección logistica_deliveries creada.");
    } catch (err) {
      console.log("[GRAVY-LOGISTICA] Error al crear logistica_deliveries: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // B. PARCHE DE ESQUEMA: created/updated en colecciones existentes
  // ──────────────────────────────────────────────────────────
  const collectionsToPatch = ["crm_deals", "logistica_vehicles", "logistica_deliveries"];
  collectionsToPatch.forEach(colName => {
    try {
      const col = $app.findCollectionByNameOrId(colName);
      let changed = false;
      let hasCreated = false;
      let hasUpdated = false;

      try {
        hasCreated = !!col.fields.getByName("created");
      } catch (_) {
        if (col.fields && col.fields.length) {
          for (let i = 0; i < col.fields.length; i++) {
            if (col.fields[i].name === "created") { hasCreated = true; break; }
          }
        }
      }
      try {
        hasUpdated = !!col.fields.getByName("updated");
      } catch (_) {
        if (col.fields && col.fields.length) {
          for (let i = 0; i < col.fields.length; i++) {
            if (col.fields[i].name === "updated") { hasUpdated = true; break; }
          }
        }
      }

      if (!hasCreated) {
        col.fields.add(new AutodateField({
          name: "created",
          onCreate: true,
          onUpdate: false
        }));
        changed = true;
        console.log(`[GRAVY-MIGRATION] Campo 'created' agregado a la coleccion ${colName}`);
      }
      if (!hasUpdated) {
        col.fields.add(new AutodateField({
          name: "updated",
          onCreate: true,
          onUpdate: true
        }));
        changed = true;
        console.log(`[GRAVY-MIGRATION] Campo 'updated' agregado a la coleccion ${colName}`);
      }

      if (colName === "logistica_vehicles") {
        let hasTransportista = false;
        try {
          hasTransportista = !!col.fields.getByName("transportista_id");
        } catch (_) {
          if (col.fields && col.fields.length) {
            for (let i = 0; i < col.fields.length; i++) {
              if (col.fields[i].name === "transportista_id") { hasTransportista = true; break; }
            }
          }
        }

        if (!hasTransportista) {
          col.fields.add(new RelationField({
            name: "transportista_id",
            collectionId: thirdPartiesId,
            cascadeDelete: false,
            maxSelect: 1,
            required: false
          }));
          changed = true;
          console.log(`[GRAVY-MIGRATION] Campo 'transportista_id' agregado a la coleccion ${colName}`);
        }
      }

      if (changed) {
        $app.save(col);
        console.log(`[GRAVY-MIGRATION] Esquema de ${colName} guardado con campos autodate.`);
      }
    } catch (err) {
      console.log(`[GRAVY-MIGRATION] Error al parchar created/updated en ${colName}: ` + err);
    }
  });

  // Sembrar número inicial consecutivo para entregas si no existe
  try {
    const settingsCol = $app.findCollectionByNameOrId("settings");
    try {
      $app.findFirstRecordByFilter("settings", 'key="delivery_consecutive"');
    } catch (_) {
      const deliveryConsecutive = new Record(settingsCol, { key: "delivery_consecutive", value: "0" });
      $app.save(deliveryConsecutive);
      console.log("[GRAVY-LOGISTICA] Semilla delivery_consecutive inicializada en 0.");
    }
  } catch (err) {
    console.log("[GRAVY-LOGISTICA] Aviso al sembrar consecutivo de entregas: " + err);
  }

  // Índices únicos adicionales
  try {
    $app.nonconcurrentDB()
      .newQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_log_veh_plate ON logistica_vehicles (plate)")
      .execute();
    $app.nonconcurrentDB()
      .newQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_log_del_number ON logistica_deliveries (number)")
      .execute();
  } catch (_) {}

  // Sembrar registro de licencia para 'crm' habilitado por defecto si no existe
  try {
    const licensesCol = $app.findCollectionByNameOrId("licenses");
    try {
      $app.findFirstRecordByFilter("licenses", 'module_key="crm"');
    } catch (_) {
      const crmLic = new Record(licensesCol, {
        module_key: "crm",
        enabled: true,
        plan: "perpetua"
      });
      $app.save(crmLic);
      console.log("[GRAVY-CRM] Registro de licencia 'crm' inicializado como habilitado (perpetua).");
    }
  } catch (err) {
    console.log("[GRAVY-CRM] Aviso al sembrar licencia de CRM: " + err);
  }

  console.log("[GRAVY-CRM-LOGISTICA] Migración de CRM y Logística/Despachos completada.");
});
