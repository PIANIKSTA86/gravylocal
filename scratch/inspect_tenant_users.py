import sqlite3

def inspect_users(db_path, label):
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT id, email, name, verified FROM users")
        rows = cur.fetchall()
        print(f"[{label}] users:")
        for r in rows:
            print(r)
        conn.close()
    except Exception as e:
        print(f"[{label}] Error: {e}")

inspect_users('empresas/empresa_8091/pb_data/data.db', 'TENANT')
