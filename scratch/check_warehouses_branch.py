import sqlite3
import json

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get warehouses fields
cursor.execute("PRAGMA table_info(warehouses)")
cols = [col[1] for col in cursor.fetchall()]

cursor.execute("SELECT * FROM warehouses")
for r in cursor.fetchall():
    wh = dict(zip(cols, r))
    print(f"Warehouse ID: {wh.get('id')} | Name: {wh.get('name')} | Branch ID: {wh.get('branch_id')}")

conn.close()
