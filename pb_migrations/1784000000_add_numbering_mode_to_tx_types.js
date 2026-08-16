/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("transaction_types");

  // Evita duplicar el índice: el hook de setup.pb.js ya declara idx_tt_code_prefix
  // en runtime y PocketBase intentaría recrearlo sin IF NOT EXISTS al guardar.
  try {
    app.nonconcurrentDB().newQuery("DROP INDEX IF EXISTS idx_tt_code").execute();
    app.nonconcurrentDB().newQuery("DROP INDEX IF EXISTS idx_tt_code_prefix").execute();
  } catch (e) {
    console.log("[migration] Aviso al limpiar índices previos:", e.message);
  }

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
