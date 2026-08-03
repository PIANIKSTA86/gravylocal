import sqlite3

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT * FROM third_parties WHERE id = 'csqkx3pmo1m4xnt'")
cust = cursor.fetchone()
# print column names and customer name/doc
cursor.execute("PRAGMA table_info(third_parties)")
cols = [c[1] for c in cursor.fetchall()]
print("Customer details:")
for k, v in zip(cols, cust):
    if k in ('name', 'doc_number', 'id', 'type'):
        print(f"  {k}: {v}")

cursor.execute("SELECT id, number, customer_id, has_pending_delivery, delivery_fulfillment_status FROM invoices WHERE id = '6bzkqrfq673ne1j'")
inv = cursor.fetchone()
print("\nInvoice:", inv)

# Let's also check the invoice lines for this invoice to see what products it contains
cursor.execute("""
    SELECT il.id, il.product_id, p.name, p.type, p.peso_neto, p.largo_cm
    FROM invoice_lines il
    JOIN products p ON il.product_id = p.id
    WHERE il.invoice_id = '6bzkqrfq673ne1j'
""")
lines = cursor.fetchall()
print("\nInvoice Lines:")
for line in lines:
    print(f"  Line ID: {line[0]} | Prod ID: {line[1]} | Name: {line[2]} | Type: {line[3]} | PesoNeto: {line[4]} | LargoCm: {line[5]}")

conn.close()
