import sqlite3
import json

conn = sqlite3.connect('pb_data/auxiliary.db')
c = conn.cursor()
c.execute("SELECT id, message, data, created FROM _logs ORDER BY rowid DESC LIMIT 30")
rows = c.fetchall()

print(f"Total rows fetched: {len(rows)}")
for r in rows:
    try:
        data = json.loads(r[2]) if r[2] else {}
        print(f"[{r[3]}] {data.get('status')} {data.get('method')} {data.get('url')}")
        if data.get('status') == 400 or 'error' in data or 'i6ftpwxa6fd480c' in r[2]:
            print("  DATA:", json.dumps(data, indent=2))
    except Exception as e:
        print("Error parsing:", e)
