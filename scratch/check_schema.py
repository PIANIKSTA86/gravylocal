import sqlite3, json

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()
c.execute("SELECT fields FROM _collections WHERE name = 'imports'")
row = c.fetchone()
if not row:
    c.execute("SELECT schema FROM _collections WHERE name = 'imports'")
    row = c.fetchone()

fields = json.loads(row[0])
print(f"Total campos: {len(fields)}")
names = [f.get('name') for f in fields]
print("Campos existentes:")
for n in sorted(names):
    print(f"  - {n}")

for check in ['tx_bank_fees_id', 'bank_fees_supplier_id', 'bank_fees_invoice_num', 'bank_fees_cost', 'bank_fees_trm']:
    print(f"¿Tiene {check}?: {check in names}")
