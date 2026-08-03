import sqlite3
import json

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

cursor.execute("SELECT name, listRule, viewRule, createRule, updateRule, deleteRule FROM _collections WHERE name IN ('purchase_invoice_lines', 'invoice_lines', 'purchase_invoices', 'invoices')")
for row in cursor.fetchall():
    print(f"Collection: {row[0]}")
    print(f"  List Rule:   {row[1]}")
    print(f"  View Rule:   {row[2]}")
    print(f"  Create Rule: {row[3]}")
    print(f"  Update Rule: {row[4]}")
    print(f"  Delete Rule: {row[5]}")
    print("-" * 40)

conn.close()
