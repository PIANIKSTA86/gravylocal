import sqlite3
import json

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get settings
cursor.execute("SELECT value FROM settings WHERE key = 'ecommerce_default_warehouse_id'")
settings_row = cursor.fetchone()
print(f"ecommerce_default_warehouse_id setting: {settings_row[0] if settings_row else 'NOT SET'}")

# Get warehouses
cursor.execute("SELECT id, name, active FROM warehouses")
print("\nWarehouses:")
for w in cursor.fetchall():
    print(f"  ID: {w[0]} | Name: {w[1]} | Active: {w[2]}")

# Get stock for AGILITY GOLD GATOS REF: 3 KILOS (q7comz1lxlevns2)
cursor.execute("SELECT id, product_id, warehouse_id, qty_on_hand FROM inventory_stock WHERE product_id = 'q7comz1lxlevns2'")
print("\nInventory Stock for q7comz1lxlevns2:")
for s in cursor.fetchall():
    print(f"  ID: {s[0]} | Product ID: {s[1]} | Warehouse ID: {s[2]} | Qty On Hand: {s[3]}")

conn.close()
