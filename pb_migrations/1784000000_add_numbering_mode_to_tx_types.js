/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("transaction_types");

  // Evita duplicar o recrear índices obsoletos:
  // 1. Dropear físicamente en SQLite
  try {
    app.nonconcurrentDB().newQuery("DROP INDEX IF EXISTS idx_tt_code").execute();
    app.nonconcurrentDB().newQuery("DROP INDEX IF EXISTS idx_tt_code_prefix").execute();
  } catch (e) {
    console.log("[migration] Aviso al limpiar índices previos:", e.message);
  }

  // 2. Limpiar del esquema PocketBase (collection.indexes) el índice obsoleto idx_tt_code (que era UNIQUE solo por 'code').
  // Al invocar app.save(collection), PocketBase intenta recrear cualquier índice presente en collection.indexes
  // que no exista en SQLite; si la base de datos tiene códigos repetidos con distintos prefijos, falla.
  const oldIndexes = collection.indexes || [];
  collection.indexes = oldIndexes.filter((i) => {
    const s = String(i).trim();
    return !s.includes("idx_tt_code ") && !s.includes("idx_tt_code(") && !s.includes("ON transaction_types (code)") && !s.includes("ON transaction_types(code)");
  });

  if (!collection.fields.getByName("numbering_mode")) {
    collection.fields.add(new Field({
      name: "numbering_mode",
      type: "select",
      required: false,
      maxSelect: 1,
      values: ["continuous", "period"],
    }));
  }

  if (!collection.fields.getByName("numbering_period_granularity")) {
    collection.fields.add(new Field({
      name: "numbering_period_granularity",
      type: "select",
      required: false,
      maxSelect: 1,
      values: ["monthly", "yearly"],
    }));
  }

  if (!collection.fields.getByName("period_counters")) {
    collection.fields.add(new Field({
      name: "period_counters",
      type: "json",
      required: false,
    }));
  }

  const idx = collection.indexes.some((i) => i.includes("idx_tt_code_prefix"));
  if (!idx) {
    collection.indexes.push("CREATE UNIQUE INDEX idx_tt_code_prefix ON transaction_types (code, prefix)");
  }

  app.save(collection);
  console.log("[migration] numbering_mode/period_counters agregados a transaction_types.");
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("transaction_types");
    for (const name of ["numbering_mode", "numbering_period_granularity", "period_counters"]) {
      const field = collection.fields.getByName(name);
      if (field) collection.fields.remove(field);
    }
    app.save(collection);
    console.log("[migration] Campos de numeración por período removidos de transaction_types.");
  } catch (e) {
    console.log("[migration down] Error:", e.message);
  }
});
