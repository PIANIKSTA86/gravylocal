import sqlite3
import os

db_path = 'empresas/pb_data/data.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Get count
cur.execute("SELECT COUNT(*) FROM audit_log")
cnt = cur.fetchone()[0]
print("COUNT:", cnt)

# Get some rows
cur.execute("SELECT rowid, id, action, entity FROM audit_log LIMIT 10")
rows = cur.fetchall()
print("ROWS count:", len(rows))
for r in rows:
    print(r)

conn.close()
