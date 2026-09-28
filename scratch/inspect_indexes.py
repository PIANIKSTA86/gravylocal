import sqlite3
import glob

dbs = glob.glob('./empresas/*/pb_data/data.db') + glob.glob('./pb_data/data.db')
for db in dbs:
    print(f"=== DB: {db} ===")
    conn = sqlite3.connect(db)
    cur = conn.cursor()
    cur.execute("""
        SELECT tbl_name, name, sql FROM sqlite_master 
        WHERE type='index' AND (tbl_name LIKE 'ph_%' OR tbl_name LIKE 'tx_%' OR tbl_name='transactions' OR tbl_name='accounts')
    """)
    rows = cur.fetchall()
    for r in rows:
        print(f"  [{r[0]}] {r[1]}: {r[2]}")
    conn.close()
