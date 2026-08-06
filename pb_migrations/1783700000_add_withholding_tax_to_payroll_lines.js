/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // UP: Add withholding_tax field to payroll_lines
  const collection = app.findCollectionByNameOrId("payroll_lines");

  const existing = collection.fields.getByName("withholding_tax");
  if (existing) {
    console.log("[migration] withholding_tax ya existe en payroll_lines — omitiendo.");
    return;
  }

  const field = new Field({
    name: "withholding_tax",
    type: "number",
    required: false,
    min: 0,
  });

  collection.fields.add(field);
  app.save(collection);
  console.log("[migration] Campo withholding_tax agregado a payroll_lines.");
}, (app) => {
  // DOWN
  try {
    const collection = app.findCollectionByNameOrId("payroll_lines");
    const field = collection.fields.getByName("withholding_tax");
    if (field) {
      collection.fields.remove(field);
      app.save(collection);
      console.log("[migration down] Campo withholding_tax eliminado de payroll_lines.");
    }
  } catch (e) {
    console.log("[migration down] Error:", e.message);
  }
});
