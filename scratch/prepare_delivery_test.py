import sqlite3

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Find products of type BIEN with no weight/dimensions
cursor.execute("SELECT id, name FROM products WHERE type='BIEN' AND (peso_neto IS NULL OR peso_neto <= 0 OR largo_cm IS NULL OR largo_cm <= 0)")
products_without_dims = cursor.fetchall()
print("BIEN products without dimensions:")
for p in products_without_dims:
    print(f"  ID: {p[0]} | Name: {p[1]}")

# Find invoices that contain these products
prod_ids = [p[0] for p in products_without_dims]
placeholders = ','.join('?' for _ in prod_ids)

cursor.execute(f"""
    SELECT il.invoice_id, i.number, i.customer_id, i.status, i.has_pending_delivery, i.delivery_fulfillment_status
    FROM invoice_lines il
    JOIN invoices i ON il.invoice_id = i.id
    WHERE il.product_id IN ({placeholders})
""", prod_ids)
invoices_with_goods = cursor.fetchall()
print("\nInvoices containing these products:")
for inv in invoices_with_goods:
    print(f"  Invoice ID: {inv[0]} | Number: {inv[1]} | Customer ID: {inv[2]} | Status: {inv[3]} | HasPending: {inv[4]} | Fulfillment: {inv[5]}")

# Let's ensure at least one invoice has has_pending_delivery = 1 (True) and delivery_fulfillment_status = 'PENDIENTE'
# so it shows up in the Despachos module.
if invoices_with_goods:
    target_invoice_id = invoices_with_goods[0][0]
    cursor.execute("UPDATE invoices SET has_pending_delivery = 1, delivery_fulfillment_status = 'PENDIENTE', status = 'posted' WHERE id = ?", (target_invoice_id,))
    conn.commit()
    print(f"\nUpdated Invoice ID {target_invoice_id} to have pending delivery for testing.")
else:
    print("\nNo invoices found containing these products to update.")

conn.close()
