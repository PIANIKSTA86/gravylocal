import sqlite3
import json

db_path = r"c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, name, deleteRule, updateRule, createRule FROM _collections WHERE name IN ('tx_lines', 'transactions')")
cols = cursor.fetchall()

print("--- Current Database Collection Rules ---")
for c in cols:
    print(f"Collection: {c[1]}")
    print(f"  createRule: {c[4]}")
    print(f"  updateRule: {c[3]}")
    print(f"  deleteRule: {c[2]}")

conn.close()
print("\nCollection rules check completed.")
