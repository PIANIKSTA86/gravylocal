import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

print("=== CHECK FV-00003773 INVOICE AND EINVOICE_DOCS ===")
cursor.execute("SELECT id, number, date, tx_id FROM invoices WHERE number = 'FV-00003773'")
rows = cursor.fetchall()
print("Invoices:", rows)

for r in rows:
    tx_id = r[3]
    print(f"tx_id: {tx_id}")
    cursor.execute("SELECT id, tx_id, cufe, status FROM einvoice_docs WHERE tx_id = ?", (tx_id,))
    print("einvoice_docs:", cursor.fetchall())

conn.close()
