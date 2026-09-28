import sqlite3
import json

conn = sqlite3.connect('pb_data/auxiliary.db')
c = conn.cursor()
c.execute("SELECT id, level, message, data, created FROM _logs WHERE data LIKE '%3fmenqh0lyy74l2%' ORDER BY rowid DESC LIMIT 3")
rows = c.fetchall()
print(f"Rows found: {len(rows)}")
for r in rows:
    print('=== LOG ENTRY ===')
    print('ID:', r[0], 'Level:', r[1], 'Created:', r[4])
    print('Message:', r[2])
    try:
        d = json.loads(r[3])
        print("URL:", d.get('url'))
        print("Method:", d.get('method'))
        print("Status:", d.get('status'))
        print("Error:", d.get('error'))
        print("Full Data:\n", json.dumps(d, indent=2))
    except Exception as e:
        print("Raw data:", r[3])
