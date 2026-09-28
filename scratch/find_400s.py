import sqlite3
import json

conn = sqlite3.connect('empresas/empresa_8094/pb_data/auxiliary.db')
c = conn.cursor()
c.execute("SELECT id, message, data, created FROM _logs WHERE message LIKE '%billing_concepts%' ORDER BY rowid DESC LIMIT 10")
for r in c.fetchall():
    print(r[0], r[1], r[3])
    print(r[2])

print("\n--- ALL 400s on collections ---")
c.execute("SELECT id, message, data, created FROM _logs WHERE message LIKE '%400%' OR data LIKE '%400%' ORDER BY rowid DESC LIMIT 20")
for r in c.fetchall():
    data = json.loads(r[2])
    if data.get('status') == 400 and 'collections' in data.get('url', ''):
        print(r[3], data.get('method'), data.get('url'), "->", data.get('error'), data.get('details'))
