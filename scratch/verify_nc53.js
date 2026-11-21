const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);

db.serialize(() => {
  db.run("UPDATE einvoice_docs SET cufe = '33422e85b1e884fb709fd6daaecfd3aa88366c476d7e8e6eacd48108ab52d6af549248d3c3ddf5f5a600866a17b844ed' WHERE document_number = 'NC53'");
  
  db.get("SELECT id, tx_id, document_number, cufe, status, dian_response, sent_at FROM einvoice_docs WHERE document_number = 'NC53'", (err, row) => {
    console.log("NC53 en einvoice_docs:\n", JSON.stringify(row, null, 2));
  });

  db.get("SELECT id, number, current_number, consecutive FROM (SELECT id, 'dian_resolutions' as t, prefix as number, current_number, 0 as consecutive FROM dian_resolutions WHERE prefix='NC' UNION ALL SELECT id, 'transaction_types' as t, prefix as number, 0 as current_number, consecutive FROM transaction_types WHERE prefix='NC')", (err, row) => {
    console.log("Resolución NC verificada:\n", JSON.stringify(row, null, 2));
  });
});
