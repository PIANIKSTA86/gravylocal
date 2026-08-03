import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

print("=== SEARCH INVOICES WITH NC ===")
cursor.execute("SELECT id, number, tx_id, notes, cross_doc_ref FROM invoices WHERE number LIKE '%NC%' OR number LIKE '%451%'")
for r in cursor.fetchall():
    print(r)

print("\n=== SEARCH TRANSACTIONS WITH NC ===")
cursor.execute("SELECT id, number, description, date FROM transactions WHERE number LIKE '%NC%'")
for r in cursor.fetchall():
    print(r)

print("\n=== SEARCH EINVOICE_DOCS WITH NC or 451 ===")
cursor.execute("SELECT id, tx_id, status, dian_response FROM einvoice_docs WHERE tx_id IN (SELECT id FROM transactions WHERE number LIKE '%NC%' OR number LIKE '%451%')")
for r in cursor.fetchall():
    print(r)

conn.close()
