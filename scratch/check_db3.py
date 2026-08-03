import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

print("=== ALL INVOICES WITH 451 ===")
cursor.execute("SELECT id, number, tx_id, notes, cross_doc_ref FROM invoices WHERE number LIKE '%451%' OR notes LIKE '%451%' OR cross_doc_ref LIKE '%451%'")
for r in cursor.fetchall():
    print(r)

print("\n=== ALL TRANSACTIONS WITH 451 ===")
cursor.execute("SELECT id, number, description, date, tx_type_id FROM transactions WHERE number LIKE '%451%' OR description LIKE '%451%'")
for r in cursor.fetchall():
    print(r)

print("\n=== TRANSACTIONS FOR INVOICES WITH NC ===")
cursor.execute("SELECT id, number, description, date FROM transactions WHERE id IN (SELECT tx_id FROM invoices WHERE number LIKE '%NC%')")
for r in cursor.fetchall():
    print(r)

conn.close()
