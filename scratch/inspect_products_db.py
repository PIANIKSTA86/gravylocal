import sqlite3

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get table columns
cursor.execute("PRAGMA table_info(products)")
columns = cursor.fetchall()
print("Products columns:")
for col in columns:
    print(f"  {col[1]} ({col[2]})")

# Get one sample row
cursor.execute("SELECT * FROM products LIMIT 1")
row = cursor.fetchone()
if row:
    colnames = [c[1] for c in columns]
    sample = dict(zip(colnames, row))
    print("\nSample Product:")
    for k, v in sample.items():
        print(f"  {k}: {v}")
else:
    print("\nNo products found in DB.")

conn.close()
