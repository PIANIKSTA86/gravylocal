import sqlite3
import glob

for db_path in glob.glob('**/data.db', recursive=True):
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'")
        if cur.fetchone():
            cur.execute("SELECT key, substr(value, 1, 40) FROM settings WHERE key LIKE '%matias%' OR key LIKE '%dian%'")
            rows = cur.fetchall()
            if rows:
                print(f"=== {db_path} ===")
                for r in rows:
                    print(f"  {r[0]}: {r[1]}")
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='electronic_documents'")
        if cur.fetchone():
            cur.execute("SELECT count(*), id, uuid, number, supplier_name FROM electronic_documents GROUP BY id")
            docs = cur.fetchall()
            if docs:
                print(f"  -> Docs in {db_path}: {len(docs)}")
                for d in docs[:3]:
                    print(f"     id={d[1]}, num={d[3]}, supplier={d[4]}")
    except Exception as e:
        print(f"Error reading {db_path}: {e}")
