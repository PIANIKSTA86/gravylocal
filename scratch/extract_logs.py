import sqlite3
import json

db_path = 'empresas/pb_data/auxiliary.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Query _logs table for POST or PATCH requests to invoices or transactions
cur.execute("SELECT id, message, data, created FROM _logs WHERE message LIKE '%invoices%' OR message LIKE '%transactions%' OR message LIKE '%inventory_movements%' LIMIT 10")
rows = cur.fetchall()

print(f"Found {len(rows)} matching logs:")
for r in rows:
    log_id, msg, data_json, created = r
    print(f"ID: {log_id} | Msg: {msg} | Created: {created}")
    try:
        data = json.loads(data_json)
        print("Data snippet:")
        print(json.dumps(data, indent=2)[:500] + "...")
    except:
        print("Data (raw):", data_json[:500] + "...")
    print("-" * 50)

conn.close()
