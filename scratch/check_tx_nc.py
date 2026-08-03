import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

print("=== TRANSACTIONS WITH NC OR 451 OR DOMESTIKO ===")
cursor.execute("SELECT id, number, description, date, tx_type_id FROM transactions WHERE number LIKE '%NC%' OR number LIKE '%451%' OR description LIKE '%DOMESTIKO%' OR description LIKE '%NC-00000451%'")
for r in cursor.fetchall():
    print("  Tx:", r)

print("\n=== INVOICES WITH NC OR 451 OR DOMESTIKO ===")
cursor.execute("SELECT id, number, tx_id, notes, cross_doc_ref, status FROM invoices WHERE number LIKE '%NC%' OR number LIKE '%451%' OR notes LIKE '%NC-00000451%'")
for r in cursor.fetchall():
    print("  Inv:", r)

conn.close()
