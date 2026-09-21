import sqlite3
import json

for db_path in ['empresas/empresa_8094/pb_data/data.db', 'pb_data/data.db']:
    try:
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        cur.execute("SELECT fields FROM _collections WHERE name='ph_invoices'")
        row = cur.fetchone()
        if row:
            fields = json.loads(row[0])
            names = [f.get('name') for f in fields]
            print(f"{db_path}: {names}")
    except Exception as e:
        print(db_path, e)
