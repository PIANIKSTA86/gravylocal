import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

rule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')"

target_collections = ['import_lines', 'import_pallet_configs', 'import_lot_configs', 'import_invoices']

for col in target_collections:
    c.execute("UPDATE _collections SET deleteRule = ? WHERE name = ?", (rule, col))
    print(f"Updated deleteRule for {col} -> {c.rowcount} row(s)")

conn.commit()

c.execute("SELECT name, deleteRule FROM _collections WHERE name IN ('import_lines', 'import_pallet_configs', 'import_lot_configs', 'import_invoices')")
for r in c.fetchall():
    print(r[0], 'deleteRule:', r[1])
