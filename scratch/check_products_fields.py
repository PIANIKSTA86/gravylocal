import sqlite3, json

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()
cur.execute("SELECT fields FROM _collections WHERE name='products'")
fields = json.loads(cur.fetchone()[0])
print("Fields in products:")
for f in fields:
    print(f" - {f.get('name')} ({f.get('type')})")
con.close()
