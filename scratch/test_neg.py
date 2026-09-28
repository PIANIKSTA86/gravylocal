import sqlite3
import json
import urllib.request

for db in ['pb_data/data.db', 'empresas/empresa_8094/pb_data/data.db']:
    try:
        conn = sqlite3.connect(db)
        c = conn.cursor()
        c.execute("SELECT fields FROM _collections WHERE name='ph_invoices'")
        row = c.fetchone()
        if row:
            fields = json.loads(row[0])
            print(db, "ph_invoices:")
            for f in fields:
                if f['name'] in ['subtotal', 'total']:
                    print("  ", f['name'], "min:", f.get('min'))
        c.execute("SELECT fields FROM _collections WHERE name='ph_invoice_lines'")
        row = c.fetchone()
        if row:
            fields = json.loads(row[0])
            print(db, "ph_invoice_lines:")
            for f in fields:
                if f['name'] in ['amount']:
                    print("  ", f['name'], "min:", f.get('min'))
        conn.close()
    except Exception as e:
        print(db, e)
