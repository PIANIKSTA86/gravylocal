import sqlite3
import os

db_path = 'pb_data/data.db'
if not os.path.exists(db_path):
    print(f"File not found: {db_path}")
else:
    print(f"File size: {os.path.getsize(db_path)} bytes")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, name, code, prefix, consecutive FROM transaction_types")
        rows = cur.fetchall()
        print("\n=== TRANSACTION TYPES IN pb_data/data.db ===")
        for r in rows:
            print(f"ID: {r[0]} | Name: {r[1]} | Code: {r[2]} | Prefix: {r[3]} | Consecutive: {r[4]}")
    except Exception as e:
        print(f"Error querying transaction_types: {e}")
    conn.close()
