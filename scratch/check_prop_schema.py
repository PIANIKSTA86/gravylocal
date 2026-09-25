import sqlite3

def check_schema(db_path):
    print(f"\n--- Schema de ph_properties en {db_path} ---")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("PRAGMA table_info(ph_properties)")
    cols = c.fetchall()
    for col in cols:
        print(f"  {col[1]} ({col[2]})")
    conn.close()

check_schema('empresas/empresa_8094/pb_data/data.db')
try:
    check_schema('pb_data/data.db')
except Exception as e:
    print("pb_data/data.db:", e)
