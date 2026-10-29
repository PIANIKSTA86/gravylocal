const fs = require('fs');

const hookPaths = [
  'pb_hooks/migrate_doc_soporte_fields.pb.js',
  'empresas/empresa_8091/pb_hooks/migrate_doc_soporte_fields.pb.js',
  'empresas/empresa_8092/pb_hooks/migrate_doc_soporte_fields.pb.js',
  'empresas/empresa_8093/pb_hooks/migrate_doc_soporte_fields.pb.js',
  'empresas/empresa_8094/pb_hooks/migrate_doc_soporte_fields.pb.js'
];

hookPaths.forEach(hp => {
  if (fs.existsSync(hp)) {
    let content = fs.readFileSync(hp, 'utf8').replace(/\r\n/g, '\n');
    const target = `    if (colChanged) {
      $app.save(col);
      console.log("[GRAVY-DS] Colección purchase_invoices actualizada exitosamente con campos de Documento Soporte.");
    }`;
    const replacement = `    const existingCc = col.fields.getByName("cost_center_id");
    if (!existingCc) {
      let costCentersColId = "";
      try { costCentersColId = $app.findCollectionByNameOrId("cost_centers").id; } catch (_) {}
      col.fields.add(new Field({
        id: "rel_cost_center_pur",
        name: "cost_center_id",
        type: "relation",
        required: false,
        collectionId: costCentersColId,
        maxSelect: 1,
        cascadeDelete: false
      }));
      colChanged = true;
    }

    if (colChanged) {
      $app.save(col);
      console.log("[GRAVY-DS] Colección purchase_invoices actualizada exitosamente con campos de Documento Soporte.");
    }`;

    if (content.includes(target)) {
      content = content.replace(target, replacement);
      fs.writeFileSync(hp, content.replace(/\n/g, '\r\n'), 'utf8');
      console.log(`Updated ${hp}`);
    }
  }
});

