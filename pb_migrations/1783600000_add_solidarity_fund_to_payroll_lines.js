/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // UP: Add solidarity_fund field to payroll_lines
  const collection = app.findCollectionByNameOrId("payroll_lines");

  // Check if field already exists to avoid duplicate
  const existing = collection.fields.getByName("solidarity_fund");
  if (existing) {
    console.log("[migration] solidarity_fund ya existe en payroll_lines — omitiendo.");
    return;
  }

  const field = new Field({
    name: "solidarity_fund",
    type: "number",
    required: false,
    min: 0,
  });

  collection.fields.add(field);
  app.save(collection);
  console.log("[migration] Campo solidarity_fund agregado a payroll_lines.");
}, (app) => {
  // DOWN: Remove solidarity_fund field
  try {
    const collection = app.findCollectionByNameOrId("payroll_lines");
    const field = collection.fields.getByName("solidarity_fund");
    if (field) {
      collection.fields.remove(field);
      app.save(collection);
      console.log("[migration] Campo solidarity_fund eliminado de payroll_lines.");
    }
  } catch (e) {
    console.log("[migration down] Error:", e.message);
  }
});
