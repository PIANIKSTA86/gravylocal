/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_purchase_payment_fields.pb.js
 * Asegura los campos de forma de pago, medio de pago DIAN y cuenta bancaria en purchase_invoices.
 */

onBootstrap((e) => {
  e.next();

  try {
    const col = $app.findCollectionByNameOrId("purchase_invoices");
    let changed = false;

    // payment_form
    let payFormField = null;
    try { payFormField = col.fields.getByName("payment_form"); } catch (_) {}
    if (!payFormField) {
      col.fields.add(new TextField({
        name: "payment_form",
        required: false
      }));
      changed = true;
    }

    // payment_dian_code
    let payDianCodeField = null;
    try { payDianCodeField = col.fields.getByName("payment_dian_code"); } catch (_) {}
    if (!payDianCodeField) {
      col.fields.add(new TextField({
        name: "payment_dian_code",
        required: false
      }));
      changed = true;
    }

    // payment_method
    let payMethodField = null;
    try { payMethodField = col.fields.getByName("payment_method"); } catch (_) {}
    if (!payMethodField) {
      col.fields.add(new TextField({
        name: "payment_method",
        required: false
      }));
      changed = true;
    }

    // bank_account_id
    let bankAccountField = null;
    try { bankAccountField = col.fields.getByName("bank_account_id"); } catch (_) {}
    if (!bankAccountField) {
      let bankColId = "";
      try { bankColId = $app.findCollectionByNameOrId("bank_accounts").id; } catch (_) {}

      if (bankColId) {
        col.fields.add(new RelationField({
          name: "bank_account_id",
          collectionId: bankColId,
          maxSelect: 1,
          required: false,
          cascadeDelete: false
        }));
      } else {
        col.fields.add(new TextField({
          name: "bank_account_id",
          required: false
        }));
      }
      changed = true;
    }

    if (changed) {
      $app.save(col);
      console.log("[GRAVY-PURCHASE-MIGRATE] purchase_invoices actualizado con campos de forma de pago.");
    }
  } catch (err) {
    console.log("[GRAVY-PURCHASE-MIGRATE] Error al verificar purchase_invoices: " + err);
  }
});
