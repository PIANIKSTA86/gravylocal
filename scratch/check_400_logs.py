import sqlite3
import json

conn = sqlite3.connect('empresas/empresa_8094/pb_data/auxiliary.db')
c = conn.cursor()
c.execute("SELECT id, message, data, created FROM _logs WHERE message LIKE '%400%' OR data LIKE '%400%' ORDER BY rowid DESC LIMIT 10")
for r in c.fetchall():
    print("--- LOG ---")
    print(r[0], r[1], r[3])
    data = json.loads(r[2])
    print("URL:", data.get('url'), "Status:", data.get('status'))
    print("Error:", data.get('error'))
    print("Data:", data.get('data'))
    print("Raw:", r[2])
