import sqlite3

for dbpath in ['empresas/empresa_8094/pb_data/data.db', 'empresas/empresa_8091/pb_data/data.db', 'empresas/empresa_8092/pb_data/data.db', 'empresas/empresa_8093/pb_data/data.db', 'pb_data/data.db']:
    try:
        conn = sqlite3.connect(dbpath)
        c = conn.cursor()
        c.execute("SELECT id, code, name, amount, is_variable, active FROM ph_billing_concepts")
        print(f"=== {dbpath} ===")
        for r in c.fetchall():
            print(" ", r)
    except Exception as e:
        print(f"=== {dbpath} Error: {e} ===")
