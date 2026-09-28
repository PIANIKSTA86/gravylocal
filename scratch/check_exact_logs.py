import sqlite3
import json

conn = sqlite3.connect('empresas/empresa_8094/pb_data/auxiliary.db')
c = conn.cursor()
c.execute("SELECT id, message, data, created FROM _logs WHERE created >= '2026-09-26 16:15:00' ORDER BY created ASC")
for r in c.fetchall():
    data = json.loads(r[2])
    print(f"[{r[3]}] {data.get('method')} {data.get('url')} -> {data.get('status')} {data.get('error') or ''} {data.get('details') or ''}")
