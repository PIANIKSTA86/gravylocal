import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

print("=== INVOICE NC-00000451 ===")
cursor.execute("SELECT * FROM invoices WHERE id = 'r6zfj7z0op7e3br'")
row = cursor.fetchone()
cols = [desc[0] for desc in cursor.description]
for c, v in zip(cols, row):
    print(f"  {c}: {v}")

print("\n=== SEARCH TRANSACTIONS FOR NC-00000451 OR NC451 OR 451 ===")
cursor.execute("SELECT id, number, description, date, tx_type_id FROM transactions WHERE number LIKE '%NC%451%' OR number = 'NC-00000451'")
for r in cursor.fetchall():
    print("  Transaction:", r)

print("\n=== SEARCH TRANSACTIONS CREATED ON 2026-07-31 ===")
cursor.execute("SELECT id, number, description, date, tx_type_id FROM transactions WHERE date LIKE '2026-07-31%' AND number LIKE '%NC%'")
for r in cursor.fetchall():
    print("  Transaction:", r)

conn.close()
