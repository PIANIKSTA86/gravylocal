import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
print('=== TRANSACTIONS WITH DEPRECIACION ===')
for r in c.execute("SELECT id, number, date, description, status, book_type, tx_type_id FROM transactions WHERE description LIKE '%depreciaci%' OR cross_type = 'DEPRECIACION_MENSUAL'"):
    print(r)

print('=== TRANSACTION TYPES ===')
for r in c.execute("SELECT id, code, name FROM transaction_types"):
    print(r)
