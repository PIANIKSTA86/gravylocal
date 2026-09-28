import sqlite3
import json

conn = sqlite3.connect('pb_data/auxiliary.db')
c = conn.cursor()
c.execute("SELECT id, message, data, created FROM _logs WHERE url LIKE '%3fmenqh0lyy74l2%' ORDER BY rowid DESC LIMIT 3")
rows = c.fetchall()
for r in rows:
    print('ID:', r[0], 'Date:', r[3])
    print('Message:', r[1])
    try:
        data = json.loads(r[2])
        print('URL:', data.get('url'))
        print('Status:', data.get('status'))
        print('Error:', data.get('error'))
        print('Full data:', json.dumps(data, indent=2))
    except Exception as e:
        print('Raw data:', r[2])
