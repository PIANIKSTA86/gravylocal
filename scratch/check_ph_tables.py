import sqlite3

conn = sqlite3.connect('file:empresas/empresa_8094/pb_data/data.db?mode=ro', uri=True)
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'ph_%'")
tables = [r[0] for r in cur.fetchall()]
print("Tables:", tables)

for t in tables:
    try:
        cur.execute(f"SELECT COUNT(*) FROM {t}")
        cnt = cur.fetchone()[0]
        print(f"  {t}: {cnt}")
    except Exception as e:
        print(f"  {t}: err {e}")
