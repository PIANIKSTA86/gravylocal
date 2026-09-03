/**
 * GRAVY v2.0 — migrate_product_images.pb.js
 * Asegura que la colección 'products' tenga el campo 'image' de tipo file para fotos de catálogo.
 */

routerAdd("GET", "/api/gravy/migrate-product-images", (e) => {
  return e.json(200, { status: "ok" });
});

onAfterBootstrap((e) => {
  try {
    const col = $app.findCollectionByNameOrId("products");
    if (!col) return;

    let hasImage = false;
    const fields = col.fields;
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].name === "image") {
        hasImage = true;
        break;
      }
    }

    if (!hasImage) {
      col.fields.add(new Field({
        name: "image",
        type: "file",
        required: false,
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]
      }));
      $app.save(col);
      console.log("[GRAVY] Campo 'image' (file) agregado exitosamente a la colección 'products'.");
    }
  } catch (err) {
    console.log("[GRAVY] Aviso al verificar campo 'image' en products: " + err);
  }
});
