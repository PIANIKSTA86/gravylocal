import sqlite3
import json

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Query the specific product
cursor.execute("SELECT * FROM products WHERE id = 'y93fy5ejhd54zp8'")
row = cursor.fetchone()
if row:
    cursor.execute("PRAGMA table_info(products)")
    columns = [col[1] for col in cursor.fetchall()]
    product = dict(zip(columns, row))
    print("Product details:")
    print(json.dumps(product, indent=2))
else:
    print("Product y93fy5ejhd54zp8 NOT found in products table.")
    
    # Let's search if there's any product with a similar ID or name
    cursor.execute("SELECT id, name, active FROM products LIMIT 10")
    print("\nFirst 10 products in DB:")
    for r in cursor.fetchall():
        print(f"  ID: {r[0]} | Name: {r[1]} | Active: {r[2]}")

conn.close()
