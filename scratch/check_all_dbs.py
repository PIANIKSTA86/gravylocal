import sqlite3
import glob

for db in glob.glob('**/*.db', recursive=True):
    if any(x in db for x in ['corrupt', 'logs', 'auxiliary', 'test_']):
        continue
    try:
        conn = sqlite3.connect(db)
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tx_lines'")
        if not c.fetchone():
            continue
        c.execute("""
            SELECT COUNT(DISTINCT tx_id)
            FROM tx_lines
            WHERE description LIKE '%Aplicación saldo a favor%' 
               OR description LIKE '%Abono desde anticipo%'
        """)
        cnt = c.fetchone()[0]
        if cnt > 0:
            print(f"{db}: {cnt} affected transactions")
    except Exception as e:
        pass
