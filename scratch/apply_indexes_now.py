import sqlite3
import glob

queries = [
    'CREATE INDEX IF NOT EXISTS idx_ph_inv_period ON ph_invoices (period)',
    'CREATE INDEX IF NOT EXISTS idx_ph_inv_prop_period ON ph_invoices (property_id, period)',
    'CREATE INDEX IF NOT EXISTS idx_ph_inv_status ON ph_invoices (status)',
    'CREATE INDEX IF NOT EXISTS idx_ph_inv_prop_status ON ph_invoices (property_id, status)',
    'CREATE INDEX IF NOT EXISTS idx_ph_lines_inv ON ph_invoice_lines (invoice_id)',
    'CREATE INDEX IF NOT EXISTS idx_ph_lines_concept ON ph_invoice_lines (concept_id)',
    'CREATE INDEX IF NOT EXISTS idx_tx_lines_cross_doc_ref ON tx_lines (cross_doc_ref)',
    'CREATE INDEX IF NOT EXISTS idx_tx_lines_account_id ON tx_lines (account_id)',
    'CREATE INDEX IF NOT EXISTS idx_tx_lines_tx_id ON tx_lines (tx_id)',
    'CREATE INDEX IF NOT EXISTS idx_tx_lines_third ON tx_lines (third_party_id)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_cross ON transactions (cross_type, cross_number)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON transactions (tx_type_id, status)',
    'CREATE INDEX IF NOT EXISTS idx_accounts_code ON accounts (code)'
]

dbs = glob.glob('./empresas/*/pb_data/data.db') + glob.glob('./pb_data/data.db')
for db in dbs:
    print(f"Applying indexes to {db}...")
    try:
        conn = sqlite3.connect(db)
        cur = conn.cursor()
        for q in queries:
            try:
                cur.execute(q)
            except Exception as e:
                print(f"  Notice on '{q}': {e}")
        conn.commit()
        conn.close()
        print(f"  OK: Indexes applied to {db}")
    except Exception as e:
        print(f"  Error on {db}: {e}")

print("Index application completed successfully!")
