import sqlite3
import os

db_path = r"c:\Users\JULIAN\Desktop\GravyLocal2.0\empresas\empresa_8091\pb_data\data.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings WHERE key IN ('company_name', 'company_nit');")
    rows = cursor.fetchall()
    print("Filtered Settings in empresa_8091 data.db:")
    for row in rows:
        print(f"  {row[0]} = '{row[1]}'")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
