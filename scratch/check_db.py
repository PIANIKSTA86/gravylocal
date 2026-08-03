import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# Find transaction with number like %451%
cursor.execute("SELECT id, number, description, date, third_party_id, tx_type_id FROM transactions WHERE number LIKE '%451%'")
tx_rows = cursor.fetchall()
print("=== TRANSACTIONS matching '%451%' ===")
for r in tx_rows:
    print(r)
    tx_id = r[0]
    
    # Check invoices for this tx_id
    cursor.execute("SELECT id, number, notes, cross_doc_ref, subtotal, iva_total, total FROM invoices WHERE tx_id = ?", (tx_id,))
    inv_rows = cursor.fetchall()
    print(f"  Invoices for tx_id {tx_id}:")
    for inv in inv_rows:
        print("   ", inv)

    # Check tx_lines for this tx_id
    cursor.execute("SELECT id, description, cross_doc_ref, debit, credit FROM tx_lines WHERE tx_id = ?", (tx_id,))
    lines_rows = cursor.fetchall()
    print(f"  Tx Lines for tx_id {tx_id}:")
    for l in lines_rows:
        print("   ", l)

conn.close()
