import sqlite3

def print_table_sql(db_path, label):
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
        row = cur.fetchone()
        if row:
            print(f"[{label}] users SQL:\n{row[0]}\n")
        else:
            print(f"[{label}] Table 'users' not found.")
        conn.close()
    except Exception as e:
        print(f"[{label}] Error: {e}")

print_table_sql('pb_data/data.db', 'DEMO')
print_table_sql('empresas/empresa_8091/pb_data/data.db', 'TENANT')
