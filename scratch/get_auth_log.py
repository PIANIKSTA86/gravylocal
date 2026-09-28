import sqlite3
import json

conn = sqlite3.connect('empresas/empresa_8094/pb_data/auxiliary.db')
c = conn.cursor()
c.execute("SELECT data FROM _logs WHERE json_extract(data, '$.auth') = 'users' ORDER BY rowid DESC LIMIT 1")
row = c.fetchone()
if row:
    print(row[0])
