/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_inmo_property_details.pb.js
 * Módulo Inmobiliario: Añade campos detallados de características de inmuebles
 * y crea la colección de historial de mantenimiento/mejoras del inmueble.
 */

onBootstrap((e) => {
  e.next();

  let propCol;
  try {
    propCol = $app.findCollectionByNameOrId("inmo_properties");
  } catch (err) {
    console.log("[GRAVY-INMO-DETAILS] Error: no se pudo obtener la colección inmo_properties: " + err);
    return;
  }

  // 1. Agregar campos de características detalladas a inmo_properties
  try {
    let needsSaveProp = false;

    const addFieldIfMissing = (name, type, options = {}) => {
      try {
        if (!propCol.fields.getByName(name)) {
          propCol.fields.add(new Field({
            name: name,
            type: type,
            required: false,
            ...options
          }));
          needsSaveProp = true;
          console.log(`[GRAVY-INMO-DETAILS] Agregando campo '${name}' a inmo_properties.`);
        }
      } catch (err) {
        console.error(`[GRAVY-INMO-DETAILS] Error al intentar agregar campo ${name}:`, err);
      }
    };

    addFieldIfMissing("neighborhood", "text");
    addFieldIfMissing("social_stratum", "number", { min: 1, max: 6 });
    addFieldIfMissing("area_sqm", "number", { min: 0 });
    addFieldIfMissing("rooms", "number", { min: 0 });
    addFieldIfMissing("bathrooms", "number", { min: 0 });
    addFieldIfMissing("parking_spaces", "number", { min: 0 });
    addFieldIfMissing("admon_price", "number", { min: 0 });
    addFieldIfMissing("year_built", "number", { min: 1800 });

    addFieldIfMissing("has_elevator", "bool");
    addFieldIfMissing("has_pool", "bool");
    addFieldIfMissing("has_gym", "bool");
    addFieldIfMissing("has_balcony", "bool");
    addFieldIfMissing("has_storage", "bool");
    addFieldIfMissing("pet_friendly", "bool");

    if (needsSaveProp) {
      $app.save(propCol);
      console.log("[GRAVY-INMO-DETAILS] Campos detallados del inmueble guardados con éxito.");
    }
  } catch (err) {
    console.error("[GRAVY-INMO-DETAILS] Error al modificar la colección inmo_properties:", err);
  }

  // 2. Crear la colección inmo_property_history para la bitácora
  try {
    $app.findCollectionByNameOrId("inmo_property_history");
    // Ya existe
  } catch (_) {
    try {
      const inmoPropertyHistory = new Collection({
        name: "inmo_property_history",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != '' && @request.auth.role != 'viewer' && @request.auth.role != 'auditor'",
        updateRule: "@request.auth.id != '' && @request.auth.role != 'viewer' && @request.auth.role != 'auditor'",
        deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
        fields: [
          {
            name: "property_id",
            type: "relation",
            required: true,
            collectionId: propCol.id,
            cascadeDelete: true
          },
          {
            name: "event_type",
            type: "select",
            required: true,
            values: ["MANTENIMIENTO", "MEJORA_ESTRUCTURAL", "OTRO"]
          },
          {
            name: "date",
            type: "text",
            required: true
          },
          {
            name: "title",
            type: "text",
            required: true
          },
          {
            name: "description",
            type: "text",
            required: false
          },
          {
            name: "cost",
            type: "number",
            required: false,
            min: 0
          }
        ]
      });

      $app.save(inmoPropertyHistory);
      console.log("[GRAVY-INMO-DETAILS] Colección inmo_property_history creada con éxito.");
    } catch (err) {
      console.error("[GRAVY-INMO-DETAILS] Error al crear la colección inmo_property_history:", err);
    }
  }
});
