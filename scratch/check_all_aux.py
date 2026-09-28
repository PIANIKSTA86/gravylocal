import sqlite3
import glob
import json

for aux in glob.glob("**/auxiliary.db", recursive=True):
    try:
        conn = sqlite3.connect(aux)
        c = conn.cursor()
        c.execute("SELECT id, message, data, created FROM _logs WHERE message LIKE '%ph_invoice_lines%' OR message LIKE '%ph_billing_concepts%' ORDER BY rowid DESC LIMIT 5")
        rows = c.fetchall()
        if rows:
            print(f"=== {aux} ===")
            for r in rows:
                data = json.loads(r[2])
                print(r[3], data.get('method'), data.get('url'), "->", data.get('status'), data.get('error'), data.get('details'))
    except Exception as e:
        pass
