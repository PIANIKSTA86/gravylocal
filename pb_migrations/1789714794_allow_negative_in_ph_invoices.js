/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // ph_invoices
  try {
    const invCol = app.findCollectionByNameOrId("ph_invoices");
    if (invCol) {
      const subtotalField = invCol.fields.getByName("subtotal");
      if (subtotalField) subtotalField.min = null;
      const totalField = invCol.fields.getByName("total");
      if (totalField) totalField.min = null;
      app.save(invCol);
    }
  } catch (e) {}

  // ph_invoice_lines
  try {
    const linesCol = app.findCollectionByNameOrId("ph_invoice_lines");
    if (linesCol) {
      const amountField = linesCol.fields.getByName("amount");
      if (amountField) amountField.min = null;
      app.save(linesCol);
    }
  } catch (e) {}

  return null;
}, (app) => {
  return null;
});
