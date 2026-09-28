import sqlite3
import json

for db in ['pb_data/data.db', 'empresas/empresa_8094/pb_data/data.db']:
    conn = sqlite3.connect(db)
    c = conn.cursor()
    for col_name in ['ph_invoices', 'ph_invoice_lines']:
        c.execute("SELECT fields FROM _collections WHERE name=?", (col_name,))
        row = c.fetchone()
        if row:
            fields = json.loads(row[0])
            for f in fields:
                if f['name'] in ['subtotal', 'total', 'amount'] and f.get('min') == 0:
                    print(f"Removing min:0 from {col_name}.{f['name']} in {db}")
                    f['min'] = None
            c.execute("UPDATE _collections SET fields=? WHERE name=?", (json.dumps(fields), col_name))
    conn.commit()
    conn.close()
print("Done!")
