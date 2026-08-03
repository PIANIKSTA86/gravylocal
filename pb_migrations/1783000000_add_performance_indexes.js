/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // El primer argumento 'app' es la instancia de la aplicación PocketBase y tiene el método nonconcurrentDB()
  app.nonconcurrentDB().newQuery("CREATE INDEX IF NOT EXISTS idx_tx_lines_account_id ON tx_lines (account_id)").execute();
  app.nonconcurrentDB().newQuery("CREATE INDEX IF NOT EXISTS idx_tx_lines_tx_id ON tx_lines (tx_id)").execute();
  app.nonconcurrentDB().newQuery("CREATE INDEX IF NOT EXISTS idx_tx_lines_cross_doc_ref ON tx_lines (cross_doc_ref)").execute();

  // Crear índices de rendimiento en la tabla transactions
  app.nonconcurrentDB().newQuery("CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date)").execute();
  app.nonconcurrentDB().newQuery("CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status)").execute();
}, (app) => {
  // Revertir índices creados
  try { app.nonconcurrentDB().newQuery("DROP INDEX IF EXISTS idx_tx_lines_account_id").execute(); } catch(_) {}
  try { app.nonconcurrentDB().newQuery("DROP INDEX IF EXISTS idx_tx_lines_tx_id").execute(); } catch(_) {}
  try { app.nonconcurrentDB().newQuery("DROP INDEX IF EXISTS idx_tx_lines_cross_doc_ref").execute(); } catch(_) {}
  try { app.nonconcurrentDB().newQuery("DROP INDEX IF EXISTS idx_transactions_date").execute(); } catch(_) {}
  try { app.nonconcurrentDB().newQuery("DROP INDEX IF EXISTS idx_transactions_status").execute(); } catch(_) {}
});
