/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — migrate_ph_indexes.pb.js
 * Optimización de alto rendimiento para el proceso de Facturación y Cartera PH.
 * Crea índices compuestos y de enlace en SQLite para evitar escaneos de tabla completa.
 */

onBootstrap((e) => {
  e.next();

  const queries = [
    // ── ph_invoices ──
    'CREATE INDEX IF NOT EXISTS idx_ph_inv_period ON ph_invoices (period)',
    'CREATE INDEX IF NOT EXISTS idx_ph_inv_prop_period ON ph_invoices (property_id, period)',
    'CREATE INDEX IF NOT EXISTS idx_ph_inv_status ON ph_invoices (status)',
    'CREATE INDEX IF NOT EXISTS idx_ph_inv_prop_status ON ph_invoices (property_id, status)',

    // ── ph_invoice_lines ──
    'CREATE INDEX IF NOT EXISTS idx_ph_lines_inv ON ph_invoice_lines (invoice_id)',
    'CREATE INDEX IF NOT EXISTS idx_ph_lines_concept ON ph_invoice_lines (concept_id)',

    // ── tx_lines ──
    'CREATE INDEX IF NOT EXISTS idx_tx_lines_cross_doc_ref ON tx_lines (cross_doc_ref)',
    'CREATE INDEX IF NOT EXISTS idx_tx_lines_account_id ON tx_lines (account_id)',
    'CREATE INDEX IF NOT EXISTS idx_tx_lines_tx_id ON tx_lines (tx_id)',
    'CREATE INDEX IF NOT EXISTS idx_tx_lines_third ON tx_lines (third_party_id)',

    // ── transactions ──
    'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_cross ON transactions (cross_type, cross_number)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON transactions (tx_type_id, status)',

    // ── accounts ──
    'CREATE INDEX IF NOT EXISTS idx_accounts_code ON accounts (code)'
  ];

  for (const q of queries) {
    try {
      $app.nonconcurrentDB().newQuery(q).execute();
    } catch (err) {
      console.log('[GRAVY-PH-INDEXES] Aviso creando índice: ' + err);
    }
  }

  console.log('[GRAVY-PH-INDEXES] Índices de alto rendimiento para Facturación PH asegurados.');
});
