import sqlite3, json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
row = c.execute("SELECT fields FROM _collections WHERE name='third_parties'").fetchone()
fields = json.loads(row[0])
print("Fields in third_parties:")
for f in fields:
    if any(k in f['name'] for k in ('date', 'term', 'retir', 'hire', 'contract', 'active', 'salary', 'type')):
        print(f"  - {f['name']} ({f['type']})")

tx_types = c.execute("SELECT id, code, name FROM transaction_types").fetchall()
print("\nTransaction types:")
for t in tx_types:
    print(f"  {t[0]} | {t[1]} | {t[2]}")

conn.close()
