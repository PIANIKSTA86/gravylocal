import sqlite3
conn = sqlite3.connect('empresas/empresa_8094/pb_data/auxiliary.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("Tables in auxiliary.db:", c.fetchall())

# Let's inspect logs table
for t in ['_logs', 'logs', '_requests']:
    try:
        c.execute(f"SELECT * FROM {t} ORDER BY rowid DESC LIMIT 5")
        print(f"Rows in {t}:", c.fetchall())
    except Exception as e:
        pass
