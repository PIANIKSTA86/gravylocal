import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in c.fetchall()]
found = False
for t in tables:
    try:
        c.execute(f"SELECT * FROM [{t}] WHERE id='7a0y7chvu2pn8hr'")
        rows = c.fetchall()
        if rows:
            print(f'Found in {t}:', rows)
            found = True
    except Exception as e:
        pass
if not found:
    print('Record 7a0y7chvu2pn8hr NOT found in any table')
