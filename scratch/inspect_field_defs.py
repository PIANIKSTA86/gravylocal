import sqlite3, json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT fields FROM _collections WHERE name = 'imports'")
fields = json.loads(c.fetchone()[0])
for f in fields:
    if f.get('name') in ['tx_local_other_id', 'local_other_supplier_id', 'local_other_invoice_num', 'otros_gastos', 'local_carrier_trm']:
        print(json.dumps(f, indent=2))
