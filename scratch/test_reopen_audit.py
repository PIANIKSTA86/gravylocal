import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

cursor.execute("SELECT product_id, warehouse_id, qty_on_hand FROM inventory_stock WHERE product_id IN ('ts9o82awncja3zt', 'ugo1nwmfuzr2r66')")
print('Current inventory_stock:', cursor.fetchall())

cursor.execute("SELECT number, status, description FROM transactions WHERE id='4r9mmgcuzkr51tb'")
print('Capitalization tx:', cursor.fetchall())

cursor.execute("SELECT account_id, debit, credit, description FROM tx_lines WHERE tx_id='4r9mmgcuzkr51tb'")
print('Capitalization tx lines:', cursor.fetchall())

conn.close()
